package th.ac.rmutto.finlove

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.Button
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import java.io.File

class RegisterActivity8 : AppCompatActivity() {
    private var selectedImageUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register8)

        val imageView = findViewById<ImageView>(R.id.imageView)
        val buttonSelectImage = findViewById<Button>(R.id.buttonSelectImage)
        val buttonUploadImage = findViewById<Button>(R.id.buttonUploadImage)

        buttonSelectImage.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(intent, 100)
        }

        buttonUploadImage.setOnClickListener {
            if (selectedImageUri == null) {
                Toast.makeText(this@RegisterActivity8, "กรุณาเลือกภาพ", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val userID = intent.getIntExtra("userID", -1)
            if (userID == -1) {
                Toast.makeText(this@RegisterActivity8, "ไม่พบ userID", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val file = getFileFromUri(selectedImageUri!!)
            if (file != null) {
                val requestFile = RequestBody.create("image/jpeg".toMediaTypeOrNull(), file)
                val body = MultipartBody.Part.createFormData("imageFile", file.name, requestFile)
                val userIdPart = RequestBody.create(MultipartBody.FORM, userID.toString())

                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val client = OkHttpClient()
                        val rootUrl = getString(R.string.root_url) // ดึงค่า root_url จาก strings.xml
                        val url = "$rootUrl/api/register8" // ประกอบ URL กับ path ที่ต้องการ
                        val request = Request.Builder()
                            .url(url)
                            .post(MultipartBody.Builder()
                                .setType(MultipartBody.FORM)
                                .addPart(MultipartBody.Part.createFormData("userID", userID.toString()))
                                .addPart(body)
                                .build())
                            .build()

                        val response = client.newCall(request).execute()

                        withContext(Dispatchers.Main) {
                            if (response.isSuccessful) {
                                Toast.makeText(this@RegisterActivity8, "ชื่อไฟล์ถูกบันทึกแล้ว", Toast.LENGTH_LONG).show()
                                val intent = Intent(this@RegisterActivity8, LoginActivity::class.java)
                                startActivity(intent)
                            } else {
                                Toast.makeText(this@RegisterActivity8, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", Toast.LENGTH_LONG).show()
                            }
                        }
                    } catch (e: Exception) {
                        withContext(Dispatchers.Main) {
                            Toast.makeText(this@RegisterActivity8, "เกิดข้อผิดพลาด: ${e.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 100 && resultCode == RESULT_OK) {
            selectedImageUri = data?.data
            val imageView = findViewById<ImageView>(R.id.imageView)
            imageView.setImageURI(selectedImageUri)
        }
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
