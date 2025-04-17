
// Common type definitions for the application

// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  avatar?: string;
  role: string;
  active: boolean;
  createdAt: Date;
  userRating?: number;
  reviewCount?: number;
}

// Conversation related types
export interface Conversation {
  id: number;
  itemId?: number | null;
  lastMessageAt: Date;
  participants: ConversationParticipant[];
}

export interface ConversationParticipant {
  id: number;
  username?: string;
  fullName?: string;
  avatar?: string;
}

// Message related types
export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  status: string;
  createdAt: Date;
  sender?: User;
}

// Item related types
export interface Item {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  condition: string;
  city?: string;
  status: string;
  viewCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Image related types
export interface Image {
  id: number;
  itemId: number;
  filePath: string;
  isMain: boolean;
}

// Offer related types
export interface Offer {
  id: number;
  fromUserId: number;
  toUserId: number;
  fromItemId: number;
  toItemId: number;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Review related types
export interface Review {
  id: number;
  offerId: number;
  fromUserId: number;
  toUserId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Notification related types
export interface Notification {
  id: number;
  userId: number;
  type: string;
  referenceId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

// Favorite related types
export interface Favorite {
  id: number;
  userId: number;
  itemId: number;
  createdAt: Date;
}

// Push subscription related types
export interface PushSubscription {
  id: number;
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date;
}

// Advertisement related types
export interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  active: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

// Search and filter options
export interface ItemOptions {
  category?: string;
  search?: string;
  status?: string;
  city?: string;
  condition?: string;
  userId?: number;
  sort?: 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'views_desc';
  limit?: number;
  offset?: number;
}

// Notification options
export interface NotificationOptions {
  includeRead?: boolean;
  limit?: number;
  offset?: number;
}
