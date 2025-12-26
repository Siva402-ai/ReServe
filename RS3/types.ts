
export enum UserRole {
  DONOR = 'DONOR',
  NGO = 'NGO',
  ADMIN = 'ADMIN',
  RECIPIENT = 'RECIPIENT' // New Role for Orphanages/Homes
}

export enum FoodStatus {
  AVAILABLE = 'AVAILABLE',
  ACCEPTED = 'ACCEPTED', // NGO accepted, on the way
  REACHED = 'REACHED',   // NGO arrived at location
  COMPLETED = 'COMPLETED', // Donor confirmed pickup
  CANCELLED = 'CANCELLED' // Donor cancelled the donation
}

export enum FreshnessLevel {
  FRESH = 'Fresh',
  RISKY = 'Risky',
  NOT_FRESH = 'Not Fresh',
  UNKNOWN = 'Unknown'
}

export interface Review {
  id: string;
  donorId: string;
  donorName: string;
  rating: number; // 1-5
  feedback: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for authentication
  role: UserRole;
  organization?: string;
  phone?: string;
  phoneVerified?: boolean; // New flag for OTP verification
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  accountStatus?: 'ACTIVE' | 'DISABLED';
  
  // Verification Fields
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documentUrl?: string; // URL to the uploaded proof
  
  // NGO Rating Fields
  reviews?: Review[];
  averageRating?: number;

  // Recipient Fields
  peopleCount?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  type: string;
  timePrepared: string;
  storageTemp: string;
  freshness: FreshnessLevel;
}

export interface FoodPost {
  id: string;
  donorId: string;
  donorName: string;
  donorAddress?: string; // Hidden until accepted
  donorPhone?: string;   // Hidden until accepted
  items: FoodItem[]; 
  status: FoodStatus;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  completedAt?: string; // Timestamp when donor confirms pickup
  
  // Uber-style NGO Details (Filled upon acceptance)
  acceptedNgoId?: string;
  acceptedNgoName?: string;
  ngoPhone?: string;
  ngoProfilePhoto?: string;
  ngoRating?: number;
  
  // Rating Status
  isRated?: boolean; // True if donor has already rated this interaction
}

export interface DistanceResult {
  postId: string;
  distanceKm: number;
}

export interface DeliveryRecord {
  id: string;
  ngoId: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  foodType: string; // From FoodItem type or name
  quantity: string;
  pickupTime: string; // from FoodPost.completedAt
  deliveryTime: string; // Now
  status: 'Completed';
  date: string; // YYYY-MM-DD
}

export interface DonationHistoryRecord {
  id: string;
  postId: string; // Reference to original post
  donorId: string;
  foodType: string; // Main item name
  quantity: string;
  prepTime: string;
  submittedTime: string;
  date: string; // YYYY-MM-DD
  month: string; // MM
  year: string; // YYYY
  status: 'Pending' | 'Picked' | 'Delivered' | 'Cancelled';
}