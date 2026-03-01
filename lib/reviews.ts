import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';

export interface Review {
  id?: string;
  parcelId: string;
  userId: string;
  address: string;
  landlordId?: string;
  bedrooms?: number;
  bathrooms?: number;
  rent?: number;
  waterBill?: number;
  electricityBill?: number;
  gasBill?: number;
  rating: number;
  maintenanceTime?: string;
  maintenanceQuality?: string;
  comment: string;
  createdAt: Date;
}

export async function addReview(
  parcelId: string,
  userId: string,
  address: string,
  rating: number,
  comment: string,
  landlordId?: string,
  extras?: {
    bedrooms?: number;
    bathrooms?: number;
    rent?: number;
    waterBill?: number;
    electricityBill?: number;
    gasBill?: number;
    maintenanceTime?: string;
    maintenanceQuality?: string;
  }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'reviews'), {
    parcelId,
    userId,
    address,
    ...(landlordId && { landlordId }),
    ...extras,
    rating,
    comment,
    createdAt: Timestamp.now()
  });

  if (landlordId) {
    await updateLandlordStats(landlordId);
  }

  return docRef.id;
}

export async function getReviewsByParcel(parcelId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('parcelId', '==', parcelId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Review[];
}

export async function getReviewsByLandlord(landlordId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('landlordId', '==', landlordId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Review[];
}

const maintenanceTimeMap: Record<string, number> = {
  '1': 5,
  '2': 4,
  '3': 3,
  '4': 2,
  '5': 1
};

const maintenanceQualityMap: Record<string, number> = {
  '1': 1,
  '2': 2,
  '3': 3
};

export async function updateLandlordStats(landlordId: string): Promise<void> {
  const reviews = await getReviewsByLandlord(landlordId);
  
  if (reviews.length === 0) return;

  const validRatings = reviews.filter((r: Review) => r.rating != null);
  const validMaintenanceTime = reviews.filter((r: Review) => r.maintenanceTime != null);
  const validMaintenanceQuality = reviews.filter((r: Review) => r.maintenanceQuality != null);

  const avgRating = validRatings.length > 0
    ? validRatings.reduce((sum: number, r: Review) => sum + r.rating, 0) / validRatings.length
    : null;

  const avgMaintenanceTime = validMaintenanceTime.length > 0
    ? validMaintenanceTime.reduce((sum: number, r: Review) => {
        const mapped = maintenanceTimeMap[r.maintenanceTime!];
        return sum + (mapped || 0);
      }, 0) / validMaintenanceTime.length
    : null;

  const avgMaintenanceQuality = validMaintenanceQuality.length > 0
    ? validMaintenanceQuality.reduce((sum: number, r: Review) => {
        const mapped = maintenanceQualityMap[r.maintenanceQuality!];
        return sum + (mapped || 0);
      }, 0) / validMaintenanceQuality.length
    : null;

  await updateDoc(doc(db, 'landlords', landlordId), {
    averageRating: avgRating,
    averageMaintenanceTime: avgMaintenanceTime,
    averageMaintenanceQuality: avgMaintenanceQuality,
    reviewCount: reviews.length
  });
}
