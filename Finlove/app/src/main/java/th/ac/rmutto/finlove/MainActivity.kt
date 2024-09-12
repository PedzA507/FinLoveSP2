package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Get the userID from the intent
        val userID = intent.getIntExtra("userID", -1)

        // Find the logout button and set a click listener
        val buttonLogout = findViewById<Button>(R.id.buttonLogout)
        buttonLogout.setOnClickListener {
            logoutUser(userID)
        }

        // Find the BottomNavigationView and set a listener
        val bottomNavigationView = findViewById<BottomNavigationView>(R.id.nav_view)
        bottomNavigationView.setOnNavigationItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigation_Profile -> {
                    // Navigate to ProfileActivity
                    val intent = Intent(this@MainActivity, ProfileActivity::class.java)
                    intent.putExtra("userID", userID) // Pass userID to ProfileActivity
                    startActivity(intent)
                    true
                }
                else -> false
            }
        }
    }

    private fun logoutUser(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            if (userID != -1) {
                val url = getString(R.string.root_url) + "/api/logout/$userID"
                val request = Request.Builder().url(url).post(FormBody.Builder().build()).build()

                try {
                    val response = OkHttpClient().newCall(request).execute()
                    if (response.isSuccessful) {
                        withContext(Dispatchers.Main) {
                            Toast.makeText(this@MainActivity, "Logged out successfully", Toast.LENGTH_SHORT).show()

                            // Navigate back to LoginActivity and clear task stack
                            val intent = Intent(this@MainActivity, LoginActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            startActivity(intent)
                            finish()
                        }
                    } else {
                        withContext(Dispatchers.Main) {
                            Toast.makeText(this@MainActivity, "Failed to logout", Toast.LENGTH_SHORT).show()
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@MainActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}
