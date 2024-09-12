package th.ac.rmutto.finlove

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import android.app.AlertDialog
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import org.json.JSONObject
import java.io.File

class ProfileActivity : AppCompatActivity() {
    private lateinit var textViewUsername: EditText
    private lateinit var textViewNickname: EditText
    private lateinit var textViewEmail: EditText
    private lateinit var textViewFirstName: EditText
    private lateinit var textViewLastName: EditText
    private lateinit var textViewGender: EditText
    private lateinit var textViewHeight: EditText
    private lateinit var textViewHome: EditText
    private lateinit var textViewDateBirth: EditText
    private lateinit var textViewEducation: EditText
    private lateinit var textViewGoal: EditText
    private lateinit var imageViewProfile: ImageView
    private lateinit var buttonEditProfile: Button
    private lateinit var buttonSaveProfile: Button
    private lateinit var buttonChangeImage: Button
    private lateinit var buttonLogout: Button
    private lateinit var buttonDeleteAccount: Button
    private var selectedImageUri: Uri? = null
    private var isEditing = false
    private val PICK_IMAGE_REQUEST = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        // Initialize views
        textViewUsername = findViewById(R.id.textViewUsername)
        textViewNickname = findViewById(R.id.textViewNickname)
        textViewEmail = findViewById(R.id.textViewEmail)
        textViewFirstName = findViewById(R.id.textViewFirstName)
        textViewLastName = findViewById(R.id.textViewLastName)
        textViewGender = findViewById(R.id.textViewGender)
        textViewHeight = findViewById(R.id.textViewHeight)
        textViewHome = findViewById(R.id.textViewHome)
        textViewDateBirth = findViewById(R.id.textViewDateBirth)
        textViewEducation = findViewById(R.id.textViewEducation)
        textViewGoal = findViewById(R.id.textViewGoal)
        imageViewProfile = findViewById(R.id.imageViewProfile)
        buttonEditProfile = findViewById(R.id.buttonEditProfile)
        buttonSaveProfile = findViewById(R.id.buttonSaveProfile)
        buttonChangeImage = findViewById(R.id.buttonChangeImage)
        buttonLogout = findViewById(R.id.buttonLogout)
        buttonDeleteAccount = findViewById(R.id.buttonDeleteAccount)

        // Initially hide the Save button and additional fields
        buttonSaveProfile.visibility = Button.GONE
        setFieldsVisibility(false)

        // Get the userID from the intent
        val userID = intent.getIntExtra("userID", -1)
        if (userID != -1) {
            fetchUserInfo(userID)
        } else {
            Toast.makeText(this, "ไม่พบ userID", Toast.LENGTH_LONG).show()
        }

        buttonLogout.setOnClickListener {
            logoutUser(userID)
        }

        // ปุ่มลบบัญชี
        buttonDeleteAccount.setOnClickListener {
            showDeleteConfirmationDialog(userID)
        }

        buttonEditProfile.setOnClickListener {
            isEditing = !isEditing
            setEditingEnabled(isEditing)
            setFieldsVisibility(isEditing)
            buttonEditProfile.text = if (isEditing) "Cancel" else "Edit"
            buttonSaveProfile.visibility = if (isEditing) Button.VISIBLE else Button.GONE
            Toast.makeText(this, if (isEditing) "Editing enabled" else "Editing disabled", Toast.LENGTH_SHORT).show()
        }

        buttonSaveProfile.setOnClickListener {
            saveUserInfo(userID)
        }

