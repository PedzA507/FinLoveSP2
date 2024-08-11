const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1112",
    database: "finlove"
});

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API สำหรับการเข้าสู่ระบบ
app.post('/api/login', function(req, res) {
    const { username, password } = req.body;
    const sql = "SELECT * FROM customer WHERE username = ? AND password = ?";

    db.query(sql, [username, password], function(err, result) {
        if (err) return res.status(500).send({"message":"เกิดข้อผิดพลาดในการเชื่อมต่อ", "status":false});

        if (result.length > 0) {
            res.send({"message":"เข้าสู่ระบบสำเร็จ", "status":true});
        } else {
            res.send({"message":"กรุณาตรวจสอบข้อมูลอีกครั้ง", "status":false});
        }
    });
});

// API สำหรับการลงทะเบียน
app.post('/api/register', function(req, res) {
    const { email, username, password } = req.body;
    const sqlCheck = "SELECT * FROM customer WHERE username = ?";

    // ตรวจสอบว่ามีชื่อผู้ใช้นี้อยู่ในระบบแล้วหรือไม่
    db.query(sqlCheck, [username], function(err, result) {
        if (err) return res.status(500).send({"message":"เกิดข้อผิดพลาดในการเชื่อมต่อ", "status":false});

        if (result.length > 0) {
            // ถ้ามีชื่อผู้ใช้นี้อยู่แล้วในระบบ
            res.send({"message":"ชื่อผู้ใช้นี้มีอยู่แล้ว", "status":false});
        } else {
            const sqlInsert = "INSERT INTO customer (email, username, password) VALUES (?, ?, ?)";
            db.query(sqlInsert, [email, username, password], function(err, result) {
                if (err) return res.status(500).send({"message":"เกิดข้อผิดพลาดในการลงทะเบียน", "status":false});

                // ถ้าการลงทะเบียนสำเร็จ
                res.send({"message":"ลงทะเบียนสำเร็จ", "status":true});
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
