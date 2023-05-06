import { Rating, RoundedStar } from "@smastrom/react-rating";
import noResults from "./assets/noResults.png";
import Image from "next/image";
export default function Poi({
  loc,
  index,
  spots,
  selectDestination,
  show,
  commited,
  setVis,
}) {
  setVis(false);
  return (
    <div
      className={`flex lg:p-5 ${!commited ? "cursor-pointer" : ""} md:p-5 ${
        loc != spots[0] ? "my-5" : "mb-5"
      }} `}
      onClick={() => (!commited ? selectDestination(loc) : console.log("no"))}
    >
      <Image
        src={loc.image_url ? loc.image_url : noResults}
        className="w-1/2 h-36 object-cover flex-1 min-w-[192px] rounded-md"
        width={160}
        height={260}
        alt={loc.alias}
      />
      <div className="flex-1 overflow-hidden text-center p-1">
        <p className="font-bold whitespace-nowrap overflow-hidden overflow-ellipsis text-white">
          {!show
            ? String.fromCharCode("B".charCodeAt(0) + index) + ". " + loc.name
            : loc.name}
        </p>
        {!commited &&
          (loc.rating != -1 ? (
            <Rating
              readOnly={true}
              className="w-4/5 mx-auto"
              value={loc.rating}
              halfFillMode="svg"
              itemStyles={{
                itemShapes: RoundedStar,
                activeFillColor: "#ffb700",
                inactiveFillColor: "#fbf1a9",
              }}
            />
          ) : null)}
      </div>
    </div>
  );
}
