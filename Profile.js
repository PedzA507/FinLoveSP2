// เรียกดูข้อมูลผู้ใช้ตาม ID (GET)
app.get('/api/user/:id', async function(req, res) {
    const { id } = req.params;
    const sql = `
        SELECT 
            u.username, u.email, u.firstname, u.lastname, u.nickname, 
            g.Gender_Name AS gender, u.height, u.home, u.DateBirth, 
            u.education, u.goal, u.imageFile 
        FROM user u
        LEFT JOIN gender g ON u.GenderID = g.GenderID
        WHERE u.UserID = ?`;

    try {
        const [result] = await db.promise().query(sql, [id]);
        if (result.length > 0) {
            if(result[0].imageFile) {
                result[0].imageFile = `${req.protocol}://${req.get('host')}/uploads/${result[0].imageFile}`;
            }
            res.send(result[0]);
        } else {
            res.status(404).send({ "message": "ไม่พบข้อมูลผู้ใช้", "status": false });
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้", "status": false });
    }
});

// อัปเดตข้อมูลผู้ใช้ (POST)
app.post('/api/user/update/:id', async function(req, res) {
    const { id } = req.params;
    const { username, email, firstname, lastname, nickname, gender, height, home, DateBirth, education, goal } = req.body;
    
    const sql = `
        UPDATE User 
        SET username = ?, email = ?, firstname = ?, lastname = ?, nickname = ?, gender = ?, height = ?, home = ?, DateBirth = ?, education = ?, goal = ? 
        WHERE UserId = ?
    `;

    try {
        await db.promise().query(sql, [username, email, firstname, lastname, nickname, gender, height, home, DateBirth, education, goal, id]);
        res.send({ "message": "ข้อมูลถูกอัปเดตเรียบร้อย", "status": true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้", "status": false });
    }
});


app.put('/api/user/update/:id', upload.single('imageFile'), async function(req, res) {
    const { id } = req.params;
    const { username, email, firstname, lastname, gender } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!username || !email || !firstname || !lastname || !gender) {
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    // หา GenderID จากชื่อเพศ
    try {
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