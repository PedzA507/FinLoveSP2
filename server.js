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
    const { education, home, DateBirth, userID } = req.body;

    if (!userID || !education || !home || !DateBirth) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        await db.promise().query("UPDATE User SET education = ?, home = ?, DateBirth = ? WHERE UserId = ?", [education, home, DateBirth, userID]);
        res.send({ "message": "ข้อมูลบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});

// API สำหรับการลงทะเบียน (ขั้นตอนที่ 5)
app.post('/api/register5', async function(req, res) {
    const { preferences, userID } = req.body;

    if (!preferences) {
        return res.status(400).send({ "message": "ไม่ได้รับข้อมูล preferences", "status": false });
    }

    const Preference_Name = preferences.split(',');
    const preferenceMapping = {
        'ดูหนัง': 1,
        'ฟังเพลง': 2,
        'เล่นกีฬา': 3
    };
    const preferenceIDs = Preference_Name.map(name => preferenceMapping[name]);

    if (preferenceIDs.includes(undefined)) {
        return res.status(400).send({ "message": "ไม่พบ PreferenceID สำหรับบางตัวเลือก", "status": false });
    }

    try {
        const promises = preferenceIDs.map(async (prefID) => {
            const [existing] = await db.promise().query("SELECT * FROM UserPreferences WHERE UserID = ? AND PreferenceID = ?", [userID, prefID]);
            if (existing.length === 0) {
                await db.promise().query("INSERT INTO UserPreferences(UserID, PreferenceID) VALUES (?, ?)", [userID, prefID]);
            }
        });

        await Promise.all(promises);
        res.send({ "message": "ลงทะเบียนสำเร็จ", "status": true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});

// API สำหรับการลงทะเบียน (ขั้นตอนที่ 6)
app.post('/api/register6', async function(req, res) {
    const { goal, userID } = req.body;

    if (!userID || !goal) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        await db.promise().query("UPDATE User SET goal = ? WHERE UserId = ?", [goal, userID]);
        res.send({ "message": "ข้อมูลบันทึกแล้ว", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});

// API สำหรับการลงทะเบียน (ขั้นตอนที่ 7)
app.post('/api/register7', async function(req, res) {
    const { interestedGender, userID } = req.body;

    if (!userID || !interestedGender) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        await db.promise().query("UPDATE User SET interestedGender = ? WHERE UserId = ?", [interestedGender, userID]);
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

// API สำหรับการส่ง PIN รีเซ็ตรหัสผ่าน
app.post('/api/reset-password', async function(req, res) {
    const { email } = req.body;

    try {
        const [result] = await db.promise().query("SELECT * FROM User WHERE email = ?", [email]);

        if (result.length > 0) {
            const pinCode = Math.floor(1000 + Math.random() * 9000).toString(); // PIN 4 หลัก ให้เป็นสตริงเพื่อความง่ายในการเปรียบเทียบ
            const expirationDate = new Date(Date.now() + 3600000); // 1 ชั่วโมง

            // อัปเดต pinCode และ pinCodeExpiration
            await db.promise().query(
                "UPDATE User SET pinCode = ?, pinCodeExpiration = ? WHERE email = ?",
                [pinCode, expirationDate, email]
            );

            // ส่ง PIN ไปยังอีเมลผู้ใช้
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'รหัส PIN สำหรับรีเซ็ตรหัสผ่าน',
                text: `รหัส PIN ของคุณคือ: ${pinCode}. รหัสนี้จะหมดอายุใน 1 ชั่วโมง.`
            };

            await transporter.sendMail(mailOptions);

            res.send("รหัส PIN ถูกส่งไปยังอีเมลของคุณ");
        } else {
            res.status(400).send({ message: "ไม่พบอีเมลนี้ในระบบ", status: false });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการส่ง PIN", status: false });
    }
});




// API สำหรับการยืนยัน PIN และเปลี่ยนรหัสผ่าน
app.post('/api/reset-password/verify', async function(req, res) {
    const { email, pin, newPassword } = req.body;

    if (!email || !pin || !newPassword) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        // ตรวจสอบ PIN และการหมดอายุ
        const [result] = await db.promise().query(
            "SELECT pinCode, pinCodeExpiration FROM User WHERE email = ? AND pinCode = ? AND pinCodeExpiration > ?",
            [email, pin, new Date()]
        );

        if (result.length > 0) {
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // อัปเดตรหัสผ่าน และล้าง PIN
            await db.promise().query("UPDATE User SET password = ?, pinCode = NULL, pinCodeExpiration = NULL WHERE email = ?", [hashedPassword, email]);

            res.send({ "message": "รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว", "status": true });
        } else {
            res.send({ "message": "PIN ไม่ถูกต้องหรือหมดอายุ", "status": false });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในการเชื่อมต่อ", "status": false });
    }
});




app.post('/api/verify-pin', async (req, res) => {
    const { email, pin } = req.body;

    try {
        const [result] = await db.promise().query(
            "SELECT pinCode, pinCodeExpiration FROM User WHERE email = ?",
            [email]
        );

        if (result.length === 0) {
            return res.status(400).send({ message: "ไม่พบอีเมลนี้ในระบบ", status: false });
        }

        const user = result[0];
        const currentTime = new Date();

        // ตรวจสอบว่ามี PIN และ PIN ยังไม่หมดอายุ
        if (user.pinCode !== pin) {
            return res.status(400).send({ message: "PIN ไม่ถูกต้อง", status: false });
        }

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


// API เรียกดูข้อมูลผู้ใช้
app.get('/api/user/:id', async function (req, res) {
    const { id } = req.params;
    const sql = `
        SELECT 
            u.username, u.email, u.firstname, u.lastname, u.nickname, 
            g.Gender_Name AS gender, u.height, u.home, u.DateBirth, 
            u.education, u.goal, u.imageFile,
            GROUP_CONCAT(p.PreferenceNames SEPARATOR ', ') AS preferences
        FROM user u
        LEFT JOIN gender g ON u.GenderID = g.GenderID
        LEFT JOIN userpreferences up ON u.UserID = up.UserID
        LEFT JOIN preferences p ON up.PreferenceID = p.PreferenceID
        WHERE u.UserID = ?
        GROUP BY u.UserID`;

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


app.post('/api/user/update/:id', async function(req, res) {
    const { id } = req.params;
    const token = req.headers["authorization"].replace("Bearer ", "");

    try {
        let decode = jwt.verify(token, SECRET_KEY);

        if(id != decode.UserId && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({ 'message': 'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false });
        }

        const { username, email, firstname, lastname, nickname, gender, height, home, DateBirth, education, goal } = req.body;
        const sql = `
            UPDATE User 
            SET username = ?, email = ?, firstname = ?, lastname = ?, nickname = ?, gender = ?, height = ?, home = ?, DateBirth = ?, education = ?, goal = ? 
            WHERE UserId = ?`;

        await db.promise().query(sql, [username, email, firstname, lastname, nickname, gender, height, home, DateBirth, education, goal, id]);
        res.send({ "message": "ข้อมูลถูกอัปเดตเรียบร้อย", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้", "status": false });
    }
});



app.put('/api/user/update/:id', upload.single('imageFile'), async function(req, res) {
    const { id } = req.params;
    const token = req.headers["authorization"].replace("Bearer ", "");

    try {
        let decode = jwt.verify(token, SECRET_KEY);

        if(id != decode.UserId && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({ 'message': 'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false });
        }

        const { username, email, firstname, lastname, gender } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!username || !email || !firstname || !lastname || !gender) {
            return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
        }

        // หา GenderID จากชื่อเพศ
        const [genderResult] = await db.promise().query("SELECT GenderID FROM gender WHERE Gender_Name = ?", [gender]);
        if (genderResult.length === 0) {
            return res.status(404).send({ "message": "ไม่พบข้อมูลเพศที่ระบุ", "status": false });
        }
        const genderID = genderResult[0].GenderID;

        const sqlUpdate = `
            UPDATE User 
            SET username = ?, email = ?, firstname = ?, lastname = ?, imageFile = ?, GenderID = ? 
            WHERE UserId = ?`;

        await db.promise().query(sqlUpdate, [username, email, firstname, lastname, image, genderID, id]);

        const imageUrl = image ? `${req.protocol}://${req.get('host')}/uploads/${image}` : null;
        
        res.send({ 
            "message": "ข้อมูลผู้ใช้อัปเดตสำเร็จ", 
            "status": true,
            "image": imageUrl
        });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "การอัปเดตข้อมูลผู้ใช้ล้มเหลว", "status": false });
    }
});

app.delete('/api/user/:id', async function(req, res) {
    const { id } = req.params;
    const token = req.headers["authorization"].replace("Bearer ", "");

    try {
        let decode = jwt.verify(token, SECRET_KEY);

        if(id != decode.UserId && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({ 'message': 'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false });
        }

        const sql = `DELETE FROM User WHERE UserId = ?`;
        await db.promise().query(sql, [id]);
        res.send({ 'message': 'ลบข้อมูลผู้ใช้เรียบร้อยแล้ว', 'status': true });

    } catch (error) {
        res.send({ 'message': 'โทเคนไม่ถูกต้อง', 'status': false });
    }
});


app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening on port ${process.env.SERVER_PORT}`);
});
