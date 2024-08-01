const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = 3000

const db  = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "1112",
        database: "finlove"
    }
)
db.connect()

app.use(express.json())
app.use(express.urlencoded ( { extended: true }))

app.post('/api/login', function(req, res){
    const { username, password } = req.body
    const sql = "SELECT * FROM customer WHERE username = ? AND password = ?"

    db.query(sql, [username, password], function(err, result){

        if(err) throw err

        if(result.length > 0){
            let customer = result[0]
            // let customer = result[0]
            // customers:['message']= "เข้าสู่ระบบสำเร็จ"
            // customers:['status']= true
            res.send(result)

        }else{
            res.send({"message":"กรุณาตรวจสอบข้อมูลอีกครั้ง", "status":false})
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})