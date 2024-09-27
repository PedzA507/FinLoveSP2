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

app.post('/api/user/update/:id', async function (req, res) {
    const { id } = req.params;
    let { username, email, firstname, lastname, nickname, gender, height, home, DateBirth, education, goal, preferences } = req.body;

    try {
        // ดึงข้อมูลเดิมจากฐานข้อมูลก่อน หากข้อมูลบางส่วนไม่ได้ส่งมา
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

        // แปลง DateBirth ให้เป็นรูปแบบ YYYY-MM-DD
        if (DateBirth) {
            DateBirth = new Date(DateBirth).toISOString().split('T')[0]; // ตัดเวลาออก
        } else {
            DateBirth = currentUser.DateBirth; // ถ้าไม่ได้ส่งมา ให้ใช้ค่าจากฐานข้อมูล
        }

        education = education || currentUser.education;
        goal = goal || currentUser.goal;

        const updateUserSql = `
            UPDATE User 
            SET username = ?, email = ?, firstname = ?, lastname = ?, nickname = ?, gender = ?, height = ?, home = ?, DateBirth = ?, education = ?, goal = ?
            WHERE UserId = ?
        `;

        // อัปเดตข้อมูลผู้ใช้ในตาราง User
        const [updateResult] = await db.promise().query(updateUserSql, [username, email, firstname, lastname, nickname, gender, height, home, DateBirth, education, goal, id]);

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
    const sqlDeleteUser = "DELETE FROM User WHERE UserId = ?";

    try {
        // ลบข้อมูลในตาราง userpreferences ก่อน
        await db.promise().query(sqlDeletePreferences, [id]);

        // ลบข้อมูลผู้ใช้
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