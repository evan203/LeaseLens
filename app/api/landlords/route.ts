import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';
  const id = searchParams.get('id');
  const name = searchParams.get('name');
  const managementGroup = searchParams.get('managementGroup');

  try {
    if (all) {
      const q = query(collection(db, 'landlords'), orderBy('name'));
      const snapshot = await getDocs(q);
      const landlords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json(landlords);
    }

    if (id) {
      const docSnap = await getDoc(doc(db, 'landlords', id));
      if (!docSnap.exists()) {
        return NextResponse.json({ error: 'Landlord not found' }, { status: 404 });
      }
      return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
    }

    if (name) {
      const q = query(
        collection(db, 'landlords'),
        where('name', '==', name)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return NextResponse.json({ error: 'Landlord not found' }, { status: 404 });
      }
      const doc = snapshot.docs[0];
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    if (managementGroup) {
      const q = query(
        collection(db, 'landlords'),
        where('managementGroup', '==', managementGroup),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      const landlords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json(landlords);
    }

    return NextResponse.json({ error: 'Missing required parameter: all, id, name, or managementGroup' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching landlord data:', error);
    return NextResponse.json({ error: 'Failed to fetch landlord data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, managementGroup } = body;

    if (!name || !managementGroup) {
      return NextResponse.json({ error: 'name and managementGroup are required' }, { status: 400 });
    }

    const { addLandlord } = await import('@/lib/landlords');
    const id = await addLandlord(name, managementGroup);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Error creating landlord:', error);
    return NextResponse.json({ error: 'Failed to create landlord' }, { status: 500 });
  }
}
