
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { UtensilsCrossed, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DistributeNGOSignup: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    phone: '',
    address: '',
    documentUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.documentUrl) {
       if(!confirm("No verification document uploaded. Your account will be pending until you provide proof. Continue?")) return;
    }

    // Register as NGO
    register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: UserRole.NGO,
      organization: formData.organization,
      phone: formData.phone,
      address: formData.address,
      location: { lat: 13.0827, lng: 80.2707 }, // Default Chennai location for demo
      documentUrl: formData.documentUrl
    });

    alert("Partner account registered! Your account is Pending Verification by Admin.");
    navigate('/distribute-ngologin');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFormData({ ...formData, documentUrl: `https://fake-storage.com/docs/${file.name}` });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-2xl border border-slate-100">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <UtensilsCrossed className="text-primary-600 group-hover:scale-110 transition" size={24} />
            <span className="font-serif text-xl font-bold text-slate-900">ReServe</span>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">Partner Registration</h1>
          <p className="text-slate-500">Join as a Distribution Partner.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="md:col-span-2 p-4 bg-primary-50 rounded-xl border border-primary-100 text-center">
             <h3 className="font-bold text-primary-800">Distribution NGO Account</h3>
             <p className="text-sm text-primary-600">This account type is specifically for managing food distribution to recipients.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Organization Name</label>
            <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contact Name</label>
            <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input required type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
            <input required type="tel" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
            <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Verification Proof</label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${formData.documentUrl ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-400'}`}>
                <input type="file" className="hidden" id="dist-doc-upload" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
                <label htmlFor="dist-doc-upload" className="cursor-pointer block w-full h-full">
                    <Upload size={24} className={`mx-auto mb-2 ${formData.documentUrl ? 'text-primary-600' : 'text-slate-400'}`} />
                    {formData.documentUrl ? <span className="text-primary-700 font-bold">Uploaded!</span> : <span className="text-slate-500 font-medium">Upload Cert/License</span>}
                </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input required type="password" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-200 hover:-translate-y-0.5">
              Register Partner
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account? <Link to="/distribute-ngologin" className="text-primary-600 font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default DistributeNGOSignup;
