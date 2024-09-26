package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.text.TextUtils
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import okhttp3.Call
import okhttp3.Callback
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.io.IOException

class ResetPasswordActivity : AppCompatActivity() {

    private lateinit var newPasswordEditText: EditText
    private lateinit var confirmPasswordEditText: EditText
    private lateinit var resetButton: Button
    private lateinit var progressBar: ProgressBar
    private val client = OkHttpClient()

    private lateinit var email: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_reset_password)

        newPasswordEditText = findViewById(R.id.newPasswordEditText)
        confirmPasswordEditText = findViewById(R.id.confirmPasswordEditText)
        resetButton = findViewById(R.id.resetButton)
        progressBar = findViewById(R.id.progressBar)

        email = intent.getStringExtra("email") ?: ""

        resetButton.setOnClickListener {
            resetPassword()
        }
    }

    private fun resetPassword() {
        val newPassword = newPasswordEditText.text.toString().trim()
        val confirmPassword = confirmPasswordEditText.text.toString().trim()

        if (TextUtils.isEmpty(newPassword) || TextUtils.isEmpty(confirmPassword)) {
            Toast.makeText(this, "กรุณากรอกรหัสผ่านใหม่", Toast.LENGTH_LONG).show()
            return
        }

        if (newPassword != confirmPassword) {
            Toast.makeText(this, "รหัสผ่านไม่ตรงกัน", Toast.LENGTH_LONG).show()
            return
        }

        progressBar.visibility = View.VISIBLE
        resetButton.isEnabled = false

        val requestBody = FormBody.Builder()
            .add("email", email)
            .add("newPassword", newPassword)
            .build()

        val request = Request.Builder()
            .url("http://192.168.1.49:4000/api/reset-password") // URL สำหรับรีเซ็ตรหัสผ่าน
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    resetButton.isEnabled = true
                    Toast.makeText(this@ResetPasswordActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    resetButton.isEnabled = true
                    if (response.isSuccessful) {
                        Toast.makeText(this@ResetPasswordActivity, "รีเซ็ตรหัสผ่านสำเร็จ", Toast.LENGTH_LONG).show()

                        // นำไปหน้า LoginActivity
                        val intent = Intent(this@ResetPasswordActivity, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish() // ปิดหน้า ResetPasswordActivity
                    } else {
                        Toast.makeText(this@ResetPasswordActivity, "Error: ${response.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }

        })
    }
}
