export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-100 rounded-lg h-24" />
        ))}
      </div>
      <div className="bg-gray-100 rounded-xl h-96" />
    </div>
  )
}
