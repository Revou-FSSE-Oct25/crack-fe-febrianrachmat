import type { MessageModule } from "./types";

export const chat: MessageModule = {
  id: {
    // Chat list page
    "chat.loadConversationsError": "Gagal memuat percakapan.",
    "chat.signInToView": "Silakan masuk untuk melihat percakapan.",
    "chat.eyebrow": "Pesan",
    "chat.listDescription":
      "Buka percakapan dari halaman Konsultasi (tombol Buka chat). Di bawah ini daftar percakapan yang pernah dibuat untuk akun Anda.",
    "chat.consultationPageLink": "Halaman konsultasi",
    "chat.emptyTitle": "Belum ada percakapan",
    "chat.emptyHint":
      "Chat terbuka setelah konsultasi aktif dan pembayaran dikonfirmasi.",
    "chat.toConsultationPage": "Ke halaman konsultasi",
    "chat.findPhysio": "Cari fisioterapis",
    "chat.latest": "Terbaru:",

    // Chat conversation page
    "chat.loadMessagesError": "Gagal memuat pesan.",
    "chat.streamDisconnectedError":
      "Koneksi live chat terputus. Muat ulang halaman jika pesan tidak masuk.",
    "chat.sendMessageError": "Gagal mengirim pesan.",
    "chat.signInToOpen": "Masuk untuk membuka percakapan.",
    "chat.backToList": "Daftar chat",
    "chat.conversationEyebrow": "Percakapan",
    "chat.liveDisconnected": "Live terputus — muat ulang jika perlu",
    "chat.lockedPrefix": "Chat masih terkunci karena sesi belum aktif. Buka ",
    "chat.lockedLink": "halaman konsultasi",
    "chat.lockedSuffix":
      " untuk menyelesaikan pembayaran. Setelah admin mengonfirmasi, chat akan aktif.",
    "chat.loadingMessages": "Memuat pesan…",
    "chat.emptyMessages": "Belum ada pesan. Mulai percakapan di bawah.",
    "chat.inputLockedPlaceholder": "Chat terkunci — selesaikan pembayaran dulu",
    "chat.inputPlaceholder": "Tulis pesan…",
    "chat.send": "Kirim",
  },
  en: {
    // Chat list page
    "chat.loadConversationsError": "Failed to load conversations.",
    "chat.signInToView": "Please sign in to view conversations.",
    "chat.eyebrow": "Messages",
    "chat.listDescription":
      "Open a conversation from the Consultations page (Open chat button). Below is the list of conversations created for your account.",
    "chat.consultationPageLink": "Consultation page",
    "chat.emptyTitle": "No conversations yet",
    "chat.emptyHint":
      "Chat opens once a consultation is active and payment is confirmed.",
    "chat.toConsultationPage": "Go to consultation page",
    "chat.findPhysio": "Find a physiotherapist",
    "chat.latest": "Latest:",

    // Chat conversation page
    "chat.loadMessagesError": "Failed to load messages.",
    "chat.streamDisconnectedError":
      "Live chat connection lost. Reload the page if messages stop coming in.",
    "chat.sendMessageError": "Failed to send message.",
    "chat.signInToOpen": "Sign in to open the conversation.",
    "chat.backToList": "Chat list",
    "chat.conversationEyebrow": "Conversation",
    "chat.liveDisconnected": "Live disconnected — reload if needed",
    "chat.lockedPrefix":
      "Chat is still locked because the session is not active yet. Open ",
    "chat.lockedLink": "consultation page",
    "chat.lockedSuffix":
      " to complete the payment. Once an admin confirms, the chat will be active.",
    "chat.loadingMessages": "Loading messages…",
    "chat.emptyMessages": "No messages yet. Start the conversation below.",
    "chat.inputLockedPlaceholder": "Chat locked — complete payment first",
    "chat.inputPlaceholder": "Write a message…",
    "chat.send": "Send",
  },
};
