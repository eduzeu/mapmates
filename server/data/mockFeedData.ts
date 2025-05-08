// This is a sample of what your backend feed data should look like
// You can use this to test your frontend before working on the backend

const mockFeedData = {
    posts: [
      {
        _id: "60d21b4667d0d8992e610c85",
        type: "visit",
        userId: "60d21b4667d0d8992e610c80",
        username: "testuser1",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        locationId: "60d21b4667d0d8992e610c81",
        locationName: "Carlo's Bakery",
        content: "Checked in at Carlo's Bakery!",
        timestamp: new Date("2025-04-01"),
        likes: 5,
        comments: 2,
        images: ["https://placehold.co/600x400?text=Visited+Carlo's+Bakery"],
        coordinates: [40.743998, -74.032364]
      },
      {
        _id: "60d21b4667d0d8992e610c86",
        type: "visit",
        userId: "60d21b4667d0d8992e610c82",
        username: "testuser2",
        userAvatar: "https://i.pravatar.cc/150?img=2",
        locationId: "60d21b4667d0d8992e610c83",
        locationName: "Pier 13",
        content: "Checked in at Pier 13!",
        timestamp: new Date("2025-04-05"),
        likes: 3,
        comments: 1,
        images: ["https://placehold.co/600x400?text=Visited+Pier+13"],
        coordinates: [40.737217, -74.025315]
      },
      {
        _id: "60d21b4667d0d8992e610c87",
        type: "visit",
        userId: "60d21b4667d0d8992e610c84",
        username: "testuser3",
        userAvatar: "https://i.pravatar.cc/150?img=3",
        locationId: "60d21b4667d0d8992e610c85",
        locationName: "The Madison Bar and Grill",
        content: "Checked in at The Madison Bar and Grill!",
        timestamp: new Date("2025-04-07"),
        likes: 7,
        comments: 4,
        images: ["https://placehold.co/600x400?text=Visited+The+Madison+Bar+and+Grill"],
        coordinates: [40.748800, -74.032046]
      },
      {
        _id: "60d21b4667d0d8992e610c88",
        type: "review",
        userId: "60d21b4667d0d8992e610c80",
        username: "testuser1",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        locationId: "60d21b4667d0d8992e610c81",
        locationName: "Carlo's Bakery",
        content: "The cannolis were amazing! Definitely worth the wait in line.",
        timestamp: new Date("2025-04-02"),
        likes: 12,
        comments: 3,
        images: ["https://placehold.co/600x400?text=Review+of+Carlo's+Bakery"]
      },
      {
        _id: "60d21b4667d0d8992e610c89",
        type: "review",
        userId: "60d21b4667d0d8992e610c82",
        username: "testuser2",
        userAvatar: "https://i.pravatar.cc/150?img=2",
        locationId: "60d21b4667d0d8992e610c83",
        locationName: "Pier 13",
        content: "Great views of NYC from here, and the food trucks have excellent options!",
        timestamp: new Date("2025-04-06"),
        likes: 8,
        comments: 2,
        images: ["https://placehold.co/600x400?text=Review+of+Pier+13"]
      }
    ],
    totalPosts: 5,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false
  };
  
  // You could use this to mock API calls during development:
  // 
  // function mockFeedAPI(page = 1) {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve({
  //         ...mockFeedData,
  //         currentPage: page
  //       });
  //     }, 500);
  //   });
  // }
  
  export default mockFeedData;