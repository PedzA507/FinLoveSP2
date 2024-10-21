const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 5000;

const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'UX23Y24%@&2aMb';

const fileupload = require('express-fileupload');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Load SSL certificates
const privateKey = fs.readFileSync('privatekey.pem', 'utf8');
const certificate = fs.readFileSync('certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Import CORS library
const cors = require('cors');

// Database(MySql) configuration
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "finlove"
});
db.connect();

// Middleware (Body parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileupload());

// Static assets
app.use('/assets/user', express.static(path.join(__dirname, 'assets/user')));

// Multer configuration for uploading files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'assets/user');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Function to execute a query with a promise-based approach
function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}




////////////////////////////////////////////////////////////////////////// Login ////////////////////////////////////////////////////////////////////////////////////


//Login
app.post('/api/login', async function(req, res) {
    const {username, password} = req.body;
    let sql = '';
    let user = {};
    let positionID = null;

    // ตรวจสอบผู้ใช้จากตารางพนักงานเท่านั้น
    sql = "SELECT * FROM employee WHERE username=? AND isActive = 1";
    let employee = await query(sql, [username]);

    if (employee.length > 0) {
        // ผู้ใช้เป็นพนักงาน
        user = employee[0];
        positionID = user['positionID']; // ดึงข้อมูล positionID ของพนักงาน

        // ตรวจสอบเฉพาะ positionID ที่เป็น 1 หรือ 2 เท่านั้นที่สามารถเข้าสู่ระบบได้
        if (positionID !== 1 && positionID !== 2) {
            return res.send({'message': 'คุณไม่มีสิทธิ์ในการเข้าสู่ระบบ', 'status': false});
        }
    } else {
        return res.send({'message': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'status': false});
    }

    // ตรวจสอบจำนวนครั้งที่พยายามเข้าสู่ระบบ
    let loginAttempt = 0;
    sql = `SELECT loginAttempt FROM employee WHERE username=? AND isActive = 1 
           AND lastAttemptTime >= CURRENT_TIMESTAMP - INTERVAL 24 HOUR`;

    let row = await query(sql, [username]);
    if (row.length > 0) {
        loginAttempt = row[0]['loginAttempt'];

        if (loginAttempt >= 3) {
            return res.send({'message': 'บัญชีคุณถูกล๊อก เนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด', 'status': false});
        }
    } else {
        // reset login attempt
        sql = `UPDATE employee SET loginAttempt = 0, lastAttemptTime=NULL WHERE username=? AND isActive = 1`;
        await query(sql, [username]);
    }

    // ตรวจสอบรหัสผ่าน
    if (bcrypt.compareSync(password, user['password'])) {
        // reset login attempt
        sql = `UPDATE employee SET loginAttempt = 0, lastAttemptTime=NULL WHERE username=? AND isActive = 1`;
        await query(sql, [username]);

        // สร้าง token และส่งกลับ
        let tokenPayload = {
            userID: user['empID'],
            username: username,
            role: 'employee',
            positionID: positionID // เพิ่ม positionID สำหรับพนักงาน
        };

        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });

        user['token'] = token;
        user['message'] = 'เข้าสู่ระบบสำเร็จ';
        user['status'] = true;

        // เพิ่มข้อมูล role และ positionID ลงใน response
        user['role'] = positionID == 1 ? 'admin' : 'employee';

        res.send(user);
    } else {
        // update login attempt
        const lastAttemptTime = new Date();
        sql = `UPDATE employee SET loginAttempt = loginAttempt + 1, lastAttemptTime=? WHERE username=? AND isActive = 1`;
        await query(sql, [lastAttemptTime, username]);

        if (loginAttempt >= 2) {
            res.send({'message': 'บัญชีคุณถูกล๊อก เนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด', 'status': false});
        } else {
            res.send({'message': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'status': false});
        }
    }
});

// Logout API
app.post('/api/logout', (req, res) => {
    // API สำหรับ logout ไม่มีการจัดการฝั่ง server มากนัก นอกจากแจ้งว่า logout สำเร็จ
    res.status(200).send({ message: 'Logged out successfully', status: true });
});


////////////////////////////////////////////////////////////////////////// User ////////////////////////////////////////////////////////////////////////////////////


