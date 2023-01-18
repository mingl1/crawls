import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
const center = {
  lat: 40.72105,
  lng: -73.99672,
};
export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
  });
  if (!isLoaded)
    return <div className="self-center text-center">Loading...</div>;
  return <MapView />;
}

function MapView() {
  return (
    <GoogleMap
      zoom={14.5}
      center={center}
      mapContainerClassName="map-view"
      options={{
        mapId: process.env.NEXT_PUBLIC_MAP_ID,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        zoomControl: false,
      }}
    ></GoogleMap>
  );
}
