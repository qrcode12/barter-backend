import { eq, and, or, like, desc, isNull, asc } from 'drizzle-orm/expressions';
import { 
  users,
  items, 
  images, 
  conversations, 
  messages, 
  offers, 
  reviews, 
  notifications,
  favorites,
  pushSubscriptions,
  conversationParticipants as participants
} from '../shared/schema.js';
import * as schema from '../shared/schema.js';

// Define advertisements schema locally if it's not in the shared schema
const advertisements = {
  id: { name: 'id' },
  position: { name: 'position' },
  active: { name: 'active' },
  createdAt: { name: 'createdAt' }
};

// Initialize database connection
let db: any;

function getDb() {
  if (!db) {
    // Import dynamically to avoid circular dependencies
    try {
      // This is a placeholder - actual implementation would depend on your database setup
      db = {}; // Will be initialized properly when first used
    } catch (err) {
      console.error("Database initialization error:", err);
    }
  }
  return db;
}

export const storage = {
  getDb() {
    return db;
  },

  async getUser(userId: number): Promise<any> {
    return getDb().select().from(users).where(eq(users.id, userId)).then((rows: any[]) => rows[0]);
  },

  async getUserByUsername(username: string): Promise<any | null> {
    return getDb().select().from(users).where(eq(users.username, username)).then((rows: any[]) => rows[0]);
  },

  async getUserByEmail(email: string): Promise<any | null> {
    return getDb().select().from(users).where(eq(users.email, email)).then((rows: any[]) => rows[0]);
  },

  async createUser(userData: any): Promise<any> {
    return getDb().insert(users).values(userData).returning().then((rows: any[]) => rows[0]);
  },

  async updateUser(userId: number, userData: any): Promise<any> {
    return getDb().update(users).set(userData).where(eq(users.id, userId)).returning().then((rows: any[]) => rows[0]);
  },

  async getAllUsers(search?: string): Promise<any[]> {
    let query = getDb().select().from(users);

    if (search && search.trim() !== '') {
      query = query.where(
        or(
          like(users.username, `%${search}%`), 
          like(users.email, `%${search}%`),
          like(users.fullName, `%${search}%`)
        )
      );
    }

    return query.orderBy(desc(users.createdAt));
  },

  async getItem(id: number): Promise<any | null> {
    return getDb().select().from(items).where(eq(items.id, id)).then((rows: any[]) => rows[0]);
  },

  async getItems(options: any): Promise<any[]> {
    // Build the query based on options
    let query = getDb().select().from(items);

    if (options.userId) {
      query = query.where(eq(items.userId, options.userId));
    }

    if (options.status) {
      query = query.where(eq(items.status, options.status));
    }

    if (options.category) {
      query = query.where(eq(items.category, options.category));
    }

    if (options.city) {
      query = query.where(eq(items.city, options.city));
    }

    // Add more filters as needed

    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    return query.orderBy(desc(items.createdAt));
  },

  async getAdvertisement(id: number): Promise<any | null> {
    // Use raw SQL query for advertisements since schema doesn't match
    return getDb().query(
      `SELECT * FROM advertisements WHERE id = $1 LIMIT 1`,
      [id]
    ).then((result: any) => result.rows?.[0] || null);
  },

  async getAllAdvertisements(): Promise<any[]> {
    return getDb().query(
      `SELECT * FROM advertisements ORDER BY "createdAt" DESC`
    ).then((result: any) => result.rows || []);
  },

  async createAdvertisement(advertisementData: any): Promise<any> {
    const fields = Object.keys(advertisementData).join(', ');
    const placeholders = Object.keys(advertisementData).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(advertisementData);

    return getDb().query(
      `INSERT INTO advertisements (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    ).then((result: any) => result.rows?.[0] || null);
  },

  async updateAdvertisement(id: number, advertisementData: any): Promise<any> {
    const setClause = Object.keys(advertisementData)
      .map((field, i) => `${field} = $${i + 2}`)
      .join(', ');
    const values = [...Object.values(advertisementData), id];

    return getDb().query(
      `UPDATE advertisements SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(advertisementData)]
    ).then((result: any) => result.rows?.[0] || null);
  },

  async deleteAdvertisement(id: number): Promise<boolean> {
    return getDb().query(
      `DELETE FROM advertisements WHERE id = $1 RETURNING *`,
      [id]
    ).then((result: any) => result.rows.length > 0);
  },

  async getActiveAdvertisement(position: string): Promise<any | null> {
    return getDb().query(
      `SELECT * FROM advertisements WHERE position = $1 AND active = true ORDER BY "createdAt" DESC LIMIT 1`,
      [position]
    ).then((result: any) => result.rows?.[0] || null);
  },

  // Add all other methods needed by the application
  async createItem(itemData: any): Promise<any> {
    return getDb().insert(items).values(itemData).returning().then((rows: any[]) => rows[0]);
  },

  async updateItem(id: number, itemData: any): Promise<any> {
    return getDb().update(items).set(itemData).where(eq(items.id, id)).returning().then((rows: any[]) => rows[0]);
  },

  async deleteItem(id: number): Promise<boolean> {
    return getDb().delete(items).where(eq(items.id, id)).returning().then((rows: any[]) => rows.length > 0);
  },

  async getImagesByItem(itemId: number): Promise<any[]> {
    return getDb().select().from(images).where(eq(images.itemId, itemId)).orderBy(desc(images.isMain));
  },

  async createImage(imageData: any): Promise<any> {
    return getDb().insert(images).values(imageData).returning().then((rows: any[]) => rows[0]);
  },

  async setMainImage(imageId: number, itemId: number): Promise<boolean> {
    // First reset all images for this item
    await getDb().update(images).set({ isMain: false }).where(eq(images.itemId, itemId));
    // Then set the selected image as main
    return getDb().update(images).set({ isMain: true }).where(eq(images.id, imageId)).returning().then((rows: any[]) => rows.length > 0);
  },

  async deleteImage(imageId: number): Promise<boolean> {
    return getDb().delete(images).where(eq(images.id, imageId)).returning().then((rows: any[]) => rows.length > 0);
  },

  async getItemsByUser(userId: number): Promise<any[]> {
    return getDb().select().from(items).where(eq(items.userId, userId)).orderBy(desc(items.createdAt));
  },

  // Add methods for messages, conversations, etc.
  async getConversationsByUser(userId: number): Promise<any[]> {
    return getDb().select()
      .from(conversations)
      .innerJoin(participants, eq(conversations.id, participants.conversationId))
      .where(eq(participants.userId, userId))
      .orderBy(desc(conversations.lastMessageAt));
  },

  async getConversation(conversationId: number): Promise<any | null> {
    return getDb().select().from(conversations).where(eq(conversations.id, conversationId)).then((rows: any[]) => rows[0]);
  },

  async getConversationByParticipants(userId1: number, userId2: number, itemId?: number): Promise<any | null> {
    const query = getDb().select()
      .from(conversations)
      .innerJoin(participants, eq(conversations.id, participants.conversationId))
      .where(eq(participants.userId, userId1));

    if (itemId) {
      query.where(eq(conversations.itemId, itemId));
    }

    return query.then((rows: any[]) => rows[0]);
  },

  async createConversation(conversationData: any): Promise<any> {
    return getDb().insert(conversations).values(conversationData).returning().then((rows: any[]) => rows[0]);
  },

  async createConversationParticipant(participantData: any): Promise<any> {
    return getDb().insert(participants).values(participantData).returning().then((rows: any[]) => rows[0]);
  },

  async getMessagesByConversation(conversationId: number): Promise<any[]> {
    return getDb().select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt)
      .then((rows: any[]) => rows);
  },

  async getMessage(messageId: number): Promise<any | null> {
    return getDb().select().from(messages).where(eq(messages.id, messageId)).then((rows: any[]) => rows[0]);
  },

  async createMessage(messageData: any): Promise<any> {
    // Also update the last message time in the conversation
    await getDb().update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, messageData.conversationId));

    return getDb().insert(messages).values(messageData).returning().then((rows: any[]) => rows[0]);
  },

  async markMessagesAsRead(conversationId: number, userId: number): Promise<any[]> {
    return getDb().update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false)
        )
      )
      .returning();
  },

  // Add all remaining methods for offers, reviews, notifications, etc.
  async getOffersByUser(userId: number, status?: string): Promise<any[]> {
    let query = getDb().select()
      .from(offers)
      .where(
        or(
          eq(offers.fromUserId, userId),
          eq(offers.toUserId, userId)
        )
      );

    if (status) {
      query = query.where(eq(offers.status, status));
    }

    return query.orderBy(desc(offers.createdAt));
  },

  async getOffer(offerId: number): Promise<any | null> {
    return getDb().select().from(offers).where(eq(offers.id, offerId)).then((rows: any[]) => rows[0]);
  },

  async createOffer(offerData: any): Promise<any> {
    return getDb().insert(offers).values(offerData).returning().then((rows: any[]) => rows[0]);
  },

  async updateOfferStatus(offerId: number, status: string): Promise<any> {
    return getDb().update(offers).set({ status, updatedAt: new Date() }).where(eq(offers.id, offerId)).returning().then((rows: any[]) => rows[0]);
  },

  async getReviewsByUser(userId: number, asReviewer: boolean = false): Promise<any[]> {
    return getDb().select()
      .from(reviews)
      .where(asReviewer ? eq(reviews.fromUserId, userId) : eq(reviews.toUserId, userId))
      .orderBy(desc(reviews.createdAt));
  },

  async getReviewsByOffer(offerId: number): Promise<any[]> {
    return getDb().select().from(reviews).where(eq(reviews.offerId, offerId)).orderBy(desc(reviews.createdAt));
  },

  async canReviewOffer(offerId: number, userId: number): Promise<boolean> {
    // Check if user can review this offer
    const offer = await this.getOffer(offerId);
    if (!offer || offer.status !== 'completed') return false;

    // Check if the user is part of this offer
    if (offer.fromUserId !== userId && offer.toUserId !== userId) return false;

    // Check if user already left a review
    const existingReview = await getDb().select().from(reviews)
      .where(
        and(
          eq(reviews.offerId, offerId),
          eq(reviews.fromUserId, userId)
        )
      )
      .then((rows: any[]) => rows[0]);

    return !existingReview;
  },

  async createReview(reviewData: any): Promise<any> {
    return getDb().insert(reviews).values(reviewData).returning().then((rows: any[]) => rows[0]);
  },

  async getUserRating(userId: number): Promise<{user: any, rating: number, reviewCount: number} | null> {
    // First get the user
    const user = await this.getUser(userId);
    if (!user) return null;

    // Then get all reviews for this user
    const userReviews = await getDb().select().from(reviews).where(eq(reviews.toUserId, userId));

    // Calculate rating
    let totalRating = 0;
    let reviewCount = userReviews.length;

    if (reviewCount === 0) {
      return { user, rating: 0, reviewCount: 0 };
    }

    for (const review of userReviews) {
      totalRating += review.rating;
    }

    const averageRating = totalRating / reviewCount;

    return { user, rating: averageRating, reviewCount };
  },

  async getNotificationsByUser(userId: number, options: any = {}): Promise<any[]> {
    let query = getDb().select().from(notifications).where(eq(notifications.userId, userId));

    if (options.includeRead === false) {
      query = query.where(eq(notifications.isRead, false));
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    return query.orderBy(desc(notifications.createdAt));
  },

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return getDb().select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .then((rows: any[]) => rows.length);
  },

  async createNotification(notificationData: any): Promise<any> {
    return getDb().insert(notifications).values(notificationData).returning().then((rows: any[]) => rows[0]);
  },

  async markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
    return getDb().update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning()
      .then((rows: any[]) => rows.length > 0);
  },

  async markAllNotificationsAsRead(userId: number): Promise<any[]> {
    return getDb().update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
      .returning();
  },

  async getFavoritesByUser(userId: number): Promise<any[]> {
    return getDb().select()
      .from(favorites)
      .innerJoin(items, eq(favorites.itemId, items.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  },

  async isFavorite(userId: number, itemId: number): Promise<boolean> {
    return getDb().select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.itemId, itemId)
        )
      )
      .then((rows: any[]) => rows.length > 0);
  },

  async addFavorite(favoriteData: any): Promise<any> {
    return getDb().insert(favorites).values(favoriteData).returning().then((rows: any[]) => rows[0]);
  },

  async removeFavorite(userId: number, itemId: number): Promise<boolean> {
    return getDb().delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.itemId, itemId)
        )
      )
      .returning()
      .then((rows: any[]) => rows.length > 0);
  },

  async createOrUpdatePushSubscription(subscriptionData: any): Promise<any> {
    // Delete any existing subscription for this user
    await getDb().delete(pushSubscriptions).where(eq(pushSubscriptions.userId, subscriptionData.userId));

    // Insert new subscription
    return getDb().insert(pushSubscriptions).values(subscriptionData).returning().then((rows: any[]) => rows[0]);
  },

  async deletePushSubscription(userId: number): Promise<boolean> {
    return getDb().delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
      .returning()
      .then((rows: any[]) => rows.length > 0)
  }
};