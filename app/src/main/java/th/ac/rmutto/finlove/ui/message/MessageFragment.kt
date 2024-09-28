package th.ac.rmutto.finlove.ui.message

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.bumptech.glide.Glide
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import th.ac.rmutto.finlove.ProfileActivity
import th.ac.rmutto.finlove.R
import th.ac.rmutto.finlove.User
import th.ac.rmutto.finlove.databinding.FragmentMessageBinding

class MessageFragment : Fragment() {

    private var _binding: FragmentMessageBinding? = null
    private val binding get() = _binding!!

    private lateinit var originalUser: User

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMessageBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // ปุ่มแก้ไขโปรไฟล์
        val buttonEditProfile = binding.buttonEditProfile
        val userID = arguments?.getInt("userID", -1) ?: -1

        // ตรวจสอบ userID และโหลดข้อมูลผู้ใช้
        if (userID != -1) {
            fetchUserInfo(userID)
        } else {
            Toast.makeText(requireContext(), "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        buttonEditProfile.setOnClickListener {
            if (::originalUser.isInitialized && originalUser.id != -1) {
                val intent = Intent(requireContext(), ProfileActivity::class.java)
                intent.putExtra("userID", originalUser.id) // ส่ง userID ที่ถูกต้อง
                startActivity(intent)
            } else {
                Toast.makeText(requireContext(), "ไม่พบข้อมูลผู้ใช้", Toast.LENGTH_LONG).show()
            }
        }

        return root
    }

    // ฟังก์ชันการดึงข้อมูลผู้ใช้
    private fun fetchUserInfo(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = getString(R.string.root_url) + "/api/user/$userID"
                val request = Request.Builder().url(url).build()
                val response = OkHttpClient().newCall(request).execute()

                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    originalUser = parseUserInfo(responseBody)

                    withContext(Dispatchers.Main) {
                        // อัปเดต UI ตามข้อมูลผู้ใช้
                        binding.toolbarProfile.title = originalUser.nickname
                        binding.textViewFirstName.setText(originalUser.firstName)
                        binding.textViewLastName.setText(originalUser.lastName)
                        binding.textViewNickname.setText(originalUser.nickname)

                        // โหลดรูปภาพผู้ใช้
                        loadImage(originalUser.imageFile)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(requireContext(), "ไม่สามารถดึงข้อมูลผู้ใช้ได้", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(requireContext(), "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    // ฟังก์ชันสำหรับแปลงข้อมูลผู้ใช้จาก JSON
    private fun parseUserInfo(responseBody: String?): User {
        val jsonObject = JSONObject(responseBody ?: "{}")
        return User(
            id = jsonObject.optInt("id", -1),
            username = jsonObject.optString("username", ""),
            nickname = jsonObject.optString("nickname", ""),
            email = jsonObject.optString("email", ""),
            firstName = jsonObject.optString("firstname", ""),
            lastName = jsonObject.optString("lastname", ""),
            gender = jsonObject.optString("gender", ""),
            education = jsonObject.optString("education", ""),
            goal = jsonObject.optString("goal", ""),
            preferences = jsonObject.optString("preferences", ""),
            height = jsonObject.optDouble("height", 0.0),
            home = jsonObject.optString("home", ""),
            dateBirth = jsonObject.optString("DateBirth", ""),
            imageFile = jsonObject.optString("imageFile", "")
        )
    }

    // ฟังก์ชันสำหรับโหลดรูปภาพ
    private fun loadImage(imageUrl: String?) {
        imageUrl?.let {
            Glide.with(this)
                .load(it)
                .placeholder(R.drawable.img_1) // รูป placeholder
                .into(binding.imageViewProfile)
        } ?: run {
            binding.imageViewProfile.setImageResource(R.drawable.img_1)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
