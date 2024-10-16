package th.ac.rmutto.finlove

import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

class OtherProfileActivity : AppCompatActivity() {

    private lateinit var profileImageView: ImageView
    private lateinit var firstNameTextView: TextView
    private lateinit var lastNameTextView: TextView
    private lateinit var nicknameTextView: TextView
    private lateinit var genderTextView: TextView
    private lateinit var preferencesTextView: TextView
    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_other_profile)

        // Initialize views
        profileImageView = findViewById(R.id.profile_image)
        firstNameTextView = findViewById(R.id.textViewFirstName)
        lastNameTextView = findViewById(R.id.textViewLastName)
        nicknameTextView = findViewById(R.id.textViewNickname)
        genderTextView = findViewById(R.id.textViewGender)
        preferencesTextView = findViewById(R.id.textViewPreferences)

        // Get the userID from intent
        val userID = intent.getIntExtra("userID", -1)

        // If userID is valid, fetch user profile
        if (userID != -1) {
            fetchUserProfile(userID)
        } else {
            Toast.makeText(this, "ไม่พบข้อมูลผู้ใช้", Toast.LENGTH_SHORT).show()
        }
    }

    // Function to fetch user profile using API
    private fun fetchUserProfile(userID: Int) {
        GlobalScope.launch(Dispatchers.IO) {
            val url = getString(R.string.root_url) + "/api/profile/$userID"
            val request = Request.Builder().url(url).build()

            try {
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    val jsonObject = JSONObject(responseBody ?: "{}")

                    // Extract data from JSON response
                    val firstName = jsonObject.optString("firstname")
                    val lastName = jsonObject.optString("lastname")
                    val nickname = jsonObject.optString("nickname")
                    val gender = jsonObject.optString("gender")
                    val preferences = jsonObject.optString("preferences")
                    val profileImage = jsonObject.optString("imageFile")

                    // Update UI on the main thread
                    withContext(Dispatchers.Main) {
                        firstNameTextView.text = firstName
                        lastNameTextView.text = lastName
                        nicknameTextView.text = nickname
                        genderTextView.text = gender
                        preferencesTextView.text = preferences

                        // Load profile image using Glide
                        Glide.with(this@OtherProfileActivity)
                            .load(profileImage)
                            .into(profileImageView)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@OtherProfileActivity, "ไม่สามารถดึงข้อมูลผู้ใช้ได้", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@OtherProfileActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                    Log.e("OtherProfileActivity", "Error fetching profile", e)
                }
            }
        }
    }
}
