// src/components/SkeletonLoader.jsx
export default function SkeletonLoader() {
  return (
    <div className="pt-24 px-6 max-w-5xl mx-auto pb-12 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Poster Skeleton */}
        <div className="w-full md:w-1/3">
          <div className="aspect-[2/3] bg-gray-800 rounded-lg"></div>
        </div>

        {/* Info Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-10 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          
          <div className="flex gap-3 pt-4">
            <div className="h-12 bg-gray-800 rounded w-32"></div>
            <div className="h-12 bg-gray-800 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}