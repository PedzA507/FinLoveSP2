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