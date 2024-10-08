package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class RegisterActivity5 : AppCompatActivity() {

    private lateinit var selectedPreferences: MutableList<Int>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register5)

        selectedPreferences = mutableListOf()

        val buttonOption1 = findViewById<Button>(R.id.buttonOption1)
        val buttonOption2 = findViewById<Button>(R.id.buttonOption2)
        val buttonOption3 = findViewById<Button>(R.id.buttonOption3)
        val buttonNextStep5 = findViewById<ImageButton>(R.id.buttonNextStep5)

        setupButton(buttonOption1, "ฟุตบอล")
        setupButton(buttonOption2, "ภาพยนตร์")
        setupButton(buttonOption3, "ท่องเที่ยว")

        buttonNextStep5.setOnClickListener {
            if (selectedPreferences.isEmpty()) {
                Toast.makeText(this, "กรุณาเลือกอย่างน้อยหนึ่งตัวเลือก", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val preferencesString = selectedPreferences.joinToString(",")
            val email = intent.getStringExtra("email")
            val username = intent.getStringExtra("username")
            val password = intent.getStringExtra("password")
            val firstname = intent.getStringExtra("firstname")
            val lastname = intent.getStringExtra("lastname")
            val nickname = intent.getStringExtra("nickname")
            val gender = intent.getStringExtra("gender")
            val height = intent.getStringExtra("height")
            val phonenumber = intent.getStringExtra("phonenumber")
            val dateOfBirth = intent.getStringExtra("dateOfBirth")
            val educationID = intent.getIntExtra("educationID", -1)
            val home = intent.getStringExtra("home")

            if (educationID == -1) {
                Toast.makeText(this, "ไม่พบข้อมูล EducationID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            // ส่งข้อมูลไปยัง RegisterActivity6 โดยไม่บันทึกข้อมูลใน RegisterActivity5
            val intent = Intent(this@RegisterActivity5, RegisterActivity6::class.java)
            intent.putExtra("email", email)
            intent.putExtra("username", username)
            intent.putExtra("password", password)
            intent.putExtra("firstname", firstname)
            intent.putExtra("lastname", lastname)
            intent.putExtra("nickname", nickname)
            intent.putExtra("gender", gender)
            intent.putExtra("height", height)
            intent.putExtra("phonenumber", phonenumber)
            intent.putExtra("dateOfBirth", dateOfBirth)
            intent.putExtra("educationID", educationID)
            intent.putExtra("home", home)
            intent.putExtra("preferences", preferencesString)
            startActivity(intent)
        }
    }

    private fun setupButton(button: Button, preference: String) {
        button.setOnClickListener {
            val preferenceID = getPreferenceID(preference)

            if (button.isSelected) {
                button.isSelected = false
                selectedPreferences.remove(preferenceID)
            } else {
                button.isSelected = true
                selectedPreferences.add(preferenceID)
            }
        }
    }

    private fun getPreferenceID(preference: String): Int {
        return when (preference) {
            "ฟุตบอล" -> 1
            "ภาพยนตร์" -> 2
            "ท่องเที่ยว" -> 3
            else -> -1
        }
    }
}
