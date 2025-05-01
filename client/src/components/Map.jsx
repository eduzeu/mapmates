import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import userIconImg from '../assets/user.png';
import visited from '../assets/visited.png';
import notVisited from '../assets/notVisited.png';
import { RestButton, ButtonContainer } from "./RestButton";

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
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    id: ""
  });

  useEffect(() => {
    fetchRestaurants();
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
      setFormData({ name: "", type: "" });
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
  };

  const hobokenCenter = [40.7440, -74.0254];

  return (
    <>
      <div>
        <h1>Welcome to your Map:</h1>
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
              return (
                <Marker
                  key={index}
                  position={[lat, lon]}
                  icon={createCustomIcon(notVisited)}
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
                        </div>
                      </Popup>
                    </Marker>
                  );
                })
            )}



        </MapContainer>

        <div>
          <ButtonContainer>
            <RestButton text="Add Restaurant" onClick={handleAddRestaurantClick} />
            <RestButton text="Delete Restaurant" />
          </ButtonContainer>
        </div>

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
              <div>
                <label>user id: </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <button type="submit" style={{ marginTop: '10px' }}>Submit</button>
            </form>
          </div>
        )}


      </div>
    </>
  );
};

export default Map;
