package th.ac.rmutto.finlove

import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import android.content.Intent
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class RegisterActivity1 : AppCompatActivity() {

    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register1)

        val editTextEmail = findViewById<EditText>(R.id.editTextEmail)
        val editTextUsername = findViewById<EditText>(R.id.editTextUsername)
        val editTextPassword = findViewById<EditText>(R.id.editTextPassword)
        val buttonNext = findViewById<ImageButton>(R.id.buttonNext)

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

            // Check if the username and email are available
            checkUsernameEmail(username, email) { isAvailable, message ->
                if (isAvailable) {
                    // Both username and email are available, proceed to next screen
                    val intent = Intent(this@RegisterActivity1, RegisterActivity2::class.java)
                    intent.putExtra("email", email)
                    intent.putExtra("username", username)
                    intent.putExtra("password", password)
                    startActivity(intent)
                } else {
                    // Show the error message received from the server
                    Toast.makeText(this@RegisterActivity1, message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun checkUsernameEmail(username: String, email: String, callback: (Boolean, String) -> Unit) {
        val jsonObject = JSONObject().apply {
            put("username", username)
            put("email", email)
        }

        val mediaType = "application/json; charset=utf-8".toMediaTypeOrNull()
        val requestBody = jsonObject.toString().toRequestBody(mediaType)

        val url = getString(R.string.root_url) + "/api/checkUsernameEmail"
        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@RegisterActivity1, "เกิดข้อผิดพลาดในระบบ", Toast.LENGTH_SHORT).show()
                }
                callback(false, "เกิดข้อผิดพลาดในระบบ")
            }

            override fun onResponse(call: Call, response: Response) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                val isAvailable = jsonResponse.optBoolean("status", false)
                val message = jsonResponse.optString("message", "เกิดข้อผิดพลาด")

                runOnUiThread {
                    callback(isAvailable, message)
                }
            }
        })
    }
}
