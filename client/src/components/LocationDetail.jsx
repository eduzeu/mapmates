import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from "axios";
import "./LocationDetail.css";
import markerIcon from '../assets/user.png';

function LocationDetail() {
  const { locationName } = useParams();
  const [location, setLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  //TODO: uncomment when you need middleware theres another one down below in useEffect
  // const isLoggedIn = async () => {
  //   try {
  //     const response = await fetch('http://localhost:3000/users/loggedIn', {
  //       method: 'GET',
  //       credentials: "include"
  //     });
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     console.log(data);
  //     if (!data.loggedIn) {
  //       alert("You need to be logged in to access this page");
  //       setLoggedIn(false);
  //       navigate("/signin");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching user:", err);
  //   }
  // };

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API
        try {
          // This would connect to your restaurant/place API
          const response = await axios.get(`/restaurants/search`);
          // Find the specific restaurant by name
          const decodedName = decodeURIComponent(locationName);
          const foundPlace = response.data.find(place => 
            place.place === decodedName || place.name === decodedName
          );
          
          if (foundPlace) {
            setLocation(formatLocationData(foundPlace));
            
            // Fetch reviews for this location
            try {
              const reviewsResponse = await axios.get(`/reviews/restaurant/${foundPlace._id || foundPlace.id}`);
              if (reviewsResponse.data) {
                setReviews(formatReviewsData(reviewsResponse.data));
              }
            } catch (reviewError) {
              console.warn('Failed to fetch reviews, using mock data');
              // Fall back to mock reviews
              setReviews(generateMockReviews(decodedName));
            }
            
            return;
          }
        } catch (apiError) {
          console.warn('API call failed, falling back to mock data:', apiError);
        }
        
        // Fall back to mock data
        const decodedName = decodeURIComponent(locationName);
        const mockLocation = generateMockLocation(decodedName);
        const mockReviews = generateMockReviews(decodedName);
        
        setLocation(mockLocation);
        setReviews(mockReviews);
      } catch (err) {
        console.error('Error fetching location details:', err);
        setError('Location not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    //uncomment when you want middleware functioning
    // isLoggedIn();
    fetchLocationData();
  }, [locationName]);

  // Format location data from API response
  const formatLocationData = (apiLocation) => {
    // Convert API response to our expected format
    return {
      id: apiLocation._id || apiLocation.id || Math.random().toString(36).substring(7),
      name: apiLocation.place || apiLocation.name,
      category: apiLocation.cuisine || apiLocation.category || 'Restaurant',
      coordinates: apiLocation.coordinates ? 
        [apiLocation.coordinates.latitude, apiLocation.coordinates.longitude] : 
        [40.7440, -74.0254], // Default Hoboken coordinates
      address: apiLocation.address || `Hoboken, NJ`,
      rating: apiLocation.rating || (Math.random() * 2 + 3).toFixed(1),
      visitCount: apiLocation.visitCount || Math.floor(Math.random() * 1000),
      description: apiLocation.description || 
        `${apiLocation.place || apiLocation.name} is a popular spot in Hoboken.`,
      images: apiLocation.images || [
        `https://source.unsplash.com/600x400/?${encodeURIComponent((apiLocation.place || apiLocation.name).toLowerCase())}`
      ],
      openingHours: apiLocation.openingHours || {
        monday: '9:00 AM - 10:00 PM',
        tuesday: '9:00 AM - 10:00 PM',
        wednesday: '9:00 AM - 10:00 PM',
        thursday: '9:00 AM - 11:00 PM',
        friday: '9:00 AM - 12:00 AM',
        saturday: '10:00 AM - 12:00 AM',
        sunday: '10:00 AM - 9:00 PM'
      }
    };
  };

  // Format reviews data from API response
  const formatReviewsData = (apiReviews) => {
    return apiReviews.map(review => ({
      id: review._id || review.id,
      user: {
        id: review.userId,
        name: review.userName || 'Anonymous User',
        avatar: review.userAvatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      },
      rating: review.rating || Math.floor(Math.random() * 5) + 1,
      content: review.text || review.content,
      timestamp: review.timestamp,
      likes: review.likes || Math.floor(Math.random() * 20),
      image: review.image
    }));
  };

  const generateMockLocation = (name) => {
    const decodedName = decodeURIComponent(name);
    
    // Generate random coordinates within Hoboken
    const lat = 40.7440 + (Math.random() * 0.01 - 0.005);
    const lng = -74.0254 + (Math.random() * 0.01 - 0.005);
    
    const categories = ['Restaurant', 'Bar', 'Cafe', 'Park', 'Shop'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const addresses = [
      '123 Washington St', '456 Hudson St', '789 River St', 
      '101 Garden St', '202 Bloomfield St', '303 Clinton St'
    ];
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    
    return {
      id: Math.random().toString(36).substring(7),
      name: decodedName,
      category,
      coordinates: [lat, lng],
      address: `${address}, Hoboken, NJ`,
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3 and 5
      visitCount: Math.floor(Math.random() * 1000),
      description: `${decodedName} is a popular ${category.toLowerCase()} in Hoboken. Known for its welcoming atmosphere and excellent service.`,
      images: [
        `https://source.unsplash.com/600x400/?${encodeURIComponent(decodedName.toLowerCase())}`,
        `https://source.unsplash.com/600x400/?${encodeURIComponent(category.toLowerCase())}`
      ],
      openingHours: {
        monday: '9:00 AM - 10:00 PM',
        tuesday: '9:00 AM - 10:00 PM',
        wednesday: '9:00 AM - 10:00 PM',
        thursday: '9:00 AM - 11:00 PM',
        friday: '9:00 AM - 12:00 AM',
        saturday: '10:00 AM - 12:00 AM',
        sunday: '10:00 AM - 9:00 PM'
      }
    };
  };

  const generateMockReviews = (locationName) => {
    const decodedName = decodeURIComponent(locationName);
    const users = [
      { id: 1, name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?img=11' },
      { id: 2, name: 'Jamie Kim', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 3, name: 'Taylor Morgan', avatar: 'https://i.pravatar.cc/150?img=32' },
      { id: 4, name: 'Jordan Smith', avatar: 'https://i.pravatar.cc/150?img=68' },
      { id: 5, name: 'Riley Johnson', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 6, name: 'Casey Wilson', avatar: 'https://i.pravatar.cc/150?img=33' }
    ];
    
    const reviewContent = [
      `I absolutely love ${decodedName}! The atmosphere is amazing and the service is top-notch.`,
      `${decodedName} is decent, but I expected better. The staff was friendly though.`,
      `Had a wonderful time at ${decodedName}. Would definitely recommend to friends.`,
      `${decodedName} has become one of my favorite spots in Hoboken. Great place to hang out.`,
      `First time visiting ${decodedName} and was pleasantly surprised. Will be coming back!`,
      `${decodedName} exceeded my expectations. The atmosphere is perfect for both casual and special occasions.`,
      `Not impressed with ${decodedName}. Expected more based on the ratings.`,
      `${decodedName} has the best vibes in town! Perfect weekend spot.`
    ];
    
    // Generate 8-12 reviews
    const numberOfReviews = Math.floor(Math.random() * 5) + 8;
    const reviews = [];
    
    for (let i = 0; i < numberOfReviews; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const content = reviewContent[Math.floor(Math.random() * reviewContent.length)];
      const rating = Math.floor(Math.random() * 5) + 1;
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      reviews.push({
        id: i + 1,
        user,
        rating,
        content,
        timestamp: date.toISOString(),
        likes: Math.floor(Math.random() * 20),
        hasImage: Math.random() > 0.7,
        image: Math.random() > 0.7 ? `https://source.unsplash.com/300x200/?${encodeURIComponent(decodedName.toLowerCase())}` : null
      });
    }
    
    return reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const createCustomIcon = () => {
    return L.icon({
      iconUrl: markerIcon,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  const addReview = () => {
    alert('Review functionality will be implemented in the future.');
  };

  const toggleReviews = () => {
    setShowAllReviews(!showAllReviews);
  };

  if (loading) {
    return <div className="loading">Loading location details...</div>;
  }

  if (error || !location) {
    return (
      <div className="error-container">
        <div className="error">{error || 'Location not found'}</div>
        <Link to="/feed" className="back-button">Back to Feed</Link>
      </div>
    );
  }

  const locationMarker = createCustomIcon();
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="location-detail-container">
      <h2>{location.name}</h2>
      
      <div className="location-images">
        {location.images.map((image, index) => (
          <img 
            key={index} 
            src={image} 
            alt={`${location.name} - Image ${index + 1}`} 
            className="location-image"
          />
        ))}
      </div>
      
      <div className="location-info-grid">
        <div className="location-details">
          <div className="details-section">
            <h3>Overview</h3>
            <p className="location-category">{location.category}</p>
            <p className="location-rating">
              ⭐ {location.rating}/5 ({reviews.length} reviews)
            </p>
            <p className="location-visits">
              👣 {location.visitCount} visits by MapMates users
            </p>
            <p className="location-description">{location.description}</p>
          </div>
          
          <div className="details-section">
            <h3>Address</h3>
            <p>{location.address}</p>
            <button className="directions-button">Get Directions</button>
          </div>
          
          <div className="details-section">
            <h3>Hours</h3>
            <div className="hours-grid">
              {Object.entries(location.openingHours).map(([day, hours]) => (
                <div key={day} className="hours-row">
                  <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                  <span className="hours">{hours}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="check-in-button">Check In Here</button>
            <button className="add-review-button" onClick={addReview}>Add Review</button>
            <button className="share-button">Share Location</button>
          </div>
        </div>
        
        <div className="location-map-container">
          <MapContainer 
            center={location.coordinates} 
            zoom={17} 
            style={{ height: '100%', width: '100%', minHeight: '300px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={location.coordinates} icon={locationMarker}>
              <Popup>{location.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
      
      <div className="reviews-section">
        <h3>User Reviews</h3>
        
        <div className="reviews-list">
          {visibleReviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <img 
                  src={review.user.avatar} 
                  alt={review.user.name} 
                  className="reviewer-avatar" 
                />
                <div className="reviewer-info">
                  <div className="reviewer-name">{review.user.name}</div>
                  <div className="review-date">{formatDate(review.timestamp)}</div>
                </div>
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)}
                </div>
              </div>
              
              <div className="review-content">
                <p>{review.content}</p>
                
                {review.image && (
                  <img 
                    src={review.image} 
                    alt="User uploaded" 
                    className="review-image" 
                  />
                )}
              </div>
              
              <div className="review-actions">
                <button className="like-review">
                  ❤️ Like ({review.likes})
                </button>
                <button className="reply-review">
                  💬 Reply
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {reviews.length > 3 && (
          <button className="toggle-reviews" onClick={toggleReviews}>
            {showAllReviews ? 'Show Fewer Reviews' : `Show All ${reviews.length} Reviews`}
          </button>
        )}
      </div>
      
      <div className="navigation-links">
        <Link to="/feed" className="back-to-feed">
          ← Back to Feed
        </Link>
      </div>
    </div>
  );
}

export default LocationDetail;