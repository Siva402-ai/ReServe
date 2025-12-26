
import React from 'react';
import { FoodPost, FoodStatus, UserRole, FreshnessLevel } from '../types';
import { FRESHNESS_COLORS } from '../constants';
import { MapPin, Phone, CheckCircle, Star, Navigation, Clock, ShieldCheck, ExternalLink, Locate, XCircle, ThumbsUp } from 'lucide-react';

interface FoodCardProps {
  post: FoodPost;
  userRole: UserRole;
  currentUserId?: string;
  distance?: number;
  onAction?: (post: FoodPost, actionType: string, payload?: any) => void;
  ngoLocation?: { lat: number; lng: number };
}

export const FoodCard: React.FC<FoodCardProps> = ({ post, userRole, currentUserId, distance, onAction, ngoLocation }) => {
  const isDonor = userRole === UserRole.DONOR;
  const isNgo = userRole === UserRole.NGO;

  // Aggregate freshness
  const hasRiskyItems = post.items.some(i => i.freshness === FreshnessLevel.RISKY);
  const hasBadItems = post.items.some(i => i.freshness === FreshnessLevel.NOT_FRESH);
  const aggregateFreshness = hasBadItems ? FreshnessLevel.NOT_FRESH : (hasRiskyItems ? FreshnessLevel.RISKY : FreshnessLevel.FRESH);

  // Status Helpers
  const isAccepted = post.status === FoodStatus.ACCEPTED;
  const isReached = post.status === FoodStatus.REACHED;
  const isCompleted = post.status === FoodStatus.COMPLETED;
  
  // NGO context
  const isAssignedToMe = isNgo && post.acceptedNgoId === currentUserId;
  const isAssignedToOther = isNgo && post.acceptedNgoId && !isAssignedToMe;

  // --- GOOGLE MAPS NAVIGATION ---
  let destination = "";
  if (post.location && post.location.lat && post.location.lng) {
    destination = `${post.location.lat},${post.location.lng}`;
  } else {
    destination = post.donorAddress || "Unknown Location";
  }
  
  const originParam = ngoLocation ? `&origin=${ngoLocation.lat},${ngoLocation.lng}` : '';
  const mapsUrl = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

  // ----------------------------------------------------------------------
  // RENDER: DONOR VIEW - UBER/OLA STYLE NGO CARD
  // ----------------------------------------------------------------------
  if (isDonor && (isAccepted || isReached)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden relative">
        <div className={`p-4 flex items-center justify-between ${isReached ? 'bg-orange-50' : 'bg-blue-50'}`}>
          <div className="flex items-center">
            {isReached ? (
               <MapPin className="text-orange-600 mr-2 animate-bounce" size={20} />
            ) : (
               <div className="relative mr-2">
                 <span className="flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                 </span>
               </div>
            )}
            <span className={`font-bold ${isReached ? 'text-orange-700' : 'text-blue-700'}`}>
              {isReached ? "NGO has arrived!" : "NGO is on the way"}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
             ETA: {isReached ? 'Here' : '10 mins'}
          </span>
        </div>

        <div className="p-6 flex flex-col items-center border-b border-slate-100">
          <div className="relative mb-3">
            <img 
              src={post.ngoProfilePhoto || "https://via.placeholder.com/150"} 
              alt="NGO Profile" 
              className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div className="absolute -bottom-2 bg-white px-2 py-0.5 rounded-full shadow border border-slate-100 flex items-center">
              <span className="font-bold text-slate-800 text-xs mr-1">{post.ngoRating || 5.0}</span>
              <Star size={10} className="text-yellow-400 fill-current" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800">{post.acceptedNgoName}</h3>
          <p className="text-slate-500 text-sm">Volunteer Partner</p>

          <div className="flex gap-3 mt-4 w-full">
            <a href={`tel:${post.ngoPhone}`} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex items-center justify-center font-medium transition">
              <Phone size={18} className="mr-2" />
              Call
            </a>
            <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex items-center justify-center font-medium transition">
              <ShieldCheck size={18} className="mr-2" />
              Profile
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50">
           <div className="mb-4">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Pickup Details</h4>
             <p className="text-slate-700 font-medium text-sm flex justify-between">
                <span>{post.items.length} Items</span>
                <span className="text-slate-500">Donation #{post.id.slice(-4)}</span>
             </p>
           </div>
           {isReached ? (
             <button
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 if (onAction) onAction(post, 'CONFIRM_PICKUP');
               }}
               className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition transform active:scale-95"
             >
               Confirm Pickup
             </button>
           ) : (
             <div className="text-center text-xs text-slate-400 font-medium py-3 border border-slate-200 rounded-xl border-dashed">
               Waiting for NGO to arrive...
             </div>
           )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: STANDARD VIEW (NGOs, History, or Available/Completed Donor Posts)
  // ----------------------------------------------------------------------
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow relative ${isAssignedToOther ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      
      <div className="absolute top-4 right-4 flex gap-2">
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${FRESHNESS_COLORS[aggregateFreshness]}`}>
          {aggregateFreshness}
        </span>
        {isCompleted && <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">Completed</span>}
      </div>

      <div className="p-5">
        <div className="mb-4 pr-16">
          <h3 className="font-bold text-slate-800 text-lg mb-1">{post.items[0].name}</h3>
          {post.items.length > 1 && (
            <p className="text-xs text-slate-500">
              + {post.items.length - 1} other items
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
             <Clock size={12} className="inline mr-1" />
             Posted {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>

        <div className="space-y-3 mb-4">
           {/* Address */}
           <div className="flex items-start text-sm">
              <MapPin size={16} className="text-slate-400 mr-2 mt-0.5 shrink-0" />
              <div className="flex-1">
                 <p className="text-slate-700 font-medium">{post.donorName}</p>
                 <p className="text-xs text-slate-500 leading-snug">{post.donorAddress}</p>
              </div>
           </div>

           {/* Distance display: Only show if valid (>0 and <1000km to filter out errors) */}
           {distance !== undefined && distance > 0 && distance < 1000 && (
              <div className="flex items-center text-sm">
                 <Navigation size={16} className="text-blue-500 mr-2" />
                 <span className="text-blue-600 font-medium">{distance} km away</span>
              </div>
           )}
        </div>

        {/* --- ACTIONS --- */}
        
        {isDonor && (
          <div className="pt-4 border-t border-slate-100">
             {!isCompleted ? (
               <div className="flex items-center justify-between text-slate-500 text-sm">
                  <span>Waiting for NGO...</span>
               </div>
             ) : (
                // Completed State Actions
                !post.isRated ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if(onAction) onAction(post, 'RATE_NGO');
                        }}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-950 py-2.5 rounded-lg font-bold shadow-sm transition active:scale-95 flex items-center justify-center"
                    >
                        <ThumbsUp size={18} className="mr-2" />
                        Rate NGO
                    </button>
                ) : (
                    <div className="w-full bg-slate-50 text-slate-400 py-2 rounded-lg text-sm font-bold text-center border border-slate-100">
                        Rating Submitted
                    </div>
                )
             )}
          </div>
        )}

        {isNgo && (
          <div className="pt-4 border-t border-slate-100">
             {post.status === FoodStatus.AVAILABLE && (
               <div className="flex flex-col gap-2">
                 <button
                   onClick={() => onAction?.(post, 'ACCEPT')}
                   className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold shadow-sm transition active:scale-95 flex items-center justify-center"
                 >
                   Accept Donation
                 </button>
                 
                 <a 
                   href={mapsUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-2.5 rounded-lg font-bold transition flex items-center justify-center"
                 >
                   <MapPin size={18} className="mr-2" />
                   View on Maps
                 </a>
               </div>
             )}

             {isAssignedToMe && isAccepted && (
               <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onAction?.(post, 'MARK_REACHED')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-sm transition active:scale-95 flex items-center justify-center"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    I Have Arrived
                  </button>

                  <a 
                   href={mapsUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg font-bold transition flex items-center justify-center"
                  >
                   <Navigation size={18} className="mr-2" />
                   Navigate
                  </a>

                  <button
                    onClick={() => onAction?.(post, 'CANCEL_PICKUP')}
                    className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-lg font-bold transition flex items-center justify-center"
                  >
                    <XCircle size={18} className="mr-2" />
                    Cancel Order
                  </button>
               </div>
             )}

             {isAssignedToMe && isReached && (
               <div className="w-full bg-orange-50 text-orange-700 py-2.5 rounded-lg font-medium text-sm text-center border border-orange-100">
                 Waiting for Donor Confirmation...
               </div>
             )}

             {isAssignedToOther && (
               <div className="w-full bg-slate-100 text-slate-400 py-2 rounded-lg text-sm text-center">
                 Taken by {post.acceptedNgoName}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
