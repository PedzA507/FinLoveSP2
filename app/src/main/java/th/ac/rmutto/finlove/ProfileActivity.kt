package th.ac.rmutto.finlove

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.bumptech.glide.Glide
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import android.app.AlertDialog
import android.app.DatePickerDialog
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.TextView
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import org.json.JSONObject
import java.io.File
import java.util.Calendar

class ProfileActivity : AppCompatActivity() {

    private var user: User? = null
    private val educationOptions = arrayOf("มัธยมศึกษา", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก")
    private lateinit var textViewUsername: EditText
    private lateinit var textViewNickname: EditText
    private lateinit var textViewEmail: EditText
    private lateinit var textViewFirstName: EditText
    private lateinit var textViewLastName: EditText
    private lateinit var textViewGender: EditText
    private lateinit var textViewHeight: EditText
    private lateinit var textViewHome: EditText
    private lateinit var buttonSelectDateProfile: Button
    private lateinit var spinnerEducationProfile: Spinner
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
        spinnerEducationProfile = findViewById(R.id.spinnerEducationProfile)
        textViewGoal = findViewById(R.id.textViewGoal)
        imageViewProfile = findViewById(R.id.imageViewProfile)
        textViewPreferences = findViewById(R.id.textViewPreferences)

        buttonEditProfile = findViewById(R.id.buttonEditProfile)
        buttonSaveProfile = findViewById(R.id.buttonSaveProfile)
        buttonChangeImage = findViewById(R.id.buttonChangeImage)
        buttonLogout = findViewById(R.id.buttonLogout)
        buttonDeleteAccount = findViewById(R.id.buttonDeleteAccount)

        // ซ่อนปุ่มเปลี่ยนรูปภาพและปุ่มบันทึกในตอนเริ่มต้น
        buttonChangeImage.visibility = View.GONE
        buttonSaveProfile.visibility = View.GONE

        // ซ่อนฟิลด์หลังจาก Gender
        textViewUsername.visibility = View.GONE
        textViewEmail.visibility = View.GONE
        textViewHeight.visibility = View.GONE
        textViewHome.visibility = View.GONE
        buttonSelectDateProfile.visibility = View.GONE
        spinnerEducationProfile.visibility = View.GONE
        textViewGoal.visibility = View.GONE

        // Set up DatePickerDialog for Date of Birth
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

        // Set up Spinner for Education
        val educationOptions = arrayOf("มัธยมศึกษา", "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, educationOptions)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerEducationProfile.adapter = adapter

        // Get the userID from the intent
        val userID = intent.getIntExtra("userID", -1)
        if (userID != -1) {
            fetchUserInfo(userID)
        } else {
            Toast.makeText(this, "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        buttonEditProfile.setOnClickListener {
            isEditing = !isEditing
            setEditingEnabled(isEditing)
            buttonChangeImage.visibility = if (isEditing) View.VISIBLE else View.GONE
            buttonSaveProfile.visibility = if (isEditing) View.VISIBLE else View.GONE
        }

        buttonSaveProfile.setOnClickListener {
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

                    // หา EducationID จากการเลือกใน Spinner
                    val educationSelected = spinnerEducationProfile.selectedItem.toString()
                    val educationID = getEducationIDFromName(educationSelected)
                    requestBuilder.addFormDataPart("educationID", educationID.toString())

                    requestBuilder.addFormDataPart("goal", textViewGoal.text.toString())

                    if (selectedImageUri != null) {
                        val file = getFileFromUri(selectedImageUri!!)
                        if (file != null && file.exists()) {
                            val requestBody = RequestBody.create("image/jpeg".toMediaTypeOrNull(), file)
                            requestBuilder.addFormDataPart("imageFile", file.name, requestBody)
                        }
                    }

                    val requestBody = requestBuilder.build()
                    val rootUrl = getString(R.string.root_url) // ดึงค่า root_url จาก strings.xml
                    val url = "$rootUrl/api/user/update/$userID" // ประกอบ URL กับ path ที่ต้องการ
                    val request = Request.Builder()
                        .url(url)
                        .put(requestBody)
                        .build()

                    val response = client.newCall(request).execute()
                    val responseBody = response.body?.string()
                    val jsonObject = JSONObject(responseBody ?: "{}")
                    val success = response.isSuccessful

                    withContext(Dispatchers.Main) {
                        if (success) {
                            Toast.makeText(this@ProfileActivity, "บันทึกข้อมูลสำเร็จ", Toast.LENGTH_SHORT).show()
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

        buttonChangeImage.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(intent, PICK_IMAGE_REQUEST)
        }

        buttonLogout.setOnClickListener {
            logoutUser(userID)
        }

        buttonDeleteAccount.setOnClickListener {
            showDeleteConfirmationDialog(userID)
        }


        buttonEditProfile.setOnClickListener {
            isEditing = !isEditing
            setEditingEnabled(isEditing)
            setFieldsVisibility(isEditing)

            // แสดงปุ่มเปลี่ยนรูปภาพและบันทึกเมื่ออยู่ในโหมดแก้ไข
            buttonChangeImage.visibility = if (isEditing) View.VISIBLE else View.GONE
            buttonSaveProfile.visibility = if (isEditing) View.VISIBLE else View.GONE

            // แสดงฟิลด์เพิ่มเติมเมื่ออยู่ในโหมดแก้ไข
            textViewUsername.visibility = if (isEditing) View.VISIBLE else View.GONE
            textViewEmail.visibility = if (isEditing) View.VISIBLE else View.GONE
            textViewHeight.visibility = if (isEditing) View.VISIBLE else View.GONE
            textViewHome.visibility = if (isEditing) View.VISIBLE else View.GONE
            buttonSelectDateProfile.visibility = if (isEditing) View.VISIBLE else View.GONE
            spinnerEducationProfile.visibility = if (isEditing) View.VISIBLE else View.GONE
            textViewGoal.visibility = if (isEditing) View.VISIBLE else View.GONE

            if (isEditing) {
                // ตั้งค่า hint เมื่อช่องข้อมูลว่าง
                setupHintOnEmptyFields()
            }

            Toast.makeText(this, if (isEditing) "Editing enabled" else "Editing disabled", Toast.LENGTH_SHORT).show()
        }


        buttonSaveProfile.setOnClickListener {
            // บันทึกข้อมูลเมื่อกดปุ่มบันทึก
            saveUserInfo(userID)
        }

        buttonChangeImage.setOnClickListener {
            // เปิดตัวเลือกการเลือกรูปภาพ
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(intent, PICK_IMAGE_REQUEST)
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
                            Toast.makeText(this@ProfileActivity, "Logged out successfully", Toast.LENGTH_SHORT).show()
                            val intent = Intent(this@ProfileActivity, LoginActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            startActivity(intent)
                            finish()
                        }
                    } else {
                        withContext(Dispatchers.Main) {
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

    private fun showDeleteConfirmationDialog(userID: Int) {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Confirm Delete")
        builder.setMessage("คุณแน่ใจหรือว่าต้องการลบบัญชีของคุณ? การลบนี้ไม่สามารถยกเลิกได้!")

        builder.setPositiveButton("ยืนยัน") { dialog, which ->
            deleteAccount(userID)
        }

        builder.setNegativeButton("ยกเลิก") { dialog, which ->
            dialog.dismiss()
        }

        val dialog = builder.create()
        dialog.show()
    }


    private fun deleteAccount(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = getString(R.string.root_url) + "/api/user/$userID"
                val request = Request.Builder().url(url).delete().build()

                val response = OkHttpClient().newCall(request).execute()
                val responseBody = response.body?.string()
                val jsonObject = JSONObject(responseBody ?: "{}")
                val message = jsonObject.optString("message", "เกิดข้อผิดพลาดในการลบบัญชี")

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ProfileActivity, "บัญชีถูกลบสำเร็จ", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@ProfileActivity, LoginActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@ProfileActivity, message, Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@ProfileActivity, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }



    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == RESULT_OK && data != null && data.data != null) {
            selectedImageUri = data.data
            if (selectedImageUri != null) {
                Glide.with(this)
                    .load(selectedImageUri)
                    .placeholder(R.drawable.img_1)  // Placeholder image
                    .error(R.drawable.error)  // Error image
                    .into(imageViewProfile)
                Toast.makeText(this, "Image selected successfully", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Failed to load selected image", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(this, "No image selected", Toast.LENGTH_SHORT).show()
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
                    user = parseUserInfo(responseBody)

                    withContext(Dispatchers.Main) {
                        toolbar.title = ""
                        val toolbarTitle = findViewById<TextView>(R.id.toolbarTitle)
                        toolbarTitle.text = user?.nickname ?: ""

                        textViewUsername.setText(user?.username ?: "")
                        textViewNickname.setText(user?.nickname ?: "")
                        textViewEmail.setText(user?.email ?: "")
                        textViewFirstName.setText(user?.firstName ?: "")
                        textViewLastName.setText(user?.lastName ?: "")
                        textViewGender.setText(user?.gender ?: "")
                        textViewHeight.setText(user?.height.toString())
                        textViewHome.setText(user?.home ?: "")
                        buttonSelectDateProfile.text = user?.dateBirth ?: ""

                        // ตรวจสอบการดึงข้อมูล goal
                        if (user?.goal != null && user?.goal!!.isNotEmpty()) {
                            textViewGoal.setText(user?.goal ?: "No goals available")
                        } else {
                            textViewGoal.setText("No goals available")
                        }

                        // ตรวจสอบการดึงข้อมูล preferences
                        textViewPreferences.text = Editable.Factory.getInstance().newEditable(user?.preferences ?: "No preferences available")

                        // ตั้งค่า Spinner สำหรับการแสดงผล Education
                        val position = educationOptions.indexOf(user?.education)
                        if (position != -1) {
                            spinnerEducationProfile.setSelection(position)
                        }

                        user?.imageFile?.let { loadImage(it, imageViewProfile) }
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
                    .addFormDataPart("education", spinnerEducationProfile.selectedItem.toString())
                    .addFormDataPart("goal", textViewGoal.text.toString())

                // Log ข้อมูลที่กำลังจะถูกส่ง
                Log.d("ProfileActivity", "Sending Data: ${textViewUsername.text.toString()}, ${textViewNickname.text.toString()}, ${textViewEmail.text.toString()}")

                val requestBody = requestBuilder.build()
                val rootUrl = getString(R.string.root_url) // ดึงค่า root_url จาก strings.xml
                val url = "$rootUrl/api/user/update/$userID"  // ใช้ API สำหรับอัปเดตผู้ใช้
                val request = Request.Builder()
                    .url(url)
                    .put(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()
                val jsonObject = JSONObject(responseBody ?: "{}")
                val success = response.isSuccessful
                val updatedImageUrl = jsonObject.optString("image", null)

                withContext(Dispatchers.Main) {
                    if (success) {
                        Toast.makeText(this@ProfileActivity, "บันทึกข้อมูลสำเร็จ", Toast.LENGTH_SHORT).show()

                        val toolbarTitle = findViewById<TextView>(R.id.toolbarTitle)
                        toolbarTitle.text = textViewNickname.text.toString()

                        updatedImageUrl?.let {
                            loadImage(it, imageViewProfile)
                        }
                        setEditingEnabled(false)
                        isEditing = false
                    } else {
                        val message = jsonObject.optString("message", "บันทึกข้อมูลล้มเหลว")
                        Toast.makeText(this@ProfileActivity, message, Toast.LENGTH_SHORT).show()
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
        buttonSelectDateProfile.isEnabled = enabled
        textViewGoal.isEnabled = enabled
        buttonChangeImage.isEnabled = enabled
        buttonSaveProfile.isEnabled = enabled
    }

    private fun setFieldsVisibility(showAll: Boolean) {
        if (showAll) {
            textViewUsername.visibility = EditText.VISIBLE
            textViewEmail.visibility = EditText.VISIBLE
            textViewHeight.visibility = EditText.VISIBLE
            textViewHome.visibility = EditText.VISIBLE
            buttonSelectDateProfile.visibility = EditText.VISIBLE
            spinnerEducationProfile.visibility = EditText.VISIBLE
            textViewGoal.visibility = EditText.VISIBLE
        } else {
            textViewUsername.visibility = EditText.GONE
            textViewEmail.visibility = EditText.GONE
            textViewHeight.visibility = EditText.GONE
            textViewHome.visibility = EditText.GONE
            buttonSelectDateProfile.visibility = EditText.GONE
            spinnerEducationProfile.visibility = EditText.GONE
            textViewGoal.visibility = EditText.GONE
        }
    }

    private fun loadImage(url: String, imageView: ImageView) {
        Glide.with(this)
            .load(url)
            .placeholder(R.drawable.img_1)  // Placeholder image
            .error(R.drawable.error)  // Error image
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
            goal = jsonObject.optString("goals", ""), // ดึงข้อมูล goals ที่ใช้ GROUP_CONCAT มาแสดง
            imageFile = jsonObject.optString("imageFile", ""),
            preferences = jsonObject.optString("preferences", "") // ดึงข้อมูล preferences ที่ใช้ GROUP_CONCAT มาแสดง
        )
    }



    private fun getFileFromUri(uri: Uri): File? {
        return try {
            val inputStream = contentResolver.openInputStream(uri) ?: return null
            val tempFile = File.createTempFile("image", ".jpg", cacheDir)
            tempFile.outputStream().use { outputStream ->
                inputStream.copyTo(outputStream)
            }
            tempFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun setupHintOnEmptyFields() {
        setHintOnEmptyField(textViewUsername, "Username")
        setHintOnEmptyField(textViewNickname, "Nickname")
        setHintOnEmptyField(textViewEmail, "Email")
        setHintOnEmptyField(textViewFirstName, "Firstname")
        setHintOnEmptyField(textViewLastName, "Last Name")
        setHintOnEmptyField(textViewGender, "Gender")
        setHintOnEmptyField(textViewHeight, "Height")
        setHintOnEmptyField(textViewHome, "Home")
        setHintOnEmptyField(textViewGoal, "Goal")
        setHintOnEmptyField(textViewPreferences, "Preferences")
    }

    private fun setHintOnEmptyField(editText: EditText, hint: String) {
        editText.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

            override fun afterTextChanged(s: Editable?) {
                if (s.isNullOrEmpty()) {
                    editText.hint = hint
                }
            }
        })
    }

    // ฟังก์ชันที่ใช้สำหรับแปลงจาก EducationName เป็น EducationID
    private fun getEducationIDFromName(educationName: String): Int {
        return when (educationName) {
            "มัธยมศึกษา" -> 1
            "ปริญญาตรี" -> 2
            "ปริญญาโท" -> 3
            "ปริญญาเอก" -> 4
            else -> 0
        }
    }
}
