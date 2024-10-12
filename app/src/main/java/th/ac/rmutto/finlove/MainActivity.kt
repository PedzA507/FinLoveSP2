package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView
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

        userID = intent.getIntExtra("userID", -1)
        if (userID == -1) {
            Toast.makeText(this, "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        val navController = findNavController(R.id.nav_host_fragment_activity_main)
        val bottomNavigationView: BottomNavigationView = findViewById(R.id.nav_view)

        bottomNavigationView.setupWithNavController(navController)

        bottomNavigationView.setOnItemSelectedListener { menuItem ->
            when (menuItem.itemId) {
                R.id.navigation_profile -> {
                    if (navController.currentDestination?.id != R.id.navigation_profile) {
                        val bundle = Bundle().apply {
                            putInt("userID", userID)
                        }
                        navController.navigate(R.id.navigation_profile, bundle)
                    }
                    true
                }
                R.id.navigation_home -> {
                    if (navController.currentDestination?.id != R.id.navigation_home) {
                        // ส่ง userID ไปยัง HomeFragment ผ่าน arguments
                        val bundle = Bundle()
                        bundle.putInt("userID", userID)

                        navController.navigate(R.id.navigation_home, bundle)

                    }
                    true
                }
                R.id.navigation_message -> {
                    if (navController.currentDestination?.id != R.id.navigation_message) {
                        navController.navigate(R.id.navigation_message)
                    }
                    true
                }
                else -> false
            }
        }
    }
}
