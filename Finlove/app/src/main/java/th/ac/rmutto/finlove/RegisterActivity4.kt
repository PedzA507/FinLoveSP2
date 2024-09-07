package th.ac.rmutto.finlove

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
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
    private var selectedDateOfBirth: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register4)

        val spinnerEducation = findViewById<Spinner>(R.id.spinnerEducation)
        val editTextHome = findViewById<EditText>(R.id.editTextHome)
        val buttonSelectDate = findViewById<Button>(R.id.buttonSelectDate)
        val buttonNextStep4 = findViewById<Button>(R.id.buttonNextStep4)

        // Set up the education level spinner
        val educationOptions = arrayOf("มัธยมศึกษา", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, educationOptions)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerEducation.adapter = adapter

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
            val education = spinnerEducation.selectedItem.toString()
            val home = editTextHome.text.toString()

            if (home.isEmpty()) {
                editTextHome.error = "กรุณาระบุที่อยู่"
                return@setOnClickListener
            }

            if (selectedDateOfBirth.isNullOrEmpty()) {
                Toast.makeText(this, "กรุณาระบุวันเกิด", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity4, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            // Send data to server
            val url = "http://192.168.1.49:3000/api/register4"
            val formBody: RequestBody = FormBody.Builder()
                .add("education", education)
                .add("home", home)
                .add("DateBirth", selectedDateOfBirth!!)
                .add("userID", userID.toString()) // Send userID to the server
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
}
