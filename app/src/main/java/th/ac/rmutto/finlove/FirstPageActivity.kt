package th.ac.rmutto.finlove

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.Spannable
import android.text.SpannableString
import android.text.style.ForegroundColorSpan
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class FirstPageActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_first_page)

        val loginButton = findViewById<Button>(R.id.btn_login)
        val registerButton = findViewById<Button>(R.id.btn_register)
        val termsConditionsTextView = findViewById<TextView>(R.id.tv_terms_conditions)

        // การตั้งค่าสีข้อความสำหรับ Terms & Conditions
        val spannable = SpannableString("By signing up, you are agreeing to our Terms & \nConditions")
        val termsColor = ForegroundColorSpan(Color.parseColor("#0000FF")) // สีน้ำเงินเข้ม
        spannable.setSpan(termsColor, 39, 58, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        termsConditionsTextView.text = spannable

        loginButton.setOnClickListener {
            val intent = Intent(this@FirstPageActivity, LoadingActivity::class.java)
            intent.putExtra("nextActivity", "Login")
            startActivity(intent)
        }

        registerButton.setOnClickListener {
            val intent = Intent(this@FirstPageActivity, LoadingActivity::class.java)
            intent.putExtra("nextActivity", "Register")
            startActivity(intent)
        }
    }
}
