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
