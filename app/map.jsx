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
const lib = ["maps", "places"];
const script = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
  libraries: lib,
};

// const houses = useMemo(()=>
export default function Map() {
  const { isLoaded } = useLoadScript(script);

  if (!isLoaded) {
    return <div className="self-center text-center">Loading...</div>;
  }
  return <MapView />;
}
let circle;
function MapView() {
  const [origin, setOrigin] = useState(center);
  const [spots, setSpots] = useState([]);
  const [directions, setDirections] = useState(null);
  const [shown, setShown] = useState(true);
  // const places = [];
  const mapRef = useRef();
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  // console.log(places);
  console.log(spots);
  const fetchItems = async (center) => {
    circle = new window.google.maps.Circle({
      center: center,
      radius: 450,
      options: walkable,
    });

    circle.setMap(mapRef.current);

    const res = await fetch(`/api/yelp/${center.lat}/${center.lng}`)
      .then((res) => res.json())
      .then((business) => setSpots(business));
  };

  const fetchDirections = async (destination) => {
    if (!destination || destination === origin) return;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: spots,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      }
    );
    setShown(false);
  };
  return (
    <div>
      <div className="absolute left-2 top-2 z-10 max-w-sm bg-transparent search">
        <Places
          setOrigin={(position) => {
            setOrigin(position);
            mapRef.current.panTo(position);
            if (circle != null) {
              circle.setMap(null);
            }
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
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              zIndex: 50,
            }}
          />
        )}

        {origin != center && (
          <div>
            <Marker position={origin} visible={shown} />
            {/* <Circle center={origin} radius={450} options={walkable} /> */}
            {spots?.map((loc) => {
              const pos = {
                lat: loc.coordinates.latitude,
                lng: loc.coordinates.longitude,
              };
              // places.push({
              //   location: {
              //     lat: loc.coordinates.latitude,
              //     lng: loc.coordinates.longitude,
              //   },
              // });
              return (
                <Marker
                  label={loc.name}
                  key={loc.id}
                  position={pos}
                  onDblClick={() => fetchDirections(pos)}
                  // className="opacity-50"
                  opacity={0.7}
                  visible={shown}
                  onMouseOver={() => {
                    // setOpacity((prev) => ({
                    //   ...prev,
                    //   [loc.id]: 1,
                    // }));
                    console.log("over");
                  }}
                />
              );
            })}
          </div>
        )}
      </GoogleMap>
    </div>
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
