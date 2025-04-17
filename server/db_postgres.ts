import { drizzle } from 'drizzle-orm/postgres-js';
import { storage } from './storage.js';
import dotenv from 'dotenv';

dotenv.config();

// Helper function to get database connection
const getDb = (): any => {
  try {
    return storage.getDb();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const formatError = (error: any) => {
  return {
    message: error.message || 'Database error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    details: error.details || null
  };
};

// Define TypeScript interfaces for common data types
interface User {
  id: number;
  username: string;
  email: string;
  [key: string]: any;
}

interface Item {
  id: number;
  title: string;
  [key: string]: any;
}

interface Conversation {
  id: number;
  [key: string]: any;
}

// Export database methods with proper TypeScript types
export const dbStorage = {
  // Expose the DB connection to storage.ts
  get db(): any {
    return getDb();
  },

  getDb(): any {
    return getDb();
  },

  async getUser(userId: number): Promise<any> {
    try {
      return await storage.getUser(userId);
    } catch (error) {
      console.error('getUser error:', error);
      throw formatError(error);
    }
  },

  async getUserByUsername(username: string) {
    try {
      return await storage.getUserByUsername(username);
    } catch (error) {
      console.error('getUserByUsername error:', error);
      throw formatError(error);
    }
  },

  async getUserByEmail(email: string) {
    try {
      return await storage.getUserByEmail(email);
    } catch (error) {
      console.error('getUserByEmail error:', error);
      throw formatError(error);
    }
  },

  async createUser(userData: any) {
    try {
      return await storage.createUser(userData);
    } catch (error) {
      console.error('createUser error:', error);
      throw formatError(error);
    }
  },

  async updateUser(userId: number, userData: any) {
    try {
      return await storage.updateUser(userId, userData);
    } catch (error) {
      console.error('updateUser error:', error);
      throw formatError(error);
    }
  },

  async getAllUsers(search?: string) {
    try {
      return await storage.getAllUsers(search || '');
    } catch (error) {
      console.error('getAllUsers error:', error);
      throw formatError(error);
    }
  },

  async getItem(id: number) {
    try {
      return await storage.getItem(id);
    } catch (error) {
      console.error('getItem error:', error);
      throw formatError(error);
    }
  },

  async getItems(options: any) {
    try {
      return await storage.getItems(options);
    } catch (error) {
      console.error('getItems error:', error);
      throw formatError(error);
    }
  },

  async createItem(itemData: any) {
    try {
      return await storage.createItem(itemData);
    } catch (error) {
      console.error('createItem error:', error);
      throw formatError(error);
    }
  },

  async updateItem(id: number, itemData: any) {
    try {
      return await storage.updateItem(id, itemData);
    } catch (error) {
      console.error('updateItem error:', error);
      throw formatError(error);
    }
  },

  async deleteItem(id: number) {
    try {
      return await storage.deleteItem(id);
    } catch (error) {
      console.error('deleteItem error:', error);
      throw formatError(error);
    }
  },

  async getImagesByItem(itemId: number) {
    try {
      return await storage.getImagesByItem(itemId);
    } catch (error) {
      console.error('getImagesByItem error:', error);
      throw formatError(error);
    }
  },

  async createImage(imageData: any) {
    try {
      return await storage.createImage(imageData);
    } catch (error) {
      console.error('createImage error:', error);
      throw formatError(error);
    }
  },

  async setMainImage(imageId: number, itemId: number) {
    try {
      return await storage.setMainImage(imageId, itemId);
    } catch (error) {
      console.error('setMainImage error:', error);
      throw formatError(error);
    }
  },

  async deleteImage(imageId: number) {
    try {
      return await storage.deleteImage(imageId);
    } catch (error) {
      console.error('deleteImage error:', error);
      throw formatError(error);
    }
  },

  async getItemsByUser(userId: number) {
    try {
      return await storage.getItemsByUser(userId);
    } catch (error) {
      console.error('getItemsByUser error:', error);
      throw formatError(error);
    }
  },

  async getConversation(conversationId: number) {
    try {
      return await storage.getConversation(conversationId);
    } catch (error) {
      console.error('getConversation error:', error);
      throw formatError(error);
    }
  },

  async getConversationsByUser(userId: number) {
    try {
      return await storage.getConversationsByUser(userId);
    } catch (error) {
      console.error('getConversationsByUser error:', error);
      throw formatError(error);
    }
  },

  async getConversationByParticipants(userId1: number, userId2: number, itemId?: number) {
    try {
      return await storage.getConversationByParticipants(userId1, userId2, itemId);
    } catch (error) {
      console.error('getConversationByParticipants error:', error);
      throw formatError(error);
    }
  },

  async createConversation(conversationData: any) {
    try {
      return await storage.createConversation(conversationData);
    } catch (error) {
      console.error('createConversation error:', error);
      throw formatError(error);
    }
  },

  async getMessagesByConversation(conversationId: number) {
    try {
      return await storage.getMessagesByConversation(conversationId);
    } catch (error) {
      console.error('getMessagesByConversation error:', error);
      throw formatError(error);
    }
  },

  async getMessage(messageId: number) {
    try {
      return await storage.getMessage(messageId);
    } catch (error) {
      console.error('getMessage error:', error);
      throw formatError(error);
    }
  },

  async createMessage(messageData: any) {
    try {
      return await storage.createMessage(messageData);
    } catch (error) {
      console.error('createMessage error:', error);
      throw formatError(error);
    }
  },

  async markMessagesAsRead(conversationId: number, userId: number) {
    try {
      return await storage.markMessagesAsRead(conversationId, userId);
    } catch (error) {
      console.error('markMessagesAsRead error:', error);
      throw formatError(error);
    }
  },

  async getOffersByUser(userId: number, status?: string) {
    try {
      return await storage.getOffersByUser(userId, status);
    } catch (error) {
      console.error('getOffersByUser error:', error);
      throw formatError(error);
    }
  },

  async getOffer(offerId: number) {
    try {
      return await storage.getOffer(offerId);
    } catch (error) {
      console.error('getOffer error:', error);
      throw formatError(error);
    }
  },

  async createOffer(offerData: any) {
    try {
      return await storage.createOffer(offerData);
    } catch (error) {
      console.error('createOffer error:', error);
      throw formatError(error);
    }
  },

  async updateOfferStatus(offerId: number, status: string) {
    try {
      return await storage.updateOfferStatus(offerId, status);
    } catch (error) {
      console.error('updateOfferStatus error:', error);
      throw formatError(error);
    }
  },

  async getReviewsByUser(userId: number, asReviewer: boolean = false) {
    try {
      return await storage.getReviewsByUser(userId, asReviewer);
    } catch (error) {
      console.error('getReviewsByUser error:', error);
      throw formatError(error);
    }
  },

  async getReviewsByOffer(offerId: number) {
    try {
      return await storage.getReviewsByOffer(offerId);
    } catch (error) {
      console.error('getReviewsByOffer error:', error);
      throw formatError(error);
    }
  },

  async canReviewOffer(offerId: number, userId: number) {
    try {
      return await storage.canReviewOffer(offerId, userId);
    } catch (error) {
      console.error('canReviewOffer error:', error);
      throw formatError(error);
    }
  },

  async createReview(reviewData: any) {
    try {
      return await storage.createReview(reviewData);
    } catch (error) {
      console.error('createReview error:', error);
      throw formatError(error);
    }
  },

  async getUserRating(userId: number) {
    try {
      return await storage.getUserRating(userId);
    } catch (error) {
      console.error('getUserRating error:', error);
      throw formatError(error);
    }
  },

  async getNotificationsByUser(userId: number, options: any = {}) {
    try {
      return await storage.getNotificationsByUser(userId, options);
    } catch (error) {
      console.error('getNotificationsByUser error:', error);
      throw formatError(error);
    }
  },

  async getUnreadNotificationsCount(userId: number) {
    try {
      return await storage.getUnreadNotificationsCount(userId);
    } catch (error) {
      console.error('getUnreadNotificationsCount error:', error);
      throw formatError(error);
    }
  },

  async createNotification(notificationData: any) {
    try {
      return await storage.createNotification(notificationData);
    } catch (error) {
      console.error('createNotification error:', error);
      throw formatError(error);
    }
  },

  async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      return await storage.markNotificationAsRead(notificationId, userId);
    } catch (error) {
      console.error('markNotificationAsRead error:', error);
      throw formatError(error);
    }
  },

  async markAllNotificationsAsRead(userId: number) {
    try {
      return await storage.markAllNotificationsAsRead(userId);
    } catch (error) {
      console.error('markAllNotificationsAsRead error:', error);
      throw formatError(error);
    }
  },

  async getFavoritesByUser(userId: number) {
    try {
      return await storage.getFavoritesByUser(userId);
    } catch (error) {
      console.error('getFavoritesByUser error:', error);
      throw formatError(error);
    }
  },

  async isFavorite(userId: number, itemId: number) {
    try {
      return await storage.isFavorite(userId, itemId);
    } catch (error) {
      console.error('isFavorite error:', error);
      throw formatError(error);
    }
  },

  async addFavorite(favoriteData: any) {
    try {
      return await storage.addFavorite(favoriteData);
    } catch (error) {
      console.error('addFavorite error:', error);
      throw formatError(error);
    }
  },

  async removeFavorite(userId: number, itemId: number) {
    try {
      return await storage.removeFavorite(userId, itemId);
    } catch (error) {
      console.error('removeFavorite error:', error);
      throw formatError(error);
    }
  },

  async incrementItemViewCount(itemId: number) {
    try {
      return await storage.getItem(itemId); // Placeholder until this function is implemented
    } catch (error) {
      console.error('incrementItemViewCount error:', error);
      throw formatError(error);
    }
  },

  async createOrUpdatePushSubscription(subscriptionData: any) {
    try {
      return await storage.createOrUpdatePushSubscription(subscriptionData);
    } catch (error) {
      console.error('createOrUpdatePushSubscription error:', error);
      throw formatError(error);
    }
  },

  async deletePushSubscription(userId: number) {
    try {
      return await storage.deletePushSubscription(userId);
    } catch (error) {
      console.error('deletePushSubscription error:', error);
      throw formatError(error);
    }
  },

  async getAdvertisement(id: number) {
    try {
      return await storage.getAdvertisement(id);
    } catch (error) {
      console.error('getAdvertisement error:', error);
      throw formatError(error);
    }
  },

  async getAllAdvertisements() {
    try {
      return await storage.getAllAdvertisements();
    } catch (error) {
      console.error('getAllAdvertisements error:', error);
      throw formatError(error);
    }
  },

  async updateAdvertisement(id: number, data: any) {
    try {
      return await storage.updateAdvertisement(id, data);
    } catch (error) {
      console.error('updateAdvertisement error:', error);
      throw formatError(error);
    }
  },

  async deleteAdvertisement(id: number) {
    try {
      return await storage.deleteAdvertisement(id);
    } catch (error) {
      console.error('deleteAdvertisement error:', error);
      throw formatError(error);
    }
  },

  async getActiveAdvertisement(position: string) {
    try {
      return await storage.getActiveAdvertisement(position);
    } catch (error) {
      console.error('getActiveAdvertisement error:', error);
      throw formatError(error);
    }
  }
};