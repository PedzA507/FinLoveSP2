package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
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

class RegisterActivity3 : AppCompatActivity() {

    private lateinit var selectedGender: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register3)

        val buttonMale = findViewById<Button>(R.id.buttonMale)
        val buttonFemale = findViewById<Button>(R.id.buttonFemale)
        val buttonOther = findViewById<Button>(R.id.buttonOther)
        val editTextHeight = findViewById<EditText>(R.id.editTextHeight)
        val editTextPhoneNumber = findViewById<EditText>(R.id.editTextPhoneNumber)
        val buttonNextStep3 = findViewById<Button>(R.id.buttonNextStep3)

        // ฟังก์ชันสำหรับจัดการการคลิกปุ่มเพศ
        setupGenderButton(buttonMale, "Male")
        setupGenderButton(buttonFemale, "Female")
        setupGenderButton(buttonOther, "Other")

        buttonNextStep3.setOnClickListener {
            val height = editTextHeight.text.toString()
            val phoneNumber = editTextPhoneNumber.text.toString()

            if (height.isEmpty()) {
                editTextHeight.error = "กรุณาระบุส่วนสูง"
                return@setOnClickListener
            }

            if (phoneNumber.isEmpty()) {
                editTextPhoneNumber.error = "กรุณาระบุเบอร์โทร"
                return@setOnClickListener
            }

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity3, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            // ส่งข้อมูลไปยังเซิร์ฟเวอร์
            val url = getString(R.string.root_url) + "/api/register3"
            val formBody: RequestBody = FormBody.Builder()
                .add("gender", selectedGender)
                .add("height", height)
                .add("phonenumber", phoneNumber)
                .add("userID", userID.toString()) // ส่ง userID ไปยังเซิร์ฟเวอร์
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
                            // ย้ายไปยังหน้า RegisterActivity4
                            val intent = Intent(this@RegisterActivity3, RegisterActivity4::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Toast.makeText(this@RegisterActivity3, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@RegisterActivity3, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    private fun setupGenderButton(button: Button, gender: String) {
        button.setOnClickListener {
            // ปรับสถานะปุ่มที่ถูกเลือก
            findViewById<Button>(R.id.buttonMale).isSelected = false
            findViewById<Button>(R.id.buttonFemale).isSelected = false
            findViewById<Button>(R.id.buttonOther).isSelected = false

            // ตั้งค่าสำหรับปุ่มที่ถูกเลือก
            button.isSelected = true
            selectedGender = gender
        }
    }
}
