package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
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

class RegisterActivity5 : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register5)

        val checkBoxPreference1 = findViewById<CheckBox>(R.id.checkBoxPreference1)
        val checkBoxPreference2 = findViewById<CheckBox>(R.id.checkBoxPreference2)
        val checkBoxPreference3 = findViewById<CheckBox>(R.id.checkBoxPreference3)
        val buttonNextStep5 = findViewById<Button>(R.id.buttonNextStep5)

        buttonNextStep5.setOnClickListener {
            val selectedPreferences = mutableListOf<String>()

            if (checkBoxPreference1.isChecked) {
                selectedPreferences.add("ดูหนัง")
            }
            if (checkBoxPreference2.isChecked) {
                selectedPreferences.add("ฟังเพลง")
            }
            if (checkBoxPreference3.isChecked) {
                selectedPreferences.add("เล่นกีฬา")
            }

            if (selectedPreferences.isEmpty()) {
                Toast.makeText(this, "กรุณาเลือกอย่างน้อยหนึ่งตัวเลือก", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val preferencesString = selectedPreferences.joinToString(",")

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity5, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val url = "http://192.168.109.1:3000/api/register5"
            val formBody: RequestBody = FormBody.Builder()
                .add("preferences", preferencesString)
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
                            // Go to RegisterActivity5
                            val intent = Intent(this@RegisterActivity5, RegisterActivity6::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Toast.makeText(this@RegisterActivity5, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@RegisterActivity5, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}
