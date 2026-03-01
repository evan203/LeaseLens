import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  query 
} from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const landlordName = searchParams.get('landlordName');
  const allLandlords = searchParams.get('all') === 'true';

  try {
    if (allLandlords) {
      const landlordsRef = collection(db, 'landlords');
      const snapshot = await getDocs(landlordsRef);
      const landlords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json(landlords);
    }

    if (landlordName) {
      const landlordDocRef = collection(db, 'landlords');
      const landlordQuery = query(landlordDocRef);
      const landlordSnapshot = await getDocs(landlordQuery);
      
      const matchedLandlord = landlordSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.name === landlordName || data.name?.toLowerCase() === landlordName?.toLowerCase();
      });

      let landlordData: Record<string, unknown> | null = null;
      if (matchedLandlord) {
        landlordData = {
          id: matchedLandlord.id,
          ...matchedLandlord.data()
        };
      }

      const reviewsRef = collection(db, 'reviews');
      const allReviewsQuery = query(reviewsRef);
      const allReviewsSnapshot = await getDocs(allReviewsQuery);
      
      const landlordNameLower = landlordName.toLowerCase();
      const reviews = allReviewsSnapshot.docs
        .filter(doc => {
          const data = doc.data();
          const rn = data.landlordName?.toLowerCase();
          return rn === landlordNameLower;
        })
        .sort((a, b) => {
          const dateA = a.data().createdAt?.toDate?.()?.getTime() || 0;
          const dateB = b.data().createdAt?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        })
        .slice(0, 50)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            rating: data.rating,
            rent: data.rent,
            comment: data.comment,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null
          };
        });

      const totalUnits = landlordData?.totalUnits || null;
      const violations = landlordData?.violations || null;
      const lastInspection = landlordData?.lastInspection || null;

      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

      const avgRent = reviews.length > 0
        ? Math.round(reviews.filter(r => r.rent).reduce((sum, r) => sum + (r.rent || 0), 0) / reviews.filter(r => r.rent).length || 0)
        : null;

      const rentData = reviews
        .filter(r => r.rent)
        .map(r => ({ rent: r.rent, createdAt: r.createdAt }))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      return NextResponse.json({
        name: landlordName,
        avgRating: avgRating ? parseFloat(avgRating) : 'NA',
        avgRent: avgRent || 'NA',
        totalUnits: totalUnits || 'NA',
        violations: violations || 'NA',
        lastInspection: lastInspection || 'NA',
        reviewCount: reviews.length,
        rentData: rentData.length > 0 ? rentData : 'NA'
      });
    }

    return NextResponse.json({ error: 'landlordName parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching landlord data:', error);
    return NextResponse.json({ error: 'Failed to fetch landlord data' }, { status: 500 });
  }
}
