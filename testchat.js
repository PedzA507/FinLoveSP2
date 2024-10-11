// Function to execute a query with a promise-based approach
function query(sql, params) {
    return new Promise(function (resolve, reject) {
        db.query(sql, params, function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Hello world route
app.get('/', function (req, res) {
    res.send('Hello World!');
});

// Create or join a chat room
app.post('/chat/join', async function (req, res) {
    const { userID, chatRoomName } = req.body;
    
    // Check if the chat room exists, if not create it
    let sql = 'SELECT chat_room_id FROM chat_rooms WHERE chat_room_name = ?';
    let results = await query(sql, [chatRoomName]);
    
    let chatRoomID;
    if (results.length === 0) {
        sql = 'INSERT INTO chat_rooms (chat_room_name) VALUES (?)';
        const insertResult = await query(sql, [chatRoomName]);
        chatRoomID = insertResult.insertId;
    } else {
        chatRoomID = results[0].chat_room_id;
    }

    // Add the user to the chat room
    sql = 'INSERT INTO chat_room_users (chat_room_id, user_id) VALUES (?, ?)';
    await query(sql, [chatRoomID, userID]);

    res.send({ 'message': 'User joined chat room', 'status': true, chatRoomID });
});

// Post a message in a chat room
app.post('/chat/post', async function (req, res) {
    const { chatRoomID, senderID, message } = req.body;
    
    // Insert the message into the database
    let sql = 'INSERT INTO messages (chat_room_id, sender_id, message) VALUES (?, ?, ?)';
    await query(sql, [chatRoomID, senderID, message]);

    res.send({ 'message': 'Message posted successfully', 'status': true });
});

// Show messages from a chat room
app.get('/chat/show/:chatRoomID', async function (req, res) {
    const chatRoomID = req.params.chatRoomID;
    
    let sql = `SELECT m.message, u.username AS sender, 
                    CASE
                      WHEN CAST(CURRENT_TIMESTAMP AS DATE) = SUBSTRING(m.sent_at,1,10) THEN CONCAT(DATE_FORMAT(m.sent_at, "%H:%i"), " น.")
                      ELSE DATE_FORMAT(m.sent_at, "%d/%m")
                    END AS sent_at
                FROM messages m
                JOIN users u ON m.sender_id = u.user_id
                WHERE m.chat_room_id = ?
                ORDER BY m.sent_at ASC`;
    
    const result = await query(sql, [chatRoomID]);
    res.send(result);
});