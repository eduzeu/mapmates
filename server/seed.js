import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "MapMates";
const COLLECTION_NAME = "users";

const users = [
  {
    username: "testuser1",
    email: "testuser1@example.com",
    password: "hashedpassword1",
    reviews: [],
    friends: [],
    badges: [],
    visitedPlaces: [
      {
        place: "Carlo's Bakery",
        cuisine: "Bakery",
        visitedAt: new Date("2025-04-01"),
        coordinates: { lat: 40.743998, long: -74.032364 }
      }
    ]
  },
  {
    username: "testuser2",
    email: "testuser2@example.com",
    password: "hashedpassword2",
    reviews: [],
    friends: [],
    badges: [],
    visitedPlaces: [
      {
        place: "Pier 13",
        cuisine: "American, Seafood",
        visitedAt: new Date("2025-04-05"),
        coordinates: { lat: 40.737217, long: -74.025315 }
      }
    ]
  },
  {
    username: "testuser3",
    email: "testuser3@example.com",
    password: "hashedpassword3",
    reviews: [],
    friends: [],
    badges: [],
    visitedPlaces: [
      {
        place: "The Madison Bar and Grill",
        cuisine: "American, Pub",
        visitedAt: new Date("2025-04-07"),
        coordinates: { lat: 40.748800, long: -74.032046 }
      }
    ]
  },
  {
    username: "testuser4",
    email: "testuser4@example.com",
    password: "hashedpassword4",
    reviews: [],
    friends: [],
    badges: [],
    visitedPlaces: [
      {
        place: "Hoboken Waterfront Walkway",
        cuisine: "N/A",
        visitedAt: new Date("2025-04-10"),
        coordinates: { lat: 40.744741, long: -74.025874 }
      }
    ]
  },
  {
    username: "testuser5",
    email: "testuser5@example.com",
    password: "hashedpassword5",
    reviews: [],
    friends: [],
    badges: [],
    visitedPlaces: [
      {
        place: "Maxwell’s Tavern",
        cuisine: "American, Bar",
        visitedAt: new Date("2025-04-12"),
        coordinates: { lat: 40.744332, long: -74.031862 }
      }
    ]
  }
];

async function seedUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // Optional: clear the collection before inserting
    await usersCollection.deleteMany({});

    const result = await usersCollection.insertMany(users);
    console.log(`Inserted ${result.insertedCount} users`);
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await client.close();
  }
}

seedUsers();
