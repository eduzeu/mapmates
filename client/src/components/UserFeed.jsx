import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateObjectId, validateString } from "../validation";
import "./UserFeed.css";
// import { c } from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

function UserFeed() {
  const [feedData, setFeedData] = useState({
    posts: [],
    totalPosts: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedType, setFeedType] = useState("general"); // "general", "user", "friends"
  const [userId, setUserId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState(null); // ID of post being commented on
  const [currUserFriends, setCurrUserFriends] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/users/getUser", {
          method: "GET",
          credentials: "include" // Send cookies with request
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user._id) {
            setUserId(data.user._id);
            handleGetBadges(data.user._id);

            let friendList = data.user.friends.map(id => id.toString());
            setCurrUserFriends(friendList);
            console.log("User ID:", data.user._id);
          }
        } else {
          alert("You need to be logged in to access this page");
          navigate("/");
          console.log("User not logged in or session expired");
        }
      } catch (err) {
        console.error("Error checking user session:", err);
      }
    };
    checkUserSession();
  }, []);

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
          url = `http://localhost:3000/feed/user/${userId}?page=${page}`;
          break;
        case "friends":
          url = `http://localhost:3000/feed/friends/${userId}?page=${page}`;
          break;
        default:
          url = `http://localhost:3000/feed?page=${page}`;
      }

      const response = await fetch(url, {
        credentials: "include" // Send cookies with request
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch feed data.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = await response.text();
        }
        console.error('Server error response:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (page > 1) {
        setFeedData(prev => ({
          ...data,
          posts: [...prev.posts, ...data.posts]
        }));
      } else {
        setFeedData(data);
      }

    } catch (err) {
      console.error(err.message);

    } finally {
      setLoading(false);
    }
  };
  const handleGetBadges = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/badges/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch badges.';
      }
      const data = await response.json();
      console.log("Badges:", data);
      setBadges(data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };
  useEffect(() => {
    console.log("Badges updated:", badges);
  }, [badges]);

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
            <div className="comment-author">{comment.user.username}</div>
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
    let user = userId;
    let reviewId = postId;

    try {
      user = validateObjectId(user, "User Id");
      reviewId = validateObjectId(reviewId, "Review Id");

    } catch (e) {
      alert(e.message);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/reviews/like/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reviewId: postId,
          userId: user
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
        throw new Error(errorMessage);
      }

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
      console.error(error.message);
      alert(error.message);
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

  const handleAddFriend = async (friendId) => {
    try {
      const friend = validateObjectId(friendId.toString(), "Friend Id");

      const response = await fetch('http://localhost:3000/users/addFriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          friendId: friend
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw (data.error);
      }
      if (!data.success) {
        throw (data.error);
      }
      alert("Friend Added!");
      setCurrUserFriends([...currUserFriends, friendId]);
    }
    catch (error) {
      alert(error);
      console.error(error);
    }

    // Check if user earned the badge.
    await hasEarnedFriendBadge();
  }

  // Function to add a comment
  // Function to add a comment
  // Simplified function to add a comment
  // Simplified function to add a comment
  // Improved error handling for adding comments
  const handleAddComment = async (postId) => {
    try {
      const user = validateObjectId(userId, "User Id");
      const reviewId = validateObjectId(postId, "Review Id");
      const text = validateString(newComment, "Comment Text");

      const commentData = {
        reviewId,
        userId: user,
        text,
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
        throw new Error(errorMessage);
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
      alert(error.message);
    }
  };

  // Check if user has liked a post
  const hasUserLiked = (post) => {
    if (!userId || !post.likes) return false;
    return post.likes.some(like =>
      like._id ? like._id.toString() === userId : like.toString() === userId
    );
  };

  const userIsFriends = (postId) => {
    if (!userId || !postId) {
      return true;
    }
    if (currUserFriends.includes(postId)) {
      return false;
    }
    if (userId.toString() == postId) {
      return false;
    }
    else {
      return true;
    }
  }

  const hasEarnedFriendBadge = async () => {
    let user = userId;

    try {
      user = validateObjectId(user, "User Id");

    } catch (e) {
      alert(e.message);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/badges/friend/${user}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check if the Friendship Badge has been earned.');
      }

      if (data["earned"] === true) {
        alert("Congratsulations! You've made 10 friends and earned the Friendship Badge!");
      }

    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="feed-container">
      <h2>MapMates Feed</h2>

      {/* Login notice if not logged in */}
      {!userId && (
        <div className="auth-notice">
          <p>
            <Link to="/">Sign in</Link> or <Link to="/signup">create an account</Link> to see personalized content and activity from friends.
          </p>
        </div>
      )}

      <div className="how-it-works">
        <h3>🧭 How MapMates Feed Works</h3>
        <ul>
          <li><span className="emoji">🧍‍♂️</span> <strong>All Activity</strong> shows only your own posts</li>
          <li><span className="emoji">🌐</span> <strong>All Posts</strong> shows everything shared by the community</li>
          <li><span className="emoji">🤝</span> <strong>Friends</strong> shows posts from people you follow</li>
          <li><span className="emoji">📝</span> Add reviews from the map and they'll appear here too!</li>
          <li><span className="emoji">✨</span> Stay active and grow your foodie journey on the feed!</li>
        </ul>
      </div>

      {badges.length > 0 && (
        <div className="badges">
          <h3>🏅 Badges</h3>
          <ul>
            {badges.map((badge, index) => (
              <li key={index} className="badge-item">
                <span className="badge-emoji">{badge.emoji || '🏅'}</span>
                <span className="badge-text">{badge.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* <div className="badges">
        <h3>🏅 Badges</h3
        <ul>
          {badges.map((badge, index) => (
            <li key={index}>
              <span className="emoji">{badge.emoji}</span> {badge.name}
            </li>
          ))}
        </ul>
      </div> */}


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
              <div className="post-meta">
                <span className="user-name">{post.username}</span>
                <span className="post-time">{formatDate(post.timestamp)}</span>
              </div>
              {userIsFriends(post.userId) && (<button className="add-friend-btn" onClick={() => handleAddFriend(post.userId)}>
                ➕ Add Friend
              </button>)}
            </div>

            {/* Location */}
            {post.restaurantName && (
              <div className="post-location">
                <p> 📍 {post.restaurantName} </p>
              </div>
            )}

            {/* Post content */}
            <div className="post-content">
              {post.text || post.content}
            </div>

            {/* Post image */}
            {post.image && post.image.url && (
              <div className="post-images">
                <img
                  src={post.image.url}
                  alt={post.image.altText}
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
      {
        feedData.hasNextPage && !loading && (
          <button className="load-more-button" onClick={loadMore}>
            Load More
          </button>
        )
      }

      {/* End of feed message */}
      {
        !feedData.hasNextPage && feedData.posts && feedData.posts.length > 0 && !loading && (
          <div className="end-of-feed">You've reached the end of the feed!</div>
        )
      }

      {/* Empty feed message */}
      {
        !loading && (!feedData.posts || feedData.posts.length === 0) && !error && (
          <div className="empty-feed">
            <p>No posts to display.</p>
            {feedType === "friends" && userId && (
              <p>Add friends to see their activity here!</p>
            )}
            {feedType === "user" && userId && (
              <p>Visit new places to see your activity here!</p>
            )}
          </div>
        )
      }
    </div >
  );
}

export default UserFeed;