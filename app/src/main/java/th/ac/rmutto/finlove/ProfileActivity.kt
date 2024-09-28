package th.ac.rmutto.finlove

import android.app.DatePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.text.Editable
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.bumptech.glide.Glide
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.File
import java.util.*

class ProfileActivity : AppCompatActivity() {

    private lateinit var textViewUsername: EditText
    private lateinit var textViewNickname: EditText
    private lateinit var textViewEmail: EditText
    private lateinit var textViewFirstName: EditText
    private lateinit var textViewLastName: EditText
    private lateinit var textViewGender: EditText
    private lateinit var textViewHeight: EditText
    private lateinit var textViewHome: EditText
    private lateinit var buttonSelectDateProfile: Button
    private lateinit var textViewEducation: EditText
    private lateinit var textViewGoal: EditText
    private lateinit var imageViewProfile: ImageView
    private lateinit var textViewPreferences: EditText

    private lateinit var buttonEditProfile: ImageButton
    private lateinit var buttonSaveProfile: Button
    private lateinit var buttonChangeImage: Button
    private lateinit var buttonLogout: Button
    private lateinit var buttonDeleteAccount: Button
    private lateinit var toolbar: Toolbar
    private var selectedImageUri: Uri? = null
    private var selectedDateOfBirth: String? = null
    private var isEditing = false
    private val PICK_IMAGE_REQUEST = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        // Initialize Toolbar and set it as ActionBar
        toolbar = findViewById(R.id.toolbarProfile)
        setSupportActionBar(toolbar)

        // Initialize views
        textViewUsername = findViewById(R.id.textViewUsername)
        textViewNickname = findViewById(R.id.textViewNickname)
        textViewEmail = findViewById(R.id.textViewEmail)
        textViewFirstName = findViewById(R.id.textViewFirstName)
        textViewLastName = findViewById(R.id.textViewLastName)
        textViewGender = findViewById(R.id.textViewGender)
        textViewHeight = findViewById(R.id.textViewHeight)
        textViewHome = findViewById(R.id.textViewHome)
        buttonSelectDateProfile = findViewById(R.id.buttonSelectDateProfile)
        textViewEducation = findViewById(R.id.textViewEducation)
        textViewGoal = findViewById(R.id.textViewGoal)
        imageViewProfile = findViewById(R.id.imageViewProfile)
        textViewPreferences = findViewById(R.id.textViewPreferences)

        buttonEditProfile = findViewById(R.id.buttonEditProfile)
        buttonSaveProfile = findViewById(R.id.buttonSaveProfile)
        buttonChangeImage = findViewById(R.id.buttonChangeImage)
        buttonLogout = findViewById(R.id.buttonLogout)
        buttonDeleteAccount = findViewById(R.id.buttonDeleteAccount)

        // Initially hide buttons and some fields
        buttonChangeImage.visibility = View.GONE
        buttonSaveProfile.visibility = View.GONE

        // Initially hide all fields except profile image, firstname, lastname, nickname, and gender
        hideFieldsForViewingMode()

        // DatePickerDialog setup for Date of Birth
        buttonSelectDateProfile.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            val datePickerDialog = DatePickerDialog(this, { _, selectedYear, selectedMonth, selectedDay ->
                selectedDateOfBirth = "$selectedYear-${String.format("%02d", selectedMonth + 1)}-${String.format("%02d", selectedDay)}"
                buttonSelectDateProfile.text = selectedDateOfBirth
            }, year, month, day)

