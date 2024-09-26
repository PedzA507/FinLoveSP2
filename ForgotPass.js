// API สำหรับการจัดการรีเซ็ตรหัสผ่าน
app.post('/api/reset-password', async function(req, res) {
    const { email, newPassword, token } = req.body;

    if (token) {
        try {
            const [result] = await db.promise().query("SELECT * FROM User WHERE resetToken = ? AND resetTokenExpiration > ?", [token, new Date()]);
            if (result.length > 0) {
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                await db.promise().query("UPDATE User SET password = ?, resetToken = NULL, resetTokenExpiration = NULL WHERE resetToken = ?", [hashedPassword, token]);
                res.send({ "message": "รหัสผ่านของคุณถูกรีเซ็ตเรียบร้อยแล้ว", "status": true });
            } else {
                res.send({ "message": "ลิงค์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ", "status": false });
            }
        } catch (err) {
            console.error('Database error:', err);
            res.status(500).send({ "message": "เกิดข้อผิดพลาดในการเชื่อมต่อ", "status": false });
        }
    } else if (email) {
        try {
            const [result] = await db.promise().query("SELECT * FROM User WHERE email = ?", [email]);
            if (result.length > 0) {
                const token = crypto.randomBytes(20).toString('hex');
                const expirationDate = new Date(Date.now() + 3600000); // ลิงค์ใช้ได้ 1 ชั่วโมง

                await db.promise().query("UPDATE User SET resetToken = ?, resetTokenExpiration = ? WHERE email = ?", [token, expirationDate, email]);

                const resetLink = `http://192.168.1.49:${process.env.SERVER_PORT}/reset-password?token=${token}`;

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'รีเซ็ตรหัสผ่านของคุณ',
                    text: `คุณได้รับคำขอในการรีเซ็ตรหัสผ่านของคุณ คลิกที่ลิงค์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ: ${resetLink}`
                };

                await transporter.sendMail(mailOptions);
                res.send({ "message": "ลิงค์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณ", "status": true });
            } else {
                res.send({ "message": "อีเมลนี้ไม่มีในระบบ", "status": false });
            }
        } catch (err) {
            console.error('Database error:', err);
            res.status(500).send({ "message": "เกิดข้อผิดพลาดในการเชื่อมต่อ", "status": false });
        }
    } else {
        res.status(400).send({ "message": "ข้อมูลที่ให้มาผิดพลาด", "status": false });
    }
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});