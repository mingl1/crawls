"use client";
import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import { useLoadScript } from "@react-google-maps/api";
const center = {
  lat: 40.72105,
  lng: -73.99672,
};
const options = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  streetViewControl: false,
  fullscreenControl: false,
  mapTypeControl: false,
  zoomControl: false,
};

const script = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
  libraries: ["places"],
};
export default function Map() {
  const { isLoaded } = useLoadScript(script);

  if (!isLoaded) {
    return <div className="self-center text-center">Loading...</div>;
  }
  return <MapView />;
}

function MapView() {
  const [origin, setOrigin] = useState(null);
  const mapRef = useRef();
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  return (
    <>
      <div className="absolute left-2 top-2 z-10 max-w-sm bg-transparent search">
        <Places
          setOrigin={(position) => {
            setOrigin(position);
            mapRef.current.panTo(position);
          }}
          className="w-full"
        />
      </div>
      <GoogleMap
        zoom={14.5}
        center={center}
        mapContainerClassName="map-view"
        options={options}
        onLoad={onLoad}
      >
        {origin && <Marker position={origin} />}
      </GoogleMap>
    </>
  );
}
