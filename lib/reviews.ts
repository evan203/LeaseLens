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

export interface Review {
  id?: string;
  parcelId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
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

export async function addReview(
  parcelId: string, 
  userId: string, 
  rating: number, 
  comment: string
): Promise<string> {
  const docRef = await addDoc(collection(db, 'reviews'), {
    parcelId,
    userId,
    rating,
    comment,
    createdAt: Timestamp.now()
  });
  return docRef.id;
}
