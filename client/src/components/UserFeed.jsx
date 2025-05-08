import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./userFeed.css";

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

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/getuser", {
          method: "GET",
          credentials: "include" // Send cookies with request
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserId(data.user);
            // Switch to friends feed if user is logged in
            setFeedType("friends");
          }
        }
      } catch (err) {
        console.error("Error checking user session:", err);
      } finally {
        // Fetch the feed regardless of login status
        fetchFeed(1);
      }
    };

    checkUserSession();
  }, []);

  // Fetch feed when feedType changes
  useEffect(() => {
    if (userId || feedType === "general") {
      fetchFeed(1);
    }
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
        credentials: "include" // Send cookies with request
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

  return (
    <div className="feed-container">
      <h2>MapMates Feed</h2>

      {/* Login notice if not logged in */}
      {!userId && (
        <div className="auth-notice">
          <p>
            <Link to="/signin">Sign in</Link> or <Link to="/signup">create an account</Link> to see personalized content and activity from friends.
          </p>
        </div>
      )}

      {/* Feed type selector */}
      <div className="feed-selector">
        <button
          className={feedType === "general" ? "active" : ""}
          onClick={() => handleFeedTypeChange("general")}
        >
          All Activity
        </button>

        {userId && (
          <>
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
          </>
        )}
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Feed content */}
      <div className="feed-list">
        {feedData.posts.map((post) => (
          <div className="feed-item" key={post._id}>
            <div className="post-header">
              <img
                src={post.userAvatar || "https://i.pravatar.cc/150?u=" + post.userId}
                alt={`${post.username}'s avatar`}
                className="user-avatar"
              />
              <div className="post-meta">
                <span className="user-name">{post.username}</span>
                <span className="post-time">{formatDate(post.timestamp)}</span>
              </div>
            </div>

            {/* Location */}
            {post.locationName && (
              <div className="post-location">
                <Link to={`/location/${encodeURIComponent(post.locationName)}`}>
                  <span className="location-pin">📍</span> {post.locationName}
                </Link>
              </div>
            )}

            {/* Post content */}
            <div className="post-content">
              {post.content}
            </div>

            {/* Post image */}
            {post.images && post.images.length > 0 && (
              <div className="post-images">
                <img
                  src={post.images[0]}
                  alt="Post"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/600x400?text=${post.type || 'Post'}+at+${post.locationName || 'Location'}`;
                  }}
                />
              </div>
            )}

            {/* Post actions */}
            <div className="post-actions">
              <button className="action-button">
                👍 {post.likes || 0}
              </button>
              <button className="action-button">
                💬 {post.comments || 0}
              </button>
              {post.coordinates && (
                <Link
                  to={`/maps?lat=${post.coordinates[0]}&lng=${post.coordinates[1]}`}
                  className="view-on-map-link"
                >
                  <button className="action-button">
                    🗺️ View on Map
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && <div className="loading">Loading feed...</div>}

      {/* Load more button */}
      {feedData.hasNextPage && !loading && (
        <button className="load-more-button" onClick={loadMore}>
          Load More
        </button>
      )}

      {/* End of feed message */}
      {!feedData.hasNextPage && feedData.posts.length > 0 && !loading && (
        <div className="end-of-feed">You've reached the end of the feed!</div>
      )}

      {/* Empty feed message */}
      {!loading && feedData.posts.length === 0 && !error && (
        <div className="empty-feed">
          <p>No posts to display.</p>
          {feedType === "friends" && userId && (
            <p>Add friends to see their activity here!</p>
          )}
          {feedType === "user" && userId && (
            <p>Visit new places to see your activity here!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserFeed;