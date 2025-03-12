import { NextResponse } from 'next/server';
import { adminDb } from "@/data/firebase-admin";

export async function GET() {
  try {
    const testDoc = await adminDb.collection('test').add({
      message: 'Test document',
      timestamp: new Date()
    });
    
    return NextResponse.json({ success: true, docId: testDoc.id });
  } catch (error) {
    console.error('Firebase error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}