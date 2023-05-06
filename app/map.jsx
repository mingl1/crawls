/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Places from "./places";
import { useLoadScript } from "@react-google-maps/api";
import d from "./assets/default.png";
import Image from "next/image";
const center = {
  lat: 40.72105,
  lng: -73.99672,
};

const options = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  streetViewControl: false,
  fullscreenControl: false,
  mapTypeControl: false,
  zoomControl: true,
};

export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen">
        <Image src={d} alt="loading" className="w-full h-full" />
      </div>
    );
  }
  return <MapView />;
}
let circle,
  directionsRenderer,
  service,
  originMarker,
  // directionService,
  place_ids;

function MapView() {
  const [origin, setOrigin] = useState(center);
  const [spots, setSpots] = useState([]);
  const [shown, setShown] = useState(true);
  const [details, setDetails] = useState(false);
  const mapRef = useRef();

  const [commited, setCommited] = useState(false);
  // console.log("rerendering");
  useEffect(() => {
    if (mapRef.current != null) {
      mapRef.current.panTo(origin.location);
      setCommited(false);
      const fetchItems = async (center) => {
        if (originMarker != null) originMarker.setMap(null);
        originMarker = new google.maps.Marker({
          map: mapRef.current,
          place: {
            placeId: origin.placeId,
            location: origin.location,
          },
        });
        circle = new window.google.maps.Circle({
          center: center,
          radius: 500,
          options: walkable,
        });
        center = center.toJSON();
        circle.setMap(mapRef.current);
        // service = new google.maps.places.PlacesService(mapRef.current);
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
                  coordinates: {
                    latitude: center.lat,
                    longitude: center.lng,
                  },
                  alias: "no-results nearby",
                  rating: -1,
                },
              ]);
            }
          });
      };
      fetchItems(origin.location);
    }
  }, [origin]);
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  function selectDestination(loc) {
    // service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      query: loc.name + " " + loc.location.address1,
      fields: ["name", "place_id", "geometry"],
    };
    service.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        fetchDirections(
          {
            placeId: results[0].place_id,
            location: results[0].geometry.location,
          },
          loc
        );
      }
    });
  }
  const fetchDirections = async (destination, dest) => {
    originMarker.setMap(null);
    place_ids = spots
      .map((spot) => ({
        location: { placeId: spot.placeId },
        stopover: true,
      }))
      .filter((spot) => spot.location.placeId != destination.placeId);
    const directionService = new window.google.maps.DirectionsService().route(
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
            preserveViewport: true,
          });

          setSpots((prev) => [
            ...result.routes[0].waypoint_order
              .map((value) => place_ids[value].location.placeId)
              .map((value) => prev.find((spot) => spot.placeId == value)),
            dest,
          ]);

          mapRef.current.fitBounds(circle.getBounds());
          setCommited(true);
          directionsRenderer.setMap(mapRef.current);
        }
      }
    );
    setShown(false);
  };

  const toGoogleMaps = () => {
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin.location
    )}&origin_place_id=${encodeURIComponent(
      origin.placeId
    )}&destination=${encodeURIComponent(
      spots[spots.length - 1].alias
    )}&destination_place_id=${encodeURIComponent(
      spots[spots.length - 1].placeId
    )}&travelmode=WALKING&waypoints=`;
    for (let i = 0; i < spots.length - 1; i++) {
      url = url + encodeURIComponent(spots[i].alias) + "%7C";
    }
    url += "&waypoint_place_ids=";
    for (let i = 0; i < spots.length - 1; i++) {
      url = url + encodeURIComponent(spots[i].placeId) + "%7C";
    }

    window.open(url, "_blank");

    console.log(url);
  };
  return (
    <>
      <div>
        <div className="absolute left-2 top-2 z-10 w-[98%] lg:max-w-sm ">
          <Places
            setOrigin={(position) => {
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
                }
              });

              if (circle != null) {
                circle.setMap(null);
              }
              if (directionsRenderer != null) {
                directionsRenderer.setMap(null);
                setShown(true);
              }
              setDetails(true);
            }}
            toGoogleMaps={toGoogleMaps}
            spots={spots}
            show={shown}
            setSpots={setSpots}
            commited={commited}
            details={details}
            selectDestination={selectDestination}
          />
        </div>
        <GoogleMap
          zoom={14.5}
          center={center}
          mapContainerClassName="map-view"
          options={options}
          onLoad={onLoad}
        >
          {shown && (
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
                    onClick={() => selectDestination(loc)}
                    opacity={0.7}
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
