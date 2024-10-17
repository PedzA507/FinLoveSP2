const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = 5000

const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'UX23Y24%@&2aMb';

const fileupload = require('express-fileupload');
const path = require('path');
const crypto = require('crypto');

// Load SSL certificates
const privateKey = fs.readFileSync('privatekey.pem', 'utf8');
const certificate = fs.readFileSync('certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Import CORS library
const cors = require('cors');

//Database(MySql) configulation
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "1234",
        database: "finlove"
    }
)
db.connect()

//Middleware (Body parser)
app.use(express.json())
app.use(express.urlencoded ({extended: true}))
app.use(cors());
app.use(fileupload());

//Hello World API
app.get('/', function(req, res){
    res.send('Hello World!')
});


/*############## user ##############*/
//Register
app.post('/api/register', 
    function(req, res) {  
        const { username, password, firstName, lastName } = req.body;
        
        //check existing username
        let sql="SELECT * FROM user WHERE username=?";
        db.query(sql, [username], async function(err, results) {
            if (err) throw err;
            
            if(results.length == 0) {
                //password and salt are encrypted by hash function (bcrypt)
                const salt = await bcrypt.genSalt(10); //generate salte
                const password_hash = await bcrypt.hash(password, salt);        
                                
                //insert user data into the database
                sql = 'INSERT INTO user (username, password, firstName, lastName) VALUES (?, ?, ?, ?)';
                db.query(sql, [username, password_hash, firstName, lastName], (err, result) => {
                    if (err) throw err;
                
                    res.send({'message':'ลงทะเบียนสำเร็จแล้ว','status':true});
                });      
            }else{
                res.send({'message':'ชื่อผู้ใช้ซ้ำ','status':false});
            }

        });      
    }
);


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



//Function to execute a query with a promise-based approach
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


