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