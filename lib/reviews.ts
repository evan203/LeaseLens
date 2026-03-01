import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { createOrUpdateLandlord } from './landlords';

export interface Review {
  id?: string;
  parcelId: string;
  userId: string;
  address: string;
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
    ...extras,
    rating,
    comment,
    createdAt: Timestamp.now()
  });

  await createOrUpdateLandlord(address, rating, extras?.maintenanceTime);

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
