
import { User, FoodPost, UserRole, FoodStatus, FreshnessLevel, DeliveryRecord, DonationHistoryRecord, Review } from '../types';

// Keys for LocalStorage
const USERS_KEY = 'reserve_users';
const POSTS_KEY = 'reserve_posts';
const LAST_UPDATE_KEY = 'reserve_last_update';
const DELIVERY_HISTORY_KEY = 'reserve_delivery_history';
const DONATION_HISTORY_KEY = 'reserve_donation_history';

// In-memory store for OTPs (Phone Number -> OTP Details)
const otpStore: Record<string, { code: string, expires: number, attempts: number }> = {};

// Triggers an event so other components (like Dashboard) know to refresh data
const notifyUpdate = () => {
  window.dispatchEvent(new Event('reserve_db_update'));
  localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
};

// Initial Mock Data (Locations updated to Chennai context)
const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@reserve.com',
    password: 'reserve123',
    role: UserRole.ADMIN,
    organization: 'ReServe HQ',
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true
  },
  {
    id: 'u2',
    name: 'Tasty Bites Restaurant',
    email: 'donor@reserve.com',
    password: 'reserve123',
    role: UserRole.DONOR,
    organization: 'Tasty Bites',
    phone: '555-0199',
    address: '12, North Boag Road, T. Nagar, Chennai',
    location: { lat: 13.0418, lng: 80.2341 }, // T. Nagar
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true
  },
  {
    id: 'u3',
    name: 'Helping Hands NGO',
    email: 'ngo@reserve.com',
    password: 'reserve123',
    role: UserRole.NGO,
    organization: 'Helping Hands Foundation',
    phone: '555-0200',
    address: '45, Pantheon Road, Egmore, Chennai',
    location: { lat: 13.0827, lng: 80.2707 }, // Egmore
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
    averageRating: 4.8,
    reviews: []
  },
  // --- 5 SPECIFIC ORPHANAGE ACCOUNTS (Updated Coordinates) ---
  {
    id: 'r_karunyam',
    name: 'Karunyam Children Home',
    email: 'home1@reserve.com',
    password: '1234',
    role: UserRole.RECIPIENT,
    organization: 'Karunyam Children Home',
    phone: '9876543210',
    address: 'Plot No. 28, 100 6, Madha Koil Street, Sathidanandapuram, Ponmar, Chennai, Thazhambur, Tamil Nadu 600127',
    location: { lat: 12.8565, lng: 80.1721 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
    peopleCount: 45
  },
  {
    id: 'r_elshadai',
    name: 'El-Shadai Children Home',
    email: 'home2@reserve.com',
    password: '1234',
    role: UserRole.RECIPIENT,
    organization: 'El-Shadai Children Home',
    phone: '9876543211',
    address: '37, Annai Theresa Street, Rajiv Gandhi Salai, Kazhipattur, Tamil Nadu 603103',
    location: { lat: 12.818381, lng: 80.2286 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
    peopleCount: 60
  },
  {
    id: 'r_igm',
    name: 'IGM Children Home',
    email: 'home3@reserve.com',
    password: '1234',
    role: UserRole.RECIPIENT,
    organization: 'IGM Children Home',
    phone: '9876543212',
    address: '3, 1st Cross St, Veerabaghu Nagar, Guduvancheri, Tamil Nadu 603202',
    location: { lat: 12.8508845, lng: 80.0619286 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
    peopleCount: 35
  },
  {
    id: 'r_atheeswarar',
    name: 'Atheeswarar Charitable Trust',
    email: 'home4@reserve.com',
    password: '1234',
    role: UserRole.RECIPIENT,
    organization: 'Atheeswarar Charitable Trust',
    phone: '9876543213',
    address: 'A2/344, Swaminagar - 4th Cross Street, Near Gayathri Mini Hall, Mudichur - Attai Company, Chennai, Tamil Nadu 600048',
    location: { lat: 12.9149904, lng: 80.0720171 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
    peopleCount: 80
  },
  {
    id: 'r_vasantham',
    name: 'Vasantham Charitable Trust',
    email: 'home5@reserve.com',
    password: '1234',
    role: UserRole.RECIPIENT,
    organization: 'Vasantham Charitable Trust',
    phone: '9876543214',
    address: '1/246, 2nd Street, Rajiv Gandhi Nagar, Vengambakkam, Chennai, Tamil Nadu 600127',
    location: { lat: 12.8733, lng: 80.1329 },
    accountStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    phoneVerified: true,
    peopleCount: 55
  }
];

const SEED_POSTS: FoodPost[] = [
  {
    id: 'p1',
    donorId: 'u2',
    donorName: 'Tasty Bites Restaurant',
    donorAddress: '12, North Boag Road, T. Nagar, Chennai',
    donorPhone: '555-0199',
    items: [
      {
        id: 'i1',
        name: 'Grilled Chicken Salads',
        quantity: '15 boxes',
        type: 'Cooked Meal',
        timePrepared: new Date(Date.now() - 3600000).toISOString(),
        storageTemp: '5',
        freshness: FreshnessLevel.FRESH
      }
    ],
    status: FoodStatus.AVAILABLE,
    location: { lat: 13.0418, lng: 80.2341 },
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Enhanced Init to merge missing seed data (Self-Healing)
const initDB = () => {
  const usersJson = localStorage.getItem(USERS_KEY);
  let users: User[] = usersJson ? JSON.parse(usersJson) : [];
  
  if (users.length === 0) {
      users = [...SEED_USERS];
  } else {
      // Robust Check: Ensure ALL seed users (Admin, Donor, NGO, and 5 Orphanages) exist
      let updated = false;
      SEED_USERS.forEach(seedUser => {
          // Check by ID to prevent duplicates if email matches but ID differs (though ID is unique)
          if (!users.find(existing => existing.id === seedUser.id)) {
              users.push(seedUser);
              updated = true;
          }
      });
      
      if (updated) {
          console.log("MockDB: Injected missing seed users into LocalStorage.");
      }
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
  }
  if (!localStorage.getItem(DELIVERY_HISTORY_KEY)) {
    localStorage.setItem(DELIVERY_HISTORY_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(DONATION_HISTORY_KEY)) {
    localStorage.setItem(DONATION_HISTORY_KEY, JSON.stringify([]));
  }
};

initDB();

// Helper to update donation history status
const updateHistoryStatus = (postId: string, newStatus: 'Pending' | 'Picked' | 'Delivered' | 'Cancelled') => {
  const history: DonationHistoryRecord[] = JSON.parse(localStorage.getItem(DONATION_HISTORY_KEY) || '[]');
  const index = history.findIndex(h => h.postId === postId);
  if (index !== -1) {
    history[index].status = newStatus;
    localStorage.setItem(DONATION_HISTORY_KEY, JSON.stringify(history));
  }
};

export const mockDB = {
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  getPosts: (): FoodPost[] => {
    return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
  },
  
  getRecipients: () => {
    const users = mockDB.getUsers();
    // Return all VERIFIED recipients (including the 5 specific ones)
    return users
      .filter(u => u.role === UserRole.RECIPIENT && u.verificationStatus === 'VERIFIED')
      .map(u => ({
        id: u.id,
        name: u.organization || u.name,
        location: u.location || { lat: 0, lng: 0 },
        address: u.address, // Added address field
        peopleCount: u.peopleCount || 0
      }));
  },

  updateRecipientCount: (userId: string, count: number) => {
    const users = mockDB.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].peopleCount = count;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      notifyUpdate();
      return true;
    }
    return false;
  },

  confirmReceipt: (deliveryId: string) => {
    return true;
  },

  getSecureFeed: (viewerId: string): FoodPost[] => {
    const posts = mockDB.getPosts();
    return posts.map(p => {
      return p;
    });
  },

  // OTP is now fixed to 1234, no alerts
  sendOTP: (phone: string): boolean => {
    if (!phone || phone.length < 10) return false;
    const code = "1234";
    const expires = Date.now() + 5 * 60 * 1000;
    otpStore[phone] = { code, expires, attempts: 0 };
    return true;
  },

  verifyOTP: (phone: string, inputCode: string): { success: boolean, message?: string } => {
    const record = otpStore[phone];
    if (!record) return { success: false, message: "No OTP request found." };
    if (Date.now() > record.expires) return { success: false, message: "OTP expired." };
    if (record.code === inputCode) {
        delete otpStore[phone];
        return { success: true };
    } else {
        record.attempts += 1;
        return { success: false, message: "Invalid Code." };
    }
  },

  createUser: (user: Omit<User, 'id'>): User => {
    const users = mockDB.getUsers();
    let initialVerification: 'PENDING' | 'VERIFIED' = 'VERIFIED';
    if (user.role === UserRole.NGO || user.role === UserRole.RECIPIENT) {
        initialVerification = 'PENDING';
    }

    const newUser: User = { 
        ...user, 
        id: `u${Date.now()}`, 
        accountStatus: 'ACTIVE',
        verificationStatus: initialVerification,
        phoneVerified: user.role === UserRole.DONOR, 
        reviews: [],
        averageRating: 0,
        peopleCount: user.role === UserRole.RECIPIENT ? 20 : undefined // Default
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    notifyUpdate();
    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = mockDB.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    notifyUpdate();
    return users[index];
  },
  
  updateUserStatus: (id: string, status: 'ACTIVE' | 'DISABLED'): boolean => {
    const users = mockDB.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].accountStatus = status;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      notifyUpdate();
      return true;
    }
    return false;
  },

  verifyUser: (id: string, isApproved: boolean): boolean => {
    const users = mockDB.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index].verificationStatus = isApproved ? 'VERIFIED' : 'REJECTED';
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        notifyUpdate();
        return true;
    }
    return false;
  },

  addNgoReview: (ngoId: string, review: Omit<Review, 'id' | 'timestamp'>) => {
    const users = mockDB.getUsers();
    const index = users.findIndex(u => u.id === ngoId);
    
    if (index !== -1) {
      const user = users[index];
      const newReview: Review = {
        id: `rev_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...review
      };

      const currentReviews = user.reviews || [];
      const updatedReviews = [...currentReviews, newReview];
      
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = parseFloat((totalRating / updatedReviews.length).toFixed(1));

      users[index] = {
        ...user,
        reviews: updatedReviews,
        averageRating: newAverage
      };

      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      notifyUpdate();
      return true;
    }
    return false;
  },

  createPost: (post: Omit<FoodPost, 'id' | 'createdAt' | 'status'>): FoodPost => {
    const posts = mockDB.getPosts();
    const donor = mockDB.getUsers().find(u => u.id === post.donorId);
    
    const finalLocation = post.location || donor?.location || { lat: 13.0827, lng: 80.2707 };
    const finalAddress = post.donorAddress || donor?.address || "Unknown Location";

    const newPost: FoodPost = {
      ...post,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: FoodStatus.AVAILABLE,
      donorAddress: finalAddress, 
      donorPhone: donor?.phone,
      location: finalLocation,
      isRated: false
    };
    posts.unshift(newPost);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

    const history: DonationHistoryRecord[] = JSON.parse(localStorage.getItem(DONATION_HISTORY_KEY) || '[]');
    const now = new Date();
    const historyItem: DonationHistoryRecord = {
      id: `dh_${Date.now()}`,
      postId: newPost.id,
      donorId: newPost.donorId,
      foodType: newPost.items[0]?.name || 'Unknown Food',
      quantity: newPost.items[0]?.quantity || 'N/A',
      prepTime: newPost.items[0]?.timePrepared || now.toISOString(),
      submittedTime: newPost.createdAt,
      date: now.toISOString().split('T')[0],
      month: String(now.getMonth() + 1).padStart(2, '0'),
      year: String(now.getFullYear()),
      status: 'Pending'
    };
    history.unshift(historyItem);
    localStorage.setItem(DONATION_HISTORY_KEY, JSON.stringify(history));

    notifyUpdate();
    return newPost;
  },

  acceptDonation: (postId: string, ngo: User): FoodPost | null => {
    const posts = mockDB.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    
    if (index === -1) return null;
    if (posts[index].status !== FoodStatus.AVAILABLE) return null;

    posts[index].status = FoodStatus.ACCEPTED;
    posts[index].acceptedNgoId = ngo.id;
    posts[index].acceptedNgoName = ngo.organization || ngo.name;
    posts[index].ngoPhone = ngo.phone || '555-0123';
    
    const ngoUser = mockDB.getUsers().find(u => u.id === ngo.id);
    posts[index].ngoRating = ngoUser?.averageRating || 4.8;
    
    posts[index].ngoProfilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&background=0D9488&color=fff`;

    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    
    notifyUpdate();
    return posts[index];
  },

  cancelPickup: (postId: string, ngoId: string): boolean => {
    const posts = mockDB.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return false;
    if (posts[index].acceptedNgoId !== ngoId) return false;

    posts[index].status = FoodStatus.AVAILABLE;
    delete posts[index].acceptedNgoId;
    delete posts[index].acceptedNgoName;
    delete posts[index].ngoPhone;
    delete posts[index].ngoProfilePhoto;
    delete posts[index].ngoRating;

    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    notifyUpdate();
    return true;
  },

  markReached: (postId: string, ngoId: string): FoodPost | null => {
    const posts = mockDB.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;
    if (posts[index].acceptedNgoId !== ngoId) return null;

    posts[index].status = FoodStatus.REACHED;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    notifyUpdate();
    return posts[index];
  },

  confirmPickup: (postId: string, donorId: string): FoodPost | null => {
    const posts = mockDB.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return null;
    const post = posts[index];
    if (post.donorId !== donorId) return null;
    if (post.status !== FoodStatus.REACHED) return null;

    posts[index].status = FoodStatus.COMPLETED;
    posts[index].completedAt = new Date().toISOString();
    
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    updateHistoryStatus(postId, 'Picked');
    notifyUpdate();
    return posts[index];
  },

  markPostAsRated: (postId: string) => {
    const posts = mockDB.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts[index].isRated = true;
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        notifyUpdate();
    }
  },

  saveDeliveryRecord: (record: Omit<DeliveryRecord, 'id'>) => {
    const history = JSON.parse(localStorage.getItem(DELIVERY_HISTORY_KEY) || '[]');
    const newRecord = { ...record, id: `del_${Date.now()}` };
    history.unshift(newRecord);
    localStorage.setItem(DELIVERY_HISTORY_KEY, JSON.stringify(history));
    
    const donationHistory: DonationHistoryRecord[] = JSON.parse(localStorage.getItem(DONATION_HISTORY_KEY) || '[]');
    const relevantItemIndex = donationHistory.findIndex(h => 
        h.donorId === record.donorId && 
        h.foodType === record.foodType &&
        h.status === 'Picked'
    );
    
    if (relevantItemIndex !== -1) {
        donationHistory[relevantItemIndex].status = 'Delivered';
        localStorage.setItem(DONATION_HISTORY_KEY, JSON.stringify(donationHistory));
    }

    notifyUpdate(); 
    return newRecord;
  },

  getDeliveryHistory: (ngoId: string, dateStr: string): DeliveryRecord[] => {
    const history: DeliveryRecord[] = JSON.parse(localStorage.getItem(DELIVERY_HISTORY_KEY) || '[]');
    return history.filter(r => r.ngoId === ngoId && r.date === dateStr);
  },
  
  getIncomingDeliveries: (recipientId: string): DeliveryRecord[] => {
    const history: DeliveryRecord[] = JSON.parse(localStorage.getItem(DELIVERY_HISTORY_KEY) || '[]');
    return history.filter(r => r.recipientId === recipientId);
  },

  getDonationHistory: (donorId: string): DonationHistoryRecord[] => {
    const history: DonationHistoryRecord[] = JSON.parse(localStorage.getItem(DONATION_HISTORY_KEY) || '[]');
    return history.filter(h => h.donorId === donorId);
  },

  cancelPost: (postId: string) => {
    const posts = mockDB.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts[index].status = FoodStatus.CANCELLED;
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        updateHistoryStatus(postId, 'Cancelled');
        notifyUpdate();
    }
  },

  deletePost: (postId: string) => {
    const posts = mockDB.getPosts().filter(p => p.id !== postId);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    notifyUpdate();
  },

  login: (email: string, password?: string): User | string | undefined => {
    const users = mockDB.getUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      (u.password === password || (!u.password && password === 'reserve123'))
    );
    
    if (user) {
        if (user.accountStatus === 'DISABLED') {
            return "Account Disabled. Please contact Admin.";
        }
        if (user.verificationStatus === 'PENDING') {
            return "Account Pending Verification. Please wait for admin approval.";
        }
        if (user.verificationStatus === 'REJECTED') {
            return "Account Registration Rejected. Please contact support.";
        }
        return user;
    }
    
    return undefined;
  }
};
