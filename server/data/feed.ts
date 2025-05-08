import { Collection, ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import { reviews } from '../config/mongoCollections.js';
import { NotFoundError, ServerError, ValidationError } from '../helpers/errors.ts';
import { validateObjectId, validateString } from '../helpers/validation.ts';
import { Review } from './review.ts';

// Define user type with the properties we need
interface User {
  _id: ObjectId;
  username?: string;
  avatar?: string;
  visitedPlaces?: Array<{
    place?: string;
    placeId?: ObjectId;
    coordinates?: {
      latitude?: number;
      longitude?: number;
      lat?: number;
      long?: number;
    };
  }>;
  friends?: Array<ObjectId>;
}

// Enhanced review with user information for feed display
export interface ReviewWithUserInfo extends Review {
  username: string;
  userAvatar?: string;
  locationName: string;
  images?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface FeedPagination {
  posts: ReviewWithUserInfo[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Get all reviews with user information for the feed
 */
export const getAllReviewsWithUserInfo = async (page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    if (page < 1) {
      throw new ValidationError('Page number must be at least 1');
    }
    
    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }
    
    const reviewCollection = await reviews();
    const userCollection = await users();
    
    // Get total count for pagination
    const totalPosts = await reviewCollection.countDocuments({});
    const totalPages = Math.ceil(totalPosts / limit);
    
    // Get reviews with pagination
    const reviewsList = await reviewCollection
      .find({})
      .sort({ timestamp: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    // Gather all user IDs from reviews
    const userIds = [...new Set(reviewsList.map(review => review.userId.toString()))];
    
    // Get all users in one query
    const userList = await userCollection
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .toArray() as User[];
    
    // Create a map for quick user lookup
    const userMap = new Map(userList.map(user => [user._id.toString(), user]));
    
    // Enhanced reviews with user and location info
    const enhancedReviews = await Promise.all(reviewsList.map(async (review) => {
      const user = userMap.get(review.userId.toString()) as User | undefined;
      
      // Try to find location information from the user's visited places
      let locationName = "Unknown Location";
      let coordinates = undefined;
      let images = undefined;
      
      if (user && user.visitedPlaces && Array.isArray(user.visitedPlaces)) {
        // Try to find the location in the user's visited places
        const visitedPlace = user.visitedPlaces.find(place => 
          place.placeId && place.placeId.toString() === review.placeId.toString()
        );
        
        if (visitedPlace && visitedPlace.place) {
          locationName = visitedPlace.place;
          
          // Extract coordinates if available
          if (visitedPlace.coordinates) {
            coordinates = {
              latitude: visitedPlace.coordinates.latitude || visitedPlace.coordinates.lat || 0,
              longitude: visitedPlace.coordinates.longitude || visitedPlace.coordinates.long || 0
            };
          }
          
          // Generate placeholder image
          images = [`https://placehold.co/600x400?text=Review+of+${encodeURIComponent(locationName)}`];
        }
      }
      
      return {
        ...review,
        username: user && user.username ? user.username : "Unknown User",
        userAvatar: user && user.avatar ? user.avatar : `https://i.pravatar.cc/150?u=${review.userId.toString()}`,
        locationName,
        images,
        coordinates
      };
    }));
    
    return {
      posts: enhancedReviews,
      totalPosts,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages
    };
  } catch (e) {
    if (e instanceof ValidationError) {
      throw e;
    }
    console.error('Error in getAllReviewsWithUserInfo:', e);
    throw new ServerError('Failed to get feed data');
  }
};

/**
 * Get reviews by a specific user with enhanced information
 */
export const getReviewsByUserWithInfo = async (userId: string, page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    userId = validateObjectId(userId, 'User ID');
    
    if (page < 1) {
      throw new ValidationError('Page number must be at least 1');
    }
    
    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }
    
    const reviewCollection = await reviews();
    const userCollection = await users();
    
    // Get the user
    const user = await userCollection.findOne({ _id: new ObjectId(userId) }) as User | null;
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Get total count for pagination
    const totalPosts = await reviewCollection.countDocuments({ userId: new ObjectId(userId) });
    const totalPages = Math.ceil(totalPosts / limit);
    
    // Get reviews with pagination
    const reviewsList = await reviewCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    // Enhanced reviews with location info
    const enhancedReviews = reviewsList.map(review => {
      // Try to find location information from the user's visited places
      let locationName = "Unknown Location";
      let coordinates = undefined;
      let images = undefined;
      
      if (user.visitedPlaces && Array.isArray(user.visitedPlaces)) {
        // Try to find the location in the user's visited places
        const visitedPlace = user.visitedPlaces.find(place => 
          place.placeId && place.placeId.toString() === review.placeId.toString()
        );
        
        if (visitedPlace && visitedPlace.place) {
          locationName = visitedPlace.place;
          
          // Extract coordinates if available
          if (visitedPlace.coordinates) {
            coordinates = {
              latitude: visitedPlace.coordinates.latitude || visitedPlace.coordinates.lat || 0,
              longitude: visitedPlace.coordinates.longitude || visitedPlace.coordinates.long || 0
            };
          }
          
          // Generate placeholder image
          images = [`https://placehold.co/600x400?text=Review+of+${encodeURIComponent(locationName)}`];
        }
      }
      
      return {
        ...review,
        username: user.username || "Unknown User",
        userAvatar: user.avatar || `https://i.pravatar.cc/150?u=${userId}`,
        locationName,
        images,
        coordinates
      };
    });
    
    return {
      posts: enhancedReviews,
      totalPosts,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages
    };
  } catch (e) {
    if (e instanceof ValidationError || e instanceof NotFoundError) {
      throw e;
    }
    console.error('Error in getReviewsByUserWithInfo:', e);
    throw new ServerError('Failed to get user feed data');
  }
};

/**
 * Get reviews by a user and their friends
 */
export const getFriendsReviewsWithInfo = async (userId: string, page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    userId = validateObjectId(userId, 'User ID');
    
    if (page < 1) {
      throw new ValidationError('Page number must be at least 1');
    }
    
    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }
    
    const reviewCollection = await reviews();
    const userCollection = await users();
    
    // Get user
    const user = await userCollection.findOne({ _id: new ObjectId(userId) }) as User | null;
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Get friend IDs
    const friendIds = user.friends && Array.isArray(user.friends)
      ? user.friends.map(friend => new ObjectId(friend.toString())) 
      : [];
    
    // Add user's own ID to the list to include their reviews
    const userAndFriendIds = [new ObjectId(userId), ...friendIds];
    
    // Get total count for pagination
    const totalPosts = await reviewCollection.countDocuments({ 
      userId: { $in: userAndFriendIds }
    });
    const totalPages = Math.ceil(totalPosts / limit);
    
    // Get reviews with pagination
    const reviewsList = await reviewCollection
      .find({ userId: { $in: userAndFriendIds } })
      .sort({ timestamp: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    // Gather all user IDs from reviews
    const reviewUserIds = [...new Set(reviewsList.map(review => review.userId.toString()))];
    
    // Get all users in one query
    const userList = await userCollection
      .find({ _id: { $in: reviewUserIds.map(id => new ObjectId(id)) } })
      .toArray() as User[];
    
    // Create a map for quick user lookup
    const userMap = new Map(userList.map(user => [user._id.toString(), user]));
    
    // Enhanced reviews with user and location info
    const enhancedReviews = await Promise.all(reviewsList.map(async (review) => {
      const reviewUser = userMap.get(review.userId.toString()) as User | undefined;
      
      // Try to find location information from the user's visited places
      let locationName = "Unknown Location";
      let coordinates = undefined;
      let images = undefined;
      
      if (reviewUser && reviewUser.visitedPlaces && Array.isArray(reviewUser.visitedPlaces)) {
        // Try to find the location in the user's visited places
        const visitedPlace = reviewUser.visitedPlaces.find(place => 
          place.placeId && place.placeId.toString() === review.placeId.toString()
        );
        
        if (visitedPlace && visitedPlace.place) {
          locationName = visitedPlace.place;
          
          // Extract coordinates if available
          if (visitedPlace.coordinates) {
            coordinates = {
              latitude: visitedPlace.coordinates.latitude || visitedPlace.coordinates.lat || 0,
              longitude: visitedPlace.coordinates.longitude || visitedPlace.coordinates.long || 0
            };
          }
          
          // Generate placeholder image
          images = [`https://placehold.co/600x400?text=Review+of+${encodeURIComponent(locationName)}`];
        }
      }
      
      return {
        ...review,
        username: reviewUser && reviewUser.username ? reviewUser.username : "Unknown User",
        userAvatar: reviewUser && reviewUser.avatar ? reviewUser.avatar : `https://i.pravatar.cc/150?u=${review.userId.toString()}`,
        locationName,
        images,
        coordinates
      };
    }));
    
    return {
      posts: enhancedReviews,
      totalPosts,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages
    };
  } catch (e) {
    if (e instanceof ValidationError || e instanceof NotFoundError) {
      throw e;
    }
    console.error('Error in getFriendsReviewsWithInfo:', e);
    throw new ServerError('Failed to get friends feed data');
  }
};