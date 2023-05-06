import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SkeletonCard() {
  return Array(4)
    .fill(0)
    .map((_, i) => (
      <div className={`flex lg:p-5 md:p-5 my-5`} key={i + 33}>
        <Skeleton className="w-1/2 object-cover flex-1 min-w-[192px] rounded-md h-32" />
        <div className="flex-1 overflow-hidden text-center p-1">
          <Skeleton className="mx-auto" width={"70%"} />

          <Skeleton className="w-full" width={"90%"} />
        </div>
      </div>
    ));
}
