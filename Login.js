// API สำหรับการเข้าสู่ระบบ
app.post('/api/login', async function(req, res) {
    const { username, password } = req.body;
    const sql = "SELECT UserId, password FROM User WHERE username = ?";

    try {
        const [users] = await db.promise().query(sql, [username]);

        if (users.length > 0) {
            const storedHashedPassword = users[0].password;
            const match = await bcrypt.compare(password, storedHashedPassword);

            if (match) {
                // Update login attempt and lastAttemptTime, set isActive to true
                const updateSql = "UPDATE User SET loginAttempt = loginAttempt + 1, lastAttemptTime = NOW(), isActive = 1 WHERE UserId = ?";
                await db.promise().query(updateSql, [users[0].UserId]);

                res.send({ 
                    "message": "เข้าสู่ระบบสำเร็จ", 
                    "status": true, 
                    "userID": users[0].UserId 
                });
            } else {
                res.send({ "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "status": false });
            }
        } else {
            res.send({ "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "status": false });
        }
    } catch (err) {
        console.error('Error during login process:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในการเชื่อมต่อ", "status": false });
    }
});
