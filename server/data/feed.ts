import { Collection, ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import { reviews } from '../config/mongoCollections.js';
import { NotFoundError, ServerError, ValidationError } from '../helpers/errors.ts';
import { validateObjectId, validateString } from '../helpers/validation.ts';

interface FeedPost {
  _id: ObjectId;
  type: string; // 'review' or 'visit'
  userId: ObjectId;
  username: string;
  userAvatar?: string;
  locationId: ObjectId;
  locationName: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  images?: string[];
  coordinates?: [number, number];
}

interface FeedPagination {
  posts: FeedPost[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

// Get a combined feed from both restaurant visits and reviews
export const getFeed = async (page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  // Validate pagination parameters
  if (page < 1) {
    throw new ValidationError('Page number must be at least 1');
  }
  
  if (limit < 1 || limit > 50) {
    throw new ValidationError('Limit must be between 1 and 50');
  }

  try {
    const userCollection = await users();
    const reviewCollection = await reviews();
    
    // Get all users to extract their visited places
    const usersList = await userCollection.find({}).toArray();
    
    // Extract all visits from users
    const visitPosts: FeedPost[] = [];
    
    usersList.forEach(user => {
      if (user.visitedPlaces && Array.isArray(user.visitedPlaces)) {
        user.visitedPlaces.forEach(place => {
          visitPosts.push({
            _id: new ObjectId(),
            type: 'visit',
            userId: user._id,
            username: user.username,
            userAvatar: user.avatar || 'https://i.pravatar.cc/150?u=' + user._id.toString(),
            locationId: new ObjectId(), // This would be the actual location ID in a real implementation
            locationName: place.place,
            content: `Checked in at ${place.place}!`,
            timestamp: place.visitedAt || new Date(),
            likes: 0,
            comments: 0,
            coordinates: place.coordinates ? [place.coordinates.latitude, place.coordinates.longitude] : undefined
          });
        });
      }
    });
    
    // Get all reviews
    const reviewsList = await reviewCollection.find({}).toArray();
    
    // Convert reviews to feed posts
    const reviewPosts: FeedPost[] = await Promise.all(reviewsList.map(async (review) => {
      // Find the user who wrote the review
      const user = usersList.find(u => u._id.equals(review.userId));
      
      // This would need to be updated to get the actual restaurant name from your database
      let locationName = "Unknown Location";
      // In a real implementation, you would fetch the restaurant name using the placeId
      
      return {
        _id: review._id,
        type: 'review',
        userId: review.userId,
        username: user ? user.username : "Unknown User",
        userAvatar: user?.avatar || 'https://i.pravatar.cc/150?u=' + review.userId.toString(),
        locationId: review.placeId,
        locationName: locationName,
        content: review.text,
        timestamp: new Date(review.timestamp),
        likes: 0,
        comments: 0
      };
    }));
    
    // Combine and sort all posts by timestamp (newest first)
    const allPosts = [...visitPosts, ...reviewPosts].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    
    return {
      posts: paginatedPosts,
      totalPosts: allPosts.length,
      currentPage: page,
      totalPages: Math.ceil(allPosts.length / limit),
      hasNextPage: endIndex < allPosts.length
    };
    
  } catch (e) {
    console.error('Error in getFeed:', e);
    throw new ServerError('Failed to retrieve feed data');
  }
};

// Get feed for a specific user (e.g., for a user profile)
export const getUserFeed = async (userId: string, page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    userId = validateObjectId(userId, 'User ID');
    
    // Get the combined feed first
    const fullFeed = await getFeed(1, 1000); // Get a large number to filter from
    
    // Filter to only include posts from the requested user
    const userPosts = fullFeed.posts.filter(post => 
      post.userId.toString() === userId
    );
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = userPosts.slice(startIndex, endIndex);
    
    return {
      posts: paginatedPosts,
      totalPosts: userPosts.length,
      currentPage: page,
      totalPages: Math.ceil(userPosts.length / limit),
      hasNextPage: endIndex < userPosts.length
    };
    
  } catch (e) {
    console.error('Error in getUserFeed:', e);
    if (e instanceof ValidationError) {
      throw e;
    }
    throw new ServerError('Failed to retrieve user feed data');
  }
};

// Get feed for a friend network (user and their friends)
export const getFriendsFeed = async (userId: string, page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    userId = validateObjectId(userId, 'User ID');
    
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Get the combined feed first
    const fullFeed = await getFeed(1, 1000); // Get a large number to filter from
    
    // Get the user's friend IDs
    const friendIds = user.friends ? user.friends.map(friend => friend.toString()) : [];
    
    // Filter to only include posts from the user and their friends
    const friendsPosts = fullFeed.posts.filter(post => 
      post.userId.toString() === userId || friendIds.includes(post.userId.toString())
    );
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = friendsPosts.slice(startIndex, endIndex);
    
    return {
      posts: paginatedPosts,
      totalPosts: friendsPosts.length,
      currentPage: page,
      totalPages: Math.ceil(friendsPosts.length / limit),
      hasNextPage: endIndex < friendsPosts.length
    };
    
  } catch (e) {
    console.error('Error in getFriendsFeed:', e);
    if (e instanceof ValidationError || e instanceof NotFoundError) {
      throw e;
    }
    throw new ServerError('Failed to retrieve friends feed data');
  }
};