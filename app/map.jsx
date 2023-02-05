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
import axios from "axios";

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

// const houses = useMemo(()=>
export default function Map() {
  const { isLoaded } = useLoadScript(script);

  if (!isLoaded) {
    return <div className="self-center text-center">Loading...</div>;
  }
  return <MapView />;
}

function MapView() {
  const [origin, setOrigin] = useState(null);
  const [spots, setSpots] = useState([]);
  const mapRef = useRef();
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  const fetchItems = async (center) => {
    const data = await axios
      .get(
        `${"https://cors-anywhere.herokuapp.com/"}https://api.yelp.com/v3/businesses/search?latitude=${
          center.lat
        }&longitude=${center.lng}&term=resturants&radius=500&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_YELP_API_KEY}`,
          },
          params: {
            // latitude: center.lat,
            // longitude: center.lng,
            // term: "resturants",
            // radius: 500,
            // limit: 20,
            // sort_by: "relevance",
          },
        }
      )
      .then((json) => {
        setSpots(json.data.businesses);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <div className="absolute left-2 top-2 z-10 max-w-sm bg-transparent search">
        <Places
          setOrigin={(position) => {
            setOrigin(position);
            mapRef.current.panTo(position);
            fetchItems(position);
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
        {origin && (
          <>
            <Marker position={origin} />
            {spots.map((loc) => {
              const pos = {
                lat: loc.coordinates.latitude,
                lng: loc.coordinates.longitude,
              };
              return <Marker key={loc.id} position={pos} />;
            })}
          </>
        )}
        <Circle
          center={origin}
          radius={500}
          options={walkable}
          visible={true}
        />
      </GoogleMap>
    </>
  );
}
const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};

const walkable = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#07da63",
  fillColor: "#07da63",
};
const train = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  //hex for yellow
  strokeColor: "#FFEB3B",
  fillColor: "#FFEB3B",
};
