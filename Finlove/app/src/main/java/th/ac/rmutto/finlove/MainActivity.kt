package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Get the userID from the intent
        val userID = intent.getIntExtra("userID", -1)

        // Find the user icon and set a click listener to navigate to the profile page
        val userIcon = findViewById<ImageView>(R.id.userIcon)
        userIcon.setOnClickListener {
            // Navigate to the profile page and pass the userID
            val intent = Intent(this, ProfileActivity::class.java)
            intent.putExtra("userID", userID)
            startActivity(intent)
        }

        // Find the logout button and set a click listener
        val buttonLogout = findViewById<Button>(R.id.buttonLogout)
        buttonLogout.setOnClickListener {
            // Clear any user session or token (this is just an example, you need to implement actual session management)
            // For demonstration, we'll just show a Toast and navigate back to the login page
            Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show()

            // Navigate back to the login screen or main activity
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }
}
