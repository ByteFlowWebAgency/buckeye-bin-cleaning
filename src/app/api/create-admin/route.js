import { NextResponse } from "next/server";
import { initFirebaseAdmin } from '@/lib/firebaseAdmin';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

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
    const { email, password, secretKey } = await request.json();

    if (secretKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    });

    await auth.setCustomUserClaims(userRecord.uid, { admin: true });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      uid: userRecord.uid,
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
