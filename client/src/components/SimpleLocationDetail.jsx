import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function SimpleLocationDetail() {
  const { locationName } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For simplicity, we'll just use mock data
        // In a real app, you would fetch this from your API
        const mockLocation = {
          name: decodeURIComponent(locationName),
          category: "Restaurant",
          description: `${decodeURIComponent(locationName)} is a popular spot in Hoboken.`,
          address: "Hoboken, NJ",
          coordinates: [40.7440, -74.0254],
          rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3 and 5
          visitCount: Math.floor(Math.random() * 100),
          image: `https://placehold.co/600x400?text=${encodeURIComponent(locationName)}`
        };
        
        setLocation(mockLocation);
      } catch (err) {
        console.error('Error fetching location details:', err);
        setError('Location not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [locationName]);

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

  return (
    <div className="location-detail-container">
      <h1>{location.name}</h1>
      
      <div className="location-image">
        <img src={location.image} alt={location.name} />
      </div>
      
      <div className="location-info">
        <p><strong>Category:</strong> {location.category}</p>
        <p><strong>Rating:</strong> {'⭐'.repeat(Math.round(parseFloat(location.rating)))}</p>
        <p><strong>Visits:</strong> {location.visitCount} MapMates users have visited here</p>
        <p><strong>Address:</strong> {location.address}</p>
        <p>{location.description}</p>
      </div>
      
      <div className="location-actions">
        <Link to={`/maps?lat=${location.coordinates[0]}&lng=${location.coordinates[1]}`} className="view-on-map">
          <button>View on Map</button>
        </Link>
      </div>
      
      <div className="location-navigation">
        <Link to="/feed" className="back-link">
          &larr; Back to Feed
        </Link>
      </div>
      
      <style jsx>{`
        .location-detail-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .location-image {
          margin-bottom: 20px;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .location-image img {
          width: 100%;
          border-radius: 8px;
        }
        
        .location-info {
          background-color: rgba(15, 23, 42, 0.85);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          color: white;
        }
        
        .location-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .location-actions button {
          background-color: #EDA2C0;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .location-actions button:hover {
          background-color: #e87daa;
          transform: translateY(-2px);
        }
        
        .location-navigation {
          margin-top: 20px;
        }
        
        .back-link {
          color: #EDA2C0;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        
        .back-link:hover {
          color: #e87daa;
          transform: translateX(-5px);
        }
        
        .loading, .error-container {
          text-align: center;
          padding: 40px;
          margin-top: 20px;
        }
        
        .error {
          color: #ff4d4d;
          background-color: rgba(255, 77, 77, 0.1);
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .back-button {
          background-color: #EDA2C0;
          color: white;
          text-decoration: none;
          padding: 10px 15px;
          border-radius: 5px;
          transition: all 0.2s ease;
        }
        
        .back-button:hover {
          background-color: #e87daa;
        }
      `}</style>
    </div>
  );
}

export default SimpleLocationDetail;