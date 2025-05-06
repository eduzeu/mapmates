import { ObjectId } from "mongodb";
import { reviews } from "../config/mongoCollections.js";
import {
  NotFoundError,
  ServerError,
  ValidationError,
} from "../helpers/errors.ts";
import {
  validateDateString,
  validateObjectId,
  validateString,
} from "../helpers/validation.ts";
import { restaurantExists } from "./restaurants.ts";

export interface Review {
  userId: ObjectId;
  placeId: ObjectId;
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

  return review as unknown as Review;
};

export const addReview = async (
  userId: string,
  placeId: string,
  text: string,
  timestamp: string
): Promise<Review> => {
  userId = validateObjectId(userId, "User Id");
  placeId = validateObjectId(placeId, "Place Id");
  text = validateString(text, "Review Text");
  timestamp = validateDateString(timestamp, "Timestamp");

  const newReview: Review = {
    userId: new ObjectId(userId),
    placeId: new ObjectId(placeId),
    text: text,
    timestamp: timestamp,
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