// List users 
app.get('/api/user', async function(req, res){             
    const token = req.headers["authorization"].replace("Bearer ", "");
        
    try{
        let decode = jwt.verify(token, SECRET_KEY);               
        if(decode.positionID != 1 && decode.positionID != 2) {
          return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
        }
        
        // Query to pull the required fields from user table, including isActive
        let sql = "SELECT userID, username, firstname, lastname, imageFile, isActive FROM user";            
        db.query(sql, function (err, result){
            if (err) throw err;            
            // Send the result back to the frontend, including isActive
            res.send(result); 
        });      

    }catch(error){
        res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
    }
});

// List users with relevant fields only
app.get('/api/userreport', async function(req, res){             
    const token = req.headers["authorization"].replace("Bearer ", "");
        
    try{
        let decode = jwt.verify(token, SECRET_KEY);               
        if(decode.positionID != 1 && decode.positionID != 2) {
          return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
        }
        
        // Query to pull the required fields from user table, including isActive
        let sql = `
            SELECT u.userID, u.username, u.imageFile, u.isActive, r.reportType
            FROM user u
            JOIN userreport ur ON u.userID = ur.reportedID
            JOIN report r ON ur.reportID = r.reportID
        `;  
              
        db.query(sql, function (err, result){
            if (err) throw err;            
            // Send the result back to the frontend, including userID, reportType, and isActive
            res.send(result); 
        });      

    }catch(error){
        res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
    }
});

// Show a user Profile
app.get('/api/profile/:id', async function(req, res) {
    const userID = req.params.id;  // ดึง userID ที่ถูกคลิกเข้ามาดู
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.send({'message': 'ไม่ได้ส่ง token มา', 'status': false});
    }

    try {
        let decode = jwt.verify(token, SECRET_KEY);

        // ตรวจสอบว่าสิทธิ์เป็น admin (positionID = 1) หรือไม่
        if (decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message':'คุณไม่มีสิทธิ์ในการเข้าถึง', 'status': false});
        }

        // ดึงข้อมูลของ user ตาม userID ที่ต้องการดู
        let userSQL = `
            SELECT u.userID, u.username, u.firstname, u.lastname, u.email, u.GenderID, u.home, u.phonenumber, u.imageFile
            FROM user u
            WHERE u.userID = ? AND u.isActive = 1
        `;
        let user = await query(userSQL, [userID]);

        if (user.length === 0) {
            return res.send({'message':'ไม่พบผู้ใช้งาน', 'status': false});
        }

        // ส่งข้อมูล user รวมถึง userID กลับไปให้ frontend
        user = user[0];
        user['message'] = 'success';
        user['status'] = true;

        res.send(user);

    } catch (error) {
        console.error('Error verifying token:', error);
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});



//Show a user image
app.get('/api/user/image/:filename', function(req, res) {        
    const filepath = path.join(__dirname, 'assets/user', req.params.filename);

    // Check if the file exists
    fs.access(filepath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, send a default image
            const defaultImage = path.join(__dirname, 'assets/user/default.jpg');
            return res.sendFile(defaultImage); // Send default image if file not found
        }
        
        // File exists, send the requested file
        res.sendFile(filepath);
    });
});

// Update a user
app.put('/api/user/:id', async function(req, res) {
    const token = req.headers["authorization"].replace("Bearer ", "");
    const userID = req.params.id; 

    try {
        let decode = jwt.verify(token, SECRET_KEY);               
        
        // ตรวจสอบสิทธิ์ในการแก้ไข
        if (userID != decode.userID && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false});
        }
        
        // ดึงข้อมูลผู้ใช้ปัจจุบันเพื่อเช็คว่ามีรูปภาพเดิมอยู่หรือไม่
        let sqlSelect = 'SELECT imageFile FROM user WHERE userID = ?';
        const [user] = await query(sqlSelect, [userID]);

        let profileImage = user.imageFile; // ตั้งค่ารูปเดิมไว้ก่อน

        // ตรวจสอบว่ามีไฟล์รูปภาพใหม่หรือไม่
        if (req.files && req.files.profileImage) {
            const image = req.files.profileImage;
            profileImage = Date.now() + '-' + image.name; // ตั้งชื่อไฟล์ใหม่
            const uploadPath = path.join(__dirname, 'assets/user', profileImage);

            // ลบรูปภาพเก่าหากมี
            if (user.imageFile) {
                const oldImagePath = path.join(__dirname, 'assets/user', user.imageFile);
                fs.access(oldImagePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlink(oldImagePath, (err) => {
                            if (err) console.error('Error deleting old image:', err);
                        });
                    }
                });
            }

            // บันทึกไฟล์รูปภาพใหม่
            image.mv(uploadPath, (err) => {
                if (err) {
                    return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'status': false });
                }
            });
        }

        // ข้อมูลจาก body
        const { password, username, firstname, lastname, email, home, phonenumber } = req.body;

        // SQL query สำหรับการอัปเดต
        let sql = 'UPDATE user SET username = ?, firstname = ?, lastname = ?, email = ?, home = ?, phonenumber = ?';
        let params = [username, firstname || '', lastname || '', email, home || '', phonenumber || ''];

        // อัปเดตไฟล์รูปภาพใหม่ในฐานข้อมูล
        if (profileImage) {    
            sql += ', imageFile = ?';
            params.push(profileImage);
        }

        // อัปเดตรหัสผ่านถ้ามีการส่งมา
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            sql += ', password = ?';
            params.push(password_hash);
        }

        sql += ' WHERE userID = ?';
        params.push(userID);

        // Execute the query
        db.query(sql, params, (err, result) => {
            if (err) throw err;
            res.send({ 'message': 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว', 'status': true });
        });
        
    } catch(error) {
        res.send({'message':'โทเคนไม่ถูกต้อง', 'status': false});
    }
});


