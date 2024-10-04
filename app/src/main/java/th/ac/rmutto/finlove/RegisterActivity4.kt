package th.ac.rmutto.finlove

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
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
import java.util.Calendar

class RegisterActivity4 : AppCompatActivity() {

    private var selectedEducation: String? = null // เปลี่ยนเป็น nullable
    private var selectedDateOfBirth: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register4)

        val buttonHighSchool = findViewById<Button>(R.id.buttonHighSchool)
        val buttonBachelor = findViewById<Button>(R.id.buttonBachelor)
        val buttonMaster = findViewById<Button>(R.id.buttonMaster)
        val buttonPhd = findViewById<Button>(R.id.buttonPhd)
        val editTextHome = findViewById<EditText>(R.id.editTextHome)
        val buttonSelectDate = findViewById<Button>(R.id.buttonSelectDate)
        val buttonNextStep4 = findViewById<ImageButton>(R.id.buttonNextStep4)

        // ฟังก์ชันสำหรับจัดการการคลิกปุ่มระดับการศึกษา
        setupEducationButton(buttonHighSchool, "มัธยมศึกษา")
        setupEducationButton(buttonBachelor, "ปริญญาตรี")
        setupEducationButton(buttonMaster, "ปริญญาโท")
        setupEducationButton(buttonPhd, "ปริญญาเอก")
        setupEducationButton(buttonPhd, "กำลังทำงาน")


        // Set up DatePickerDialog
        buttonSelectDate.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            val datePickerDialog = DatePickerDialog(this, { _, selectedYear, selectedMonth, selectedDay ->
                // Format as YYYY-MM-DD
                selectedDateOfBirth = "$selectedYear-${String.format("%02d", selectedMonth + 1)}-${String.format("%02d", selectedDay)}"
                buttonSelectDate.text = selectedDateOfBirth
            }, year, month, day)

            datePickerDialog.show()
        }

        buttonNextStep4.setOnClickListener {
            val home = editTextHome.text.toString()

            if (home.isEmpty()) {
                editTextHome.error = "กรุณาระบุที่อยู่"
                return@setOnClickListener
            }

            if (selectedDateOfBirth.isNullOrEmpty()) {
                Toast.makeText(this, "กรุณาระบุวันเกิด", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            if (selectedEducation == null) {
                Toast.makeText(this, "กรุณาเลือกระดับการศึกษาก่อน", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity4, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            // แปลง selectedEducation เป็น educationID
            val educationID = getEducationID(selectedEducation!!)
            if (educationID == -1) {
                Toast.makeText(this, "ไม่พบระดับการศึกษาที่ถูกต้อง", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            // ส่งข้อมูลไปยังเซิร์ฟเวอร์
            val url = getString(R.string.root_url) + "/api/register4"
            val formBody: RequestBody = FormBody.Builder()
                .add("educationID", educationID.toString())
                .add("home", home)
                .add("DateBirth", selectedDateOfBirth!!)
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
                            // ไปยังหน้า RegisterActivity5
                            val intent = Intent(this@RegisterActivity4, RegisterActivity5::class.java)
                            intent.putExtra("userID", userID)
                            startActivity(intent)
                        } else {
                            Toast.makeText(this@RegisterActivity4, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@RegisterActivity4, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    // ฟังก์ชันสำหรับแปลง education เป็น educationID
    private fun getEducationID(education: String): Int {
        return when (education) {
            "มัธยมศึกษา" -> 1
            "ปริญญาตรี" -> 2
            "ปริญญาโท" -> 3
            "ปริญญาเอก" -> 4
            "กำลังทำงาน" -> 5
            else -> -1
        }
    }

    private fun setupEducationButton(button: Button, education: String) {
        button.setOnClickListener {
            // ปรับสถานะปุ่มที่ถูกเลือก
            findViewById<Button>(R.id.buttonHighSchool).isSelected = false
            findViewById<Button>(R.id.buttonBachelor).isSelected = false
            findViewById<Button>(R.id.buttonMaster).isSelected = false
            findViewById<Button>(R.id.buttonPhd).isSelected = false
            findViewById<Button>(R.id.buttonWorking).isSelected = false

            // ตั้งค่าสำหรับปุ่มที่ถูกเลือก
            button.isSelected = true
            selectedEducation = education
        }
    }
}
