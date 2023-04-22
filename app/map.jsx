"use client";
import { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  // DirectionsRenderer,
  // Circle,
  // MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import { useLoadScript } from "@react-google-maps/api";
// import { getLatLng } from "use-places-autocomplete";
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

const lib = ["places"];

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

    await fetch(`/api/yelp/${center.lat}/${center.lng}`)
      .then((res) => res.json())
      .then((business) =>
        business[0]
          ? setSpots(business)
          : setSpots([
              {
                name: "no crawls found",
                coordinates: {
                  latitude: center.lat,
                  longitude: center.lng,
                },
                alias: "no-results nearby",
              },
            ])
      );
  };

  const fetchDirections = async (destination) => {
    if (
      !destination ||
      (destination.lat == origin.lat && destination.lng == origin.lng)
    )
      return;
    const directionsService = new window.google.maps.DirectionsService();
    const temp = places.filter(
      (place) =>
        place.location.lat != destination.lat &&
        place.location.lng != destination.lng
    );
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: temp,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // setDirections(result);
          directionsRenderer = new window.google.maps.DirectionsRenderer({
            directions: result,
          });
          const x = [];
          for (let i = 0; i < result.routes[0].legs.length; i++) {
            for (let j = 0; j < spots.length; j++) {
              if (
                result.routes[0].legs[i].start_address.includes(
                  spots[j].location.address1
                )
              ) {
                x.push(spots[j]);
                break;
              }
            }
          }
          x.push(
            spots.filter(
              (place) =>
                place.coordinates.latitude == destination.lat &&
                place.coordinates.longitude == destination.lng
            )[0]
          );
          setSpots(x);
          // console.log(result.routes[0].legs[0].start_location.toJSON());
          // setSpots()
          directionsRenderer.setMap(mapRef.current);
        }
      }
    );
    // console.log(directionsService);
    setShown(false);
  };
  return (
    <div>
      <div className="absolute left-2 top-2 z-10 w-[98%] lg:max-w-sm ">
        <Places
          setOrigin={(position) => {
            setOrigin(position);
            {
              mapRef.current && mapRef.current.panTo(position);
            }
            if (circle != null) {
              circle.setMap(null);
            }
            if (directionsRenderer != null) {
              directionsRenderer.setMap(null);
              setShown(true);
            }
            fetchItems(position);
          }}
          spots={spots}
          show={shown}
        />
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
                    // opacity: 1,
                    className: "translate-x-2/3",
                  }}
                  key={loc.id}
                  position={pos}
                  onDblClick={() => {
                    fetchDirections(pos);
                  }}
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
