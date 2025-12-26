
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Home, Heart, ShieldCheck, Upload, FileText } from 'lucide-react';

const RecipientRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    organization: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    documentUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    if (!formData.documentUrl) {
       if(!confirm("No verification document uploaded. Your account will be pending until you provide proof. Continue?")) return;
    }

    // Default mock location (Chennai) for demo purposes
    const mockLocation = { lat: 13.0810, lng: 80.2710 }; 

    register({
      name: formData.name, // Contact Person
      email: formData.email,
      password: formData.password,
      role: UserRole.RECIPIENT,
      organization: formData.organization, // Orphanage Name
      phone: formData.phone,
      address: formData.address,
      location: mockLocation,
      documentUrl: formData.documentUrl
    });

    // Alert and Redirect
    alert("Orphanage registered successfully! Your account is now Pending Verification. Please wait for Admin approval.");
    navigate('/recipient-login');
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
             <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 group-hover:scale-110 transition">
                <Home size={20} />
             </div>
             <span className="font-serif text-xl font-bold text-slate-900">ReServe</span>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">Register Home</h1>
          <p className="text-slate-500">Create a beneficiary account to receive donations.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Role Selection Look-alike */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">I am joining as...</label>
            <div className="p-4 rounded-2xl border-2 border-pink-500 bg-pink-50 text-pink-700 shadow-md ring-1 ring-pink-200 text-center relative cursor-default">
                <div className="absolute top-3 right-3 text-pink-500">
                   <ShieldCheck size={20} />
                </div>
                <span className="block font-bold text-lg mb-1 flex items-center justify-center gap-2">
                  <Home size={20} /> Orphanage / Home
                </span>
                <span className="text-xs font-medium opacity-80">Receiving Food Donations</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Organization / Home Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Sunrise Children's Home"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition bg-slate-50 focus:bg-white" 
              value={formData.organization} 
              onChange={e => setFormData({...formData, organization: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contact Person</label>
            <input 
              required 
              type="text" 
              placeholder="Manager Name"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition bg-slate-50 focus:bg-white" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
            <input 
              required 
              type="tel" 
              placeholder="Contact Number"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition bg-slate-50 focus:bg-white" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input 
              required 
              type="email" 
              placeholder="home@example.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition bg-slate-50 focus:bg-white" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Address</label>
            <textarea 
              required 
              rows={2}
              placeholder="Street address, City, Zip Code"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition bg-slate-50 focus:bg-white resize-none" 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>

          {/* Proof Document Upload */}
          <div className="md:col-span-2">
             <label className="block text-sm font-bold text-slate-700 mb-2">
               Registration Proof <span className="text-slate-400 font-normal">(License/Cert)</span>
             </label>
             <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition group ${formData.documentUrl ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-400 hover:bg-slate-50'}`}>
                <input type="file" className="hidden" id="doc-upload" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
                <label htmlFor="doc-upload" className="cursor-pointer block w-full h-full">
                    <Upload size={24} className={`mx-auto mb-2 transition ${formData.documentUrl ? 'text-pink-600' : 'text-slate-400 group-hover:text-pink-500'}`} />
                    {formData.documentUrl ? (
                         <span className="text-pink-700 font-bold">Document Uploaded Successfully</span>
                    ) : (
                        <>
                            <p className="text-sm text-slate-500 font-medium">Click to upload Government ID or Registration Cert</p>
                            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                        </>
                    )}
                </label>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Create Password</label>
            <input 
              required 
              type="password" 
              placeholder="********"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition bg-slate-50 focus:bg-white" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
            <input 
              required 
              type="password" 
              placeholder="********"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition bg-slate-50 focus:bg-white" 
              value={formData.confirmPassword} 
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-pink-200 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <ShieldCheck size={20} />
              Register Account
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-600">
          Already registered? <Link to="/recipient-login" className="text-pink-600 font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RecipientRegister;
