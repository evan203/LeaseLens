import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  doc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';

export interface Landlord {
  id?: string;
  name: string;
  managementGroup: string;
  averageRating?: number;
  averageMaintenanceTime?: number;
  averageMaintenanceQuality?: number;
  reviewCount?: number;
  createdAt: Date;
}

export async function addLandlord(
  name: string,
  managementGroup: string
): Promise<string> {
  const docRef = await addDoc(collection(db, 'landlords'), {
    name,
    managementGroup,
    createdAt: Timestamp.now()
  });
  return docRef.id;
}

export async function getLandlord(id: string): Promise<Landlord | null> {
  const docSnap = await getDoc(doc(db, 'landlords', id));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate() || new Date()
  } as Landlord;
}

export async function getLandlordsByManagementGroup(managementGroup: string): Promise<Landlord[]> {
  const q = query(
    collection(db, 'landlords'),
    where('managementGroup', '==', managementGroup)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Landlord[];
}

export async function getOrCreateLandlordByAddress(address: string): Promise<string | null> {
  const response = await fetch('/renters.geojson');
  const data = await response.json();
  
  const feature = data.features.find((f: { properties: { Address: string } }) => 
    f.properties.Address?.toLowerCase() === address.toLowerCase()
  );
  
  if (!feature?.properties?.ManagementGroup) {
    return null;
  }
  
  const managementGroup = feature.properties.ManagementGroup;
  
  const q = query(
    collection(db, 'landlords'),
    where('managementGroup', '==', managementGroup)
  );
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  
  const docRef = await addDoc(collection(db, 'landlords'), {
    name: managementGroup,
    managementGroup,
    createdAt: Timestamp.now()
  });
  
  return docRef.id;
}
