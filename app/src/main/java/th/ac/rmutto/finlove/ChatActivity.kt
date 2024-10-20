package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import th.ac.rmutto.finlove.databinding.ActivityChatBinding

class ChatActivity : AppCompatActivity() {

    private lateinit var binding: ActivityChatBinding
    private val client = OkHttpClient()
    private var matchID: Int = -1
    private var senderID: Int = -1
    private var receiverNickname: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // รับค่า matchID, senderID, และ nickname ของคู่สนทนา
        matchID = intent.getIntExtra("matchID", -1)
        senderID = intent.getIntExtra("senderID", -1)
        receiverNickname = intent.getStringExtra("nickname") ?: ""

        // ตรวจสอบค่าที่ได้รับ
        Log.d("ChatActivity", "Received matchID: $matchID, senderID: $senderID, nickname: $receiverNickname")

        if (matchID == -1 || senderID == -1) {
            Log.e("ChatActivity", "matchID หรือ senderID ไม่ถูกต้อง")
            Toast.makeText(this, "ไม่พบข้อมูลการสนทนา", Toast.LENGTH_LONG).show()
            return
        }

        // ตั้งค่า Toolbar ให้แสดงชื่อเล่นของคู่สนทนา
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = receiverNickname
        supportActionBar?.setDisplayHomeAsUpEnabled(true) // เพิ่มปุ่มย้อนกลับ

        // กำหนดการทำงานของปุ่มย้อนกลับ
        binding.toolbar.setNavigationOnClickListener {
            finish() // ย้อนกลับไปหน้าก่อนหน้า
        }

        // ตั้งค่า RecyclerView
        val chatAdapter = ChatAdapter(senderID) // ใช้ senderID ของผู้ใช้ที่ล็อกอินเป็น currentUserID
        binding.recyclerViewChat.layoutManager = LinearLayoutManager(this)
        binding.recyclerViewChat.adapter = chatAdapter

        Log.d("ChatActivity", "RecyclerView Adapter attached")

        // ดึงข้อมูลการสนทนา
        fetchChatMessages()

        // เมื่อผู้ใช้ส่งข้อความ
        binding.sendButton.setOnClickListener {
            val message = binding.messageInput.text.toString().trim()
            Log.d("ChatActivity", "User attempting to send message: $message")
            if (message.isNotEmpty()) {
                sendMessage(message)
                binding.messageInput.text.clear()
            } else {
                Log.d("ChatActivity", "Message is empty, skipping send")
            }
        }
    }


    private fun fetchChatMessages() {
        lifecycleScope.launch(Dispatchers.IO) {
            val url = getString(R.string.root_url) + "/api/chats/$matchID"
            Log.d("ChatActivity", "Fetching chat messages from URL: $url")

            val request = Request.Builder().url(url).build()

            try {
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d("ChatActivity", "API response: $responseBody")

                    val messages = parseChatMessages(responseBody)
                    withContext(Dispatchers.Main) {
                        if (messages.isEmpty()) {
                            // ถ้าไม่มีข้อความในแชท ให้แสดงข้อความ "เริ่มแชทกันเลย !!!"
                            binding.emptyChatMessage.visibility = View.VISIBLE
                            binding.recyclerViewChat.visibility = View.GONE
                        } else {
                            // ถ้ามีข้อความในแชท ให้แสดงข้อความตามปกติ
                            binding.emptyChatMessage.visibility = View.GONE
                            binding.recyclerViewChat.visibility = View.VISIBLE
                            (binding.recyclerViewChat.adapter as ChatAdapter).setMessages(messages)
                            Log.d("ChatActivity", "Messages set in Adapter: ${messages.size} items")
                        }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Log.e("ChatActivity", "Failed to fetch chat messages: ${response.message}")
                        Toast.makeText(this@ChatActivity, "ไม่สามารถดึงข้อมูลการสนทนาได้", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.e("ChatActivity", "Error occurred while fetching chat messages: ${e.message}")
                    Toast.makeText(this@ChatActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun sendMessage(message: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            val url = getString(R.string.root_url) + "/api/chats/$matchID"
            Log.d("ChatActivity", "Sending message to URL: $url")

            val requestBody = FormBody.Builder()
                .add("senderID", senderID.toString())
                .add("message", message)
                .build()

            val request = Request.Builder()
                .url(url)
                .post(requestBody)
                .build()

            try {
                val response = client.newCall(request).execute()
                if (!response.isSuccessful) {
                    withContext(Dispatchers.Main) {
                        Log.e("ChatActivity", "Failed to send message: ${response.message}")
                        Toast.makeText(this@ChatActivity, "ไม่สามารถส่งข้อความได้", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Log.d("ChatActivity", "Message sent successfully")
                    fetchChatMessages() // ดึงข้อมูลการสนทนาใหม่
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.e("ChatActivity", "Error occurred while sending message: ${e.message}")
                    Toast.makeText(this@ChatActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun parseChatMessages(responseBody: String?): List<ChatMessage> {
        val messages = mutableListOf<ChatMessage>()
        responseBody?.let {
            try {
                val jsonObject = JSONObject(it) // แปลงเป็น JSON Object
                val messagesArray = jsonObject.getJSONArray("messages") // เข้าถึงอาร์เรย์ messages

                Log.d("ChatActivity", "Parsing ${messagesArray.length()} messages from response")

                for (i in 0 until messagesArray.length()) {
                    val messageObject = messagesArray.getJSONObject(i)
                    val chatMessage = ChatMessage(
                        messageObject.getInt("senderID"),
                        messageObject.getString("nickname"),
                        messageObject.getString("imageFile"),
                        messageObject.getString("message"),
                        messageObject.getString("timestamp")
                    )
                    Log.d("ChatActivity", "Parsed message from ${chatMessage.nickname}: ${chatMessage.message}")
                    messages.add(chatMessage)
                }
            } catch (e: Exception) {
                Log.e("ChatActivity", "Error parsing chat messages: ${e.message}")
            }
        }
        return messages
    }
}

// Data class สำหรับเก็บข้อมูลการสนทนา
data class ChatMessage(
    val senderID: Int,
    val nickname: String,
    val profilePicture: String,
    val message: String,
    val timestamp: String
)
