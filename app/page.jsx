'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

const MADISON_CENTER = {
  latitude: 43.0731,
  longitude: -89.3841,
  zoom: 12
};

const parcelLayerStyle = {
  id: 'parcel-layer',
  type: 'fill',
  paint: {
    'fill-color': '#6b7280',
    'fill-opacity': 0.3,
    'fill-outline-color': '#374151'
  }
};

const parcelHighlightStyle = {
  id: 'parcel-highlight',
  type: 'line',
  paint: {
    'line-color': '#2563eb',
    'line-width': 2
  }
};

async function fetchParcels() {
  const response = await fetch('/madison_parcels.json');
  const data = await response.json();
  console.log('Loaded parcel data:', data);
  return data;
}

function StarRating({ rating, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${!readonly && 'hover:scale-110 transition-transform'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewPanel({ parcel, reviews, onAddReview, user }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!parcel) return null;

  const address = parcel.properties.Address || 'N/A';
  const owner = [parcel.properties.OwnerName1, parcel.properties.OwnerName2].filter(Boolean).join(' ') || 'N/A';
  const propertyUse = parcel.properties.PropertyUse || 'N/A';
  const zoning = parcel.properties.Zoning1 || 'N/A';
  const parcelId = parcel.properties.OBJECTID;

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmitting(true);
    try {
      await onAddReview(parcelId, rating, comment);
      setComment('');
      setRating(5);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute left-4 top-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-[80vh] flex flex-col">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Parcel Information</h2>
      </div>
      
      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        <div>
          <div className="text-xs text-gray-500 uppercase">Address</div>
          <div className="text-gray-900 font-medium">{address}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Owner</div>
          <div className="text-gray-900">{owner}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Property Type</div>
          <div className="text-gray-900">{propertyUse}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Zoning</div>
          <div className="text-gray-900">{zoning}</div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-800">Reviews</div>
            {avgRating && (
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(avgRating)} readonly />
                <span className="text-sm text-gray-600">({avgRating})</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">No reviews yet. Be the first to review!</div>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} readonly />
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">{review.comment}</div>
                </div>
              ))}
            </div>
          )}

          {user ? (
            showReviewForm ? (
              <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t">
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">Your Rating</div>
                  <StarRating rating={rating} onChange={setRating} />
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  rows={3}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-1.5 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Write a Review
              </button>
            )
          ) : (
            <div className="mt-3 pt-3 border-t text-center">
              <Link href="/login" className="text-blue-600 hover:underline text-sm">
                Sign in to write a review
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParcelMap() {
  const [parcelData, setParcelData] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth();
  const mapRef = useRef(null);

  useEffect(() => {
    fetchParcels()
      .then(data => {
        console.log('Parcel data:', data);
        if (data.error) {
          console.error('API Error:', data.error);
        }
        setParcelData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch parcels:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedParcel) {
      setReviews([]);
      return;
    }

    const parcelId = selectedParcel.properties.OBJECTID;
    setReviewsLoading(true);

    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('parcelId', '==', String(parcelId)),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [selectedParcel]);

  const handleAddReview = async (parcelId, rating, comment) => {
    if (!user) throw new Error('Must be logged in');

    await addDoc(collection(db, 'reviews'), {
      parcelId: String(parcelId),
      userId: user.uid,
      rating,
      comment,
      createdAt: Timestamp.now()
    });

    const q = query(
      collection(db, 'reviews'),
      where('parcelId', '==', String(parcelId)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const reviewsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    setReviews(reviewsData);
  };

  const handleMapClick = (event) => {
    if (!mapRef.current || !parcelData) return;

    const features = mapRef.current.queryRenderedFeatures(event.point, {
      layers: ['parcel-layer']
    });

    if (features.length > 0) {
      setSelectedParcel(features[0]);
    } else {
      setSelectedParcel(null);
    }
  };

  const onMapLoad = () => {
    setMapLoaded(true);
  };

  return (
    <div className="relative w-full h-screen">
      <Map
        ref={mapRef}
        initialViewState={MADISON_CENTER}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onClick={handleMapClick}
        onLoad={onMapLoad}
      >
        <NavigationControl position="top-right" />

        {mapLoaded && parcelData && (
          <Source id="parcels" type="geojson" data={parcelData}>
            <Layer {...parcelLayerStyle} />
            {selectedParcel && (
              <Layer
                {...parcelHighlightStyle}
                filter={['==', 'OBJECTID', selectedParcel.properties.OBJECTID]}
              />
            )}
          </Source>
        )}
      </Map>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-gray-600">Loading parcels...</div>
        </div>
      )}

      <ReviewPanel 
        parcel={selectedParcel} 
        reviews={reviews} 
        onAddReview={handleAddReview}
        user={user}
      />

      <button
        onClick={() => setSelectedParcel(null)}
        className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-sm text-gray-600">
        Click on a parcel to view details and reviews
      </div>
    </div>
  );
}
