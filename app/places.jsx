import usePlacesAutocomplete from "use-places-autocomplete";
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
import noResults from "./assets/noResults.png";

export default function Places({ setOrigin, spots, show, setSpots }) {
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
      setSpots([]);
      setOrigin(address);
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  return (
    <Combobox
      onSelect={handleSelect}
      className="w-full drop-shadow-md "
      openOnFocus
    >
      <ComboboxInput
        placeholder="Got a place in mind?"
        value={value}
        disabled={!ready}
        onChange={(e) => setValue(e.target.value)}
        className="p-2 rounded-md bg-[#3A5A40] text-white 
    placeholder-[#DAD7CD]
    focus:outline-none w-[98%] placeholder:text-[#AFC0AF] font-medium placeholder:font-normal tracking-wide"
        autoFocus={true}
        onFocus={() => {
          document.querySelector("[hidden]").style.display = "block";
        }}
      />
      <ComboboxPopover className="drop-shadow-md">
        <ComboboxList className="bg-forest/75 rounded-md to-pea text-[#D1D1D1] w-full">
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
                <ComboboxOption
                  value={description}
                  className="flex-[5] my-auto align-middle truncate"
                  title={description}
                />
              </div>
            ))}
        </ComboboxList>

        {spots != null && spots[0] != null && (
          <div className="w-full bg-gradient-to-b from-forest to-[#5a533a] z-50 relative top-0 rounded-b-md pb-1">
            {spots?.map((loc, index) => {
              return (
                <div
                  key={index + 10}
                  className={`flex lg:p-5 md:p-5 ${
                    loc != spots[0] ? "my-5" : "mb-5"
                  }`}
                >
                  <Image
                    src={loc.image_url ? loc.image_url : noResults}
                    className="w-1/2 h-36 object-cover flex-1 min-w-[192px]"
                    width={160}
                    height={260}
                    alt={loc.alias}
                  />
                  <div className="flex-1 overflow-hidden text-center p-1">
                    <p className="font-bold whitespace-nowrap overflow-hidden overflow-ellipsis text-white">
                      {!show
                        ? String.fromCharCode("B".charCodeAt(0) + index) +
                          ". " +
                          loc.name
                        : loc.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ComboboxPopover>
    </Combobox>
  );
}
