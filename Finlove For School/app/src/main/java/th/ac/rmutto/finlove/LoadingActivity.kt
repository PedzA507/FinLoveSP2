package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class LoadingActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_loading)

        // รับข้อมูลจาก Intent เพื่อตรวจสอบว่าจะไปหน้า Login หรือ Register
        val nextActivity = intent.getStringExtra("nextActivity")


        Handler(Looper.getMainLooper()).postDelayed({
            val intent = when (nextActivity) {
                "Login" -> Intent(this, LoginActivity::class.java)
                "Register" -> Intent(this, RegisterActivity::class.java)
                else -> null
            }
            intent?.let {
                startActivity(it)
                finish()
            }
        }, 700)
    }
}
