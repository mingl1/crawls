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
import { memo } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import "react-spring-bottom-sheet/dist/style.css";
import Bottom from "./bottom";
import Poi from "./poi";
import SkeletonCard from "./SkeletonCard";

const Places = memo(function Places({
  setOrigin,
  spots,
  show,
  setSpots,
  toGoogleMaps,
  commited,
  details,
  selectDestination,
}) {
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
        <BrowserView>
          {details ? (
            <div className="w-full bg-gradient-to-b from-forest to-[#5a533a] z-50 relative top-0 rounded-b-md pb-1">
              {commited && (
                <div className="w-full items-center flex justify-center align-middle">
                  <button
                    className="bg-slate-800 text-green-500 p-2 rounded-md w-4/5 h-12"
                    onClick={toGoogleMaps}
                  >
                    Open In Google Maps
                  </button>
                </div>
              )}

              {spots[0] ? (
                spots.map((loc, index) => (
                  <Poi
                    loc={loc}
                    index={index}
                    details={details}
                    spots={spots}
                    selectDestination={selectDestination}
                    show={show}
                    commited={commited}
                    key={index + 10}
                  />
                ))
              ) : (
                <SkeletonCard />
              )}
            </div>
          ) : null}
        </BrowserView>
        <MobileView>
          <Bottom
            details={details}
            spots={spots}
            show={show}
            commited={commited}
            toGoogleMaps={toGoogleMaps}
            selectDestination={selectDestination}
          />
        </MobileView>
      </ComboboxPopover>
    </Combobox>
  );
});

export default Places;