// List users with relevant fields only
app.get('/api/user', async function(req, res){             
    const token = req.headers["authorization"].replace("Bearer ", "");
        
    try{
        let decode = jwt.verify(token, SECRET_KEY);               
        if(decode.positionID != 1 && decode.positionID != 2) {
          return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
        }
        
        // Query to pull the required fields from user table
        let sql = "SELECT userID, username, firstname, lastname, imageFile FROM user";            
        db.query(sql, function (err, result){
            if (err) throw err;            
            // Send the result back to the frontend, including userID
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
        
        // Query to pull the required fields from user table and join with userreport and report
        let sql = `
            SELECT u.userID, u.username, u.imageFile, r.reportType
            FROM user u
            JOIN userreport ur ON u.userID = ur.reportedID
            JOIN report r ON ur.reportID = r.reportID
        `;  
              
        db.query(sql, function (err, result){
            if (err) throw err;            
            // Send the result back to the frontend, including userID and reportType
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
            SELECT u.username, u.firstname, u.lastname, u.email, u.GenderID, u.home, u.phonenumber, u.imageFile
            FROM user u
            WHERE u.userID = ? AND u.isActive = 1
        `;
        let user = await query(userSQL, [userID]);

        if (user.length === 0) {
            return res.send({'message':'ไม่พบผู้ใช้งาน', 'status': false});
        }

        // ดึงประวัติการรายงานของผู้ใช้ (ไม่มี timestamp)
        let reportSQL = `
            SELECT r.reportType
            FROM userreport ur
            JOIN report r ON ur.reportID = r.reportID
            WHERE ur.reportedID = ?
        `;
        let reportHistory = await query(reportSQL, [userID]);

        user = user[0];
        user['reportHistory'] = reportHistory;
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
        if (userID != decode.userID && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false});
        }
        
        // Handle image file update if provided
        let fileName = "";
        if (req?.files?.imageFile) {        
            const imageFile = req.files.imageFile;
            fileName = imageFile.name.split(".");
            fileName = fileName[0] + Date.now() + '.' + fileName[1]; 
        
            const imagePath = path.join(__dirname, 'assets/user', fileName);
            fs.writeFile(imagePath, imageFile.data, (err) => {
                if(err) throw err;
            });
        }

        // Destructure data from the request body
        const { password, username, firstname, lastname, email, home, phonenumber } = req.body;

        // Build SQL query
        let sql = 'UPDATE user SET username = ?, firstname = ?, lastname = ?, email = ?, home = ?, phonenumber = ?';
        let params = [username, firstname, lastname, email, home, phonenumber];

        // If password is provided, hash and update it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            sql += ', password = ?';
            params.push(password_hash);
        }

        // If a new image was uploaded, update the image file
        if (fileName != "") {    
            sql += ', imageFile = ?';
            params.push(fileName);
        }

        // Finalize the query with the userID
        sql += ' WHERE userID = ?';
        params.push(userID);

        // Execute the query
        db.query(sql, params, (err, result) => {
            if (err) throw err;
            res.send({ 'message': 'แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว', 'status': true });
        });
        
    } catch(error) {
        res.send({'message':'โทเคนไม่ถูกต้อง', 'status': false});
    }
});

// Suspend a user (set isActive to 0 in user table)
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

        // อัปเดต isActive ในตาราง user ให้เป็น 0
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

// Unban a user (set isActive to 1 and clear loginAttempt in user table)
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

        // อัปเดต isActive ในตาราง user ให้เป็น 1 และเคลีย loginAttempt
        let sql = "UPDATE user SET isActive = 1, loginAttempt = 0 WHERE userID = ?";
        db.query(sql, [userID], (err, result) => {
            if (err) {
                console.error(err);
                return res.send({'message': 'เกิดข้อผิดพลาดในการปลดแบนผู้ใช้', 'status': false});
            }
            res.send({'message': 'ปลดแบนผู้ใช้เรียบร้อยแล้วและเคลียร์จำนวนครั้งที่ล็อกอินสำเร็จ', 'status': true});
        });

    } catch (error) {
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});




    
//Delete a user
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

            // First, delete related entries from the `userlike` table
            const deleteLikesSQL = `DELETE FROM userlike WHERE likedID = ? OR likerID = ?`;
            db.query(deleteLikesSQL, [userID, userID], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        throw err;
                    });
                }

                // Next, delete related entries from the `userreport` table
                const deleteReportsSQL = `DELETE FROM userreport WHERE reportedID = ? OR reporterID = ?`;
                db.query(deleteReportsSQL, [userID, userID], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            throw err;
                        });
                    }

                    // Then, delete the user from the `user` table
                    const deleteUserSQL = `DELETE FROM user WHERE UserID = ?`;
                    db.query(deleteUserSQL, [userID], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                throw err;
                            });
                        }

                        // Commit the transaction
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

    } catch (error) {
        res.send({'message': 'โทเคนไม่ถูกต้อง', 'status': false});
    }
});








/*############## employee ##############*/
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


//Show an employee image
app.get('/api/employee/image/:filename', 
    function(req, res) {
        const filepath = path.join(__dirname, 'assets/employee', req.params.filename);  
        res.sendFile(filepath);
    }
);

//Generate a password
function generateRandomPassword(length) {
    return crypto
        .randomBytes(length)
        .toString('base64')
        .slice(0, length)
        .replace(/\+/g, 'A')  // Replace '+' to avoid special chars if needed
        .replace(/\//g, 'B'); // Replace '/' to avoid special chars if needed
}


//Add an employee
app.post('/api/employee', 
    async function(req, res){
  
        //receive a token
        const token = req.headers["authorization"].replace("Bearer ", "");        
    
        try{
            //validate the token    
            let decode = jwt.verify(token, SECRET_KEY);               
            if(decode.positionID != 1) {
                return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
            }            

            //receive data from users
            const {username, firstName, lastName, email, gender } = req.body;

            //check existing username
            let sql="SELECT * FROM employee WHERE username=?";
            db.query(sql, [username], async function(err, results) {
                if (err) throw err;
                
                if(results.length == 0) {
                    //password and salt are encrypted by hash function (bcrypt)
                    const password = generateRandomPassword(8);
                    const salt = await bcrypt.genSalt(10); //generate salte
                    const password_hash = await bcrypt.hash(password, salt);    
                    
                    //save data into database                
                    let sql = `INSERT INTO employee(
                            username, password, firstName, lastName, email, gender
                            )VALUES(?, ?, ?, ?, ?, ?)`;   
                    let params = [username, password_hash, firstName, lastName, email, gender];
                
                    db.query(sql, params, (err, result) => {
                        if (err) throw err;
                        res.send({ 'message': 'เพิ่มข้อมูลพนักงานเรียบร้อยแล้ว', 'status': true });
                    });                    

                }else{
                    res.send({'message':'ชื่อผู้ใช้ซ้ำ','status':false});
                }
            });                        
            
        }catch(error){
            res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
        }    
    }
);
    
//Update an employee
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

        // ตรวจสอบไม่ให้ส่งค่า null ไปยังฐานข้อมูล
        let sql = 'UPDATE employee SET username = ?, firstname = ?, lastname = ?, email = ?, gender = ?, phonenumber = ?';
        let params = [
            username, 
            firstname || '',   // ตรวจสอบไม่ให้เป็น null
            lastname || '',    // ตรวจสอบไม่ให้เป็น null
            email, 
            gender, 
            phonenumber || ''  // ตรวจสอบไม่ให้เป็น null
        ];

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



// Suspend an employee (set isActive to 0 in employee table)
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

// Unsuspend an employee (set isActive to 1 and clear loginAttempt in employee table if applicable)
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

/*############## WEB SERVER ##############*/  
// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);
app.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});