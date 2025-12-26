
import React, { useEffect, useState } from 'react';
import { mockDB } from '../../services/mockDatabase';
import { FoodPost, FoodStatus, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { FoodCard } from '../../components/FoodCard';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Loader2, History, ArrowRight, Star, X } from 'lucide-react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<FoodPost | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const loadPosts = () => {
    if (user) {
      const allPosts = mockDB.getPosts();
      setPosts(allPosts.filter(p => p.donorId === user.id));
    }
  };

  useEffect(() => {
    loadPosts();
    const interval = setInterval(loadPosts, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const confirmPickup = async (donationId: string) => {
    if (!user) return;
    setLoadingAction(donationId);

    try {
      const response = await API.post('/donor/confirm-pickup', { 
        donationId,
        donorId: user.id 
      });
      if (response.data.success) {
        alert("Pickup confirmed! Donation completed.");
        mockDB.confirmPickup(donationId, user.id);
        loadPosts();
      }
    } catch (error) {
      console.warn("API failed, falling back to MockDB logic for demo", error);
      const result = mockDB.confirmPickup(donationId, user.id);
      if (result) {
        alert("Pickup confirmed (Local). Donation completed.");
        loadPosts();
      } else {
        alert("Could not confirm pickup. Please check status.");
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRateNgo = () => {
    if (!ratingTarget || !user || !ratingTarget.acceptedNgoId) return;
    
    if (ratingValue === 0) {
        alert("Please select a star rating.");
        return;
    }

    // Save review to DB
    const success = mockDB.addNgoReview(ratingTarget.acceptedNgoId, {
        donorId: user.id,
        donorName: user.name,
        rating: ratingValue,
        feedback: reviewText
    });

    if (success) {
        mockDB.markPostAsRated(ratingTarget.id);
        alert("Rating submitted successfully! Thank you.");
        setRatingModalOpen(false);
        setRatingValue(0);
        setReviewText("");
        setRatingTarget(null);
        loadPosts();
    } else {
        alert("Failed to submit rating.");
    }
  };

  const handleAction = (post: FoodPost, actionType: string, payload?: any) => {
    if (!user) return;

    if (actionType === 'DELETE') {
       if(window.confirm("Delete this post?")) {
          mockDB.deletePost(post.id);
          loadPosts();
       }
    } 
    else if (actionType === 'CONFIRM_PICKUP') {
      confirmPickup(post.id);
    }
    else if (actionType === 'RATE_NGO') {
        setRatingTarget(post);
        setRatingModalOpen(true);
        setRatingValue(0);
        setReviewText("");
    }
  };

  // Only show Active posts. Past posts are now in History page.
  // BUT we keep COMPLETED posts here TEMPORARILY if they are unrated, so the donor sees the "Rate NGO" button.
  // Or simpler: History page is for history. Dashboard is for active.
  // However, the prompt says "After confirm pickup, add a new button visible ONLY to the donor". 
  // If we move completed posts immediately to history, the user might miss the rate button.
  // For better UX, we can keep "Completed & Unrated" posts in dashboard or just include COMPLETED in the filter below if needed.
  // Current logic: dashboard shows everything except cancelled? 
  // The original code filtered: `p.status !== FoodStatus.COMPLETED`.
  // I will Modify the filter to SHOW Completed IF they are NOT rated yet, so the Rate button is actionable.
  
  const activePosts = posts.filter(p => 
      (p.status !== FoodStatus.COMPLETED && p.status !== FoodStatus.CANCELLED) || 
      (p.status === FoodStatus.COMPLETED && !p.isRated)
  );

  return (
    <div>
      {/* RATING MODAL */}
      {ratingModalOpen && ratingTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setRatingModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                  <X size={20} />
              </button>

              <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 font-serif">Rate Your Experience</h3>
                  <p className="text-slate-500 text-sm mt-1">How was the pickup with <span className="font-bold text-slate-700">{ratingTarget.acceptedNgoName}</span>?</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star} 
                        onClick={() => setRatingValue(star)}
                        className={`transition hover:scale-110 ${ratingValue >= star ? 'text-yellow-400 fill-current' : 'text-slate-200'}`}
                    >
                        <Star size={36} fill={ratingValue >= star ? "currentColor" : "none"} />
                    </button>
                 ))}
              </div>

              <textarea 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none mb-6 bg-slate-50"
                rows={3}
                placeholder="Share your feedback (optional)..."
                maxLength={200}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />

              <button 
                onClick={handleRateNgo}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition shadow-lg"
              >
                Submit Rating
              </button>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 font-serif">My Donations</h1>
           <p className="text-slate-500 mt-1">Manage active pickups and contributions.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/donor/history" className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-6 py-3 rounded-full flex items-center font-bold shadow-sm transition">
            <History size={20} className="mr-2" />
            View History
          </Link>
          <Link to="/donor/create" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full flex items-center font-bold shadow-lg transition hover:-translate-y-0.5">
            <Plus size={20} className="mr-2" />
            Donate Food
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-bold text-slate-700 mb-6 flex items-center">
            <span className="w-2 h-8 bg-primary-500 rounded-full mr-3"></span>
            Live Status
          </h2>
          {activePosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Plus className="text-slate-300" size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-700">No active donations</h3>
               <p className="text-slate-500 mb-6">Your generosity starts here. Create your first post!</p>
               <button 
                onClick={() => navigate('/donor/create')}
                className="text-primary-600 font-bold hover:underline flex items-center justify-center mx-auto"
               >
                 Create Post <ArrowRight size={16} className="ml-1" />
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activePosts.map(post => (
                <div key={post.id} className="relative">
                  <FoodCard 
                    post={post} 
                    userRole={UserRole.DONOR} 
                    currentUserId={user?.id}
                    onAction={handleAction}
                  />
                  {loadingAction === post.id && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                      <Loader2 className="animate-spin text-primary-600" size={32} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DonorDashboard;
