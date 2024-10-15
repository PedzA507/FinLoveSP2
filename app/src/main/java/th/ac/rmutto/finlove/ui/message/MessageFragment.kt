package th.ac.rmutto.finlove.ui.message

import android.content.Intent
import android.os.Bundle
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
import org.json.JSONObject
import th.ac.rmutto.finlove.ChatActivity
import th.ac.rmutto.finlove.R
import th.ac.rmutto.finlove.databinding.FragmentMessageBinding

class MessageFragment : Fragment() {

    private var _binding: FragmentMessageBinding? = null
    private val binding get() = _binding!!
    private var userID: Int = -1
    private val client = OkHttpClient()

    private var matchedUsers = listOf<MatchedUser>()

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

    private fun displayUsers() {
        val userListLayout: LinearLayout = binding.userListLayout
        userListLayout.removeAllViews() // ลบรายการก่อนหน้าออก

        matchedUsers.forEach { user ->
            val userView = LayoutInflater.from(requireContext()).inflate(R.layout.item_matched_user, userListLayout, false)

            val nickname: TextView = userView.findViewById(R.id.nickname)
            val profileImage: ImageView = userView.findViewById(R.id.profile_image)
            val lastMessage: TextView = userView.findViewById(R.id.last_message)

            nickname.text = user.nickname
            lastMessage.text = user.lastMessage ?: "ไม่มีข้อความล่าสุด"
            Glide.with(requireContext()).load(user.profilePicture).into(profileImage)

            // เมื่อกดที่รายการให้ไปยังหน้า ChatActivity
            userView.setOnClickListener {
                val intent = Intent(requireContext(), ChatActivity::class.java).apply {
                    putExtra("matchID", user.matchID)  // ส่ง matchID ไปยัง ChatActivity
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
            Log.d("API Request", "Fetching matched users from URL: $url")  // เพิ่ม Log เพื่อตรวจสอบ URL
            val request = Request.Builder().url(url).build()

            try {
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    Log.d("API Response", responseBody ?: "ไม่มีการตอบกลับ")  // เพิ่ม Log เพื่อตรวจสอบการตอบกลับ
                    val matchedUsersList = parseUsers(responseBody)
                    withContext(Dispatchers.Main) {
                        callback(matchedUsersList)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Log.e("API Error", "Response not successful: ${response.message}")  // เพิ่ม Log เพื่อแสดง error
                        Toast.makeText(requireContext(), "ไม่สามารถดึงข้อมูลผู้ใช้ได้", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.e("API Error", "Exception occurred: ${e.message}")  // เพิ่ม Log เพื่อแสดงข้อผิดพลาด
                    Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    // แปลงข้อมูล JSON ให้เป็นรายการผู้ใช้
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
    val matchID: Int  // เพิ่ม matchID ที่นี่
)
