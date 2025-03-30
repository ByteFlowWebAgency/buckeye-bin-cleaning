import { NextResponse } from "next/server";

const PARMA_CENTER = {
  lat: 41.404774,
  lng: -81.722565
}; // Coordinates for Parma, OH

export async function POST(req) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({
        success: false,
        message: "Address is required",
      });
    }

    // Google Maps Geocoding API call
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json({
        success: false,
        message: "Could not validate address",
      });
    }

    const location = data.results[0].geometry.location;
    const formattedAddress = data.results[0].formatted_address;

    // Calculate distance and direction from Parma
    const distance = calculateDistance(
      PARMA_CENTER.lat,
      PARMA_CENTER.lng,
      location.lat,
      location.lng
    );

    // Calculate bearing to determine direction
    const bearing = calculateBearing(
      PARMA_CENTER.lat,
      PARMA_CENTER.lng,
      location.lat,
      location.lng
    );

    // Determine if location is within service area based on direction
    let isWithinServiceArea = false;
    let directionMessage = "";

    // Convert bearing to compass direction
    const direction = getCompassDirection(bearing);

    // Check distance limits based on direction
    switch (direction) {
      case "N":
        isWithinServiceArea = distance <= 10;
        directionMessage = "north";
        break;
      case "E":
        isWithinServiceArea = distance <= 42;
        directionMessage = "east";
        break;
      case "S":
        isWithinServiceArea = distance <= 25;
        directionMessage = "south";
        break;
      case "W":
        isWithinServiceArea = distance <= 25;
        directionMessage = "west";
        break;
      case "NE":
        isWithinServiceArea = distance <= Math.min(42, 42);
        directionMessage = "northeast";
        break;
      case "SE":
        isWithinServiceArea = distance <= Math.min(25, 42);
        directionMessage = "southeast";
        break;
      case "SW":
        isWithinServiceArea = distance <= 25;
        directionMessage = "southwest";
        break;
      case "NW":
        isWithinServiceArea = distance <= Math.min(10, 25);
        directionMessage = "northwest";
        break;
    }

    return NextResponse.json({
      success: true,
      isWithinServiceArea,
      distance: Math.round(distance * 10) / 10,
      direction: directionMessage,
      formattedAddress,
      message: isWithinServiceArea
        ? `Address is within service area (${Math.round(distance * 10) / 10} miles ${directionMessage} of Parma)`
        : `Address is outside service area (${Math.round(distance * 10) / 10} miles ${directionMessage} of Parma). We only serve up to 10 miles north, 42 miles east, 25 miles south and west of Parma.`,
    });

  } catch (error) {
    console.error("Location validation error:", error);
    return NextResponse.json({
      success: false,
      message: "Error validating location",
    });
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to convert degrees to radians
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Helper function to calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

// Helper function to convert radians to degrees
function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

// Helper function to convert bearing to compass direction
function getCompassDirection(bearing) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}
