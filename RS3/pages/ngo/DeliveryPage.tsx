
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/mockDatabase';
import { DeliveryMap } from '../../components/DeliveryMap';
import { getCurrentLocation } from '../../services/locationService';
import { ArrowLeft, Loader2, Navigation } from 'lucide-react';

const DeliveryPage: React.FC = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState<any>(null);
  const [ngoLocation, setNgoLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const recipients = mockDB.getRecipients();
        const found = recipients.find(r => r.id === recipientId);
        if (found) {
            setRecipient(found);
        }
        
        const loc = await getCurrentLocation();
        setNgoLocation(loc);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [recipientId]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    );
  }

  if (!recipient || !ngoLocation) {
    return (
        <div className="p-10 text-center">
            <h2 className="text-xl font-bold text-slate-800">Recipient Not Found</h2>
            <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 font-bold">Go Back</button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/ngo/distribute')} 
        className="mb-6 flex items-center text-slate-500 hover:text-slate-800 font-bold transition"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Distribution
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Delivery In Progress</h1>
        <p className="text-slate-500">Navigating to {recipient.name}</p>
      </div>

      <DeliveryMap ngoLocation={ngoLocation} recipientLocation={recipient.location} />

      <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start">
        <div className="bg-blue-100 p-3 rounded-xl mr-4 text-blue-600">
            <Navigation size={24} />
        </div>
        <div>
            <h3 className="font-bold text-blue-900 text-lg">Heading to {recipient.name}</h3>
            <p className="text-blue-700/80 mt-1 mb-4">
                Follow the route to complete the delivery. Once you arrive, confirm the delivery status.
            </p>
            <button 
                onClick={() => {
                    alert("Delivery started! (Demo)");
                    navigate('/ngo/distribute');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition"
            >
                Start Navigation
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
