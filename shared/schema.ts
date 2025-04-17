import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  bio: text("bio"),
  phone: text("phone"),
  city: text("city"),
  rating: integer("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  role: text("role").default("user").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  condition: text("condition").notNull(),
  city: text("city"),
  status: text("status").notNull().default("active"),
  price: integer("price"),
  currency: text("currency").default("AZN"),
  wantedExchange: text("wanted_exchange"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertItemSchema = createInsertSchema(items)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Item images table
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => items.id),
  filePath: text("file_path").notNull(),
  isMain: boolean("is_main").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertImageSchema = createInsertSchema(images)
  .omit({ id: true, createdAt: true });

// Conversations table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations)
  .omit({ id: true, lastMessageAt: true, createdAt: true });

// Conversation participants
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants)
  .omit({ id: true, createdAt: true });

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  status: text("status").notNull().default("sent"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, createdAt: true });

// Offers table
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  fromItemId: integer("from_item_id").notNull().references(() => items.id),
  toItemId: integer("to_item_id").notNull().references(() => items.id),
  status: text("status").notNull().default("pending"),
  message: text("message"), // Added message field
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offers)
  .extend({
    message: z.string().nullable().optional()
  })
  .omit({ id: true, createdAt: true, updatedAt: true });

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  referenceId: integer("reference_id"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications)
  .extend({
    isRead: z.boolean().default(false).optional()
  })
  .omit({ id: true, createdAt: true });

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites)
  .omit({ id: true, createdAt: true });

// Push subscriptions table
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  subscription: jsonb("subscription").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Reviews table (for reputation system)
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull().references(() => offers.id),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews)
  .omit({ id: true, createdAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Extended types for frontend use
export type ItemWithImages = Item & {
  images?: Array<Image>;
  mainImage?: string;
  owner?: User & {
    rating?: number;
    reviewCount?: number;
  };
};

export type ConversationWithParticipants = Conversation & {
  participants: User[];
  otherParticipant: User | null;
  lastMessage?: Message & { sender: User };
  unreadCount: number;
  item?: ItemWithImages;
  lastMessageAt?: Date;
  message?: string;
};

export type MessageWithSender = Message & {
  sender: User;
  isRead?: boolean;
};

export type UserWithRating = User & {
  averageRating?: number;
  reviewCount?: number;
};

export type ReviewWithDetails = Review & {
  fromUser: User;
  toUser: User;
  offer: Offer;
};

// Additional types for notifications and other features
export type NotificationWithDetails = Notification & {
  isRead: boolean;
  message?: string;
};

export type OfferWithDetails = Offer & {
  fromItemData?: ItemWithImages;
  toItemData?: ItemWithImages;
  fromUserData?: UserWithRating;
  toUserData?: UserWithRating;
  lastMessageAt?: Date;
  message?: string;
};