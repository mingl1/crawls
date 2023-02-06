"use client";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import location from "./assets/location.svg";
import Image from "next/image";

// import "@fortawesome/fontawesome-free/css/all.css";
export default function Places({ setOrigin }) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setOrigin({ lat, lng });
      console.log("Coordinates: ", { lat, lng });
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  return (
    <Combobox onSelect={handleSelect} className="w-full drop-shadow-md">
      <ComboboxInput
        placeholder="search an addresss"
        value={value}
        disabled={!ready}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-2 rounded-md bg-[#3A5A40] text-white 
    placeholder-[#DAD7CD]
    focus:outline-none"
      />
      <ComboboxPopover className="drop-shadow-md">
        <ComboboxList className="bg-forest rounded-md to-pea text-egg w-full">
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <div
                key={place_id}
                className="rounded-md flex hover:bg-[#426446] w-full p-1"
              >
                <div className="flex-1 max-w-[25px] ">
                  <Image
                    className=" w-full mx-auto"
                    src={location}
                    alt="location icon"
                    width="2"
                    height="5"
                  />
                </div>
                {/* <FontAwesomeIcon icon="fa-solid fa-location-dot" /> */}
                {/* <div className=""> */}
                <ComboboxOption
                  value={description}
                  className="flex-[5] my-auto align-middle truncate"
                  title={description}
                />
                {/* </div> */}
              </div>
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
