package th.ac.rmutto.finlove

import android.app.AlertDialog
import android.app.DatePickerDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.bumptech.glide.Glide
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.MediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.*

class ProfileActivity : AppCompatActivity() {

    private lateinit var textViewUsername: EditText
    private lateinit var textViewNickname: EditText
    private lateinit var textViewEmail: EditText
    private lateinit var textViewFirstName: EditText
    private lateinit var textViewLastName: EditText
    private lateinit var spinnerGender: Spinner
    private lateinit var textViewHeight: EditText
    private lateinit var textViewHome: EditText
    private lateinit var buttonSelectDateProfile: Button
    private lateinit var imageViewProfile: ImageView

    // Spinners for education, goal and preference
    private lateinit var spinnerEducation: Spinner
    private lateinit var spinnerGoal: Spinner
    private lateinit var spinnerPreference: Spinner

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

    private lateinit var originalUser: User // Original user data
    private lateinit var currentUser: User // Edited user data

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        val userID = intent.getIntExtra("userID", -1)
        Log.d("ProfileActivity", "Received userID: $userID")

        if (userID != -1) {
            fetchUserInfo(userID)
        } else {
            Toast.makeText(this, "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        // Initialize Toolbar and set it as ActionBar
        toolbar = findViewById(R.id.toolbarProfile)
        setSupportActionBar(toolbar)

        // Initialize views
        textViewUsername = findViewById(R.id.textViewUsername)
        textViewNickname = findViewById(R.id.textViewNickname)
        textViewEmail = findViewById(R.id.textViewEmail)
        textViewFirstName = findViewById(R.id.textViewFirstName)
        textViewLastName = findViewById(R.id.textViewLastName)
        spinnerGender = findViewById(R.id.spinnerGender)
        textViewHeight = findViewById(R.id.textViewHeight)
        textViewHome = findViewById(R.id.textViewHome)
        buttonSelectDateProfile = findViewById(R.id.buttonSelectDateProfile)
        imageViewProfile = findViewById(R.id.imageViewProfile)

        // Initialize new Spinners
        spinnerEducation = findViewById(R.id.spinnerEducation)
        spinnerGoal = findViewById(R.id.spinnerGoal)
        spinnerPreference = findViewById(R.id.spinnerPreference)

        // Initialize buttons
        buttonChangeImage = findViewById(R.id.buttonChangeImage)
        buttonEditProfile = findViewById(R.id.buttonEditProfile)
        buttonSaveProfile = findViewById(R.id.buttonSaveProfile)
        buttonLogout = findViewById(R.id.buttonLogout)
        buttonDeleteAccount = findViewById(R.id.buttonDeleteAccount)

        // Set adapters for Spinners
        setupSpinners()

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

        buttonDeleteAccount.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Delete Account")
                .setMessage("Are you sure you want to delete your account? This action cannot be undone.")
                .setPositiveButton("YES") { _, _ ->
                    deleteUser(userID) // Call deleteUser function to delete account
                }
                .setNegativeButton("NO", null)
                .show()
        }


        // Edit profile functionality
        buttonEditProfile.setOnClickListener {
            isEditing = !isEditing
            if (isEditing) {
                setEditingEnabled(true)
                buttonChangeImage.visibility = View.VISIBLE
                buttonSaveProfile.visibility = View.VISIBLE

                currentUser = originalUser.copy() // Clone original data for editing
                showAllFields() // Show all fields for editing
            } else {
                setEditingEnabled(false)
                buttonChangeImage.visibility = View.GONE
                buttonSaveProfile.visibility = View.GONE
                restoreOriginalUserInfo() // Restore original data
                hideFieldsForViewingMode() // Hide fields not in viewing mode
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

    // Handle the result of image selection
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.data != null) {
            selectedImageUri = data.data // เก็บ Uri ของรูปภาพที่เลือก
            imageViewProfile.setImageURI(selectedImageUri) // แสดงภาพที่เลือกใน ImageView
        }
    }

    private fun setupSpinners() {
        // Setup the education spinner
        val educationAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.education_levels,
            android.R.layout.simple_spinner_item
        )
        educationAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerEducation.adapter = educationAdapter

        // Setup the goal spinner
        val goalAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.goal_options,
            android.R.layout.simple_spinner_item
        )
        goalAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerGoal.adapter = goalAdapter