// ban user
app.put('/api/user/ban/:id', async function(req, res) {
    const userID = req.params.id;
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.send({'message': 'ไม่ได้ส่ง token มา', 'status': false});
    }

    try {
        let decode = jwt.verify(token, SECRET_KEY);
        // ตรวจสอบว่าเป็นผู้ดูแลระบบหรือไม่ (positionID = 1 หมายถึง admin)
        if (decode.positionID != 1) {
            return res.send({'message':'คุณไม่มีสิทธิ์ในการระงับผู้ใช้', 'status': false});
        }

        // อัปเดต isActive ในตาราง user ให้เป็น 0 (ระงับผู้ใช้)
        let sql = "UPDATE user SET isActive = 0 WHERE userID = ?";
        db.query(sql, [userID], (err, result) => {
            if (err) {
                console.error(err);
                return res.send({'message': 'เกิดข้อผิดพลาดในการระงับผู้ใช้', 'status': false});
            }
            res.send({'message': 'ระงับผู้ใช้เรียบร้อยแล้ว', 'status': true});
        });

    } catch (error) {
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});

// Unban user
app.put('/api/user/unban/:id', async function(req, res) {
    const userID = req.params.id;
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.send({'message': 'ไม่ได้ส่ง token มา', 'status': false});
    }

    try {
        let decode = jwt.verify(token, SECRET_KEY);
        // ตรวจสอบว่าเป็นผู้ดูแลระบบหรือไม่ (positionID = 1 หมายถึง admin)
        if (decode.positionID != 1) {
            return res.send({'message':'คุณไม่มีสิทธิ์ในการปลดแบนผู้ใช้', 'status': false});
        }

        // อัปเดต isActive ในตาราง user ให้เป็น 1 และเคลีย loginAttempt (ปลดแบน)
        let sql = "UPDATE user SET isActive = 1, loginAttempt = 0 WHERE userID = ?";
        db.query(sql, [userID], (err, result) => {
            if (err) {
                console.error(err);
                return res.send({'message': 'เกิดข้อผิดพลาดในการปลดแบนผู้ใช้', 'status': false});
            }
            res.send({'message': 'ปลดแบนผู้ใช้เรียบร้อยแล้ว', 'status': true});
        });

    } catch (error) {
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});

