import { Collection, ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import { validateObjectId } from '../helpers/validation';
import { User } from './users';

export const earnFriendBadge = async (id: string) => {
  try {
    const userCollection: Collection<User> = await users();
    const userId = validateObjectId(id, 'User ID');
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error('User not found');
    }

    const hasBadge = await userCollection.findOne({
      _id: new ObjectId(userId),
      'badges.name': 'Friendship Badge'
    });
    if (hasBadge) { return { alreadyEarned: true } };

    //check first if it's not reaching 10 by deleting a friend
    if (user?.friends.length > 10) {
      return { alreadyEarned: true };
    }

    if (user?.friends.length === 10) {
      const badge = {
        name: 'Friendship Badge',
        description: 'You have made  10 friends!',
        date: new Date()
      };
      await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { badges: badge } }
      );

      return { earned: true };
    }

    return { earned: false };

  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
    throw new Error('Error while earning friend badge');
  }

}

export const earnReviewBadge = async (id: string) => {
  try {
    const userCollection: Collection<User> = await users();
    const userId = validateObjectId(id, 'User ID');
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error('User not found');
    }

    const hasBadge = await userCollection.findOne({
      _id: new ObjectId(userId),
      'badges.name': 'Reviewer Badge'
    });
    if (hasBadge) { return { alreadyEarned: true } };

    //check first if it's not reaching 10 by deleting a review
    if (user?.reviews.length > 5) {
      //nothing to do here, just return
      return { alreadyEarned: true };
    }

    if (user?.reviews.length === 5) {
      const badge = {
        name: 'Reviewer Badge',
        description: 'You have made 5 reviews!',
        date: new Date()
      };
      await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { badges: badge } }
      );
      return { earned: true };
    }

    return { earned: false };

  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
    throw new Error('Error while earning review badge');
  }

}