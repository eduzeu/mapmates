import React, { useState, useEffect } from "react";
import "../components/UserFeed"; 

function UserFeed() {
  const [feedData, setFeedData] = useState({
    posts: [],
    totalPosts: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedType, setFeedType] = useState("general"); // "general", "user", "friends"
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUserSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/getuser", {
          method: "GET",
          credentials: "include" // coooooookies
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserId(data.user);
            // Optionally switch to friends feed if user is logged in(idk if this works yet)
            setFeedType("friends");
          }
        }
      } catch (err) {
        console.error("Error checking user session:", err);
      }
    };

    checkUserSession();
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, [feedType, userId]);

  const fetchFeed = async (page = 1) => {
    setLoading(true);
    try {
      let url;
      
      switch (feedType) {
        case "user":
          if (!userId) throw new Error("User ID is required for user feed");
          url = `http://localhost:3000/feed/user/${userId}?page=${page}`;
          break;
        case "friends":
          if (!userId) throw new Error("User ID is required for friends feed");
          url = `http://localhost:3000/feed/friends/${userId}?page=${page}`;
          break;
        default:
          url = `http://localhost:3000/feed?page=${page}`;
      }

      const response = await fetch(url, {
        credentials: "include" // cooooookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // If loading more posts (page > 1), append to existing posts
      if (page > 1) {
        setFeedData(prev => ({
          ...data,
          posts: [...prev.posts, ...data.posts]
        }));
      } else {
        setFeedData(data);
      }
      
    } catch (err) {
      setError(err.message);
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (feedData.hasNextPage) {
      fetchFeed(feedData.currentPage + 1);
    }
  };

  const handleFeedTypeChange = (type) => {
    setFeedType(type);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to render location with pin icon
  const renderLocation = (post) => {
    if (post.locationName) {
      return (
        <div className="post-location">
          <a href={`/maps?location=${encodeURIComponent(post.locationName)}`}>
            <span className="location-pin">📍</span> {post.locationName}
          </a>
        </div>
      );
    }
    return null;
  };

  // Function to handle like button click
  const handleLike = (postId) => {
    // Implementation for liking a post would go here
    console.log("Like post:", postId);
  };

  // Function to handle comment button click
  const handleComment = (postId) => {
    // Implementation for commenting on a post would go here
    console.log("Comment on post:", postId);
  };

  // Function to handle view on map button click
  const handleViewOnMap = (post) => {
    // Implementation for viewing on map would go here
    if (post.coordinates) {
      console.log("View on map:", post.coordinates);
    }
  };

  return (
    <div className="feed-container">
      <h2>MapMates Feed</h2>
      
      {/* Feed type selector */}
      {userId && (
        <div className="feed-selector">
          <button 
            className={feedType === "general" ? "active" : ""} 
            onClick={() => handleFeedTypeChange("general")}
          >
            All Activity
          </button>
          <button 
            className={feedType === "friends" ? "active" : ""} 
            onClick={() => handleFeedTypeChange("friends")}
          >
            Friends
          </button>
          <button 
            className={feedType === "user" ? "active" : ""} 
            onClick={() => handleFeedTypeChange("user")}
          >
            My Activity
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && <div className="error">{error}</div>}
      
      {/* Feed list */}
      <div className="feed-list">
        {feedData.posts.map((post) => (
          <div className="feed-item" key={post._id}>
            <div className="post-header">
              <img
                src={post.userAvatar || "https://i.pravatar.cc/150"}
                alt={`${post.username}'s avatar`}
                className="user-avatar"
              />
              <div className="post-meta">
                <span className="user-name">{post.username}</span>
                <span className="post-time">{formatDate(post.timestamp)}</span>
              </div>
            </div>
            
            {renderLocation(post)}
            
            <div className="post-content">
              {post.content}
            </div>
            
            {post.images && post.images.length > 0 && (
              <div className="post-images">
                <img src={post.images[0]} alt="Post" />
              </div>
            )}
            
            <div className="post-actions">
              <button onClick={() => handleLike(post._id)}>
                👍 {post.likes}
              </button>
              <button onClick={() => handleComment(post._id)}>
                💬 {post.comments}
              </button>
              {post.coordinates && (
                <a 
                  href={`/maps?lat=${post.coordinates[0]}&lng=${post.coordinates[1]}`}
                  className="view-on-map-link"
                >
                  <button>
                    🗺️ View on Map
                  </button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Loading state */}
      {loading && <div className="loading">Loading feed...</div>}
      
      {/* Load more button */}
      {feedData.hasNextPage && !loading && (
        <button className="load-more" onClick={loadMore}>
          Load More
        </button>
      )}
      
      {/* End of feed message */}
      {!feedData.hasNextPage && feedData.posts.length > 0 && !loading && (
        <div className="end-of-feed">You've reached the end of the feed!</div>
      )}
      
      {/* Empty feed message */}
      {!loading && feedData.posts.length === 0 && !error && (
        <div className="empty-feed">No posts to display.</div>
      )}
    </div>
  );
}

export default UserFeed;