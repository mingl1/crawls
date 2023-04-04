"use client";
import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  // DirectionsRenderer,
  // Circle,
  // MarkerClusterer,
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

// const houses = useMemo(()=>
export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
    libraries: lib,
  });

  if (!isLoaded) {
    return <div className="self-center text-center">Loading...</div>;
  }
  return <MapView />;
}
let circle;
let directionsRenderer;

const styles = {
  default: [],
  hide: [
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
};

function MapView() {
  const [origin, setOrigin] = useState(center);
  const [spots, setSpots] = useState([]);
  const [directions, setDirections] = useState(null);
  const [shown, setShown] = useState(true);
  const mapRef = useRef();
  const places = [];
  const onLoad = useCallback((map) => (mapRef.current = map), []);
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
        waypoints: places,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          directionsRenderer = new window.google.maps.DirectionsRenderer({
            directions: result,
            zIndex: 50,
          });
          console.log(directionsRenderer);
          directionsRenderer.setMap(mapRef.current);
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
            if (directionsRenderer != null) {
              directionsRenderer.setMap(null);
              setShown(true);
            }
            // mapRef.current.options = {
            //   ...mapRef.current.optioions,
            //   styles: styles["hide"],
            // };

            fetchItems(position);
          }}
          className="w-full"
          spots={spots}
        />
        {/* <div className="w-24 h-24 bg-violet-700 z-50 relative"></div> */}
      </div>
      <GoogleMap
        zoom={14.5}
        center={center}
        mapContainerClassName="map-view"
        options={options}
        onLoad={onLoad}
      >
        {origin != center && (
          <div>
            <Marker position={origin} visible={shown} />
            {spots?.map((loc) => {
              const pos = {
                lat: loc.coordinates.latitude,
                lng: loc.coordinates.longitude,
              };

              places.push({
                location: {
                  ...pos,
                },
              });

              return (
                <Marker
                  label={{
                    text: loc.name,
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    opacity: 1,
                    className: "translate-x-2/3",
                  }}
                  key={loc.id}
                  position={pos}
                  onDblClick={() => {
                    fetchDirections(pos);
                  }}
                  // className="opacity-50"
                  opacity={0.7}
                  visible={shown}
                  onMouseOver={() => {
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
