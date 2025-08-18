import { CircularProgress } from "@mui/material";

export function Loading() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <span className="text-gray-200 font-semibold text-sm">
        <CircularProgress />
      </span>
    </div>
  );
}
