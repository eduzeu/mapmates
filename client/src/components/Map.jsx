import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import userIconImg from '../assets/user.png'; 

const hobokenBounds = [
  [40.7684, -74.0401], 
  [40.7311, -74.0122]  
];

const createCustomIcon = () => {
  return L.icon({
    iconUrl: userIconImg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
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

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();
  const userIcon = createCustomIcon();
  
  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true });
    
    map.on('locationfound', (e) => {
      const bounds = L.latLngBounds(hobokenBounds);
      const isInHoboken = bounds.contains(e.latlng);
      
      if (isInHoboken) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      } else {
        console.log("Location outside of Hoboken");
      }
    });
    
    return () => {
      map.stopLocate();
    };
  }, [map]);
  
  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function Map() {
  const hobokenCenter = [40.7440, -74.0254];

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer 
        center={hobokenCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        maxBounds={hobokenBounds}
        maxBoundsViscosity={1.0}
        minZoom={14}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundary />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default Map;