        buttonChangeImage.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(intent, PICK_IMAGE_REQUEST)
        }
    }

    private fun logoutUser(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            if (userID != -1) {
                val url = "http://192.168.109.1:3000/api/logout/$userID"
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

    // ป๊อปอัปยืนยันการลบบัญชี
    private fun showDeleteConfirmationDialog(userID: Int) {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Confirm Delete")
        builder.setMessage("คุณแน่ใจหรือว่าต้องการลบบัญชีของคุณ? การลบนี้ไม่สามารถยกเลิกได้!")

        // ปุ่มยืนยัน
        builder.setPositiveButton("ยืนยัน") { dialog, which ->
            deleteAccount(userID)
        }

        // ปุ่มยกเลิก
        builder.setNegativeButton("ยกเลิก") { dialog, which ->
            dialog.dismiss()
        }

        val dialog = builder.create()
        dialog.show()
    }

    // ลบบัญชีผู้ใช้
    private fun deleteAccount(userID: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = "http://192.168.109.1:3000/api/user/$userID"
                val request = Request.Builder().url(url).delete().build()

                val response = OkHttpClient().newCall(request).execute()
                val responseBody = response.body?.string()
                val jsonObject = JSONObject(responseBody ?: "{}")
                val message = jsonObject.optString("message", "เกิดข้อผิดพลาดในการลบบัญชี")

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@ProfileActivity, "บัญชีถูกลบสำเร็จ", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@ProfileActivity, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
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
                val url = "http://192.168.109.1:3000/api/user/$userID"
                val request = Request.Builder().url(url).build()
                val response = OkHttpClient().newCall(request).execute()

                if (response.isSuccessful) {
                    val responseBody = response.body?.string()
                    val user = parseUserInfo(responseBody)

                    withContext(Dispatchers.Main) {
                        textViewUsername.setText(user.username)
                        textViewNickname.setText(user.nickname)
                        textViewEmail.setText(user.email)
                        textViewFirstName.setText(user.firstName)
                        textViewLastName.setText(user.lastName)
                        textViewGender.setText(user.gender)
                        textViewHeight.setText(user.height.toString())
                        textViewHome.setText(user.home)
                        textViewDateBirth.setText(user.dateBirth)
                        textViewEducation.setText(user.education)
                        textViewGoal.setText(user.goal)
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
                    .addFormDataPart("DateBirth", textViewDateBirth.text.toString())
                    .addFormDataPart("education", textViewEducation.text.toString())
                    .addFormDataPart("goal", textViewGoal.text.toString())

                selectedImageUri?.let {
                    val file = getFileFromUri(it)
                    if (file != null && file.exists()) {
                        val requestBody = RequestBody.create("image/jpeg".toMediaTypeOrNull(), file)
                        requestBuilder.addFormDataPart("imageFile", file.name, requestBody)
                    }
                }

                val requestBody = requestBuilder.build()
                val request = Request.Builder()
                    .url("http://192.168.109.1:3000/api/user/update/$userID")
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
                        updatedImageUrl?.let {
                            loadImage(it, imageViewProfile)
                        }
                        setEditingEnabled(false)
                        buttonEditProfile.text = "Edit"
                        buttonSaveProfile.visibility = Button.GONE
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
        textViewDateBirth.isEnabled = enabled
        textViewEducation.isEnabled = enabled
        textViewGoal.isEnabled = enabled
        buttonChangeImage.isEnabled = enabled
        buttonSaveProfile.isEnabled = enabled
    }

    private fun setFieldsVisibility(showAll: Boolean) {
        if (showAll) {
            // Show all fields
            textViewEmail.visibility = EditText.VISIBLE
            textViewHeight.visibility = EditText.VISIBLE
            textViewHome.visibility = EditText.VISIBLE
            textViewDateBirth.visibility = EditText.VISIBLE
            textViewEducation.visibility = EditText.VISIBLE
            textViewGoal.visibility = EditText.VISIBLE
        } else {
            // Hide additional fields, only show essential ones
            textViewEmail.visibility = EditText.GONE
            textViewHeight.visibility = EditText.GONE
            textViewHome.visibility = EditText.GONE
            textViewDateBirth.visibility = EditText.GONE
            textViewEducation.visibility = EditText.GONE
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
            goal = jsonObject.optString("goal", ""),
            imageFile = jsonObject.optString("imageFile", "")
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
}
