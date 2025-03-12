import { NextResponse } from 'next/server';
import { adminAuth } from "@/data/firebase-admin";

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

export async function POST(request) {
  try {
    const { email, password, secretKey } = await request.json();
    
    if (secretKey !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: true,
    });
    
    await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}