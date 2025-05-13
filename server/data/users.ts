import bcrypt from 'bcrypt';
import { Collection, InsertOneResult, ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import { validateEmailAddress, validateObjectId, validatePassword, validateString } from '../helpers/validation';
//import { ca } from 'date-fns/locale';


export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  reviews: any[];
  friends: any[];
  badges: any[];
  visitedPlaces?: {
    place: string;
    cuisine: string;
    visitedAt: Date;
    coordinates: { lat: number; long: number };
  }[];
}

const saltRounds = 10;

export const addNewUser = async (
  username: string,
  email: string,
  password: string
): Promise<InsertOneResult<User>> => {
  username = validateString(username, 'Username');
  email = validateEmailAddress(email, 'Email');
  password = validatePassword(password, 'Password');

  const userCollection: Collection<User> = await users();
  const eUser = await userCollection.findOne({ email: email.toLowerCase() });
  const uUser = await userCollection.findOne({ username: username.toLowerCase() });

  if (eUser || uUser) {
    throw new Error('Account exists!');
  }

  const hashedPass = await bcrypt.hash(password, saltRounds);

  const userObj: User = {
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPass,
    reviews: [],
    friends: [],
    badges: []
  };

  const insertInfo = await userCollection.insertOne(userObj);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error('Failed to insert user');
  }

  return insertInfo;
};

export const checkUser = async (
  username: string,
  password: string
): Promise<ObjectId> => {
  username = validateString(username, 'Username').toLowerCase();
  password = validateString(password, 'Password');

  const userCollection: Collection<User> = await users();
  const user = await userCollection.findOne({ username });
  if (!user) {
    throw new Error('Invalid Login');
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error('Invalid Login');
  }

  return user._id as ObjectId;
};

export const getUsername = async (id: string) : Promise<string> => {
  id = validateObjectId(id);

  const collection = await users();
  const user = await collection.findOne({_id: new ObjectId(id)});
  
  if (!user) {
    throw new Error('User not found');
  }

  return user.username;
}
