import { BottomSheet } from "react-spring-bottom-sheet";
import Image from "next/image";

export default function Bottom({
  spots,
  show,
  commited,
  toGoogleMaps,
  details,
}) {
  return (
    <BottomSheet
      open={details}
      blocking={false}
      defaultSnap={({ snapPoints, lastSnap }) =>
        lastSnap ?? Math.min(...snapPoints)
      }
      snapPoints={({ maxHeight }) => [
        maxHeight * 0.95,
        maxHeight - maxHeight / 10,
        maxHeight * 0.3,
        maxHeight * 0.05,
      ]}
      className="w-full h-full bg-gradient-to-b from-forest to-[#5a533a] z-50 relative top-0 rounded-b-md pb-1"
    >
      {details && (
        <div className="w-full z-50 relative top-0 rounded-b-md pb-1">
          <h1 className="flex items-center text-xl justify-center font-bold text-gray-800">
            Details!
          </h1>

          {spots?.map((loc, index) => {
            return (
              <div
                key={index + 10}
                className={`flex lg:p-5 md:p-5 ${
                  loc != spots[0] ? "my-5" : "mb-5"
                } p-2`}
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
                      ? String.fromCharCode("B".charCodeAt(0) + index) +
                        ". " +
                        loc.name
                      : loc.name}
                  </p>
                </div>
              </div>
            );
          })}
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
        </div>
      )}
    </BottomSheet>
  );
}
