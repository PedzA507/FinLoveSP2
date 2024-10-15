package th.ac.rmutto.finlove

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {
    private var userID: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        userID = intent.getIntExtra("userID", -1)
        if (userID == -1) {
            Toast.makeText(this, "ไม่พบ userID", Toast.LENGTH_LONG).show()
            return // หยุดการทำงานหากไม่มี userID
        }

        val navController = findNavController(R.id.nav_host_fragment_activity_main)
        val bottomNavigationView: BottomNavigationView = findViewById(R.id.nav_view)

        bottomNavigationView.setupWithNavController(navController)

        // นำทางไปยัง HomeFragment ทันที
        val bundle = Bundle().apply {
            putInt("userID", userID)
        }
        navController.navigate(R.id.navigation_home, bundle)

        bottomNavigationView.setOnItemSelectedListener { menuItem ->
            val bundle = Bundle().apply {
                putInt("userID", userID)
            }
            when (menuItem.itemId) {
                R.id.navigation_profile -> {
                    if (navController.currentDestination?.id != R.id.navigation_profile) {
                        navController.navigate(R.id.navigation_profile, bundle)
                    }
                    true
                }

                R.id.navigation_home -> {
                    if (navController.currentDestination?.id != R.id.navigation_home) {
                        navController.navigate(R.id.navigation_home, bundle)
                    }
                    true
                }

                R.id.navigation_message -> {
                    if (navController.currentDestination?.id != R.id.navigation_message) {
                        navController.navigate(R.id.navigation_message, bundle)
                    }
                    true
                }

                else -> false
            }
        }
    }
}
