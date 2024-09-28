package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.RadioButton
import android.widget.RadioGroup
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

class RegisterActivity7 : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register7)

        val radioGroupGender = findViewById<RadioGroup>(R.id.radioGroupGender)
        val buttonNextStep7 = findViewById<Button>(R.id.buttonNextStep7)

        buttonNextStep7.setOnClickListener {
            val selectedRadioButtonId = radioGroupGender.checkedRadioButtonId
            if (selectedRadioButtonId == -1) {
                Toast.makeText(this@RegisterActivity7, "กรุณาเลือกเพศที่คุณสนใจ", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val selectedGender = findViewById<RadioButton>(selectedRadioButtonId).text.toString()
            val interestedGenderID = getInterestedGenderID(selectedGender) // แปลงเพศเป็น interestedGenderID

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity7, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            Log.d("RegisterActivity7", "Selected Gender: $selectedGender")
            Log.d("RegisterActivity7", "InterestedGenderID: $interestedGenderID")
            Log.d("RegisterActivity7", "UserID: $userID")

            val url = getString(R.string.root_url) + "/api/register7"
            val formBody: RequestBody = FormBody.Builder()
                .add("interestedGenderID", interestedGenderID.toString()) // ส่ง interestedGenderID แทน interestedGender
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
                            Log.d("RegisterActivity7", "Response successful")
                            val intent = Intent(this@RegisterActivity7, RegisterActivity8::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Log.e("RegisterActivity7", "Response error: ${response.code}")
                            Toast.makeText(this@RegisterActivity7, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Log.e("RegisterActivity7", "Error: ${e.message}")
                        Toast.makeText(this@RegisterActivity7, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    // ฟังก์ชันสำหรับแปลงชื่อเพศเป็น interestedGenderID
    private fun getInterestedGenderID(gender: String): Int {
        return when (gender) {
            "ชาย" -> 1
            "หญิง" -> 2
            "อื่นๆ" -> 3
            else -> -1
        }
    }
}
