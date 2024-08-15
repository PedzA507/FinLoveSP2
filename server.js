const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();

require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

db.connect();
const saltRounds = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API สำหรับการเข้าสู่ระบบ
app.post('/api/login', function(req, res) {
    const { username, password } = req.body;
    const sql = "SELECT * FROM User WHERE username = ?";

    db.query(sql, [username], async function(err, result) {
        if (err) return res.status(500).send({"message":"เกิดข้อผิดพลาดในการเชื่อมต่อ", "status":false});

        if (result.length > 0) {
            const storedHashedPassword = result[0].passwords;
            const match = await bcrypt.compare(password, storedHashedPassword);
            
            if (match) {
                res.send({"message":"เข้าสู่ระบบสำเร็จ", "status":true});
            } else {
                res.send({"message":"รหัสผ่านไม่ถูกต้อง", "status":false});
            }
        } else {
            res.send({"message":"ชื่อผู้ใช้นี้ไม่มีอยู่ในระบบ", "status":false});
        }
    });
});

// API สำหรับการลงทะเบียน
app.post('/api/register',async function(req, res) {
    const { email, username, password } = req.body;
    const sqlCheck = "SELECT * FROM User WHERE username = ?";

    // ตรวจสอบว่ามีชื่อผู้ใช้นี้อยู่ในระบบแล้วหรือไม่
    db.query(sqlCheck, [username],async function(err, result) {
        if (err) return res.status(401).send({"message":"เกิดข้อผิดพลาดในการเชื่อมต่อ", "status":false});

        if (result.length > 0) {
            // ถ้ามีชื่อผู้ใช้นี้อยู่แล้วในระบบ
            res.send({"message":"ชื่อผู้ใช้นี้มีอยู่แล้ว", "status":false});
        } else {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const sqlInsert = "INSERT INTO User(username,passwords,email,GenderID)VALUES(?,?,?,'3');";
            db.query(sqlInsert, [username, hashedPassword, email], function(err) {
                if (err) return res.status(402).send({"message":"เกิดข้อผิดพลาดในการลงทะเบียน", "status":false});

                // ถ้าการลงทะเบียนสำเร็จ
                res.send({"message":"ลงทะเบียนสำเร็จ", "status":true});
            });
        }
    });
});

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening on port ${process.env.SERVER_PORT}`);
});
