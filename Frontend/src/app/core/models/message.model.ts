export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  fileName?: string;
  fileUrl?: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

export interface Conversation {
  conversationId: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  upcomingAppointment?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType: 'text' | 'file';
}

export interface ConversationListResponse {
  success: boolean;
  data: Conversation[];
}

export interface MessageListResponse {
  success: boolean;
  data: Message[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}