import { NextResponse } from "next/server";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  // Skip during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping route execution during build phase');
    return NextResponse.json({ success: true });
  }

  const { auth } = initFirebaseAdmin();
  
  if (!auth) {
    console.log('Firebase Auth not available');
    return NextResponse.json({ success: true });
  }

  try {
    const { email, secretKey } = await request.json();

    console.log("Received secret key:", secretKey);
    console.log("Expected secret key:", process.env.ADMIN_SECRET_KEY);

    // Verify secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Find the user by email
    const user = await auth.getUserByEmail(email);

    // Set custom admin claim
    await auth.setCustomUserClaims(user.uid, { admin: true });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      uid: user.uid,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
