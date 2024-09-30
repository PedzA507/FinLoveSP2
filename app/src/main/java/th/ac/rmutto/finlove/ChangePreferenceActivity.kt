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

class ChangePreferenceActivity : AppCompatActivity() {

    private lateinit var selectedPreferences: MutableList<Int> // เก็บ PreferenceID ที่เลือก

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_preference)

        selectedPreferences = mutableListOf()

        val buttonOption1 = findViewById<Button>(R.id.buttonOption1)
        val buttonOption2 = findViewById<Button>(R.id.buttonOption2)
        val buttonOption3 = findViewById<Button>(R.id.buttonOption3)
        val buttonSave = findViewById<Button>(R.id.buttonsave)

        // ฟังก์ชันสำหรับจัดการการคลิกปุ่ม
        setupButton(buttonOption1, "ดูหนัง")
        setupButton(buttonOption2, "ฟังเพลง")
        setupButton(buttonOption3, "เล่นกีฬา")

        buttonSave.setOnClickListener {
            if (selectedPreferences.isEmpty()) {
                Toast.makeText(this, "กรุณาเลือกอย่างน้อยหนึ่งตัวเลือก", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val preferencesString = selectedPreferences.joinToString(",") // แปลงเป็น comma-separated ID string
            Log.d("ChangePreferenceActivity", "Selected preferences: $preferencesString")

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@ChangePreferenceActivity, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            Log.d("ChangePreferenceActivity", "UserID: $userID")

            val url = getString(R.string.root_url) + "/api/user/update_preferences/$userID"
            Log.d("ChangePreferenceActivity", "API URL: $url")

            val formBody: RequestBody = FormBody.Builder()
                .add("preferences", preferencesString)
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
                            Log.d("ChangePreferenceActivity", "Response successful")
                            // ส่งข้อมูลกลับไปที่ ProfileActivity หลังจากบันทึก Preferences
                            val resultIntent = Intent()
                            resultIntent.putExtra("preferences", preferencesString)
                            setResult(RESULT_OK, resultIntent)
                            finish() // กลับไปที่หน้า ProfileActivity
                        } else {
                            Log.e("ChangePreferenceActivity", "Response error: ${response.code}")
                            Toast.makeText(this@ChangePreferenceActivity, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Log.e("ChangePreferenceActivity", "Error: ${e.message}")
                        Toast.makeText(this@ChangePreferenceActivity, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    // ฟังก์ชันสำหรับแปลง preference เป็น preferenceID ที่ถูกต้อง
    private fun getPreferenceID(preference: String): Int {
        return when (preference) {
            "ดูหนัง" -> 1
            "ฟังเพลง" -> 2
            "เล่นกีฬา" -> 3
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
