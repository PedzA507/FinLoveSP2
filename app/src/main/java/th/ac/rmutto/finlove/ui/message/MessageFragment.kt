package th.ac.rmutto.finlove.ui.message

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import th.ac.rmutto.finlove.ChatActivity
import th.ac.rmutto.finlove.OtherProfileActivity
import th.ac.rmutto.finlove.R
import th.ac.rmutto.finlove.databinding.FragmentMessageBinding

class MessageFragment : Fragment() {

    private var _binding: FragmentMessageBinding? = null
    private val binding get() = _binding!!
    private var userID: Int = -1
    private val client = OkHttpClient()

    private var matchedUsers = listOf<MatchedUser>()

    private val handler = Handler()
    private val refreshInterval = 2000L // รีเฟรชทุก 2 วินาที

    private val refreshRunnable = object : Runnable {
        override fun run() {
            fetchMatchedUsers { fetchedUsers ->
                if (fetchedUsers.isNotEmpty()) {
                    matchedUsers = fetchedUsers
                    displayUsers() // อัปเดต UI ด้วยข้อมูลล่าสุด
                }
            }
            handler.postDelayed(this, refreshInterval) // กำหนดการรีเฟรชครั้งถัดไป
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMessageBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // รับ userID ที่ถูกส่งมาจาก MainActivity
        userID = arguments?.getInt("userID", -1) ?: -1

        // ตรวจสอบว่า userID ถูกส่งมาหรือไม่
        if (userID != -1) {
            fetchMatchedUsers { fetchedUsers ->
                if (fetchedUsers.isNotEmpty()) {
                    matchedUsers = fetchedUsers
                    displayUsers() // แสดงรายชื่อผู้ใช้ที่จับคู่
                } else {
                    Toast.makeText(requireContext(), "ไม่พบผู้ใช้ที่จับคู่กัน", Toast.LENGTH_SHORT).show()
                }
            }
        } else {
            Toast.makeText(requireContext(), "UserID ไม่ถูกพบ", Toast.LENGTH_SHORT).show()
        }

        return root
    }

    override fun onResume() {
        super.onResume()
        handler.post(refreshRunnable) // เริ่มการรีเฟรชข้อมูล
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(refreshRunnable) // หยุดการรีเฟรชข้อมูล
    }

    private fun displayUsers() {
        val userListLayout: LinearLayout = binding.userListLayout
        userListLayout.removeAllViews() // ลบรายการก่อนหน้าออก

        matchedUsers.forEach { user ->
            val userView = LayoutInflater.from(requireContext()).inflate(R.layout.item_message, userListLayout, false)

            val nickname: TextView = userView.findViewById(R.id.textNickname)
            val profileImage: ImageView = userView.findViewById(R.id.imageProfile)
            val lastMessage: TextView = userView.findViewById(R.id.lastMessage)

            nickname.text = user.nickname
            lastMessage.text = user.lastMessage ?: "ไม่มีข้อความล่าสุด"
            Glide.with(requireContext()).load(user.profilePicture).into(profileImage)

            // เมื่อกดที่รายการให้ไปยังหน้า ChatActivity
            userView.setOnClickListener {
                val intent = Intent(requireContext(), ChatActivity::class.java).apply {
                    putExtra("matchID", user.matchID)  // ส่ง matchID ไปยัง ChatActivity
                    putExtra("senderID", userID)  // ส่ง userID ของผู้ใช้ที่ล็อกอินไปด้วย (คือ senderID)
                }
                startActivity(intent)
            }

            // เพิ่มฟังก์ชันการกดที่รูปโปรไฟล์เพื่อไปหน้า OtherProfileActivity
            profileImage.setOnClickListener {
                val intent = Intent(requireContext(), OtherProfileActivity::class.java).apply {
                    putExtra("userID", user.userID)  // ส่ง userID ของคู่สนทนาไปหน้าโปรไฟล์
                }
                startActivity(intent)
            }

            // เพิ่ม view ของผู้ใช้แต่ละคนเข้าไปใน layout
            userListLayout.addView(userView)
        }
    }

    // ดึงข้อมูลผู้ใช้ที่จับคู่จาก API
    private fun fetchMatchedUsers(callback: (List<MatchedUser>) -> Unit) {
        lifecycleScope.launch(Dispatchers.IO) {
            val url = getString(R.string.root_url) + "/api/matches/$userID"
            Log.d("API Request", "Fetching matched users from URL: $url")
            val request = Request.Builder().url(url).build()

            try {
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d("API Response", responseBody ?: "ไม่มีการตอบกลับ")
                    val matchedUsersList = parseUsers(responseBody)
                    withContext(Dispatchers.Main) {
                        callback(matchedUsersList)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Log.e("API Error", "Response not successful: ${response.message}")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.e("API Error", "Exception occurred: ${e.message}")
                }
            }
        }
    }

    private fun parseUsers(responseBody: String?): List<MatchedUser> {
        val users = mutableListOf<MatchedUser>()
        responseBody?.let {
            val jsonArray = JSONArray(it)
            for (i in 0 until jsonArray.length()) {
                val jsonObject = jsonArray.getJSONObject(i)
                val user = MatchedUser(
                    jsonObject.getInt("userID"),
                    jsonObject.getString("nickname"),
                    jsonObject.getString("imageFile"),
                    jsonObject.optString("lastMessage"),
                    jsonObject.getInt("matchID")
                )
                users.add(user)
            }
        }
        return users
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

// Data class สำหรับเก็บข้อมูลผู้ใช้ที่จับคู่
data class MatchedUser(
    val userID: Int,
    val nickname: String,
    val profilePicture: String,
    val lastMessage: String?,
    val matchID: Int
)
