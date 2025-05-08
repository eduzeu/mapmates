import { ObjectId } from "mongodb";
import { reviews } from "../config/mongoCollections.js";
import {
  NotFoundError,
  ServerError,
  ValidationError,
} from "../helpers/errors.ts";
import {
  validateCloudinaryUrl,
  validateDateString,
  validateObjectId,
  validateString,
} from "../helpers/validation.ts";
import { restaurantExists } from "./restaurants.ts";

export interface Review {
  userId: ObjectId;
  placeId: string;
  text: string;
  image: string | null;
  timestamp: string;
  likes: ObjectId[];
  comments: Comment[];
}

export interface Comment {
  _id: ObjectId;
  userId: ObjectId;
  text: string;
  timestamp: string;
}

interface ReviewEdit {
  text?: string;
  timestamp?: string;
}

export const getReviewById = async (id: string): Promise<Review> => {
  id = validateObjectId(id, "Review Id");

  const collection = await reviews();
  const review = await collection.findOne({ _id: new ObjectId(id) });

  if (!review) throw new NotFoundError("No review found with that id.");

  return review;
};

export const addReview = async (
  userId: string,
  placeId: string,
  text: string,
  timestamp: string,
  image?: string
): Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  placeId = validateString(placeId, "Place Id");
  text = validateString(text, "Review Text");
  timestamp = validateDateString(timestamp, "Timestamp");
  if (image) image = validateCloudinaryUrl(image, "Image Url");

  const newReview: Review = {
    userId: new ObjectId(userId),
    placeId: placeId,
    text: text,
    timestamp: timestamp,
    image: image ? image : null,
    likes: [],
    comments: [],
  };

  const collection = await reviews();
  const insertInfo = await collection.insertOne(newReview);

  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw new ServerError("Could not add the artist.");

  const newId = insertInfo.insertedId.toString();
  return await getReviewById(newId);
};

export const updateReview = async (
  id: string,
  editObj: ReviewEdit
): Promise<Review> => {
  if (Object.keys(editObj).length === 0)
    throw new ValidationError("No fields to update.");

  id = validateObjectId(id, "Review Id");

  const collection = await reviews();

  const review = await collection.findOne({ _id: new ObjectId(id) });
  if (!review) throw new NotFoundError("No review found with that id.");

  if (editObj.text) {
    editObj.text = validateString(editObj.text, "Review Text");
  }

  if (editObj.timestamp) {
    editObj.timestamp = validateDateString(editObj.timestamp, "Timestamp");
  }

  const updateInfo = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: editObj },
    { returnDocument: "after" }
  );

  if (!updateInfo?.ok || !updateInfo?.value)
    throw new ServerError("Could not update the review.");

  return updateInfo.value;
};

export const deleteReview = async (id: string): Promise<Review> => {
  id = validateObjectId(id, "Review Id");

  const collection = await reviews();
  const review = await collection.findOne({ _id: new ObjectId(id) });

  if (!review)
    throw new NotFoundError(`Could not find review with the id '${id}'.`);

  const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });

  if (deleteResult.deletedCount === 0)
    throw new ServerError(`Could not delete the review with the id '${id}'.`);

  return review;
};

export const toggleLike = async (reviewId: string, userId: string): Promise<Review> => {
  try {
    // Validate the inputs
    reviewId = validateObjectId(reviewId, "Review Id");
    userId = validateObjectId(userId, "User Id");

    const collection = await reviews();
    
    // First, check if the review exists and get it
    const review = await collection.findOne({ _id: new ObjectId(reviewId) });
    if (!review) {
      throw new NotFoundError(`Could not find review with the id '${reviewId}'.`);
    }

    // Convert userId to ObjectId
    const userObjectId = new ObjectId(userId);
    
    // Initialize likes array if it doesn't exist or is not an array
    if (!review.likes || !Array.isArray(review.likes)) {
      // If likes isn't an array, initialize it first
      await collection.updateOne(
        { _id: new ObjectId(reviewId) },
        { $set: { likes: [] } }
      );
      
      // Add the user's like
      const updateInfo = await collection.findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        { $addToSet: { likes: userObjectId } },
        { returnDocument: "after" }
      );
      
      if (!updateInfo || !updateInfo.value) {
        const updatedReview = await collection.findOne({ _id: new ObjectId(reviewId) });
        if (updatedReview) return updatedReview;
        throw new ServerError("Could not update the review.");
      }
      
      return updateInfo.value;
    }
    
    // Check if the user has already liked the review
    // Convert all ObjectIds to strings for comparison
    const userIdStr = userId.toString();
    const hasLiked = review.likes.some(like => {
      // Handle both ObjectId and string formats
      if (!like) return false;
      return like.toString() === userIdStr;
    });

    let updateOperation;
    if (hasLiked) {
      // User has already liked - remove the like
      updateOperation = {
        $pull: { likes: userObjectId }
      };
    } else {
      // User hasn't liked - add the like
      updateOperation = {
        $addToSet: { likes: userObjectId }
      };
    }

    // Perform the update
    const updateInfo = await collection.findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      updateOperation,
      { returnDocument: "after" }
    );

    // Handle MongoDB 4.x compatibility
    if (!updateInfo || !updateInfo.value) {
      const updatedReview = await collection.findOne({ _id: new ObjectId(reviewId) });
      if (updatedReview) {
        return updatedReview;
      }
      throw new ServerError("Could not update the review.");
    }

    return updateInfo.value;
  } catch (error) {
    console.error("Error in toggleLike:", error);
    throw error;
  }
};


