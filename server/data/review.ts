import { ObjectId } from "mongodb";
import { reviews } from "../config/mongoCollections.js";
import {
  NotFoundError,
  ServerError,
  ValidationError,
} from "../helpers/errors.ts";
import { clearKey, reviewKey, setJson } from "../helpers/redis.ts";
import {
  validateDateString,
  validateObjectId,
  validateReviewImage,
  validateString
} from "../helpers/validation.ts";
import { addReviewToUser, restaurantExists } from "./restaurants.ts";

export interface Review {
  userId: ObjectId;
  restaurantName: string;
  text: string;
  image?: ReviewImage;
  timestamp: string;
  likes: ObjectId[];
  comments: Comment[];
}

export interface ReviewImage {
  url: string;
  altText: string;
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
  image?: ReviewImage;
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
  restaurantName: string,
  text: string,
  timestamp: string,
  image?: ReviewImage
): Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  restaurantName = validateString(restaurantName, "Restaurant Name");
  text = validateString(text, "Review Text");
  timestamp = validateDateString(timestamp, "Timestamp");
  if (image) image = validateReviewImage(image, "Review Image");

  const collection = await reviews();
  const existingReview = await collection.findOne({
    userId: new ObjectId(userId),
    restaurantName,
  });

  if (existingReview)
    throw new ValidationError("User has already reviewed this place.");

  let newReview = {
    userId: new ObjectId(userId),
    restaurantName: restaurantName,
    text: text,
    timestamp: timestamp,
    image: image ? image : null,
    likes: [],
    comments: [],
  };

  const insertInfo = await collection.insertOne(newReview);

  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw new ServerError("Could not add the artist.");

  const newId = insertInfo.insertedId.toString();
  await addReviewToUser(userId, newId);

  const key = reviewKey(restaurantName);
  await clearKey(key);

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

  if (editObj.image) {
    editObj.image = validateReviewImage(editObj.image, "Review Image");
  }

  const updateInfo = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: editObj },
    { returnDocument: "after" }
  );

  if (!updateInfo?.ok || !updateInfo?.value)
    throw new ServerError("Could not update the review.");

  const key = reviewKey(updateInfo.value.restaurantName);
  await clearKey(key);

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


  const key = reviewKey(review.restaurantName);
  await clearKey(key);

  return review;
};

export const toggleLike = async (
  reviewId: string,
  userId: string
): Promise<Review> => {
  reviewId = validateObjectId(reviewId, "Review Id");
  userId = validateObjectId(userId, "User Id");

  const review = await getReviewById(reviewId);
  const liked = review.likes.map((x) => x.toString()).includes(userId);

  console.log(liked);

  const collection = await reviews();

  let likes = review.likes;
  if (liked)
    likes = review.likes.filter((id) => id.toString() !== userId.toString());
  else likes.push(new ObjectId(userId));

  console.log(likes);

  let newReview = await collection.findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    { $set: { likes: likes } },
    { returnDocument: "after" }
  );

  if (!newReview) throw new ServerError("Could not update the review.");

  const key = reviewKey(newReview.restaurantName);
  await clearKey(key);

  return newReview;
};

export const reviewsByRestaurant = async (
  restaurantId: string
): Promise<Review[]> => {
  restaurantId = validateString(restaurantId, "Restaurant Id");

  let exists = await restaurantExists(restaurantId);
  if (!exists) throw new NotFoundError("No restaurant found with that id.");

  const collection = await reviews();
  const reviewList = await collection.find({
    restaurantName: restaurantId,
  })
  .toArray();

  const key = reviewKey(restaurantId);
  await setJson(key, reviewList, 3600);

  return reviewList;
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
  const comment = await collection.findOne({
    "comments._id": new ObjectId(commentId),
  });

  if (!comment) throw new NotFoundError("No comment found with that id.");

  return comment;
};

const getReviewOfComment = async (commentId: string): Promise<Review> => {
  commentId = validateObjectId(commentId, "Comment Id");
  const collection = await reviews();
  const review = await collection.findOne({
    "comments._id": new ObjectId(commentId),
  });
  if (!review) throw new NotFoundError("No review found with that id.");
  return review;
};

export const addComment = async (
  reviewId: string,
  userId: string,
  text: string,
  timestamp: string
): Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  reviewId = validateObjectId(reviewId, "Review Id");
  text = validateString(text, "Comment Text");
  timestamp = validateDateString(timestamp, "Timestamp");

  const collection = await reviews();

  const review = await collection.findOne({ _id: new ObjectId(reviewId) });
  if (!review) {
    throw new NotFoundError("No review found with that id.");
  }

  const newComment: Comment = {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    text: text,
    timestamp: timestamp,
  };

  const updatedComments = [...review.comments, newComment];

  const updateResult = await collection.updateOne(
    { _id: new ObjectId(reviewId) },
    { $set: { comments: updatedComments } }
  );

  if (!updateResult.acknowledged || updateResult.modifiedCount !== 1) {
    throw new ServerError("Could not add the comment.");
  }

  const updatedReview = await collection.findOne({
    _id: new ObjectId(reviewId),
  });
  if (!updatedReview) {
    throw new ServerError("Could not retrieve the updated review.");
  }

  return updatedReview;
};

export const editComment = async (
  commentId: string,
  userId: string,
  text: string,
  timestamp: string
): Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  commentId = validateObjectId(commentId, "Comment Id");
  text = validateString(text, "Comment Text");
  timestamp = validateDateString(timestamp, "Timestamp");

  const comment = await getComment(commentId);
  if (comment.userId.toString() !== userId)
    throw new ValidationError(
      "Cannot edit comment that doesn't belong to user."
    );

  const collection = await reviews();
  const updateInfo = await collection.updateOne(
    { "comments._id": new ObjectId(commentId) },
    { $set: { "comments.$.text": text, "comments.$.timestamp": timestamp } }
  );

  if (!updateInfo?.ok || !updateInfo?.value)
    throw new ServerError("Could not update the review.");

  return await getReviewOfComment(commentId);
};

export const deleteComment = async (
  userId: string,
  commentId: string
): Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  commentId = validateObjectId(commentId, "Comment Id");

  let comment = await getComment(commentId);
  if (!comment) throw new NotFoundError("No comment found with that id.");
  if (!comment)
    throw new ValidationError(
      "Cannot delete comment that doesn't exist or that user didn't make."
    );

  let review = await getReviewOfComment(commentId);
  const updatedComments = review.comments.filter(
    (c: Comment) => c._id.toString() !== commentId
  );

  const collection = await reviews();
  const updateInfo = await collection.updateOne(
    { "comments._id": new ObjectId(commentId) },
    { $set: { comments: updatedComments } }
  );

  if (!updateInfo?.ok || !updateInfo?.value)
    throw new ServerError("Could not update the review.");

  return await getReviewOfComment(commentId);
};
