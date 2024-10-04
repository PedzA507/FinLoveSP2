package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody

class RegisterActivity5 : AppCompatActivity() {

    private lateinit var selectedPreferences: MutableList<Int> // ต้องเป็น Int เพราะเราจะเก็บ PreferenceID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register5)

        selectedPreferences = mutableListOf()

        val buttonOption1 = findViewById<Button>(R.id.buttonOption1)
        val buttonOption2 = findViewById<Button>(R.id.buttonOption2)
        val buttonOption3 = findViewById<Button>(R.id.buttonOption3)
        val buttonNextStep5 = findViewById<Button>(R.id.buttonNextStep5)

        // ฟังก์ชันสำหรับจัดการการคลิกปุ่ม
        setupButton(buttonOption1, "ฟุตบอล")
        setupButton(buttonOption2, "ภาพยนตร์")
        setupButton(buttonOption3, "ท่องเที่ยว")
        setupButton(buttonOption1, "อนิเมชั่น")
        setupButton(buttonOption2, "ช็อปปิ้ง")
        setupButton(buttonOption3, "เล่นดนตรี")
        setupButton(buttonOption1, "เล่นกีฬา")
        setupButton(buttonOption2, "เล่นเกม")
        setupButton(buttonOption3, "อ่านหนังสือ")
        setupButton(buttonOption1, "ปาร์ตี้")
        setupButton(buttonOption2, "สายควัน")
        setupButton(buttonOption3, "ออกกำลังกาย")

        buttonNextStep5.setOnClickListener {
            if (selectedPreferences.isEmpty()) {
                Toast.makeText(this, "กรุณาเลือกอย่างน้อยหนึ่งตัวเลือก", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val preferencesString = selectedPreferences.joinToString(",") // แปลงเป็น comma-separated ID string
            Log.d("RegisterActivity5", "Selected preferences: $preferencesString")

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity5, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            Log.d("RegisterActivity5", "UserID: $userID")

            val url = getString(R.string.root_url) + "/api/register5"
            Log.d("RegisterActivity5", "API URL: $url")

            val formBody: RequestBody = FormBody.Builder()
                .add("preferences", preferencesString)
                .add("userID", userID.toString())
                .build()

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val request: Request = Request.Builder()
                        .url(url)
                        .post(formBody)
                        .build()

                    val response = OkHttpClient().newCall(request).execute()

                    withContext(Dispatchers.Main) {
                        if (response.isSuccessful) {
                            Log.d("RegisterActivity5", "Response successful")
                            // Go to RegisterActivity6
                            val intent = Intent(this@RegisterActivity5, RegisterActivity6::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Log.e("RegisterActivity5", "Response error: ${response.code}")
                            Toast.makeText(this@RegisterActivity5, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Log.e("RegisterActivity5", "Error: ${e.message}")
                        Toast.makeText(this@RegisterActivity5, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    // ฟังก์ชันสำหรับแปลง preference เป็น preferenceID ที่ถูกต้อง
    private fun getPreferenceID(preference: String): Int {
        return when (preference) {
            "ฟุตบอล" -> 1
            "ภาพยนตร์" -> 2
            "ท่องเที่ยว" -> 3
            "อนิเมชั่น" -> 4
            "ช็อปปิ้ง" -> 5
            "เล่นดนตรี" -> 6
            "เล่นกีฬา" -> 7
            "เล่นเกม" -> 8
            "อ่านหนังสือ" -> 9
            "ปาร์ตี้" -> 10
            "สายควัน" -> 11
            "ออกกำลังกาย" -> 12
            else -> -1
        }
    }

    private fun setupButton(button: Button, preference: String) {
        button.setOnClickListener {
            val preferenceID = getPreferenceID(preference)

            if (preferenceID == -1) {
                Toast.makeText(this, "ไม่พบ preference ที่ถูกต้อง", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            if (button.isSelected) {
                button.isSelected = false
                selectedPreferences.remove(preferenceID) // เอา PreferenceID ออกจาก List
            } else {
                button.isSelected = true
                selectedPreferences.add(preferenceID) // เพิ่ม PreferenceID ลงใน List
            }
        }
    }
}