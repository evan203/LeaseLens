import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { fetchParcels } from './fetchParcels';

export interface Landlord {
  id: string;
  name: string;
  address: string;
  averageRating: number;
  averageMaintenanceTime: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ParcelFeature {
  properties: {
    OwnerName1?: string;
    OwnerName2?: string;
    Address?: string;
    OwnerAddress?: string;
    OwnerCityStZip?: string;
    ManagementGroup?: string;
  };
}

const MAINTENANCE_TIME_MAP: Record<string, number> = {
  'Within a day': 1,
  'Within a few days': 3,
  'Within a week': 5,
  'Within a few weeks': 14,
  'Within a month': 30,
  'Longer than a month': 60
};

function getLandlordId(managementGroup: string | undefined, ownerName1: string | undefined): string {
  if (managementGroup && managementGroup.trim()) {
    return managementGroup.trim();
  }
  if (ownerName1 && ownerName1.trim()) {
    return ownerName1.trim();
  }
  return 'Unknown';
}

function getLandlordName(managementGroup: string | undefined, ownerName1: string | undefined): string {
  if (managementGroup && managementGroup.trim()) {
    return managementGroup.trim();
  }
  if (ownerName1 && ownerName1.trim()) {
    return ownerName1.trim();
  }
  return 'Unknown';
}

export async function findParcelByAddress(address: string): Promise<ParcelFeature | null> {
  const parcels = await fetchParcels();
  const feature = parcels.features.find(
    (f: ParcelFeature) => f.properties.Address?.toLowerCase() === address.toLowerCase()
  );
  return feature || null;
}

export async function createOrUpdateLandlord(
  parcelAddress: string,
  rating: number,
  maintenanceTime?: string
): Promise<string> {
  const parcel = await findParcelByAddress(parcelAddress);
  
  if (!parcel) {
    console.warn('Parcel not found for address:', parcelAddress);
    return '';
  }

  const { ManagementGroup, OwnerName1, OwnerAddress, OwnerCityStZip } = parcel.properties;
  
  const landlordId = getLandlordId(ManagementGroup, OwnerName1);
  const landlordName = getLandlordName(ManagementGroup, OwnerName1);
  const mailingAddress = OwnerAddress && OwnerCityStZip 
    ? `${OwnerAddress}, ${OwnerCityStZip}` 
    : '';

  const landlordRef = doc(db, 'landlords', landlordId);
  const existingDoc = await getDoc(landlordRef);

  const maintenanceTimeNumeric = maintenanceTime 
    ? (MAINTENANCE_TIME_MAP[maintenanceTime] || 0) 
    : 0;

  if (existingDoc.exists()) {
    const existingData = existingDoc.data();
    const currentCount = existingData.reviewCount || 0;
    const currentRatingSum = (existingData.averageRating || 0) * currentCount;
    const currentMaintenanceSum = (existingData.averageMaintenanceTime || 0) * currentCount;
    
    const newCount = currentCount + 1;
    const newRatingSum = currentRatingSum + rating;
    const newMaintenanceSum = currentMaintenanceSum + maintenanceTimeNumeric;

    await updateDoc(landlordRef, {
      averageRating: newRatingSum / newCount,
      averageMaintenanceTime: newCount > 0 ? newMaintenanceSum / newCount : 0,
      reviewCount: newCount,
      updatedAt: Timestamp.now()
    });
  } else {
    await setDoc(landlordRef, {
      id: landlordId,
      name: landlordName,
      address: mailingAddress,
      averageRating: rating,
      averageMaintenanceTime: maintenanceTimeNumeric,
      reviewCount: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  return landlordId;
}

export async function getLandlords(): Promise<Landlord[]> {
  const snapshot = await getDocs(collection(db, 'landlords'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as Landlord[];
}

export async function getLandlordById(id: string): Promise<Landlord | null> {
  const docRef = doc(db, 'landlords', id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate() || new Date(),
    updatedAt: snapshot.data().updatedAt?.toDate() || new Date()
  } as Landlord;
}
