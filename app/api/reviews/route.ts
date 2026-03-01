import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parcelId = searchParams.get('parcelId');

  if (!parcelId) {
    return NextResponse.json({ error: 'parcelId required' }, { status: 400 });
  }

  try {
    const q = query(
      collection(db, 'reviews'),
      where('parcelId', '==', parcelId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ 
    error: 'Use client-side Firebase for adding reviews' 
  }, { status: 501 });
}
