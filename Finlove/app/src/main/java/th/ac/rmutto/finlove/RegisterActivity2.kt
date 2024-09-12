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

class RegisterActivity2 : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register2)

        val editTextFirstname = findViewById<EditText>(R.id.editTextFirstname)
        val editTextLastname = findViewById<EditText>(R.id.editTextLastname)
        val editTextNickname = findViewById<EditText>(R.id.editTextNickname)
        val buttonNextStep2 = findViewById<Button>(R.id.buttonNextStep2)

        buttonNextStep2.setOnClickListener {
            val firstname = editTextFirstname.text.toString()
            val lastname = editTextLastname.text.toString()
            val nickname = editTextNickname.text.toString()

            if (firstname.isEmpty()) {
                editTextFirstname.error = "กรุณาระบุชื่อจริง"
                return@setOnClickListener
            }

            if (lastname.isEmpty()) {
                editTextLastname.error = "กรุณาระบุนามสกุล"
                return@setOnClickListener
            }

            if (nickname.isEmpty()) {
                editTextNickname.error = "กรุณาระบุชื่อเล่น"
                return@setOnClickListener
            }

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity2, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            // ส่งข้อมูลไปยังเซิร์ฟเวอร์
            val url = "root_url/api/register2"
            val formBody: RequestBody = FormBody.Builder()
                .add("firstname", firstname)
                .add("lastname", lastname)
                .add("nickname", nickname)
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
                            // ย้ายไปยังหน้า RegisterActivity3
                            val intent = Intent(this@RegisterActivity2, RegisterActivity3::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Toast.makeText(
                                this@RegisterActivity2,
                                "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@RegisterActivity2,
                            "เกิดข้อผิดพลาด: ${e.message}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }
        }
    }
}
