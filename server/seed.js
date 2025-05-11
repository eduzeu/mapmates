import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "MapMates";
const saltRounds = 16;

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(DB_NAME);

    // Clear existing collections
    await db.collection("users").deleteMany({});
    await db.collection("reviews").deleteMany({});
    console.log("Cleared existing collections");

    // Create users
    const hashedPassword = await bcrypt.hash("Password123!", saltRounds);

    const users = [
      {
        _id: new ObjectId(),
        username: "user1",
        email: "user1@example.com",
        password: hashedPassword,
        reviews: [],
        friends: [],
        badges: [],
        avatar: "https://i.pravatar.cc/150?img=1",
        visitedPlaces: []
      },
      {
        _id: new ObjectId(),
        username: "user2",
        email: "user2@example.com",
        password: hashedPassword,
        reviews: [],
        friends: [],
        badges: [],
        avatar: "https://i.pravatar.cc/150?img=2",
        visitedPlaces: []
      },
      {
        _id: new ObjectId(),
        username: "user3",
        email: "user3@example.com",
        password: hashedPassword,
        reviews: [],
        friends: [],
        badges: [],
        avatar: "https://i.pravatar.cc/150?img=3",
        visitedPlaces: []
      }
    ];

    // Make users friends with each other
    users[0].friends = [users[1]._id, users[2]._id];
    users[1].friends = [users[0]._id, users[2]._id];
    users[2].friends = [users[0]._id, users[1]._id];

    // Insert users
    await db.collection("users").insertMany(users);
    console.log("Inserted users");

    // Define places
    const places = [
      {
        _id: new ObjectId(),
        name: "Carlo's Bakery",
        type: "Bakery",
        coordinates: { latitude: 40.743998, longitude: -74.032364 }
      },
      {
        _id: new ObjectId(),
        name: "Pier 13",
        type: "American",
        coordinates: { latitude: 40.737217, longitude: -74.025315 }
      },
      {
        _id: new ObjectId(),
        name: "The Madison Bar and Grill",
        type: "American",
        coordinates: { latitude: 40.748800, longitude: -74.032046 }
      },
      {
        _id: new ObjectId(),
        name: "Hoboken Waterfront Walkway",
        type: "Recreation",
        coordinates: { latitude: 40.744741, longitude: -74.025874 }
      },
      {
        _id: new ObjectId(),
        name: "Tony Boloney's",
        type: "Pizza",
        coordinates: { latitude: 40.742298, longitude: -74.032368 }
      }
    ];

    // Add visited places to users
    users[0].visitedPlaces = places.map(place => ({
      place: place.name,
      cuisine: place.type,
      placeId: place._id,
      visitedAt: getRandomPastDate(30),
      coordinates: {
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude
      }
    }));

    users[1].visitedPlaces = places.slice(0, 3).map(place => ({
      place: place.name,
      cuisine: place.type,
      placeId: place._id,
      visitedAt: getRandomPastDate(60),
      coordinates: {
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude
      }
    }));

    users[2].visitedPlaces = places.slice(3, 5).map(place => ({
      place: place.name,
      cuisine: place.type,
      placeId: place._id,
      visitedAt: getRandomPastDate(90),
      coordinates: {
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude
      }
    }));

    // Update users with visited places
    for (const user of users) {
      await db.collection("users").updateOne(
        { _id: user._id },
        { $set: { visitedPlaces: user.visitedPlaces } }
      );
    }

    console.log("Updated user visited places");

    // Create reviews
    const reviews = [];

    // User 1 reviews
    for (let i = 0; i < 3; i++) {
      const place = places[i];
      reviews.push({
        _id: new ObjectId(),
        userId: users[0]._id,
        text: getRandomReview(place.name),
        restaurantName: place.name,
        timestamp: getRandomPastDate(15).toISOString(),
        likes: [],
        comments: []
      });
    }

    // User 2 reviews
    for (let i = 0; i < 2; i++) {
      const place = places[i];
      reviews.push({
        _id: new ObjectId(),
        userId: users[1]._id,
        text: getRandomReview(place.name),
        restaurantName: place.name,
        timestamp: getRandomPastDate(25).toISOString(),
        likes: [],
        comments: []
      });
    }

    // User 3 reviews
    for (let i = 3; i < 5; i++) {
      const place = places[i];
      reviews.push({
        _id: new ObjectId(),
        userId: users[2]._id,
        text: getRandomReview(place.name),
        restaurantName: place.name,
        timestamp: getRandomPastDate(35).toISOString(),
        likes: [],
        comments: []
      });
    }

    // Add comments
    reviews[0].comments.push({
      _id: new ObjectId(),
      userId: users[1]._id,
      text: "I agree! This place is amazing!",
      timestamp: getRandomPastDate(10).toISOString()
    });

    reviews[0].comments.push({
      _id: new ObjectId(),
      userId: users[2]._id,
      text: "Thanks for the recommendation! I'll check it out.",
      timestamp: getRandomPastDate(8).toISOString()
    });

    reviews[3].comments.push({
      _id: new ObjectId(),
      userId: users[0]._id,
      text: "I had a similar experience. The food is amazing!",
      timestamp: getRandomPastDate(5).toISOString()
    });

    // Insert reviews
    await db.collection("reviews").insertMany(reviews);
    console.log("Inserted reviews");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

// Helpers
function getRandomPastDate(maxDaysAgo) {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date();
  date.setDate(today.getDate() - daysAgo);
  return date;
}

function getRandomReview(placeName) {
  const reviews = [
    `${placeName} was amazing! Would definitely come back again.`,
    `Great atmosphere at ${placeName}. The service was excellent.`,
    `Had a wonderful time at ${placeName}. Highly recommend!`,
    `${placeName} exceeded my expectations. The food was delicious.`,
    `Visited ${placeName} with friends and had a blast. Good vibes all around.`,
    `${placeName} has the best views in Hoboken! A must-visit location.`,
    `The staff at ${placeName} were friendly and attentive. Made our experience special.`,
    `${placeName} is a gem! Can't believe I haven't been here before.`,
    `The ambiance at ${placeName} is unmatched. Perfect for a date night.`,
    `${placeName} has become one of my favorite spots in town. Will be returning soon!`
  ];
  return reviews[Math.floor(Math.random() * reviews.length)];
}

seed().catch(console.error);
