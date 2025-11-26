'use client';

export function TruckLoader({ message = 'Processing your request...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-64 h-32 mb-6">
        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 rounded"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-300 rounded" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #000 20px, #000 40px)'
        }}></div>
        
        {/* Truck */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 animate-truck-drive">
          <svg width="120" height="80" viewBox="0 0 120 80" className="truck-svg">
            {/* Truck body */}
            <rect x="20" y="30" width="60" height="30" fill="#ff8b3d" rx="2"/>
            {/* Truck cabin */}
            <rect x="80" y="35" width="25" height="25" fill="#ff7a20" rx="2"/>
            {/* Windows */}
            <rect x="82" y="38" width="8" height="8" fill="#87ceeb" rx="1"/>
            <rect x="92" y="38" width="8" height="8" fill="#87ceeb" rx="1"/>
            {/* Wheels */}
            <circle cx="35" cy="60" r="8" fill="#333"/>
            <circle cx="35" cy="60" r="5" fill="#666"/>
            <circle cx="75" cy="60" r="8" fill="#333"/>
            <circle cx="75" cy="60" r="5" fill="#666"/>
            {/* Headlights */}
            <circle cx="20" cy="45" r="3" fill="#ffeb3b"/>
          </svg>
        </div>
      </div>
      
      <p className="text-lg font-semibold text-[var(--color-text)] mb-2">{message}</p>
      <p className="text-sm text-[var(--color-muted)]">Please wait while we process your file...</p>
      
    </div>
  );
}

