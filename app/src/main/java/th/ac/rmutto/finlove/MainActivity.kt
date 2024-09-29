package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.navigation.findNavController
import androidx.navigation.ui.setupWithNavController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request

class MainActivity : AppCompatActivity() {
    private var userID: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // รับค่า userID จาก Intent ที่ส่งมา
        userID = intent.getIntExtra("userID", -1)

        // ตรวจสอบว่า userID ถูกต้องหรือไม่
        if (userID == -1) {
            Toast.makeText(this, "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        // ตั้งค่า NavController และ BottomNavigationView
        val navController = findNavController(R.id.nav_host_fragment_activity_main)
        val bottomNavigationView: BottomNavigationView = findViewById(R.id.nav_view)

        // เชื่อมต่อ BottomNavigationView กับ NavController
        bottomNavigationView.setupWithNavController(navController)

        // ตรวจสอบการคลิกที่แต่ละเมนูใน BottomNavigationView
        bottomNavigationView.setOnItemSelectedListener { menuItem ->
            when (menuItem.itemId) {
                R.id.navigation_profile -> {
                    // ส่ง userID ไปยัง ProfileFragment
                    if (navController.currentDestination?.id != R.id.navigation_profile) {
                        val bundle = Bundle().apply {
                            putInt("userID", userID)
                        }
                        navController.navigate(R.id.navigation_profile, bundle)
                    }
                    true
                }
                R.id.navigation_home -> {
                    // นำทางไปหน้า HomeFragment
                    if (navController.currentDestination?.id != R.id.navigation_home) {
                        navController.navigate(R.id.navigation_home)
                    }
                    true
                }
                R.id.navigation_message -> {
                    // นำทางไปหน้า MessageFragment
                    if (navController.currentDestination?.id != R.id.navigation_message) {
                        navController.navigate(R.id.navigation_message)
                    }
                    true
                }
                else -> false
            }
        }
    }

    // ฟังก์ชันสำหรับการ Logout
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

                            // กลับไปที่หน้า LoginActivity และเคลียร์ stack
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