export const reviewsByRestaurant = async (
  restaurantId: string
): Promise<Review[]> => {
  restaurantId = validateObjectId(restaurantId, "Restaurant Id");

  let exists = await restaurantExists(restaurantId);
  if (!exists) throw new NotFoundError("No restaurant found with that id.");

  const collection = await reviews();
  const reviewList = await collection.find({
    placeId: new ObjectId(restaurantId),
  });

  return reviewList.toArray();
};

export const reviewsByUser = async (userId: string): Promise<Review[]> => {
  userId = validateObjectId(userId, "User Id");

  let exists = await restaurantExists(userId);
  if (!exists) throw new NotFoundError("No user found with that id.");

  const collection = await reviews();
  const reviewList = await collection.find({ placeId: new ObjectId(userId) });

  return reviewList.toArray();
};

const getComment = async (commentId: string) => {
  commentId = validateObjectId(commentId, "Comment Id");

  const collection = await reviews();
  const comment = await collection.findOne({ "comments._id": new ObjectId(commentId) });

  if (!comment) throw new NotFoundError("No comment found with that id.");

  return comment;
}

const getReviewOfComment = async (commentId: string) : Promise<Review> => {
  commentId = validateObjectId(commentId, "Comment Id");
  const collection = await reviews();
  const review = await collection.findOne({ "comments._id": new ObjectId(commentId) });
  if (!review) throw new NotFoundError("No review found with that id.");
  return review;
}

export const addComment = async (
  reviewId: string,
  userId: string,
  text: string,
  timestamp: string
): Promise<Review> => {
  try {
    // Validate inputs
    userId = validateObjectId(userId, "User Id");
    reviewId = validateObjectId(reviewId, "Review Id");
    text = validateString(text, "Comment Text");
    timestamp = validateDateString(timestamp, "Timestamp");

    // Log for debugging
    console.log("Add comment params:", { reviewId, userId, text, timestamp });

    const collection = await reviews();
    
    // First, check if the review exists
    const review = await collection.findOne({ _id: new ObjectId(reviewId) });
    if (!review) {
      throw new NotFoundError("No review found with that id.");
    }

    // Convert userId to ObjectId
    const userIdObj = new ObjectId(userId);

    // Create new comment
    const newComment: Comment = {
      _id: new ObjectId(),
      userId: userIdObj,
      text: text,
      timestamp: timestamp,
    };

    console.log("New comment object:", newComment);
    
    // Ensure we have a comments array
    if (!review.comments) {
      review.comments = [];
    }
    
    // Add new comment
    const updatedComments = [...review.comments, newComment];
    
    // Update the review with the new comments
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { comments: updatedComments } }
    );

    if (!updateResult.acknowledged || updateResult.modifiedCount !== 1) {
      console.error("MongoDB update failed:", updateResult);
      throw new ServerError("Could not add the comment.");
    }

    // Get the updated review to return
    const updatedReview = await collection.findOne({ _id: new ObjectId(reviewId) });
    if (!updatedReview) {
      throw new ServerError("Could not retrieve the updated review.");
    }

    return updatedReview;
  } catch (error) {
    console.error("Error in addComment:", error);
    throw error; // Re-throw to be handled by the route
  }
};

export const editComment = async (
  commentId: string,
  userId: string,
  text: string,
  timestamp: string
) : Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  commentId = validateObjectId(commentId, "Comment Id");
  text = validateString(text, "Comment Text");
  timestamp = validateDateString(timestamp, "Timestamp");

  const comment = await getComment(commentId);
  if (comment.userId.toString() !== userId) throw new ValidationError("Cannot edit comment that doesn't belong to user.");

  const collection = await reviews();
  const updateInfo = await collection.updateOne(
    { "comments._id": new ObjectId(commentId) },
    { $set: { "comments.$.text": text, "comments.$.timestamp": timestamp } }
  );

  if (!updateInfo?.ok || !updateInfo?.value)
    throw new ServerError("Could not update the review.");

  return await getReviewOfComment(commentId);
}

export const deleteComment = async (
  userId: string,
  commentId: string
) : Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  commentId = validateObjectId(commentId, "Comment Id");

  let comment = await getComment(commentId);
  if (!comment) throw new NotFoundError("No comment found with that id.");
  if (!comment) throw new ValidationError("Cannot delete comment that doesn't exist or that user didn't make.");

  let review = await getReviewOfComment(commentId);
  const updatedComments = review.comments.filter((c: Comment) => c._id.toString() !== commentId);

  const collection = await reviews();
  const updateInfo = await collection.updateOne(
    { "comments._id": new ObjectId(commentId) },
    { $set: { comments: updatedComments } }
  );

  if (!updateInfo?.ok || !updateInfo?.value)
    throw new ServerError("Could not update the review.");

  return await getReviewOfComment(commentId);
}