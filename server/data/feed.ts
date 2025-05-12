import { ObjectId } from 'mongodb';
import { reviews, users } from '../config/mongoCollections.js';
import { NotFoundError, ServerError, ValidationError } from '../helpers/errors.ts';
import { validateObjectId, validatePageLimit, validatePageNumber } from '../helpers/validation.ts';
import { Review } from './review.ts';

interface User {
  _id: ObjectId;
  username?: string;
  friends?: Array<ObjectId>;
}

export interface ReviewWithUserInfo extends Review {
  username: string;
  restaurantName: string;
}

export interface FeedPagination {
  posts: ReviewWithUserInfo[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

export const getAllReviewsWithUserInfo = async (page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    page = validatePageNumber(page, "Page Number");
    limit = validatePageLimit(limit, "Page Limit");

    const reviewCollection = await reviews();
    const userCollection = await users();

    const totalPosts = await reviewCollection.countDocuments({});
    const totalPages = Math.ceil(totalPosts / limit);

    const reviewsList: Review[] = await reviewCollection
      .find({})
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const userIds = [...new Set(reviewsList.map(review => review.userId.toString()))];

    const userList = await userCollection
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .toArray() as User[];

    const userMap = new Map(userList.map(user => [user._id.toString(), user]));

    const enhancedReviews = reviewsList.map((review) => {
      const user = userMap.get(review.userId.toString()) as User | undefined;

      return {
        ...review,
        username: user?.username || 'Unknown User',
        restaurantName: review.restaurantName || 'Unknown Restaurant'
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
    if (e instanceof ValidationError) throw e;
    console.error('Error in getAllReviewsWithUserInfo:', e);
    throw new ServerError('Failed to get feed data');
  }
};

export const getReviewsByUserWithInfo = async (userId: string, page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    userId = validateObjectId(userId, 'User ID');
    page = validatePageNumber(page, "Page Number");
    limit = validatePageLimit(limit, "Page Limit");

    const reviewCollection = await reviews();
    const userCollection = await users();

    const user = await userCollection.findOne({ _id: new ObjectId(userId) }) as User | null;
    if (!user) throw new NotFoundError('User not found');

    const totalPosts = await reviewCollection.countDocuments({ userId: new ObjectId(userId) });
    const totalPages = Math.ceil(totalPosts / limit);

    const reviewsList = await reviewCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const enhancedReviews = reviewsList.map(review => ({
      ...review,
      username: user.username || 'Unknown User',
      restaurantName: review.restaurantName || 'Unknown Restaurant'
    }));

    return {
      posts: enhancedReviews,
      totalPosts,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages
    };
  } catch (e) {
    if (e instanceof ValidationError || e instanceof NotFoundError) throw e;
    console.error('Error in getReviewsByUserWithInfo:', e);
    throw new ServerError('Failed to get user feed data');
  }
};

export const getFriendsReviewsWithInfo = async (userId: string, page: number = 1, limit: number = 10): Promise<FeedPagination> => {
  try {
    userId = validateObjectId(userId, 'User ID');
    page = validatePageNumber(page, "Page Number");
    limit = validatePageLimit(limit, "Page Limit");

    const reviewCollection = await reviews();
    const userCollection = await users();

    const user = await userCollection.findOne({ _id: new ObjectId(userId) }) as User | null;
    if (!user) throw new NotFoundError('User not found');

    const friendIds = user.friends?.map(id => new ObjectId(id.toString())) || [];
    const userAndFriendIds = [new ObjectId(userId), ...friendIds];

    const totalPosts = await reviewCollection.countDocuments({ userId: { $in: userAndFriendIds } });
    const totalPages = Math.ceil(totalPosts / limit);

    const reviewsList: Review[] = await reviewCollection
      .find({ userId: { $in: userAndFriendIds } })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const reviewUserIds = [...new Set(reviewsList.map(review => review.userId.toString()))];

    const userList = await userCollection
      .find({ _id: { $in: reviewUserIds.map(id => new ObjectId(id)) } })
      .toArray() as User[];

    const userMap = new Map(userList.map(user => [user._id.toString(), user]));

    const enhancedReviews = reviewsList.map((review) => {
      const reviewUser = userMap.get(review.userId.toString()) as User | undefined;

      return {
        ...review,
        username: reviewUser?.username || 'Unknown User',
        restaurantName: review.restaurantName || 'Unknown Restaurant'
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
    if (e instanceof ValidationError || e instanceof NotFoundError) throw e;
    console.error('Error in getFriendsReviewsWithInfo:', e);
    throw new ServerError('Failed to get friends feed data');
  }
};
