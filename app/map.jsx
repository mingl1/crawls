"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
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

export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <div className="self-center text-center">Loading...</div>;
  }
  return <MapView />;
}
let circle;
let directionsRenderer;
let service;
let originMarker;
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

  useEffect(() => {
    // console.log(origin.name);
    if (mapRef.current != null) {
      mapRef.current.panTo(origin.location);
      fetchItems(origin.location);
    }
  }, [origin]);
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  const fetchItems = async (center) => {
    originMarker = new google.maps.Marker({
      map: mapRef.current,
      place: {
        placeId: origin.placeId,
        location: origin.location,
      },
    });
    circle = new window.google.maps.Circle({
      center: center,
      radius: 450,
      options: walkable,
    });
    center = center.toJSON();
    circle.setMap(mapRef.current);
    service = new google.maps.places.PlacesService(mapRef.current);

    await fetch(`/api/yelp/${center.lat}/${center.lng}`)
      .then((res) => res.json())
      .then((business) => {
        if (business[0] != null) {
          business.map((item) => {
            const req = {
              query: item.name + " " + item.location.address1,
              fields: ["name", "place_id", "geometry"],
            };
            service.findPlaceFromQuery(req, (results, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                console.log({ ...item, placeId: results[0].place_id });
                setSpots((prev) => [
                  ...prev,
                  { ...item, placeId: results[0].place_id },
                ]);
              }
            });
          });
        } else {
          setSpots([
            {
              name: "no crawls found",
              location: {
                latitude: center.lat,
                longitude: center.lng,
              },
              alias: "no-results nearby",
            },
          ]);
        }
      });
  };

  const fetchDirections = async (destination, dest) => {
    originMarker.setMap(null);
    // console.log(spots);
    console.log(spots);

    const place_ids = spots
      .map((spot) => ({
        location: { placeId: spot.placeId },
        stopover: true,
      }))
      .filter((spot) => spot.location.placeId != destination.placeId);

    const directionsService = new window.google.maps.DirectionsService(
      mapRef.current
    );
    directionsService.route(
      {
        origin: { placeId: origin.placeId },
        destination: { placeId: destination.placeId },
        waypoints: place_ids,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer = new window.google.maps.DirectionsRenderer({
            directions: result,
          });

          setSpots((prev) => [
            ...result.routes[0].waypoint_order
              .map((value) => place_ids[value].location.placeId)
              .map((value) => prev.find((spot) => spot.placeId == value)),
            dest,
          ]);
          directionsRenderer.setMap(mapRef.current);
        }
      }
    );
    setShown(false);
  };
  return (
    <>
      <div>
        <div className="absolute left-2 top-2 z-10 w-[98%] lg:max-w-sm ">
          <Places
            setOrigin={(position) => {
              console.log(position);
              const request = {
                query: position,
                fields: ["name", "place_id", "geometry"],
              };
              service = new google.maps.places.PlacesService(mapRef.current);
              service.findPlaceFromQuery(request, (results, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  results
                ) {
                  setOrigin({
                    placeId: results[0].place_id,
                    location: results[0].geometry.location,
                  });
                  // }
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
            setSpots={setSpots}
          />
        </div>
        <GoogleMap
          zoom={14.5}
          center={center}
          mapContainerClassName="map-view"
          options={options}
          onLoad={onLoad}
        >
          {spots != null && spots[0] != null && (
            <div>
              {spots?.map((loc, count) => {
                const pos = {
                  lat: loc.coordinates.latitude,
                  lng: loc.coordinates.longitude,
                };

                return (
                  <Marker
                    label={{
                      text: loc.name,
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      className: "translate-x-2/3",
                    }}
                    key={count}
                    position={pos}
                    onDblClick={() => {
                      service = new window.google.maps.places.PlacesService(
                        mapRef.current
                      );
                      const request = {
                        query: loc.name + " " + loc.location.address1,
                        fields: ["name", "place_id", "geometry"],
                      };
                      service.findPlaceFromQuery(request, (results, status) => {
                        if (
                          status ===
                            google.maps.places.PlacesServiceStatus.OK &&
                          results
                        ) {
                          fetchDirections(
                            {
                              placeId: results[0].place_id,
                              location: results[0].geometry.location,
                            },
                            loc
                          );
                        }
                      });
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
      {/* <Example /> */}
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