//Delete a user
app.delete('/api/user/:id', async function(req, res) {
    const userID = req.params.id;
    const token = req.headers["authorization"].replace("Bearer ", "");

    try {
        let decode = jwt.verify(token, SECRET_KEY);
        
        // ตรวจสอบว่าเป็น admin หรือไม่ (positionID = 1 เท่านั้น)
        if (decode.positionID != 1) {
            return res.send({'message': 'คุณไม่ได้รับสิทธิ์ในการลบผู้ใช้', 'status': false});
        }

        // Begin transaction to ensure consistency
        db.beginTransaction((err) => {
            if (err) throw err;

            // ลบข้อมูลในตาราง chats ที่เกี่ยวข้องกับ matchID
            const deleteChatsSQL = `DELETE FROM chats WHERE matchID IN (SELECT matchID FROM matches WHERE user1ID = ? OR user2ID = ?)`;
            db.query(deleteChatsSQL, [userID, userID], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        throw err;
                    });
                }

                // ลบข้อมูลในตาราง matches
                const deleteMatchesSQL = `DELETE FROM matches WHERE user1ID = ? OR user2ID = ?`;
                db.query(deleteMatchesSQL, [userID, userID], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            throw err;
                        });
                    }

                    // ลบข้อมูลในตาราง userlike ที่เกี่ยวข้อง
                    const deleteLikesSQL = `DELETE FROM userlike WHERE likedID = ? OR likerID = ?`;
                    db.query(deleteLikesSQL, [userID, userID], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                throw err;
                            });
                        }

                        // ลบข้อมูลในตาราง userreport ที่เกี่ยวข้อง
                        const deleteReportsSQL = `DELETE FROM userreport WHERE reportedID = ? OR reporterID = ?`;
                        db.query(deleteReportsSQL, [userID, userID], (err, result) => {
                            if (err) {
                                return db.rollback(() => {
                                    throw err;
                                });
                            }

                            // สุดท้ายลบผู้ใช้จากตาราง user
                            const deleteUserSQL = `DELETE FROM user WHERE userID = ?`;
                            db.query(deleteUserSQL, [userID], (err, result) => {
                                if (err) {
                                    return db.rollback(() => {
                                        throw err;
                                    });
                                }

                                // Commit การทำงาน
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            throw err;
                                        });
                                    }

                                    res.send({'message': 'ลบข้อมูลลูกค้าเรียบร้อยแล้ว', 'status': true});
                                });
                            });
                        });
                    });
                });
            });
        });

    } catch (error) {
        res.send({'message': 'โทเคนไม่ถูกต้อง', 'status': false});
    }
});


////////////////////////////////////////////////////////////////////////// employee ////////////////////////////////////////////////////////////////////////////////////


// List employees
app.get('/api/employee', function(req, res) {
    const token = req.headers["authorization"].replace("Bearer ", "");

    try {
        let decode = jwt.verify(token, SECRET_KEY);

        // ตรวจสอบว่าเป็น admin หรือพนักงานทั่วไป (positionID = 1 หรือ 2)
        if (decode.positionID != 1 && decode.positionID != 2) {
            return res.send({ 'message': 'คุณไม่ได้รับสิทธิ์ในการเข้าถึงข้อมูลพนักงาน', 'status': false });
        }

        let sql = "SELECT empID, firstname, lastname, username, gender, imageFile, isActive FROM employee";
        db.query(sql, function(err, result) {
            if (err) throw err;
            res.send(result);
        });

    } catch (error) {
        res.send({ 'message': 'โทเคนไม่ถูกต้อง', 'status': false });
    }
});


//Show an employee detail
app.get('/api/employee/:id', async function(req, res) {
    const empID = req.params.id;
    const token = req.headers["authorization"].replace("Bearer ", "");

    try {
        let decode = jwt.verify(token, SECRET_KEY);

        // ตรวจสอบว่าเป็น admin หรือพนักงานทั่วไป (positionID = 1 หรือ 2)
        if (decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message': 'คุณไม่ได้รับสิทธิ์ในการเข้าถึงข้อมูลพนักงาน', 'status': false});
        }

        let sql = "SELECT * FROM employee WHERE empID = ?";
        let employee = await query(sql, [empID]);

        if (employee.length > 0) {
            res.send(employee[0]);
        } else {
            res.send({'message': 'ไม่พบพนักงาน', 'status': false});
        }
    } catch (error) {
        res.send({'message': 'โทเคนไม่ถูกต้อง', 'status': false});
    }
});


// Show employee image
app.get('/api/employee/image/:filename', function(req, res) {        
    const filepath = path.join(__dirname, 'assets/employee', req.params.filename);

    // Check if the file exists
    fs.access(filepath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, send a default image
            const defaultImage = path.join(__dirname, 'assets/employee/default.jpg');
            return res.sendFile(defaultImage); // Send default image if file not found
        }
        
        // File exists, send the requested file
        res.sendFile(filepath);
    });
});


