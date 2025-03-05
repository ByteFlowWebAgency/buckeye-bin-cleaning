import { NextResponse } from "next/server";

// Constants for service area (Cleveland area)
const CLEVELAND_CENTER = {
  latitude: 41.4993,
  longitude: -81.6944
};
const SERVICE_RADIUS_MILES = 30; // Adjust based on your service area

// Haversine formula to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = value => (value * Math.PI) / 180;
  const R = 3958.8; // Earth's radius in miles
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request) {
  try {
    const { address } = await request.json();
    
    // Add Ohio if not included to improve geocoding
    let searchAddress = address;
    if (!searchAddress.toLowerCase().includes("ohio") && 
        !searchAddress.toLowerCase().includes("oh")) {
      searchAddress += ", Ohio";
    }
    
    // Ensure we have some kind of zip code region
    if (!searchAddress.match(/\d{5}/) && !searchAddress.includes("Cleveland")) {
      searchAddress += ', Cleveland area';
    }
    
    // Using native fetch instead of axios for stability
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    console.log("Geocoding response status:", data.status);
    
    if (data.status !== 'OK' || !data.results.length) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid address. Please include street, city, and state.", 
          debug: { status: data.status, error_message: data.error_message } 
        },
        { status: 400 }
      );
    }
    
    const location = data.results[0].geometry.location;
    const userCoordinates = {
      latitude: location.lat,
      longitude: location.lng
    };
    
    // Calculate distance from Cleveland center
    const distance = calculateDistance(
      CLEVELAND_CENTER.latitude,
      CLEVELAND_CENTER.longitude,
      userCoordinates.latitude,
      userCoordinates.longitude
    );
    
    const isWithinServiceArea = distance <= SERVICE_RADIUS_MILES;
    
    return NextResponse.json({
      success: true,
      isWithinServiceArea,
      distance: Math.round(distance),
      formattedAddress: data.results[0].formatted_address
    });
  } catch (error) {
    console.error("Location validation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error validating location. Please try again.", 
        debug: error.message 
      },
      { status: 500 }
    );
  }
}