package th.ac.rmutto.finlove.ui.home

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import org.json.JSONArray
import th.ac.rmutto.finlove.R
import th.ac.rmutto.finlove.databinding.FragmentHomeBinding
import java.io.IOException

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private var userID: Int = -1
    private val client = OkHttpClient()

    private var users = listOf<User>() // เก็บรายการผู้ใช้ทั้งหมด
    private var currentIndex = 0 // ตัวนับสำหรับผู้ใช้ปัจจุบัน

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // รับ userID ที่ถูกส่งมาจาก MainActivity
        userID = arguments?.getInt("userID", -1) ?: -1
        if (userID == -1) {
            Toast.makeText(requireContext(), "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        // ดึงข้อมูลผู้ใช้จาก API และกรองผู้ใช้ที่เป็นผู้ล็อกอินอยู่
        fetchUsers { fetchedUsers ->
            if (fetchedUsers.isNotEmpty()) {
                users = fetchedUsers
                currentIndex = 0
                displayUser(currentIndex) // แสดงผู้ใช้คนแรก
            } else {
                Toast.makeText(requireContext(), "ไม่พบผู้ใช้", Toast.LENGTH_SHORT).show()
            }
        }

        return root
    }

    // ฟังก์ชันแสดงผู้ใช้จากตำแหน่ง currentIndex
    private fun displayUser(index: Int) {
        if (index >= users.size) {
            Toast.makeText(requireContext(), "ไม่มีผู้ใช้อีกแล้ว", Toast.LENGTH_SHORT).show()
            return
        }

        val user = users[index]
        val userListLayout: LinearLayout = binding.userListLayout // LinearLayout ใน fragment_home.xml
        userListLayout.removeAllViews() // ลบรายการผู้ใช้ก่อนหน้าออก

        val userView = LayoutInflater.from(requireContext()).inflate(R.layout.item_user, userListLayout, false)

        // กำหนดข้อมูลผู้ใช้ใน View
        val nickname: TextView = userView.findViewById(R.id.textNickname)
        val profileImage: ImageView = userView.findViewById(R.id.imageProfile)
        val likeButton: Button = userView.findViewById(R.id.buttonLike)
        val dislikeButton: Button = userView.findViewById(R.id.buttonDislike)
        val reportButton: Button = userView.findViewById(R.id.buttonReport)

        nickname.text = user.nickname
        Glide.with(requireContext()).load(user.profilePicture).into(profileImage)

        // เมื่อกดปุ่ม "Like"
        likeButton.setOnClickListener {
            likeUser(user.userID)
        }

        // เมื่อกดปุ่ม "Dislike"
        dislikeButton.setOnClickListener {
            dislikeUser(user.userID)
            nextUser() // ไปยังผู้ใช้คนถัดไปทันทีเมื่อกด "Dislike"
        }

        // เมื่อกดปุ่มรายงาน
        reportButton.setOnClickListener {
            showReportDialog(user.userID)
        }

        // เพิ่ม View ที่สร้างขึ้นใหม่ไปยัง LinearLayout
        userListLayout.addView(userView)
    }

    // ฟังก์ชันไปยังผู้ใช้คนถัดไป
    private fun nextUser() {
        currentIndex++
        if (currentIndex >= users.size) {
            currentIndex = 0 // วนกลับไปผู้ใช้คนแรก
        }
        displayUser(currentIndex) // แสดงผู้ใช้ในตำแหน่งปัจจุบัน
    }

    // ฟังก์ชันสำหรับการกด "Like"
    private fun likeUser(likedID: Int) {
        val url = getString(R.string.root_url) + "/api/like"
        val formBody = FormBody.Builder()
            .add("likerID", userID.toString()) // userID ของผู้ใช้ที่กด "Like"
            .add("likedID", likedID.toString())
            .build()

        client.newCall(Request.Builder().url(url).post(formBody).build()).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                requireActivity().runOnUiThread {
                    Toast.makeText(requireContext(), "Failed to like user", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: okhttp3.Call, response: Response) {
                requireActivity().runOnUiThread {
                    if (response.isSuccessful) {
                        // ตรวจสอบว่าอีกฝ่ายกด "Like" กลับหรือไม่
                        checkMatch(likedID)
                    } else {
                        Toast.makeText(requireContext(), "Error: ${response.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    // ฟังก์ชันตรวจสอบการ Match
    private fun checkMatch(likedID: Int) {
        val url = getString(R.string.root_url) + "/api/check_match"
        val formBody = FormBody.Builder()
            .add("userID", userID.toString()) // userID ของผู้ใช้ที่ล็อกอินอยู่
            .add("likedID", likedID.toString()) // userID ของผู้ใช้ที่ถูกกด "Like"
            .build()

        client.newCall(Request.Builder().url(url).post(formBody).build()).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                requireActivity().runOnUiThread {
                    Toast.makeText(requireContext(), "Failed to check match", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: okhttp3.Call, response: Response) {
                requireActivity().runOnUiThread {
                    val responseBody = response.body?.string()
                    val isMatch = responseBody?.contains("\"match\":true") == true

                    if (isMatch) {
                        // แสดงข้อความ Match ถ้าทั้งสองฝ่ายกด "Like" ให้กัน
                        showMatchPopup()
                    } else {
                        nextUser() // ถ้าไม่มีการ Match ให้ไปผู้ใช้คนถัดไป
                    }
                }
            }
        })
    }

    // ฟังก์ชันแสดง Popup ตรงกลางหน้าจอเมื่อ Match กัน
    private fun showMatchPopup() {
        val builder = AlertDialog.Builder(requireContext())
        builder.setTitle("Match!")
        builder.setMessage("คุณ Match กับผู้ใช้นี้แล้ว!")
        builder.setPositiveButton("ตกลง") { dialog, _ ->
            dialog.dismiss()
            nextUser() // เมื่อกด "ตกลง" ไปยังผู้ใช้คนถัดไป
        }

        val alertDialog = builder.create()
        alertDialog.show()
    }

    // ฟังก์ชันสำหรับการกด "Dislike"
    private fun dislikeUser(dislikedID: Int) {
        val url = getString(R.string.root_url) + "/api/dislike"
        val formBody = FormBody.Builder()
            .add("dislikerID", userID.toString()) // userID ของผู้ใช้ที่กด "Dislike"
            .add("dislikedID", dislikedID.toString())
            .build()

        client.newCall(Request.Builder().url(url).post(formBody).build()).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                requireActivity().runOnUiThread {
                    Toast.makeText(requireContext(), "Failed to dislike user", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: okhttp3.Call, response: Response) {
                requireActivity().runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(requireContext(), "User disliked successfully", Toast.LENGTH_SHORT).show()

                        nextUser() // ไปยังผู้ใช้คนถัดไปทันทีเมื่อกด "Dislike"

                    } else {
                        Toast.makeText(requireContext(), "Error: ${response.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    // แสดง AlertDialog สำหรับเลือกเหตุผลการรายงาน
    private fun showReportDialog(reportedID: Int) {
        val reportOptions = arrayOf("Gore", "Spam", "Nudity")
        val builder = AlertDialog.Builder(requireContext())
        builder.setTitle("เลือกประเภทการรายงาน")
        builder.setSingleChoiceItems(reportOptions, -1) { dialog, which ->
            val reportType = reportOptions[which]
            dialog.dismiss()
            confirmReport(reportedID, reportType)
        }
        builder.create().show()
    }

    // ยืนยันการรายงานผู้ใช้
    private fun confirmReport(reportedID: Int, reportType: String) {
        val builder = AlertDialog.Builder(requireContext())
        builder.setTitle("ยืนยันการรายงาน")
        builder.setMessage("คุณต้องการรายงานผู้ใช้ด้วยเหตุผล '$reportType' หรือไม่?")
        builder.setPositiveButton("ยืนยัน") { _, _ ->
            reportUser(reportedID, reportType)
        }
        builder.setNegativeButton("ยกเลิก", null)
        builder.create().show()
    }

    // ดึงข้อมูลผู้ใช้จาก API และกรองผู้ใช้ที่เป็นผู้ล็อกอินอยู่
    private fun fetchUsers(callback: (List<User>) -> Unit) {
        lifecycleScope.launch(Dispatchers.IO) {
            val url = getString(R.string.root_url) + "/api/users"
            val request = Request.Builder().url(url).build()

            try {
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    val allUsers = parseUsers(responseBody)

                    // กรองผู้ใช้ที่มี userID ไม่ตรงกับผู้ล็อกอิน
                    val filteredUsers = allUsers.filter { it.userID != userID }

                    withContext(Dispatchers.Main) {
                        callback(filteredUsers)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(requireContext(), "ไม่สามารถดึงข้อมูลผู้ใช้ได้", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }


    // แปลงข้อมูล JSON ที่ได้จาก API เป็นรายการผู้ใช้
    private fun parseUsers(responseBody: String?): List<User> {
        val users = mutableListOf<User>()
        responseBody?.let {
            val jsonArray = JSONArray(it)
            for (i in 0 until jsonArray.length()) {
                val jsonObject = jsonArray.getJSONObject(i)
                val user = User(
                    jsonObject.getInt("userID"),
                    jsonObject.getString("nickname"),
                    jsonObject.getString("imageFile")
                )
                users.add(user)
            }
        }
        return users
    }

    // ส่งข้อมูลรายงานผู้ใช้ไปยัง API
    private fun reportUser(reportedID: Int, reportType: String) {
        val url = getString(R.string.root_url) + "/api/report"
        val formBody = FormBody.Builder()
            .add("reporterID", userID.toString())  // ตรวจสอบว่า userID ถูกต้อง
            .add("reportedID", reportedID.toString())
            .add("reportType", reportType)
            .build()

        client.newCall(Request.Builder().url(url).post(formBody).build()).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                requireActivity().runOnUiThread {
                    Toast.makeText(requireContext(), "Failed to report", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: okhttp3.Call, response: Response) {
                requireActivity().runOnUiThread {
                    if (response.isSuccessful) {
                        Toast.makeText(requireContext(), "Report sent successfully", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(requireContext(), "Error: ${response.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

// คลาสสำหรับเก็บข้อมูลผู้ใช้
data class User(val userID: Int, val nickname: String, val profilePicture: String)
