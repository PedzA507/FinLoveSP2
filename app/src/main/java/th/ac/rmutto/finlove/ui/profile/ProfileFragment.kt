package th.ac.rmutto.finlove.ui.profile
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import th.ac.rmutto.finlove.ProfileActivity
import th.ac.rmutto.finlove.databinding.FragmentProfileBinding
class ProfileFragment : Fragment() {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        val root: View = binding.root
        // ดึง userID จาก Intent หรือ SharedPreferences
        val userID = requireActivity().intent.getIntExtra("userID", -1)
        if (userID != -1) {
            // ส่ง userID ไปที่ ProfileActivity
            val intent = Intent(requireContext(), ProfileActivity::class.java)
            intent.putExtra("userID", userID)
            startActivity(intent)
        } else {
            // แสดงข้อความแจ้งเตือนหากไม่พบ userID
            Toast.makeText(requireContext(), "ไม่พบ userID", Toast.LENGTH_SHORT).show()
        }
        return root
    }
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}