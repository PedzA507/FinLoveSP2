package th.ac.rmutto.finlove

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

class ForgotPasswordActivity : AppCompatActivity() {

    private lateinit var emailEditText: EditText
    private lateinit var sendButton: Button
    private lateinit var progressBar: ProgressBar

    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_forgot_password)

        emailEditText = findViewById(R.id.emailEditText)
        sendButton = findViewById(R.id.sendButton)
        progressBar = findViewById(R.id.progressBar)

        sendButton.setOnClickListener {
            sendResetPasswordRequest()
        }
    }

    private fun sendResetPasswordRequest() {
        val email = emailEditText.text.toString().trim()

        if (TextUtils.isEmpty(email)) {
            emailEditText.error = "Please enter your email"
            return
        }

        progressBar.visibility = View.VISIBLE
        sendButton.isEnabled = false

        val requestBody = FormBody.Builder()
            .add("email", email)
            .build()

        val request = Request.Builder()
            .url("http://192.168.109.1:3000/api/reset-password") // เปลี่ยน URL ตามต้องการ
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    sendButton.isEnabled = true
                    Toast.makeText(this@ForgotPasswordActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    sendButton.isEnabled = true
                    if (response.isSuccessful) {
                        val message = response.body?.string()
                        Toast.makeText(this@ForgotPasswordActivity, message, Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(this@ForgotPasswordActivity, "Error: ${response.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        })
    }
}
