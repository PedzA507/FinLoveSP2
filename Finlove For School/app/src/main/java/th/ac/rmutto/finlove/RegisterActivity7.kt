package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
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
            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity7, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val url = "http://192.168.109.1:3000/api/register7"
            val formBody: RequestBody = FormBody.Builder()
                .add("interestedGender", selectedGender)
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
                            val intent = Intent(this@RegisterActivity7, RegisterActivity8::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Toast.makeText(this@RegisterActivity7, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@RegisterActivity7, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}
