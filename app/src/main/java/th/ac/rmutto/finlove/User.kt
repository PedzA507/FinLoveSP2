package th.ac.rmutto.finlove

data class User(
    val id: Int, // เพิ่มฟิลด์ id
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val nickname: String,
    val gender: String,
    val interestGender: String,
    val height: Double,
    val home: String,
    val dateBirth: String,
    val education: String,
    val goal: String,
    val imageFile: String,
    val preferences: String?
)