// Generate a password
function generateRandomPassword(length) {
    return crypto.randomBytes(length)
                 .toString('base64')
                 .slice(0, length)
                 .replace(/\+/g, 'A')  // Replace '+' to avoid special chars if needed
                 .replace(/\//g, 'B'); // Replace '/' to avoid special chars if needed
}


// Add an employee
app.post('/api/employee', async function (req, res) {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).send({ 'message': 'ไม่ได้รับโทเคน', 'status': false });
    }

    try {
        let decode = jwt.verify(token, SECRET_KEY);
        if (decode.positionID != 1) {
            return res.status(403).send({ 'message': 'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false });
        }

        const { username, firstName, lastName, email, gender, positionID, phonenumber } = req.body;

        let sql = "SELECT * FROM employee WHERE username=?";
        db.query(sql, [username], async function (err, results) {
            if (err) {
                return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในระบบ', 'status': false });
            }

            if (results.length === 0) {
                try {
                    const password = generateRandomPassword(8);
                    const salt = await bcrypt.genSalt(10);
                    const password_hash = await bcrypt.hash(password, salt);

                    let profileImage = null;

                    // เช็คว่าได้รับไฟล์รูปภาพหรือไม่
                    if (req.files && req.files.profileImage) {
                        const image = req.files.profileImage;
                        profileImage = Date.now() + '-' + image.name;
                        const uploadPath = path.join(__dirname, 'assets/employee', profileImage);

                        // บันทึกไฟล์ไปที่ assets/employee
                        image.mv(uploadPath, (err) => {
                            if (err) {
                                return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'status': false });
                            }
                        });
                    }

                    // บันทึกข้อมูลใน database
                    let sql = `INSERT INTO employee (username, password, firstName, lastName, email, gender, positionID, phonenumber, imageFile) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    let params = [username, password_hash, firstName, lastName, email, gender, positionID, phonenumber, profileImage];

                    db.query(sql, params, (err, result) => {
                        if (err) {
                            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน', 'status': false });
                        }
                        res.send({ 'message': 'เพิ่มข้อมูลพนักงานเรียบร้อยแล้ว', 'status': true });
                    });
                } catch (hashError) {
                    return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการสร้างรหัสผ่าน', 'status': false });
                }
            } else {
                return res.status(400).send({ 'message': 'ชื่อผู้ใช้ซ้ำ', 'status': false });
            }
        });
    } catch (error) {
        res.status(401).send({ 'message': 'โทเคนไม่ถูกต้อง', 'status': false });
    }
});


    
// Update an employee
app.put('/api/employee/:id', async function(req, res) {
    const empID = req.params.id;
    const token = req.headers["authorization"].replace("Bearer ", "");

    try {
        let decode = jwt.verify(token, SECRET_KEY);

        // ตรวจสอบสิทธิ์ admin หรือเป็นพนักงานที่แก้ไขข้อมูลตนเอง
        if (decode.positionID != 1 && decode.empID != empID) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลพนักงานคนอื่น', status: false });
        }

        const { password, username, firstname, lastname, email, gender, phonenumber } = req.body;
        let profileImage = null;

        // ดึงข้อมูลพนักงานปัจจุบันเพื่อเช็คว่ามีรูปภาพเดิมอยู่หรือไม่
        let sqlSelect = 'SELECT imageFile FROM employee WHERE empID = ?';
        const [employee] = await query(sqlSelect, [empID]);

        // ตรวจสอบไฟล์รูปภาพใหม่
        if (req.files && req.files.profileImage) {
            const image = req.files.profileImage;
            profileImage = Date.now() + '-' + image.name;
            const uploadPath = path.join(__dirname, 'assets/employee', profileImage);

            // ลบรูปภาพเก่าหากมี
            if (employee.imageFile) {
                const oldImagePath = path.join(__dirname, 'assets/employee', employee.imageFile);
                fs.access(oldImagePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        // ลบไฟล์เก่า
                        fs.unlink(oldImagePath, (err) => {
                            if (err) console.error('Error deleting old image:', err);
                        });
                    }
                });
            }

            // บันทึกไฟล์รูปภาพใหม่
            image.mv(uploadPath, (err) => {
                if (err) {
                    return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'status': false });
                }
            });
        }

        // ตรวจสอบไม่ให้ส่งค่า null ไปยังฐานข้อมูล
        let sql = 'UPDATE employee SET username = ?, firstname = ?, lastname = ?, email = ?, gender = ?, phonenumber = ?';
        let params = [
            username, 
            firstname || '',   // ตรวจสอบไม่ให้เป็น null
            lastname || '',    
            email, 
            gender, 
            phonenumber || ''  
        ];

        if (profileImage) {
            sql += ', imageFile = ?'; // อัปเดตไฟล์รูปภาพใหม่
            params.push(profileImage);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            sql += ', password = ?';
            params.push(password_hash);
        }

        sql += ' WHERE empID = ?';
        params.push(empID);

        db.query(sql, params, (err, result) => {
            if (err) throw err;
            res.send({ message: 'แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว', status: true });
        });

    } catch (error) {
        res.status(401).json({ message: 'โทเคนไม่ถูกต้อง', status: false });
    }
});


// ban employee
app.put('/api/employee/ban/:id', async function(req, res) {
    const empID = req.params.id;
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.send({'message': 'ไม่ได้ส่ง token มา', 'status': false});
    }

    try {
        let decode = jwt.verify(token, SECRET_KEY);
        // ตรวจสอบว่าเป็นผู้ดูแลระบบหรือไม่ (positionID = 1 หมายถึง admin)
        if (decode.positionID != 1) {
            return res.send({'message':'คุณไม่มีสิทธิ์ในการระงับพนักงาน', 'status': false});
        }

        // อัปเดต isActive ในตาราง employee ให้เป็น 0
        let sql = "UPDATE employee SET isActive = 0 WHERE empID = ?";
        db.query(sql, [empID], (err, result) => {
            if (err) {
                console.error(err);
                return res.send({'message': 'เกิดข้อผิดพลาดในการระงับพนักงาน', 'status': false});
            }
            res.send({'message': 'ระงับพนักงานเรียบร้อยแล้ว', 'status': true});
        });

    } catch (error) {
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});

// unban employee
app.put('/api/employee/unban/:id', async function(req, res) {
    const empID = req.params.id;
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.send({'message': 'ไม่ได้ส่ง token มา', 'status': false});
    }

    try {
        let decode = jwt.verify(token, SECRET_KEY);
        // ตรวจสอบว่าเป็นผู้ดูแลระบบหรือไม่ (positionID = 1 หมายถึง admin)
        if (decode.positionID != 1) {
            return res.send({'message':'คุณไม่มีสิทธิ์ในการปลดแบนพนักงาน', 'status': false});
        }

        // อัปเดต isActive ในตาราง employee ให้เป็น 1 และเคลีย loginAttempt (ถ้ามี)
        let sql = "UPDATE employee SET isActive = 1, loginAttempt = 0 WHERE empID = ?";
        db.query(sql, [empID], (err, result) => {
            if (err) {
                console.error(err);
                return res.send({'message': 'เกิดข้อผิดพลาดในการปลดแบนพนักงาน', 'status': false});
            }
            res.send({'message': 'ปลดแบนพนักงานเรียบร้อย', 'status': true});
        });

    } catch (error) {
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});

//Delete an employee
app.delete('/api/employee/:id',
    async function(req, res){
        const empID = req.params.id;        
        const token = req.headers["authorization"].replace("Bearer ", "");
            
        try{
            let decode = jwt.verify(token, SECRET_KEY);               
            if(decode.positionID != 1) {
                return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
            }
            
            const sql = `DELETE FROM employee WHERE empID = ?`;
            db.query(sql, [empID], (err, result) => {
                if (err) throw err;
                res.send({'message':'ลบข้อมูลพนักงานเรียบร้อยแล้ว','status':true});
            });

        }catch(error){
            res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
        }
        
    }
);

////////////////////////////////////////////////////////////////////////// Preference ////////////////////////////////////////////////////////////////////////////////////

// Get all preferences
app.get('/api/preferences', async (req, res) => {
    try {
        let sql = 'SELECT * FROM preferences';
        let preferences = await query(sql);
        res.send(preferences);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching preferences', error });
    }
});

// Add a new preference
app.post('/api/preferences', async (req, res) => {
    const { PreferenceName } = req.body;

    if (!PreferenceName) {
        return res.status(400).send({ message: 'Preference name is required' });
    }

    try {
        let sql = 'INSERT INTO preferences (PreferenceNames) VALUES (?)';
        await query(sql, [PreferenceName]);
        res.send({ message: 'Preference added successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error adding preference', error });
    }
});

// Delete a preference
app.delete('/api/preferences/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let sql = 'DELETE FROM preferences WHERE PreferenceID = ?';
        await query(sql, [id]);
        res.send({ message: 'Preference deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting preference', error });
    }
});

// Update a preference
app.put('/api/preferences/:id', async (req, res) => {
    const { id } = req.params;
    const { PreferenceName } = req.body;

    if (!PreferenceName) {
        return res.status(400).send({ message: 'Preference name is required' });
    }

    try {
        let sql = 'UPDATE preferences SET PreferenceNames = ? WHERE PreferenceID = ?';
        await query(sql, [PreferenceName, id]);
        res.send({ message: 'Preference updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating preference', error });
    }
});


////////////////////////////////////////////////////////////////////////// Web server ////////////////////////////////////////////////////////////////////////////////////


// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);
app.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});