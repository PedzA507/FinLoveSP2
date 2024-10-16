package th.ac.rmutto.finlove

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide

class ChatAdapter(private val currentUserID: Int) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private var messages: List<ChatMessage> = listOf()

    companion object {
        private const val VIEW_TYPE_LEFT = 1
        private const val VIEW_TYPE_RIGHT = 2
    }

    // ฟังก์ชันสำหรับตั้งค่ารายการข้อความใหม่
    fun setMessages(newMessages: List<ChatMessage>) {
        messages = newMessages
        notifyDataSetChanged() // แจ้งเตือนให้ RecyclerView รีเฟรชข้อมูล
    }

    // ใช้ ViewType เพื่อตรวจสอบว่าข้อความนี้ส่งโดยผู้ใช้ปัจจุบันหรือผู้ใช้อื่น
    override fun getItemViewType(position: Int): Int {
        val message = messages[position]
        return if (message.senderID == currentUserID) {
            VIEW_TYPE_RIGHT // ถ้าผู้ส่งคือผู้ใช้ปัจจุบัน ให้แสดงทางขวา
        } else {
            VIEW_TYPE_LEFT // ถ้าผู้ส่งไม่ใช่ผู้ใช้ปัจจุบัน ให้แสดงทางซ้าย
        }
    }

    // สร้าง ViewHolder สำหรับแต่ละรายการของข้อความ
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == VIEW_TYPE_RIGHT) {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_chat_message_right, parent, false)
            RightChatViewHolder(view)
        } else {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_chat_message_left, parent, false)
            LeftChatViewHolder(view)
        }
    }

    // ผูกข้อมูลกับ ViewHolder
    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val message = messages[position]
        if (holder is RightChatViewHolder) {
            holder.bind(message)
        } else if (holder is LeftChatViewHolder) {
            holder.bind(message)
        }
    }

    // จำนวนรายการข้อความใน Adapter
    override fun getItemCount(): Int = messages.size

    // ViewHolder สำหรับข้อความที่อยู่ด้านซ้าย
    class LeftChatViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val profileImage: ImageView = itemView.findViewById(R.id.profile_image)
        private val messageText: TextView = itemView.findViewById(R.id.message_text)

        // ฟังก์ชันสำหรับผูกข้อมูลของแต่ละข้อความกับ UI
        fun bind(chatMessage: ChatMessage) {
            messageText.text = chatMessage.message
            Glide.with(itemView.context)
                .load(chatMessage.profilePicture)
                .into(profileImage)
        }
    }

    // ViewHolder สำหรับข้อความที่อยู่ด้านขวา
    class RightChatViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val profileImage: ImageView = itemView.findViewById(R.id.profile_image)
        private val messageText: TextView = itemView.findViewById(R.id.message_text)

        // ฟังก์ชันสำหรับผูกข้อมูลของแต่ละข้อความกับ UI
        fun bind(chatMessage: ChatMessage) {
            messageText.text = chatMessage.message
            Glide.with(itemView.context)
                .load(chatMessage.profilePicture)
                .into(profileImage)
        }
    }
}
