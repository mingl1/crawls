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
    <Combobox onSelect={handleSelect} className="w-full">
      <ComboboxInput
        placeholder="search an addresss"
        value={value}
        disabled={!ready}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-2 rounded-t-lg bg-[#3A5A40] text-white 
    placeholder-[#DAD7CD]
    focus:outline-none"
      />
      <ComboboxPopover className="bg-none">
        <ComboboxList className="bg-forest rounded-b-md to-pea text-egg w-full">
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <div key={place_id} className="flex hover:bg-[#426446]">
                <i class="fa-solid fa-location-dot"></i>
                {/* <FontAwesomeIcon icon="fa-solid fa-location-dot" /> */}
                <ComboboxOption value={description} className="flex-1" />
              </div>
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
