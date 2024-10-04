package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
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

    private var selectedGoalID: Int? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register6)

        val buttonGoal1 = findViewById<Button>(R.id.buttonGoal1)
        val buttonGoal2 = findViewById<Button>(R.id.buttonGoal2)
        val buttonGoal3 = findViewById<Button>(R.id.buttonGoal3)
        val buttonGoal4 = findViewById<Button>(R.id.buttonGoal4)
        val buttonNextStep6 = findViewById<Button>(R.id.buttonNextStep6)

        // ฟังก์ชันสำหรับจัดการการคลิกปุ่มเป้าหมาย
        setupGoalButton(buttonGoal1, "หาคู่รักที่จริงใจ")
        setupGoalButton(buttonGoal2, "หาคู่เดทช่วงสั้นๆ")
        setupGoalButton(buttonGoal3, "หาเพื่อนใหม่")
        setupGoalButton(buttonGoal4, "ยังไม่แน่ใจ")

        buttonNextStep6.setOnClickListener {
            if (selectedGoalID == null) {
                Toast.makeText(this, "กรุณาเลือกหนึ่งเป้าหมาย", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity6, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val url = getString(R.string.root_url) + "/api/register6"

            val formBody: RequestBody = FormBody.Builder()
                .add("goalID", selectedGoalID.toString()) // ส่ง goalID แทน goal
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
                            Toast.makeText(this@RegisterActivity6, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@RegisterActivity6, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    // ฟังก์ชันสำหรับแปลง goal เป็น goalID
    private fun getGoalID(goal: String): Int {
        return when (goal) {
            "หาคู่รักที่จริงใจ" -> 1
            "หาคู่เดทช่วงสั้นๆ" -> 2
            "หาเพื่อนใหม่" -> 3
            "ยังไม่แน่ใจ" -> 4
            else -> -1
        }
    }

    private fun setupGoalButton(button: Button, goal: String) {
        button.setOnClickListener {
            // ปรับสถานะปุ่มที่ถูกเลือก
            findViewById<Button>(R.id.buttonGoal1).isSelected = false
            findViewById<Button>(R.id.buttonGoal2).isSelected = false
            findViewById<Button>(R.id.buttonGoal3).isSelected = false

            // ตั้งค่าสำหรับปุ่มที่ถูกเลือก
            button.isSelected = true
            selectedGoalID = getGoalID(goal)
        }
    }
}
