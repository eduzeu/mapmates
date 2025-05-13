import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import notVisited from '../assets/notVisited.png';
import userIconImg from '../assets/user.png';
import visited from '../assets/visited.png';
import { validateCuisine, validateObjectId, validateReviewImage, validateString } from '../validation.js';
import { ImageUpload } from "./ImageUpload.jsx";
import "./Map.css";
import { ButtonContainer, RestButton } from "./RestButton";

const hobokenBounds = [
  [40.7684, -74.0401],
  [40.7311, -74.0122]
];

const createCustomIcon = (iconUrl) => L.icon({
  iconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const createCustomIcon1 = (iconUrl) => L.icon({
  iconUrl,
  iconSize: [28, 28],
  iconAnchor: [10, 30],
  popupAnchor: [0, -40]
});

function MapBoundary() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(hobokenBounds);
    map.options.minZoom = 14;
    map.options.maxBoundsViscosity = 1.0;
  }, [map]);
  return null;
}

function LocationMarker({ onLocationFound, outsideOfHoboken }) {
  const [position, setPosition] = useState(null);
  const map = useMap();
  const userIcon = createCustomIcon(userIconImg);

  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true });
    map.on('locationfound', (e) => {
      const bounds = L.latLngBounds(hobokenBounds);
      const isInHoboken = bounds.contains(e.latlng);
      if (isInHoboken) {
        setPosition(e.latlng);
        outsideOfHoboken(false);
        map.flyTo(e.latlng, map.getZoom());
        onLocationFound?.(e.latlng);
      } else {
        outsideOfHoboken(true);
        console.log("Location outside of Hoboken");
      }
    });
    return () => map.stopLocate();
  }, [map, onLocationFound]);

  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function Map() {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "" });
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [visitedIds, setVisitedIds] = useState(() => {
    const saved = localStorage.getItem("visitedRestaurantIds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [currentRestaurantName, setCurrentRestaurantName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [reviewError, setReviewError] = useState(null);
  const [outsideOfHoboken, setOutsideOfHoboken] = useState(false);

  useEffect(() => {
    const init = async () => {
      const loggedInStatus = await isLoggedIn();
      if (loggedInStatus) {
        await fetchUser();

        await fetchRestaurants();
      }
    };
    init();
  }, []);

  const isLoggedIn = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/loggedIn', {
        method: 'GET',
        credentials: "include"
      });
      const data = await response.json();
      setLoggedIn(data.loggedIn);
      return data.loggedIn;
    } catch (err) {
      console.error("Error checking login:", err);
      setLoggedIn(false);
      return false;
    }
  };
  const
    removeDuplicates = (restaurants) => {
      const seen = new Set();
      return restaurants.filter((r) => {
        const coords = r.geometry?.coordinates;
        const name = r.properties?.name?.toLowerCase();
        if (!coords || !name) return false;

        const key = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}-${name}`;
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      });
    };


  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:3000/restaurants/', {
        method: 'GET',
        credentials: "include"
      });
      const data = await response.json();
      console.log("Fetched restaurants:", data);
      if (Array.isArray(data)) {
        setRestaurants(data);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/getUser', {
        method: 'GET',
        credentials: "include"
      });
      const data = await response.json();
      setFormData(prev => ({ ...prev, id: data.user._id }));
      setUser(data.user._id);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const addNewRestaurant = async (newRestaurant) => {
    if (!loggedIn) return alert("Must be logged in to add a restaurant");

    try {
      const response = await fetch('http://localhost:3000/restaurants/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(newRestaurant)
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const createdRestaurant = await response.json();

      setFormData({ name: "", type: "" });
      setShowForm(false);

      const id = createdRestaurant.id || createdRestaurant._id || createdRestaurant.properties?.id;
      if (id) {
        setVisitedIds(prev => {
          const updated = new Set(prev);
          updated.add(id);
          localStorage.setItem("visitedRestaurantIds", JSON.stringify(Array.from(updated)));
          return updated;
        });
      }

      fetchRestaurants();
    } catch (e) {
      console.error("Error adding restaurant:", e.message);
      alert(e.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (outsideOfHoboken) return alert("You must be within Hoboken to add restaurants.");
    if (!userLocation) return alert("User location not available yet.");

    let name = formData.name;
    let type = formData.type;

    try {
      name = validateString(name, "Restaurant Name");
      type = validateString(type, "Cuisine Type");

    } catch (e) {
      alert(e.message);
      return;
    }

    const newRestaurant = {
      name: name,
      type: type,
      id: user,
      visitedAt: new Date().toISOString(),
      coordinates: {
        lat: userLocation.lat,
        long: userLocation.lng
      }
    };

    await addNewRestaurant(newRestaurant);
  };

  const handleChangeRestaurantPinColor = async (id) => {
    setVisitedIds(prev => {
      const updated = new Set(prev);
      updated.add(id);
      localStorage.setItem("visitedRestaurantIds", JSON.stringify(Array.from(updated)));
      return updated;
    });

    await handleUpdateVisitedRestaurant(id);
  };

  const handleUpdateVisitedRestaurant = async (id) => {
    try {
      const update = await fetch('http://localhost:3000/restaurants/update/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ id, visitedAt: new Date().toISOString() })
      });
      const data = await update.json();
      console.log("Update response:", data);
    } catch (err) {
      console.error("Error updating restaurant:", err);
    }
  };

  const handleSearchRestaurantSubmit = async (e) => {
    e.preventDefault();
    let selectedCuisine = e.target.cuisine.value;

    try {
      selectedCuisine = validateCuisine(selectedCuisine, "Cuisine");

      const response = await fetch(`http://localhost:3000/restaurants/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ type: selectedCuisine })
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setRestaurants(data);
      } else {
        setRestaurants([]);
      }
      setShowSearchForm(false);
    } catch (err) {
      console.error("Error searching restaurants:", err);
      alert(err.message);
    }
  };

  const addReview = async (e) => {
    e.preventDefault();

    let userId = user;
    let restaurantName;
    let text;
    let image = {};

    try {
      userId = validateObjectId(userId, "User Id");
      restaurantName = validateString(currentRestaurantName, "Restaurant Name");
      text = validateString(reviewText, "Review Text");

      if (imageUrl) {
        image = validateReviewImage({ imageUrl: imageUrl, altText: altText }, "Review Image");
      }

    } catch (e) {
      setReviewError(e.message);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          userId: user,
          restaurantName: restaurantName,
          text: text,
          timestamp: new Date().toISOString(),
          "imageUrl": image.imageUrl ?? null,
          altText: image.imageUrl ? image.altText : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      console.log("Review submitted:", data);
      alert("Review has been added to the user feed!");

      setReviewError(null);
      setReviewText("");
      setShowReview(false);
      setCurrentRestaurantName("");
      setImageUrl(null);
      setAltText(null);

      await hasEarnedReviewBadge();

    } catch (err) {
      setReviewError(err.message);
      console.error(err.message);
      console.error("Error submitting review:", err);
    }
  };

  const hasEarnedReviewBadge = async () => {
    let userId = user;

    try {
      userId = validateObjectId(userId, "User Id");

    } catch (e) {
      alert(e.message);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/badges/review/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check if the Reviewer Badge has been earned.');
      }

      if (data["earned"] === true) {
        alert("Congratsulations! You've made 5 reviews and earned the Reviewer Badge!");
      }

    } catch (e) {
      alert(e.message);
    }
  }

  const hobokenCenter = [40.7440, -74.0254];

  if (!loggedIn) {
    return <div>Please log in to view your restaurants and map.</div>;
  }

  return (
    <>
      <div><h1>Welcome to your Map:</h1></div>
      <h3> How it works? </h3>

      <div className="how-it-works">
        <h3>📍 How It Works</h3>
        <ul>
          <li><span className="emoji">🩷</span> <strong>Pink pins</strong> = Not visited yet</li>
          <li><span className="emoji">🔵</span> <strong>Blue pins</strong> = Already visited</li>
          <li><span className="emoji">ℹ️</span> Click a pin to view details</li>
          <li><span className="emoji">📝</span> Click <em>"Leave a review"</em> to share your thoughts</li>
          <li><span className="emoji">✅</span> Click <em>"Make it blue"</em> on a pink pin to mark it visited</li>
          <li><span className="emoji">➕</span> You can add restaurants without visiting them — just drop a pin and later mark it as visited!</li>
          <li><span className="emoji">📌</span> This app uses coordinates: if you add multiple restaurants at the same spot, only one will show. Try walking around a bit to drop pins at new spots!</li>
        </ul>
      </div>


      <div className="button-container">
        <ButtonContainer>
          <RestButton text="Add Restaurant" onClick={() => { setShowForm(true); setShowSearchForm(false); }} />
          <RestButton text="Filter Restaurants" onClick={() => { setShowSearchForm(true); setShowForm(false); }} />
        </ButtonContainer>
      </div>

      {showSearchForm && (
        <div className='form-container'>
          <h3>Search Restaurant</h3>
          <form onSubmit={handleSearchRestaurantSubmit}>
            <label htmlFor="cuisine">Cuisine:</label>
            <select id="cuisine" name="cuisine">
              <option value="mexican">Mexican</option>
              <option value="indian">Indian</option>
              <option value="chinese">Chinese</option>
              <option value="italian">Italian</option>
              <option value="cuban">Cuban</option>
              <option value="vietnamese">Vietnamese</option>
            </select>
            <button className='submit-button' type="submit">Search</button>
            <button className='cancel-button' type="button" onClick={() => setShowSearchForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {showForm && (
        <div className='form-container'>
          <h3>Add New Restaurant</h3>
          <form onSubmit={handleFormSubmit}>
            <label>Restaurant Name:</label>
            <input type="text" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            <label>Restaurant Type:</label>
            <input type="text" name="type" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required />
            <button className='submit-button' type="submit">Submit</button>
            <button className='cancel-button' type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className='map-container'>
        <MapContainer
          className='map'
          center={hobokenCenter}
          zoom={15}
          maxBounds={hobokenBounds}
          maxBoundsViscosity={1.0}
          minZoom={14}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBoundary />
          <LocationMarker onLocationFound={setUserLocation} outsideOfHoboken={setOutsideOfHoboken} />

          {restaurants
            .filter(r => r.type === 'Feature' && r.geometry?.coordinates)
            .map((restaurant, index) => {
              const [lon, lat] = restaurant.geometry.coordinates;
              const restaurantId = restaurant.properties.id || `${restaurant.properties.name}-${index}`;
              const isVisited = visitedIds.has(restaurantId);
              const icon = isVisited ? createCustomIcon1(visited) : createCustomIcon(notVisited);
              return (
                <Marker key={index} position={[lat, lon]} icon={icon}>
                  <Popup>
                    <h3>{restaurant.properties.name}</h3>
                    <p>{restaurant.properties.formatted}</p>
                    {restaurant.properties.contact?.phone && <p>Phone: {restaurant.properties.contact.phone}</p>}
                    {restaurant.properties.website && (
                      <p><a href={restaurant.properties.website} target="_blank" rel="noopener noreferrer">Website</a></p>
                    )}
                    {!isVisited ? (
                      <button onClick={() => handleChangeRestaurantPinColor(
                        restaurantId,
                        restaurant.properties.name,
                        restaurant.properties.datasource?.raw?.cuisine?.toLowerCase() || "restaurant"
                      )}>
                        Already visited this place? Make it blue!
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateVisitedRestaurant(restaurantId)}>
                        Update visit date!
                      </button>
                    )}
                    <button onClick={() => {
                      setCurrentRestaurantName(restaurant.properties.name);
                      setShowReview(true);
                    }}>
                      Leave a review!
                    </button>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {showReview && (
        <div className='form-container'>
          <h3>Leave a Review for <em>{currentRestaurantName}</em></h3>
          <form onSubmit={addReview}>
            {reviewError && (
              <>
                <p className='error'>Error: {reviewError}</p>
                <br />
              </>
            )}
            <label>Review Text</label>
            <br />
            <textarea
              className='textarea'
              rows="4"
              cols="50"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Write your review here..."
            />
            {imageUrl && (
              <div className='image-container'>
                <img
                  className='image-item'
                  src={imageUrl}
                  alt={altText || "Your image"}
                />
              </div>
            )}
            {imageUrl && (
              <>
                <label>Image Alt Text</label>
                <br />
                <textarea
                  className='textarea'
                  rows="4"
                  cols="50"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  placeholder="Write alt text for your image here..."
                />
              </>
            )}
            <br />
            <ImageUpload setImageUrl={setImageUrl} setError={setReviewError} />
            <br />
            <br />
            {imageUrl && <button type='button' onClick={() => setImageUrl(null)}>Remove Image</button>}
            <br />
            <button className='submit-button' type='submit' >Submit</button>
            <button type='button' className='cancel-button' onClick={() => {
              setShowReview(false);
              setReviewText("");
              setCurrentRestaurantName("");
              setImageUrl(null);
              setAltText("");
              setReviewError(null);
            }}>Cancel</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Map;
