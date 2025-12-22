// src/components/SkeletonLoader.jsx
export default function SkeletonLoader() {
  return (
    <div className="pt-24 px-6 max-w-6xl mx-auto pb-12 animate-pulse">
      {/* Topo: Poster e Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3 max-w-[300px] aspect-[2/3] bg-gray-800 rounded-xl shadow-lg"></div>
        <div className="flex-1 space-y-6">
           <div className="h-12 bg-gray-800 rounded-lg w-3/4"></div>
           <div className="flex gap-3">
              <div className="h-6 bg-gray-800 rounded w-20"></div>
              <div className="h-6 bg-gray-800 rounded w-24"></div>
           </div>
           <div className="h-32 bg-gray-800 rounded-lg w-full"></div>
           <div className="flex gap-4 pt-2">
              <div className="h-12 bg-gray-800 rounded-lg w-40"></div>
              <div className="h-12 bg-gray-800 rounded-lg w-12"></div>
           </div>
        </div>
      </div>
      
      {/* Baixo: Episódios */}
      <div className="h-8 bg-gray-800 rounded w-48 mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="space-y-3">
                <div className="aspect-video bg-gray-800 rounded-lg"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
             </div>
          ))}
      </div>
    </div>
  );
}