// app/api/set-admin/route.js
import { NextResponse } from 'next/server';
import { adminAuth } from '@/data/firebase-admin';

export async function POST(request) {
  try {
    const { email, secretKey } = await request.json();
    
    console.log('Received secret key:', secretKey);
    console.log('Expected secret key:', process.env.ADMIN_SECRET_KEY);
    
    // Verify secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user by email
    const user = await adminAuth.getUserByEmail(email);
    
    // Set custom admin claim
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      uid: user.uid
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}