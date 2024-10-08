package th.ac.rmutto.finlove

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.Spannable
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
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

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_login)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val editTextUsername = findViewById<EditText>(R.id.editTextUsername)
        val editTextPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonLogin = findViewById<Button>(R.id.buttonLogin)
        val forgetPasswordButton = findViewById<TextView>(R.id.forgetbtn)
        val termsConditionsTextView = findViewById<TextView>(R.id.tv_terms_conditions)


        // การตั้งค่าสีข้อความสำหรับ Terms & Conditions
        val spannable = SpannableString("By signing up, you are agreeing to our Terms & \nConditions")
        val termsColor = ForegroundColorSpan(Color.parseColor("#0000FF")) // สีน้ำเงินเข้ม
        spannable.setSpan(termsColor, 39, 58, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        termsConditionsTextView.text = spannable



        // การทำงานเมื่อผู้ใช้กดปุ่มเข้าสู่ระบบ
        buttonLogin.setOnClickListener {
            val username = editTextUsername.text.toString()
            val password = editTextPassword.text.toString()
            if (username.isEmpty()) {
                editTextUsername.error = "กรุณาระบุชื่อผู้ใช้"
                return@setOnClickListener
            }

            if (password.isEmpty()) {
                editTextPassword.error = "กรุณาระบุรหัสผ่าน"
                return@setOnClickListener
            }

            val url = getString(R.string.root_url) + "/api/login"
            val formBody: RequestBody = FormBody.Builder()
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
                            val obj = JSONObject(response.body!!.string())
                            val status = obj["status"].toString()

                            if (status == "true") {
                                val userID = obj["userID"].toString().toInt()
                                val intent = Intent(this@LoginActivity, MainActivity::class.java)
                                intent.putExtra("userID", userID)
                                startActivity(intent)
                                finish()
                            } else {
                                val message = obj["message"].toString()
                                Toast.makeText(applicationContext, message, Toast.LENGTH_LONG).show()
                            }
                        } else {
                            Toast.makeText(applicationContext, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(applicationContext, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        forgetPasswordButton.setOnClickListener {
            val intent = Intent(this, ForgotPasswordActivity::class.java)
            startActivity(intent)
        }
    }
}