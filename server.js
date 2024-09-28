const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const saltRounds = 10;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);  // ใช้ชื่อไฟล์เดิม
    }
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: 'smtp.gmail.com',
    port: process.env.EMAIL_PORT,
    secure: false, // ใช้ false สำหรับ port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// API สำหรับการเข้าสู่ระบบ
app.post('/api/login', async function(req, res) {
    const { username, password } = req.body;
    const sql = "SELECT UserId, password, loginAttempt, isActive, lastAttemptTime FROM User WHERE username = ?";

    try {
        const [users] = await db.promise().query(sql, [username]);

        if (users.length > 0) {
            const user = users[0];
            const storedHashedPassword = user.password;
            const loginAttempt = user.loginAttempt;
            const isActive = user.isActive;
            const lastAttemptTime = user.lastAttemptTime;

            // ตรวจสอบสถานะของบัญชีว่าถูกล็อกหรือไม่
            if (isActive !== 1) {
                return res.send({ "message": "บัญชีนี้ถูกปิดใช้งาน", "status": false });
            }

            // ตรวจสอบจำนวนครั้งในการพยายามเข้าสู่ระบบในช่วงเวลา 24 ชั่วโมง
            const now = new Date();
            const lastAttempt = new Date(lastAttemptTime);
            const diffTime = Math.abs(now - lastAttempt);
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); // แปลงเป็นชั่วโมง

            if (loginAttempt > 5 && diffHours < 24) {
                return res.send({ 
                    "message": "บัญชีคุณถูกล็อคเนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด", 
                    "status": false 
                });
            }

            // ตรวจสอบรหัสผ่าน
            const match = await bcrypt.compare(password, storedHashedPassword);

            if (match) {
                // รีเซ็ตจำนวนครั้งการพยายามเข้าสู่ระบบและ lastAttemptTime
                const updateSql = "UPDATE User SET loginAttempt = 0, lastAttemptTime = NULL, isActive = 1 WHERE UserId = ?";
                await db.promise().query(updateSql, [user.UserId]);

                res.send({ 
                    "message": "เข้าสู่ระบบสำเร็จ", 
                    "status": true, 
                    "userID": user.UserId 
                });
            } else {
                // เพิ่มจำนวนครั้งที่พยายามเข้าสู่ระบบและอัปเดต lastAttemptTime
                const updateSql = "UPDATE User SET loginAttempt = loginAttempt + 1, lastAttemptTime = NOW() WHERE UserId = ?";
                await db.promise().query(updateSql, [user.UserId]);

                if (loginAttempt >= 2) {
                    res.send({ 
                        "message": "บัญชีคุณถูกล็อคเนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด", 
                        "status": false 
                    });
                } else {
                    res.send({ "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "status": false });
                }
            }
        } else {
            res.send({ "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "status": false });
        }
    } catch (err) {
        console.error('Error during login process:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในการเชื่อมต่อ", "status": false });
    }
});



// Logout endpoint
app.post('/api/logout/:id', async (req, res) => {
    const { id } = req.params;
    const updateSql = "UPDATE User SET isActive = 1, loginAttempt = 0, lastAttemptTime = NULL WHERE UserId = ?";

    try {
        await db.promise().query(updateSql, [id]);
        res.send({ status: true, message: "Logged out successfully" });
    } catch (err) {
        console.error('Error during logout process:', err);
        res.status(500).send({ message: "Database update error", status: false });
    }
});




// API สำหรับการลงทะเบียน (ขั้นตอนที่ 1)
app.post('/api/register1', async function(req, res) {
    const { email, username, password } = req.body;
    const sqlCheck = "SELECT * FROM User WHERE username = ?";

    try {
        const result = await db.promise().query(sqlCheck, [username]);
        if (result[0].length > 0) {
            res.send({ "message": "ชื่อผู้ใช้นี้มีอยู่แล้ว", "status": false });
        } else {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const sqlInsert = "INSERT INTO User(username, password, email) VALUES (?, ?, ?);";
            const insertResult = await db.promise().query(sqlInsert, [username, hashedPassword, email]);
            res.send({ "message": "ลงทะเบียนสำเร็จ", "status": true, "userID": insertResult[0].insertId });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในการลงทะเบียน", "status": false });
    }
});



// API สำหรับการลงทะเบียน (ขั้นตอนที่ 2)
app.post('/api/register2', async function(req, res) {
    const { firstname, lastname, nickname, userID } = req.body;

    if (!userID || !firstname || !lastname || !nickname) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    const sqlUpdate = "UPDATE User SET firstname = ?, lastname = ?, nickname = ? WHERE UserId = ?";

    try {
        await db.promise().query(sqlUpdate, [firstname, lastname, nickname, userID]);
        res.send({ "message": "ข้อมูลบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});



// API สำหรับการลงทะเบียน (ขั้นตอนที่ 3)
app.post('/api/register3', async function(req, res) {
    const { gender, height, phonenumber, userID } = req.body;

    if (!userID || !gender || !height || !phonenumber) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        const [results] = await db.promise().query("SELECT GenderID FROM gender WHERE Gender_Name = ?", [gender]);

        if (results.length === 0) {
            return res.status(404).send({ "message": "ไม่พบข้อมูลเพศที่ระบุ", "status": false });
        }

        const genderID = results[0].GenderID;
        await db.promise().query("UPDATE User SET GenderID = ?, height = ?, phonenumber = ? WHERE UserId = ?", [genderID, height, phonenumber, userID]);
        res.send({ "message": "ข้อมูลบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});



// API สำหรับการลงทะเบียน (ขั้นตอนที่ 4)
app.post('/api/register4', async function(req, res) {
    const { educationID, home, DateBirth, userID } = req.body;

    if (!userID || !educationID || !home || !DateBirth) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        await db.promise().query("UPDATE User SET EducationID = ?, home = ?, DateBirth = ? WHERE UserId = ?", [educationID, home, DateBirth, userID]);
        res.send({ "message": "ข้อมูลบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});



app.post('/api/register5', async function(req, res) {
    const { preferences, userID } = req.body;

    if (!preferences || !userID) {
        console.log("Missing preferences or userID");
        return res.status(400).send({ "message": "ไม่ได้รับข้อมูล preferences หรือ userID", "status": false });
    }

    // preferences.split(',') คืนค่าเป็นตัวเลข เช่น '3', '1'
    const preferenceID = preferences.split(',').map(Number); // แปลงเป็นตัวเลข
    console.log("Received preferences:", preferenceID);
    console.log("Received userID:", userID);

    if (preferenceID.includes(NaN)) {
        console.log("Invalid preference ID");
        return res.status(400).send({ "message": "ไม่พบ PreferenceID สำหรับบางตัวเลือก", "status": false });
    }

    try {
        // Loop เพื่อบันทึกข้อมูล preference หลายตัวเลือก
        for (const preferenceID of preferenceID) {
            await db.promise().query("INSERT INTO userpreferences (UserID, PreferenceID) VALUES (?, ?)", [userID, preferenceID]);
        }

        res.send({ "message": "ลงทะเบียนสำเร็จ", "status": true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});



// API สำหรับการลงทะเบียน (ขั้นตอนที่ 6)
app.post('/api/register6', async function(req, res) {
    const { goalID, userID } = req.body;

    if (!userID || !goalID) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        await db.promise().query("UPDATE User SET goalID = ? WHERE UserId = ?", [goalID, userID]);
        res.send({ "message": "ข้อมูลบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});

app.post('/api/register7', async function(req, res) {
    const { interestedGenderID, userID } = req.body;

    if (!userID || !interestedGenderID) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        // บันทึก interestedGenderID ลงในตาราง User
        await db.promise().query("UPDATE User SET interestGenderID = ? WHERE UserId = ?", [interestedGenderID, userID]);

        res.send({ "message": "ข้อมูลบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});




// API สำหรับการลงทะเบียน (ขั้นตอนที่ 8)
app.post('/api/register8', upload.single('imageFile'), async function(req, res) {
    const { userID } = req.body;
    const fileName = req.file ? req.file.filename : null;

    if (!userID || !fileName) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        await db.promise().query("UPDATE User SET imageFile = ? WHERE UserId = ?", [fileName, userID]);
        res.send({ "message": "ชื่อไฟล์ถูกบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});

app.post('/api/request-pin', async (req, res) => {
    const { email } = req.body;

    try {
        // ดึง userID จาก email
        const [result] = await db.promise().query("SELECT userID FROM User WHERE email = ?", [email]);

        if (result.length === 0) {
            return res.status(400).send({ message: "ไม่พบอีเมลนี้ในระบบ", status: false });
        }

        const userId = result[0].userID;  // ดึง userID เพื่ออัพเดต PIN
        const pinCode = Math.floor(1000 + Math.random() * 9000).toString(); // PIN 4 หลัก
        const expirationDate = new Date(Date.now() + 3600000); // PIN หมดอายุใน 1 ชั่วโมง

        // อัพเดต pinCode และ pinCodeExpiration โดยใช้ userID
        const updateResult = await db.promise().query(
            "UPDATE User SET pinCode = ?, pinCodeExpiration = ? WHERE userID = ?",
            [pinCode, expirationDate, userId]
        );

        // ตรวจสอบการอัพเดต
        if (updateResult[0].affectedRows === 0) {
            return res.status(500).send({ message: "ไม่สามารถอัพเดต PIN ได้", status: false });
        }

        // ส่ง PIN ไปยังอีเมลผู้ใช้
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'รหัส PIN สำหรับรีเซ็ตรหัสผ่าน',
            text: `รหัส PIN ของคุณคือ: ${pinCode}. รหัสนี้จะหมดอายุใน 1 ชั่วโมง.`
        };

        await transporter.sendMail(mailOptions);

        res.send({ message: "PIN ถูกส่งไปยังอีเมลของคุณ", status: true });
    } catch (err) {
        console.error('Error sending PIN:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการส่ง PIN", status: false });
    }
});


app.post('/api/verify-pin', async (req, res) => {
    const { email, pin } = req.body;

    try {
        // ตรวจสอบว่าอีเมลและ PIN ถูกต้อง
        const [result] = await db.promise().query(
            "SELECT userID, pinCode, pinCodeExpiration FROM User WHERE email = ? AND pinCode = ?",
            [email, pin]
        );

        if (result.length === 0) {
            return res.status(400).send({ message: "PIN ไม่ถูกต้อง", status: false });
        }

        const user = result[0];
        const currentTime = new Date();

        // ตรวจสอบว่า PIN หมดอายุหรือไม่
        if (currentTime > user.pinCodeExpiration) {
            return res.status(400).send({ message: "PIN หมดอายุ", status: false });
        }

        // ถ้า PIN ถูกต้องและยังไม่หมดอายุ
        res.send({ message: "PIN ถูกต้อง", status: true });
    } catch (err) {
        console.error("Error verifying PIN:", err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการยืนยัน PIN", status: false });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, pin, newPassword } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!email || !pin || !newPassword) {
        return res.status(400).send({ message: "ข้อมูลไม่ครบถ้วน", status: false });
    }

    console.log("Received Data:", req.body); // Log ข้อมูลที่ได้รับจากแอป Android

    try {
        // ตรวจสอบ PIN และวันหมดอายุ
        const [result] = await db.promise().query(
            "SELECT userID, pinCode, pinCodeExpiration FROM User WHERE email = ? AND pinCode = ? AND pinCodeExpiration > ?",
            [email, pin, new Date()]
        );

        if (result.length === 0) {
            return res.status(400).send({ message: "PIN ไม่ถูกต้องหรือหมดอายุ", status: false });
        }

        const userId = result[0].userID;

        // เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // อัปเดตรหัสผ่านใหม่ในฟิลด์ password และลบข้อมูล PIN ออก
        const updateResult = await db.promise().query(
            "UPDATE User SET password = ?, pinCode = NULL, pinCodeExpiration = NULL WHERE userID = ?",
            [hashedPassword, userId]
        );

        if (updateResult[0].affectedRows === 0) {
            return res.status(400).send({ message: "ไม่สามารถอัปเดตรหัสผ่านได้", status: false });
        }

        res.send({ message: "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว", status: true });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน", status: false });
    }
});

// API ดึงข้อมูลผู้ใช้พร้อม EducationName
app.get('/api/user/:id', async function (req, res) {
    const { id } = req.params;
    const sql = `
    SELECT 
        u.username, u.email, u.firstname, u.lastname, u.nickname, 
        g.Gender_Name AS gender, u.height, u.home, u.DateBirth, 
        u.imageFile,
        e.EducationName AS education,  -- ดึง EducationName แทน EducationID
        GROUP_CONCAT(p.PreferenceNames SEPARATOR ', ') AS preferences,
        GROUP_CONCAT(goal.goalName SEPARATOR ', ') AS goals
    FROM user u
    LEFT JOIN gender g ON u.GenderID = g.GenderID
    LEFT JOIN userpreferences up ON u.UserID = up.UserID
    LEFT JOIN preferences p ON up.PreferenceID = p.PreferenceID
    LEFT JOIN usergoal ug ON u.UserID = ug.UserID
    LEFT JOIN goal ON ug.goalID = goal.goalID
    LEFT JOIN usereducation ue ON u.UserID = ue.UserID  -- เชื่อมโยงกับ usereducation
    LEFT JOIN education e ON ue.EducationID = e.EducationID  -- ดึงข้อมูล EducationName
    WHERE u.UserID = ?
    GROUP BY u.UserID, u.username, u.email, u.firstname, u.lastname, u.nickname, 
        g.Gender_Name, u.height, u.home, u.DateBirth, u.imageFile, e.EducationName
    `;

    try {
        const [result] = await db.promise().query(sql, [id]);
        if (result.length > 0) {
            if (result[0].imageFile) {
                result[0].imageFile = `${req.protocol}://${req.get('host')}/uploads/${result[0].imageFile}`;
            }
            res.send(result[0]);
        } else {
            res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้", status: false });
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้", status: false });
    }
});



// แก้ไขส่วนการอัปเดตข้อมูลผู้ใช้
app.post('/api/user/update/:id', async function (req, res) {
    const { id } = req.params;
    let { username, email, firstname, lastname, nickname, gender, height, home, DateBirth, educationID, goals, preferences } = req.body;

    try {
        const [userResult] = await db.promise().query("SELECT * FROM User WHERE UserId = ?", [id]);

        if (userResult.length === 0) {
            return res.status(404).send({ message: "ไม่พบผู้ใช้ที่ต้องการอัปเดต", status: false });
        }

        const currentUser = userResult[0];

        // ใช้ข้อมูลเดิมหากข้อมูลใหม่ไม่ได้ถูกส่งมา
        username = username || currentUser.username;
        email = email || currentUser.email;
        firstname = firstname || currentUser.firstname;
        lastname = lastname || currentUser.lastname;
        nickname = nickname || currentUser.nickname;
        gender = gender || currentUser.gender;
        height = height || currentUser.height;
        home = home || currentUser.home;

        if (DateBirth) {
            DateBirth = new Date(DateBirth).toISOString().split('T')[0];
        } else {
            DateBirth = currentUser.DateBirth;
        }

        const updateUserSql = `
            UPDATE User 
            SET username = ?, email = ?, firstname = ?, lastname = ?, nickname = ?, gender = ?, height = ?, home = ?, DateBirth = ?
            WHERE UserId = ?
        `;
        await db.promise().query(updateUserSql, [username, email, firstname, lastname, nickname, gender, height, home, DateBirth, id]);

        // อัปเดต EducationID ใน usereducation
        if (educationID) {
            const updateEducationSql = `REPLACE INTO usereducation (UserID, EducationID) VALUES (?, ?)`; // อัปเดตการเชื่อมโยง EducationID
            await db.promise().query(updateEducationSql, [id, educationID]);
        }

        // ลบ goals เก่าของผู้ใช้ใน usergoal
        const deleteGoalsSql = `DELETE FROM usergoal WHERE UserID = ?`;
        await db.promise().query(deleteGoalsSql, [id]);

        // แทรก goals ใหม่ที่ได้รับจาก client
        const insertGoalsSql = `INSERT INTO usergoal (UserID, goalID) VALUES (?, ?)`;
        if (Array.isArray(goals) && goals.length > 0) {
            for (let goal of goals) {
                const [goalResult] = await db.promise().query("SELECT goalID FROM goal WHERE goalName = ?", [goal]);
                if (goalResult.length > 0) {
                    const goalID = goalResult[0].goalID;
                    await db.promise().query(insertGoalsSql, [id, goalID]);
                }
            }
        }

        // ลบ preferences เก่าของผู้ใช้ใน userpreferences
        const deletePreferencesSql = `DELETE FROM userpreferences WHERE UserID = ?`;
        await db.promise().query(deletePreferencesSql, [id]);

        // แทรก preferences ใหม่ที่ได้รับจาก client
        const insertPreferencesSql = `INSERT INTO userpreferences (UserID, PreferenceID) VALUES (?, ?)`;
        if (Array.isArray(preferences) && preferences.length > 0) {
            for (let pref of preferences) {
                await db.promise().query(insertPreferencesSql, [id, pref]);
            }
        }

        res.send({ message: "ข้อมูลถูกอัปเดตเรียบร้อย", status: true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้", status: false });
    }
});


// API สำหรับการอัปเดตรูปภาพของผู้ใช้ (PUT)
app.put('/api/user/update/:id', upload.single('imageFile'), async function (req, res) {
    const { id } = req.params;
    const { username, email, firstname, lastname, nickname, gender, height, home, DateBirth, education, goal, preferences } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!username || !email || !firstname || !lastname || !nickname || !gender) {
        return res.status(400).send({ message: "ข้อมูลไม่ครบถ้วน", status: false });
    }

    try {
        // หา GenderID จากชื่อเพศ
        const [genderResult] = await db.promise().query("SELECT GenderID FROM gender WHERE Gender_Name = ?", [gender]);
        if (genderResult.length === 0) {
            return res.status(404).send({ message: "ไม่พบข้อมูลเพศที่ระบุ", status: false });
        }
        const genderID = genderResult[0].GenderID;

        // ดึงข้อมูลรูปภาพเดิมถ้าไม่มีการอัปเดตภาพใหม่
        let currentImageFile = image;
        if (!currentImageFile) {
            const [userResult] = await db.promise().query("SELECT imageFile FROM User WHERE UserId = ?", [id]);
            if (userResult.length > 0) {
                currentImageFile = userResult[0].imageFile; // ใช้รูปภาพเดิมจากฐานข้อมูล
            }
        }

        // อัปเดตข้อมูลผู้ใช้ รวมถึง nickname และรูปภาพ
        const sqlUpdate = `
            UPDATE User 
            SET username = ?, email = ?, firstname = ?, lastname = ?, nickname = ?, imageFile = ?, GenderID = ?, height = ?, home = ?, DateBirth = ?, education = ?, goal = ?
            WHERE UserId = ?`;
        await db.promise().query(sqlUpdate, [username, email, firstname, lastname, nickname, currentImageFile, genderID, height, home, DateBirth, education, goal, id]);

        const imageUrl = currentImageFile ? `${req.protocol}://${req.get('host')}/uploads/${currentImageFile}` : null;

        res.send({
            message: "ข้อมูลผู้ใช้อัปเดตสำเร็จ",
            status: true,
            image: imageUrl
        });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ message: "การอัปเดตข้อมูลผู้ใช้ล้มเหลว", status: false });
    }
});

// API สำหรับการลบผู้ใช้
app.delete('/api/user/:id', async function (req, res) {
    const { id } = req.params;

    const sqlDeletePreferences = "DELETE FROM userpreferences WHERE UserID = ?";
    const sqlDeleteGoals = "DELETE FROM usergoal WHERE UserID = ?";
    const sqlDeleteUser = "DELETE FROM User WHERE UserId = ?";

    try {
        // ลบข้อมูลในตาราง userpreferences ก่อน
        await db.promise().query(sqlDeletePreferences, [id]);

        // ลบข้อมูลในตาราง usergoal ก่อน
        await db.promise().query(sqlDeleteGoals, [id]);

        // ลบข้อมูลผู้ใช้ในตาราง user
        const [result] = await db.promise().query(sqlDeleteUser, [id]);

        if (result.affectedRows > 0) {
            res.send({ message: "ลบข้อมูลผู้ใช้สำเร็จ", status: true });
        } else {
            res.status(404).send({ message: "ไม่พบผู้ใช้ที่ต้องการลบ", status: false });
        }
    } catch (err) {
        console.error('Database delete error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้", status: false });
    }
});


app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening on port ${process.env.SERVER_PORT}`);
});
