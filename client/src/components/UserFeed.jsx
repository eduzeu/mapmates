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
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState(null); // ID of post being commented on

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
          if (data.user && data.user._id) {
            setUserId(data.user._id);
            // Switch to friends feed if user is logged in
            setFeedType("friends");
            console.log("User ID:", data.user._id);
          }
        } else {
          console.log("User not logged in or session expired");
          // User is not logged in, just continue with general feed
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
        // If we get a 404 or other error on friends/user feed, fall back to general feed
        if ((feedType === "friends" || feedType === "user") && response.status !== 200) {
          console.log(`Error with ${feedType} feed, falling back to general feed`);
          setFeedType("general");
          return;
        }
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

  // Helper to render comments safely
  const renderComments = (post) => {
    if (!post.comments || !Array.isArray(post.comments)) return null;
    
    return (
      <div className="post-comments">
        {post.comments.length > 0 && (
          <div className="comments-header">
            <h4>Comments ({post.comments.length})</h4>
          </div>
        )}
        {post.comments.map((comment, index) => (
          <div key={comment._id || index} className="comment-item">
            <div className="comment-author">{comment.username || "User"}</div>
            <div className="comment-text">{comment.text}</div>
            <div className="comment-time">{formatDate(comment.timestamp)}</div>
          </div>
        ))}
        
        {userId && commentingOn === post._id && (
          <div className="comment-form">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
            />
            <div className="comment-actions">
              <button 
                onClick={() => handleAddComment(post._id)}
                className="comment-submit"
                disabled={!newComment.trim()}
              >
                Submit
              </button>
              <button 
                onClick={() => setCommentingOn(null)}
                className="comment-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Function to handle post likes
// Function to handle post likes
// Simplified function to handle post likes
// Improved error handling for the like feature
// Improved error handling for the like feature
const handleLike = async (postId) => {
  if (!userId) {
    alert("Please sign in to like posts.");
    return;
  }

  try {
    // First check if the post has a likes array
    // Temporarily disable optimistic UI update since it may be causing issues
    
    // Send request to server
    const response = await fetch('http://localhost:3000/reviews/like/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        reviewId: postId,
        userId
      })
    });
    
    // Check for server errors
    if (!response.ok) {
      let errorMessage = 'Failed to like post';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse JSON, just use the response text
        errorMessage = await response.text();
      }
      console.error('Server error response:', errorMessage);
      throw new Error(`Server error: ${response.status} - ${errorMessage}`);
    }

    // Update UI with server response
    const updatedReview = await response.json();
    
    setFeedData(prevData => ({
      ...prevData,
      posts: prevData.posts.map(post => 
        post._id === postId ? {
          ...post,
          likes: updatedReview.likes || []
        } : post
      )
    }));
  } catch (error) {
    console.error('Error liking post:', error);
    // We're not going to reload the page on error anymore, just show the error
    // and let the user try again if they want
  }
};

  // Function to toggle comment form
  const toggleCommentForm = (postId) => {
    if (!userId) {
      alert("Please sign in to comment on posts.");
      return;
    }

    if (commentingOn === postId) {
      setCommentingOn(null);
    } else {
      setCommentingOn(postId);
      setNewComment('');
    }
  };

  // Function to add a comment
 // Function to add a comment
// Simplified function to add a comment
// Simplified function to add a comment
// Improved error handling for adding comments
const handleAddComment = async (postId) => {
  if (!userId || !newComment.trim()) {
    if (!userId) {
      alert("Please sign in to comment on posts.");
    }
    return;
  }

  try {
    // Prepare comment data
    const commentData = {
      reviewId: postId,
      userId,
      text: newComment.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Send request to server
    const response = await fetch('http://localhost:3000/reviews/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(commentData)
    });
    
    // Check for server errors
    if (!response.ok) {
      let errorMessage = 'Failed to add comment';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse JSON, just use the response text
        errorMessage = await response.text();
      }
      console.error('Server error response:', errorMessage);
      throw new Error(`Server error: ${response.status} - ${errorMessage}`);
    }

    // Update UI with server response
    const updatedReview = await response.json();
    
    // Update the feed data with the new comment
    setFeedData(prevData => ({
      ...prevData,
      posts: prevData.posts.map(post => 
        post._id === postId ? {
          ...post,
          comments: updatedReview.comments || []
        } : post
      )
    }));

    // Clear the comment form
    setNewComment('');
    setCommentingOn(null);
  } catch (error) {
    console.error('Error adding comment:', error);
    // Show an error message to the user
    alert('Failed to add comment. Please try again.');
  }
};

  // Check if user has liked a post
  const hasUserLiked = (post) => {
    if (!userId || !post.likes) return false;
    return post.likes.some(like => 
      like._id ? like._id.toString() === userId : like.toString() === userId
    );
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
        {feedData.posts && feedData.posts.map((post) => (
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
              {post.text || post.content}
            </div>

            {/* Post image */}
            {post.image && (
              <div className="post-images">
                <img 
                  src={post.image} 
                  alt="Post" 
                  onError={(e) => {
                    e.target.src = `https://placehold.co/600x400?text=Review+at+${post.locationName || 'Location'}`;
                  }}
                />
              </div>
            )}
            {!post.image && post.images && post.images.length > 0 && (
              <div className="post-images">
                <img
                  src={post.images[0]}
                  alt="Post"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/600x400?text=Review+at+${post.locationName || 'Location'}`;
                  }}
                />
              </div>
            )}
            
            {/* Comments */}
            {renderComments(post)}
            
            {/* Post actions */}
            <div className="post-actions">
              <button 
                className={`action-button ${hasUserLiked(post) ? 'liked' : ''}`}
                onClick={() => handleLike(post._id)}
              >
                {hasUserLiked(post) ? '❤️' : '👍'} {post.likes ? post.likes.length : 0}
              </button>
              <button 
                className="action-button"
                onClick={() => toggleCommentForm(post._id)}
              >
                💬 {post.comments ? post.comments.length : 0}
              </button>
              {post.coordinates && (
                <Link 
                  to={`/maps?lat=${post.coordinates.latitude || post.coordinates[0]}&lng=${post.coordinates.longitude || post.coordinates[1]}`}
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
      {!feedData.hasNextPage && feedData.posts && feedData.posts.length > 0 && !loading && (
        <div className="end-of-feed">You've reached the end of the feed!</div>
      )}

      {/* Empty feed message */}
      {!loading && (!feedData.posts || feedData.posts.length === 0) && !error && (
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