package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import org.json.JSONObject

class RegisterActivity1 : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_register1)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val editTextEmail = findViewById<EditText>(R.id.editTextEmail)
        val editTextUsername = findViewById<EditText>(R.id.editTextUsername)
        val editTextPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonNext = findViewById<Button>(R.id.buttonNext)

        buttonNext.setOnClickListener {
            val email = editTextEmail.text.toString()
            val username = editTextUsername.text.toString()
            val password = editTextPassword.text.toString()

            if (email.isEmpty()) {
                editTextEmail.error = "กรุณาระบุอีเมล"
                return@setOnClickListener
            }

            if (username.isEmpty()) {
                editTextUsername.error = "กรุณาระบุชื่อผู้ใช้"
                return@setOnClickListener
            }

            if (password.isEmpty()) {
                editTextPassword.error = "กรุณาระบุรหัสผ่าน"
                return@setOnClickListener
            }

            val url = getString(R.string.root_url) + "/api/register1"

            val formBody: RequestBody = FormBody.Builder()
                .add("email", email)
                .add("username", username)
                .add("password", password)
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
                            val responseBody = response.body?.string() ?: ""
                            try {
                                val obj = JSONObject(responseBody)
                                val status = obj.optString("status", "false")
                                val message = obj.optString("message", "ไม่ทราบข้อผิดพลาด")

                                if (status == "true") {
                                    // ดึง userID จากเซิร์ฟเวอร์
                                    val userID = obj.optInt("userID", -1)
                                    if (userID != -1) {
                                        // ส่ง userID ไปยัง RegisterActivity2
                                        val intent =
                                            Intent(this@RegisterActivity1, RegisterActivity2::class.java)
                                        intent.putExtra("userID", userID)
                                        startActivity(intent)
                                    } else {
                                        Toast.makeText(
                                            applicationContext,
                                            "ไม่สามารถดึง userID ได้",
                                            Toast.LENGTH_LONG
                                        ).show()
                                    }
                                } else {
                                    Toast.makeText(applicationContext, message, Toast.LENGTH_LONG)
                                        .show()
                                }
                            } catch (e: Exception) {
                                Toast.makeText(
                                    applicationContext,
                                    "การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                        } else {
                            Toast.makeText(
                                applicationContext,
                                "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            applicationContext,
                            "เกิดข้อผิดพลาด: ${e.message}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }
        }
    }
}