            datePickerDialog.show()
        }

        // Get userID from intent
        val userID = intent.getIntExtra("userID", -1)
        if (userID != -1) {
            fetchUserInfo(userID)
        } else {
            Toast.makeText(this, "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        // Edit profile functionality
        buttonEditProfile.setOnClickListener {
            isEditing = !isEditing
            setEditingEnabled(isEditing)
            buttonChangeImage.visibility = if (isEditing) View.VISIBLE else View.GONE
            buttonSaveProfile.visibility = if (isEditing) View.VISIBLE else View.GONE

            // If editing is enabled, show all fields
            if (isEditing) {
                showAllFields()
            } else {
                // Hide fields again when editing is done
                hideFieldsForViewingMode()
            }
        }

        // Save profile functionality
        buttonSaveProfile.setOnClickListener {
            saveUserInfo(userID)
        }

        // Change image functionality
        buttonChangeImage.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(intent, PICK_IMAGE_REQUEST)
        }

        // Logout functionality
        buttonLogout.setOnClickListener {
            logoutUser(userID)
        }
    }

    private fun fetchUserInfo(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = getString(R.string.root_url) + "/api/user/$userID"
                val request = Request.Builder().url(url).build()
                val response = OkHttpClient().newCall(request).execute()

                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    val user = parseUserInfo(responseBody)

                    withContext(Dispatchers.Main) {
                        toolbar.title = ""
                        val toolbarTitle = findViewById<TextView>(R.id.toolbarTitle)
                        toolbarTitle.text = user.nickname

                        textViewFirstName.setText(user.firstName)
                        textViewLastName.setText(user.lastName)
                        textViewNickname.setText(user.nickname)
                        textViewGender.setText(user.gender)

                        // Other fields will remain hidden until edit mode is enabled
                        textViewUsername.setText(user.username)
                        textViewEmail.setText(user.email)
                        textViewHeight.setText(user.height.toString())
                        textViewHome.setText(user.home)
                        buttonSelectDateProfile.text = user.dateBirth

                        textViewGoal.setText(user.goal ?: "No goals available")
                        textViewPreferences.text = Editable.Factory.getInstance().newEditable(user.preferences ?: "No preferences available")
                        textViewEducation.setText(user.education ?: "")

                        user.imageFile?.let { loadImage(it, imageViewProfile) }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@ProfileActivity, "Failed to fetch user info", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@ProfileActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun saveUserInfo(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()
                val requestBuilder = MultipartBody.Builder().setType(MultipartBody.FORM)
                    .addFormDataPart("username", textViewUsername.text.toString())
                    .addFormDataPart("nickname", textViewNickname.text.toString())
                    .addFormDataPart("email", textViewEmail.text.toString())
                    .addFormDataPart("firstname", textViewFirstName.text.toString())
                    .addFormDataPart("lastname", textViewLastName.text.toString())
                    .addFormDataPart("gender", textViewGender.text.toString())
                    .addFormDataPart("height", textViewHeight.text.toString())
                    .addFormDataPart("home", textViewHome.text.toString())
                    .addFormDataPart("DateBirth", selectedDateOfBirth ?: "")
                    .addFormDataPart("education", textViewEducation.text.toString())
                    .addFormDataPart("goal", textViewGoal.text.toString())

                val requestBody = requestBuilder.build()
                val rootUrl = getString(R.string.root_url)
                val url = "$rootUrl/api/user/update/$userID"
                val request = Request.Builder().url(url).put(requestBody).build()

                val response = client.newCall(request).execute()
                val success = response.isSuccessful

                withContext(Dispatchers.Main) {
                    if (success) {
                        Toast.makeText(this@ProfileActivity, "บันทึกข้อมูลสำเร็จ", Toast.LENGTH_SHORT).show()
                        setEditingEnabled(false)
                        isEditing = false
                        hideFieldsForViewingMode()
                    } else {
                        Toast.makeText(this@ProfileActivity, "บันทึกข้อมูลล้มเหลว", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@ProfileActivity, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun setEditingEnabled(enabled: Boolean) {
        textViewUsername.isEnabled = enabled
        textViewNickname.isEnabled = enabled
        textViewEmail.isEnabled = enabled
        textViewFirstName.isEnabled = enabled
        textViewLastName.isEnabled = enabled
        textViewGender.isEnabled = enabled
        textViewHeight.isEnabled = enabled
        textViewHome.isEnabled = enabled
        buttonSelectDateProfile.isEnabled = enabled
        textViewGoal.isEnabled = enabled
        textViewEducation.isEnabled = enabled
        buttonChangeImage.isEnabled = enabled
        buttonSaveProfile.isEnabled = enabled
    }

    private fun loadImage(url: String, imageView: ImageView) {
        Glide.with(this)
            .load(url)
            .placeholder(R.drawable.img_1)
            .error(R.drawable.error)
            .into(imageView)
    }

    private fun parseUserInfo(responseBody: String?): User {
        val jsonObject = JSONObject(responseBody ?: "{}")
        return User(
            username = jsonObject.optString("username", ""),
            nickname = jsonObject.optString("nickname", ""),
            email = jsonObject.optString("email", ""),
            firstName = jsonObject.optString("firstname", ""),
            lastName = jsonObject.optString("lastname", ""),
            gender = jsonObject.optString("gender", "Unknown"),
            height = jsonObject.optDouble("height", 0.0),
            home = jsonObject.optString("home", ""),
            dateBirth = jsonObject.optString("DateBirth", ""),
            education = jsonObject.optString("education", ""),
            goal = jsonObject.optString("goals", ""),  // Use the string from the API
            imageFile = jsonObject.optString("imageFile", ""),
            preferences = jsonObject.optString("preferences", "")
        )
    }

    private fun hideFieldsForViewingMode() {
        textViewUsername.visibility = View.GONE
        textViewEmail.visibility = View.GONE
        textViewHeight.visibility = View.GONE
        textViewHome.visibility = View.GONE
        buttonSelectDateProfile.visibility = View.GONE
        textViewGoal.visibility = View.GONE
        textViewPreferences.visibility = View.GONE
        textViewEducation.visibility = View.GONE
    }

    private fun showAllFields() {
        textViewUsername.visibility = View.VISIBLE
        textViewEmail.visibility = View.VISIBLE
        textViewHeight.visibility = View.VISIBLE
        textViewHome.visibility = View.VISIBLE
        buttonSelectDateProfile.visibility = View.VISIBLE
        textViewGoal.visibility = View.VISIBLE
        textViewPreferences.visibility = View.VISIBLE
        textViewEducation.visibility = View.VISIBLE
    }

    private fun logoutUser(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = getString(R.string.root_url) + "/api/logout/$userID"
                val request = Request.Builder()
                    .url(url)
                    .post(FormBody.Builder().build()) // POST with an empty form body
                    .build()

                val response = OkHttpClient().newCall(request).execute()
                val success = response.isSuccessful

                withContext(Dispatchers.Main) {
                    if (success) {
                        Toast.makeText(this@ProfileActivity, "Logged out successfully", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@ProfileActivity, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@ProfileActivity, "Failed to logout", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@ProfileActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

}
