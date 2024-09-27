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

class RegisterActivity6 : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register6)

        val radioGroupGoals = findViewById<RadioGroup>(R.id.radioGroupGoals)
        val buttonNextStep6 = findViewById<Button>(R.id.buttonNextStep6)

        buttonNextStep6.setOnClickListener {
            // ตรวจสอบว่ามีการเลือก RadioButton หรือไม่
            val selectedGoalId = radioGroupGoals.checkedRadioButtonId
            if (selectedGoalId == -1) {
                Toast.makeText(this, "กรุณาเลือกหนึ่งเป้าหมาย", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            // นำค่า Text จาก RadioButton ที่ถูกเลือก
            val selectedGoal = findViewById<RadioButton>(selectedGoalId).text.toString()

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity6, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val url = getString(R.string.root_url) + "/api/register6"
            Log.d("RegisterActivity6", "URL: $url")
            Log.d("RegisterActivity6", "Selected Goal: $selectedGoal")

            val formBody: RequestBody = FormBody.Builder()
                .add("goal", selectedGoal)
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
                            val intent = Intent(this@RegisterActivity6, RegisterActivity7::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Log.e("RegisterActivity6", "Response Code: ${response.code}")
                            Toast.makeText(this@RegisterActivity6, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Log.e("RegisterActivity6", "Error: ${e.message}")
                        Toast.makeText(this@RegisterActivity6, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}