        // Setup the preference spinner
        val preferenceAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.preference_options,
            android.R.layout.simple_spinner_item
        )
        preferenceAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerPreference.adapter = preferenceAdapter

        // Setup the gender spinner
        val genderAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.gender_array,
            android.R.layout.simple_spinner_item
        )
        genderAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerGender.adapter = genderAdapter
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
                        originalUser = user // Store original user data
                        toolbar.title = ""
                        val toolbarTitle = findViewById<TextView>(R.id.toolbarTitle)
                        toolbarTitle.text = user.nickname // Update toolbar title

                        updateUserFields(user) // Update all fields
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

    private fun updateUserFields(user: User) {
        textViewFirstName.setText(user.firstName)
        textViewLastName.setText(user.lastName)
        textViewNickname.setText(user.nickname)
        textViewUsername.setText(user.username)
        textViewEmail.setText(user.email)
        textViewHeight.setText(user.height.toString())
        textViewHome.setText(user.home)
        buttonSelectDateProfile.text = user.dateBirth

        // Set Spinner selections safely
        val genderIndex = resources.getStringArray(R.array.gender_array).indexOf(user.gender)
        if (genderIndex >= 0) {
            spinnerGender.setSelection(genderIndex)
        }

        val educationIndex = resources.getStringArray(R.array.education_levels).indexOf(user.education)
        if (educationIndex >= 0) {
            spinnerEducation.setSelection(educationIndex)
        }

        val goalIndex = resources.getStringArray(R.array.goal_options).indexOf(user.goal)
        if (goalIndex >= 0) {
            spinnerGoal.setSelection(goalIndex)
        }

        val preferenceIndex = resources.getStringArray(R.array.preference_options).indexOf(user.preferences)
        if (preferenceIndex >= 0) {
            spinnerPreference.setSelection(preferenceIndex)
        }

        user.imageFile?.let { loadImage(it, imageViewProfile) }
    }

    private fun restoreOriginalUserInfo() {
        updateUserFields(originalUser) // Restore fields to original user data
    }

    private fun saveUserInfo(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()

                val selectedGender = spinnerGender.selectedItem.toString()
                val selectedEducation = spinnerEducation.selectedItem.toString()
                val selectedGoal = spinnerGoal.selectedItem.toString()
                val selectedPreference = spinnerPreference.selectedItem.toString()

                // สร้าง request body สำหรับข้อมูลโปรไฟล์
                val requestBuilder = MultipartBody.Builder().setType(MultipartBody.FORM)
                    .addFormDataPart("username", textViewUsername.text.toString())
                    .addFormDataPart("nickname", textViewNickname.text.toString())
                    .addFormDataPart("email", textViewEmail.text.toString())
                    .addFormDataPart("firstname", textViewFirstName.text.toString())
                    .addFormDataPart("lastname", textViewLastName.text.toString())
                    .addFormDataPart("gender", selectedGender)
                    .addFormDataPart("education", selectedEducation)
                    .addFormDataPart("goal", selectedGoal)
                    .addFormDataPart("preference", selectedPreference)
                    .addFormDataPart("height", textViewHeight.text.toString())
                    .addFormDataPart("home", textViewHome.text.toString())
                    .addFormDataPart("DateBirth", selectedDateOfBirth ?: "")

                // เพิ่มรูปภาพลงใน request ถ้าเลือกภาพมา
                if (selectedImageUri != null) {
                    val inputStream = contentResolver.openInputStream(selectedImageUri!!)
                    val fileBytes = inputStream?.readBytes()
                    if (fileBytes != null) {
                        requestBuilder.addFormDataPart(
                            "image",
                            "profile_image.jpg",
                            fileBytes.toRequestBody("image/jpeg".toMediaTypeOrNull())
                        )
                    }
                }

                val requestBody = requestBuilder.build()
                val rootUrl = getString(R.string.root_url)
                val url = "$rootUrl/api/user/update/$userID"
                val request = Request.Builder().url(url).put(requestBody).build()

                // ส่ง request และจัดการการตอบกลับ
                val response = client.newCall(request).execute()
                val success = response.isSuccessful

                withContext(Dispatchers.Main) {
                    if (success) {
                        Toast.makeText(this@ProfileActivity, "บันทึกข้อมูลสำเร็จ", Toast.LENGTH_SHORT).show()

                        // หน่วงเวลาและ fetch ข้อมูลใหม่
                        withContext(Dispatchers.IO) {
                            delay(600)
                        }
                        fetchUserInfo(userID)

                        setEditingEnabled(false)
                        buttonChangeImage.visibility = View.GONE
                        buttonSaveProfile.visibility = View.GONE
                        hideFieldsForViewingMode()
                    } else {
                        val errorResponse = response.body?.string()
                        Log.e("ProfileActivity", "Error response: $errorResponse")
                        Toast.makeText(this@ProfileActivity, "บันทึกข้อมูลล้มเหลว: ${errorResponse ?: "Unknown error"}", Toast.LENGTH_SHORT).show()
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
        spinnerGender.isEnabled = enabled
        spinnerEducation.isEnabled = enabled
        spinnerGoal.isEnabled = enabled
        spinnerPreference.isEnabled = enabled
        textViewHeight.isEnabled = enabled
        textViewHome.isEnabled = enabled
        buttonSelectDateProfile.isEnabled = enabled
        buttonChangeImage.isEnabled = enabled
        buttonSaveProfile.isEnabled = enabled
    }

    private fun showAllFields() {
        textViewUsername.visibility = View.VISIBLE
        textViewEmail.visibility = View.VISIBLE
        textViewHeight.visibility = View.VISIBLE
        textViewHome.visibility = View.VISIBLE
        buttonSelectDateProfile.visibility = View.VISIBLE
        spinnerGoal.visibility = View.VISIBLE
        spinnerEducation.visibility = View.VISIBLE
        spinnerPreference.visibility = View.VISIBLE
    }

    private fun hideFieldsForViewingMode() {
        textViewUsername.visibility = View.GONE
        textViewEmail.visibility = View.GONE
        textViewHeight.visibility = View.GONE
        textViewHome.visibility = View.GONE
        buttonSelectDateProfile.visibility = View.GONE
        spinnerGoal.visibility = View.GONE
        spinnerEducation.visibility = View.GONE
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
            id = jsonObject.optInt("id", -1),
            username = jsonObject.optString("username", ""),
            nickname = jsonObject.optString("nickname", ""),
            email = jsonObject.optString("email", ""),
            firstName = jsonObject.optString("firstname", ""),
            lastName = jsonObject.optString("lastname", ""),
            gender = jsonObject.optString("gender", ""),
            education = jsonObject.optString("education", ""),
            goal = jsonObject.optString("goal", ""),
            preferences = jsonObject.optString("preferences", ""),
            height = jsonObject.optDouble("height", 0.0),
            home = jsonObject.optString("home", ""),
            dateBirth = jsonObject.optString("DateBirth", ""),
            imageFile = jsonObject.optString("imageFile", "")
        )
    }

    private fun logoutUser(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = getString(R.string.root_url) + "/api/logout/$userID"
                val request = Request.Builder()
                    .url(url)
                    .post(okhttp3.FormBody.Builder().build()) // POST with an empty form body
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

    private fun deleteUser(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient()
                val request = Request.Builder()
                    .url("${getString(R.string.root_url)}/api/user/$userID")
                    .delete()
                    .build()

                val response = client.newCall(request).execute()
                val success = response.isSuccessful

                withContext(Dispatchers.Main) {
                    if (success) {
                        Toast.makeText(this@ProfileActivity, "ลบผู้ใช้สำเร็จ", Toast.LENGTH_SHORT).show()
                        // ทำการ Logout หรือส่งผู้ใช้กลับไปหน้าแรก
                        val intent = Intent(this@ProfileActivity, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@ProfileActivity, "ลบผู้ใช้ไม่สำเร็จ", Toast.LENGTH_SHORT).show()
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


