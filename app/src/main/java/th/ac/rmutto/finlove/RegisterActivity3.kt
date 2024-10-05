package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class RegisterActivity3 : AppCompatActivity() {

    private var selectedGender: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register3)

        val buttonMale = findViewById<Button>(R.id.buttonMale)
        val buttonFemale = findViewById<Button>(R.id.buttonFemale)
        val buttonOther = findViewById<Button>(R.id.buttonOther)
        val editTextHeight = findViewById<EditText>(R.id.editTextHeight)
        val editTextPhoneNumber = findViewById<EditText>(R.id.editTextPhoneNumber)
        val buttonNextStep3 = findViewById<ImageButton>(R.id.buttonNextStep3)

        setupGenderButton(buttonMale, "Male")
        setupGenderButton(buttonFemale, "Female")
        setupGenderButton(buttonOther, "Other")

        // รับข้อมูลจากหน้า RegisterActivity2
        val email = intent.getStringExtra("email")
        val username = intent.getStringExtra("username")
        val password = intent.getStringExtra("password")
        val firstname = intent.getStringExtra("firstname")
        val lastname = intent.getStringExtra("lastname")
        val nickname = intent.getStringExtra("nickname")

        buttonNextStep3.setOnClickListener {
            val height = editTextHeight.text.toString()
            val phoneNumber = editTextPhoneNumber.text.toString()

            if (selectedGender == null) {
                Toast.makeText(this, "กรุณาเลือกเพศก่อน", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (height.isEmpty()) {
                editTextHeight.error = "กรุณาระบุส่วนสูง"
                return@setOnClickListener
            }

            if (phoneNumber.isEmpty()) {
                editTextPhoneNumber.error = "กรุณาระบุเบอร์โทร"
                return@setOnClickListener
            }

            // ส่งข้อมูลไปที่ RegisterActivity4
            val intent = Intent(this@RegisterActivity3, RegisterActivity4::class.java)
            intent.putExtra("email", email)
            intent.putExtra("username", username)
            intent.putExtra("password", password)
            intent.putExtra("firstname", firstname)
            intent.putExtra("lastname", lastname)
            intent.putExtra("nickname", nickname)
            intent.putExtra("gender", selectedGender)
            intent.putExtra("height", height)
            intent.putExtra("phonenumber", phoneNumber)
            startActivity(intent)
        }
    }

    private fun setupGenderButton(button: Button, gender: String) {
        button.setOnClickListener {
            findViewById<Button>(R.id.buttonMale).isSelected = false
            findViewById<Button>(R.id.buttonFemale).isSelected = false
            findViewById<Button>(R.id.buttonOther).isSelected = false
            button.isSelected = true
            selectedGender = gender
        }
    }
}
