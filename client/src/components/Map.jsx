import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import userIconImg from '../assets/user.png';
import visited from '../assets/visited.png';
import notVisited from '../assets/notVisited.png';
import { RestButton, ButtonContainer } from "./RestButton";
import { Link } from "react-router-dom";

const hobokenBounds = [
  [40.7684, -74.0401],
  [40.7311, -74.0122]
];

const createCustomIcon = (iconUrl) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const createCustomIcon1 = (iconUrl) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [28, 28],
    iconAnchor: [10, 30],
    popupAnchor: [0, -40]
  });
};

function MapBoundary() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(hobokenBounds);
    map.options.minZoom = 14;
    map.options.maxBoundsViscosity = 1.0;
  }, [map]);
  return null;
}

function LocationMarker({ onLocationFound }) {
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
        map.flyTo(e.latlng, map.getZoom());
        if (onLocationFound) {
          onLocationFound(e.latlng);
        }
      } else {
        console.log("Location outside of Hoboken");
      }
    });

    return () => {
      map.stopLocate();
    };
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
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    id: user
  });
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [visitedIds, setVisitedIds] = useState(() => {
    const saved = localStorage.getItem("visitedRestaurantIds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  useEffect(() => {
    fetchRestaurants();
    fetchUser();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:3000/restaurants/');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/getuser', {
        method: 'GET',
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setFormData({
        ...formData,
        id: data.user._id
      });
      setUser(data.user._id);
      console.log(data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const addNewRestaurant = async (newRestaurant) => {
    try {
      const response = await fetch(`http://localhost:3000/restaurants/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRestaurant)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setFormData({ name: "", type: "", id: "" });
      setShowForm(false);
      fetchRestaurants();

    } catch (e) {
      console.error("Error adding restaurant:", e.message);
    }
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSearchRestaurantSubmit = async (e) => {
    e.preventDefault();
    const selectedCuisine = e.target.cuisine.value;

    try {
      const response = await fetch(`http://localhost:3000/restaurants/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: selectedCuisine })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Search results:", data);
      setRestaurants(data);
      setShowSearchForm(false);

    } catch (err) {
      console.error("Error searching restaurants:", err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!userLocation) {
      alert("User location not available yet.");
      return;
    }

    const newRestaurant = {
      name: formData.name,
      type: formData.type,
      id: formData.id,
      visitedAt: new Date().toISOString(),
      coordinates: {
        lat: userLocation.lat,
        long: userLocation.lng
      }
    };

    await addNewRestaurant(newRestaurant);
  };

  const handleAddRestaurantClick = () => {
    setShowForm(true);
    setShowSearchForm(false);
  };

  const handleSearchRestaurant = () => {
    setShowSearchForm(true);
    setShowForm(false);
  }

  const handleChangeRestaurantPinColor = async (id, name, type) => {
    console.log("Changing pin color for restaurant:", id, name, type);
    setVisitedIds(prev => {
      const updated = new Set(prev);
      updated.add(id);
      localStorage.setItem("visitedRestaurantIds", JSON.stringify(Array.from(updated)));
      return updated;
    });

    await addNewRestaurant({
      name: name,
      type: type,
      id: user,
      visitedAt: new Date().toISOString(),
      coordinates: {
        lat: userLocation.lat,
        long: userLocation.lng
      }
    });

  };
  const hobokenCenter = [40.7440, -74.0254];

  const handleUpdateVisitedRestaurant = async (id) => {
    console.log("Updating visited restaurant:", id);
    const update = await fetch(`http://localhost:3000/restaurants/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, visitedAt: new Date().toISOString() })
    });
    if (!update.ok) {
      throw new Error(`HTTP error! Status: ${update.status}`);
    }
    const data = await update.json();
    console.log("Update response:", data);

  }

  return (
    <>
      <div>
        <h1>Welcome to your Map:</h1>
      </div>


      <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '20px' }}>
        <ButtonContainer>
          <RestButton text="Add Restaurant" onClick={handleAddRestaurantClick} />
          <RestButton text="Filter Restaurants" onClick={handleSearchRestaurant} />

        </ButtonContainer>
      </div>

      <div style={{ alignItems: 'center', marginBottom: '20px' }}>

        {showSearchForm && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <h3>Search Restaurant</h3>
            <form onSubmit={handleSearchRestaurantSubmit}>
              <div>
                <label htmlFor="cuisine">Cuisine:</label>
                <select id="cuisine" name="cuisine">
                  <option value="mexican">Mexican</option>
                  <option value="indian">Indian</option>
                  <option value="chinese">Chinese</option>
                  <option value="italian">Italian</option>
                  <option value="cuban">Cuban</option>
                  <option value="vietnamese">Vietnamese</option>
                </select>
              </div>
              <button type="submit" style={{ marginTop: '10px' }}>Search</button>
              <button
                type="button"
                style={{ marginLeft: '10px' }}
                onClick={() => setShowSearchForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {showForm && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <h3>Add New Restaurant</h3>
            <form onSubmit={handleFormSubmit}>
              <div>
                <label>Restaurant Name: </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label>Restaurant Type: </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                />
              </div>
              {/* <div>
                <label>user id: </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleFormChange}
                  required
                />
              </div> */}
              <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
              <button
                type="button"
                style={{ marginLeft: '10px' }}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>


      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer
          center={hobokenCenter}
          zoom={15}
          style={{ height: '100%', width: '100%', borderRadius: '10px' }}
          maxBounds={hobokenBounds}
          maxBoundsViscosity={1.0}
          minZoom={14}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBoundary />
          <LocationMarker onLocationFound={setUserLocation} />

          {restaurants
            .filter(restaurant => restaurant.type === 'Feature' && restaurant.geometry?.coordinates)
            .map((restaurant, index) => {
              const [lon, lat] = restaurant.geometry.coordinates;
              const restaurantId = restaurant.properties.id || `${restaurant.properties.name}-${index}`;
              const isVisited = visitedIds.has(restaurantId);

              const icon = isVisited ? createCustomIcon1(visited) : createCustomIcon(notVisited);
              return (
                <Marker
                  key={index}
                  position={[lat, lon]}
                  icon={icon}
                >
                  <Popup>
                    <div>
                      <h3>{restaurant.properties.name}</h3>
                      <p>{restaurant.properties.formatted}</p>
                      {restaurant.properties.contact?.phone && (
                        <p>Phone: {restaurant.properties.contact.phone}</p>
                      )}
                      {restaurant.properties.website && (
                        <p><a href={restaurant.properties.website} target="_blank" rel="noopener noreferrer">Website</a></p>
                      )}
                      {!isVisited ? (
                        <button onClick={() => handleChangeRestaurantPinColor(
                          restaurantId,
                          restaurant.properties.name,
                          restaurant.properties.datasource.raw.cuisine?.toLowerCase() ? 'restaurant' : 'other'
                        )}>
                          Already visited this place? Make it blue!
                        </button>
                      ) : (
                        <button onClick={() => handleUpdateVisitedRestaurant(user, restaurant.properties.name)}>
                          Update visit date!
                        </button>)}


                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {restaurants
            .filter(user => Array.isArray(user.visitedPlaces))
            .flatMap((user, userIndex) =>
              user.visitedPlaces
                .filter(place => {
                  const coords = place.coordinates || {};
                  const lat = coords.lat ?? coords.latitude;
                  const lng = coords.long ?? coords.longitude;
                  return typeof lat === 'number' && typeof lng === 'number';
                })
                .map((place, placeIndex) => {
                  const coords = place.coordinates || {};
                  const lat = coords.lat ?? coords.latitude;
                  const lng = coords.long ?? coords.longitude;

                  return (
                    <Marker
                      key={`mongo-${userIndex}-${placeIndex}`}
                      position={[lat, lng]}
                      icon={createCustomIcon1(visited)}
                    >
                      <Popup>
                        <div>
                          <h3>{place.place}</h3>
                          <p>Type: {place.cuisine}</p>
                          <p>Visited: {new Date(place.visitedAt).toLocaleDateString()}</p>
                          <button> Update visit date!</button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })
            )}



        </MapContainer>



      </div>
    </>
  );
};

export default Map;
