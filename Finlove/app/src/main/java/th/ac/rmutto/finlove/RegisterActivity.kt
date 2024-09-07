package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val nextButton = findViewById<Button>(R.id.btn_next)
        nextButton.setOnClickListener {
            val intent = Intent(this, RegisterActivity1::class.java)
            startActivity(intent)
        }
    }
}
