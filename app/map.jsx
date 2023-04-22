"use client";
import { useState, useCallback, useRef, useEffect } from "react";
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
let circle, service, originMarker;
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

  useEffect(() => {
    originMarker = new google.maps.Marker({
      map: mapRef.current,
      place: {
        placeId: origin.placeId,
        location: origin.location,
      },
    });
    async function fetchItems() {
      let center = origin;
      circle = new window.google.maps.Circle({
        center: center.location,
        radius: 450,
        options: walkable,
      });

      circle.setMap(mapRef.current);

      await fetch(`/api/yelp/${center.location.lat}/${center.location.lng}`)
        .then((res) => res.json())
        .then((business) =>
          business[0]
            ? setSpots(business)
            : setSpots([
                {
                  name: "no crawls found",
                  coordinates: {
                    latitude: center.location.lat,
                    longitude: center.location.lng,
                  },
                  alias: "no-results nearby",
                },
              ])
        );
    }
    if (mapRef.current != null) {
      mapRef.current.panTo(origin.location);
      fetchItems();
    }
  }, [origin]);

  const fetchDirections = async (destination, index) => {
    originMarker.setMap(null);
    const pos = {
      lat: destination.coordinates.latitude,
      lng: destination.coordinates.longitude,
    };
    if (
      !destination ||
      (pos.lat == origin.location.lat && pos.lng == origin.location.lng)
    )
      return;
    const directionsService = new window.google.maps.DirectionsService();
    // const temp = places.filter(
    //   (place) =>
    //     place.location.lat != destination.lat &&
    //     place.location.lng != destination.lng
    // );
    const filtered = places.filter((val, ind) => ind != index);
    console.log(filtered);
    directionsService.route(
      {
        origin: { placeId: origin.placeId },
        destination: pos,
        waypoints: filtered,
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
                place.coordinates.latitude == pos.lat &&
                place.coordinates.longitude == pos.lng
            )[0]
          );
          setSpots(x);

          directionsRenderer.setMap(mapRef.current);
        }
      }
    );
    setShown(false);
  };
  return (
    <div>
      <div className="absolute left-2 top-2 z-10 w-[98%] lg:max-w-sm ">
        <Places
          setOrigin={(address) => {
            const request = {
              query: address,
              fields: ["name", "place_id", "geometry"],
            };
            service = new window.google.maps.places.PlacesService(
              mapRef.current
            );
            service.findPlaceFromQuery(request, (results, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                setOrigin({
                  placeId: results[0].place_id,
                  location: results[0].geometry.location.toJSON(),
                });
              }
            });

            if (circle != null) {
              circle.setMap(null);
            }
            if (directionsRenderer != null) {
              directionsRenderer.setMap(null);
              setShown(true);
            }
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
        {spots[0] != null && (
          <div>
            {/* <Marker position={origin} visible={shown} /> */}
            {spots?.map((loc, counter) => {
              const pos = {
                lat: loc.coordinates.latitude,
                lng: loc.coordinates.longitude,
              };
              const request = {
                query: loc.name + " " + loc.location.address1,
                fields: ["name", "place_id", "geometry"],
              };
              service = new window.google.maps.places.PlacesService(
                mapRef.current
              );
              service.findPlaceFromQuery(request, (results, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  results
                ) {
                  places.push({
                    location: { placeId: results[0].place_id },
                    // id: loc.id,
                  });
                }
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
                  key={counter}
                  position={pos}
                  onDblClick={() => {
                    fetchDirections(loc, counter);
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
