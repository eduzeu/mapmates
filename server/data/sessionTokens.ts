import { sessionTokens, users } from "../config/mongoCollections.js";
import {
  validateDate,
  validateObjectId,
  validateUUID,
} from "../helpers.js";
import { ObjectId, Collection, Document } from "mongodb";

interface SessionToken {
  sessionId: string;
  userId: ObjectId;
  expiresAt: Date;
}

interface User extends Document {
  _id: ObjectId;
}

export const addSessionToken = async (
  sessionId: string,
  userId: string,
  expiresAt: Date
): Promise<Document> => {
  sessionId = validateUUID(sessionId, "Session Id");
  validateObjectId(userId, "User Id");
  validateDate(expiresAt, "Expires At Date");

  const tokenObj: SessionToken = {
    sessionId,
    userId: new ObjectId(userId),
    expiresAt,
  };

  const sessionTokensCollection: Collection<SessionToken> = await sessionTokens();
  const inserted = await sessionTokensCollection.insertOne(tokenObj);

  if (!inserted.acknowledged) {
    throw new Error("Error inserting token");
  }

  return inserted;
};

export const findUserFromSessionToken = async (
  sessionToken: string
): Promise<User> => {
    let validSessionToken: string = validateUUID(sessionToken, "Session Token");

  const sessionTokensCollection: Collection<SessionToken> = await sessionTokens();
  const session = await sessionTokensCollection.findOne({
    sessionId: validSessionToken,
  });

  if (!session) {
    throw new Error("Invalid sessionId");
  }

  const userCollection: Collection<User> = await users();
  const user = await userCollection.findOne({ _id: session.userId });

  if (!user) {
    throw new Error("No matching user for session");
  }

  return user;
};

export const sessionChecker = async (
  sessionToken: string | null
): Promise<string> => {
  if (sessionToken == null) {
    throw new Error("You need to be logged in to access this page! null token");
  }

  let validSessionToken: string = validateUUID(sessionToken, "Session Token");

  const sessionTokensCollection: Collection<SessionToken> = await sessionTokens();
  const validToken = await sessionTokensCollection.findOne({
    sessionId: validSessionToken,
  });

  if (!validToken) {
    throw new Error(
      "You need to be logged in to access this page! token not in database"
    );
  }

  const userCollection: Collection<User> = await users();
  const user = await userCollection.findOne({ _id: validToken.userId });

  if (!user) {
    throw new Error(
      "You need to be logged in to access this page! not matching userId"
    );
  }

  const currDate = new Date();
  if (currDate > validToken.expiresAt) {
    throw new Error("Login has expired, please log in again! expired");
  }

  return validSessionToken;
};

export const deleteSessionToken = async (
  sessionToken: string | null
): Promise<boolean> => {
  if (sessionToken == null) {
    throw new Error("You need to be logged in to log out");
  }

  let validSessionToken: string = validateUUID(sessionToken, "Session Token");

  const sessionTokensCollection: Collection<SessionToken> = await sessionTokens();
  const result = await sessionTokensCollection.deleteOne({
    sessionId: validSessionToken,
  });

  if (result.deletedCount === 0) {
    throw new Error("Token not found");
  }

  return true;
};

export const updateExpiration = async (
  sessionToken: string | null
): Promise<boolean> => {
  if (sessionToken == null) {
    throw new Error("Not logged in");
  }

  let validSessionToken: string = validateUUID(sessionToken, "Session Token");

  const sessionTokensCollection: Collection<SessionToken> = await sessionTokens();
  const result = await sessionTokensCollection.findOne({
    sessionId: validSessionToken,
  });

  if (!result) {
    throw new Error("Invalid no matching object with given sessionId");
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  const newObj: SessionToken = {
    sessionId: sessionToken,
    userId: result.userId,
    expiresAt,
  };

  const insertResult = await sessionTokensCollection.findOneAndReplace(
    { sessionId: sessionToken },
    newObj
  );

  if (!insertResult) {
    throw new Error("Error inserting new object");
  }

  return true;
};