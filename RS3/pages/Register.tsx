
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { UtensilsCrossed, Home, Upload, Smartphone, Lock, Check } from 'lucide-react';
import { mockDB } from '../services/mockDatabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.DONOR,
    organization: '',
    phone: '',
    address: '',
    documentUrl: ''
  });

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if document is uploaded for NGO/Recipient
    if ((formData.role === UserRole.NGO || formData.role === UserRole.RECIPIENT) && !formData.documentUrl) {
        if (!confirm("No verification document uploaded. Your account will be pending until you provide proof. Continue?")) {
            return;
        }
    }

    // DONOR VERIFICATION FLOW
    if (formData.role === UserRole.DONOR && !isPhoneVerified) {
       // Open OTP Modal
       if (!formData.phone || formData.phone.length < 10) {
         alert("Please enter a valid phone number for verification.");
         return;
       }
       
       const sent = mockDB.sendOTP(formData.phone);
       if (sent) {
         setShowOtpModal(true);
       } else {
         alert("Failed to send OTP. Please check phone number.");
       }
       return; // Stop standard registration until verified
    }

    completeRegistration();
  };

  const completeRegistration = () => {
    const mockLocation = { lat: 40.7128 + (Math.random() * 0.1), lng: -74.0060 + (Math.random() * 0.1) };

    register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      organization: formData.organization,
      phone: formData.phone,
      address: formData.address,
      location: mockLocation,
      documentUrl: formData.documentUrl
    });
    
    if (formData.role === UserRole.NGO || formData.role === UserRole.RECIPIENT) {
        alert("Registration Successful! Your account is now Pending Verification. You will be able to login once an Admin approves your documents.");
        navigate('/login');
    } else if (formData.role === UserRole.DONOR) {
        alert("Verification Successful! Welcome to ReServe.");
        navigate('/donor');
    } else {
        navigate('/admin');
    }
  };

  const verifyOtp = () => {
    const result = mockDB.verifyOTP(formData.phone, otpInput);
    if (result.success) {
       setIsPhoneVerified(true);
       setShowOtpModal(false);
       completeRegistration();
    } else {
       setOtpError(result.message || "Invalid OTP");
    }
  };

  const getOrgLabel = () => {
    if (formData.role === UserRole.DONOR) return 'Establishment Name';
    if (formData.role === UserRole.NGO) return 'Organization Name';
    return 'Orphanage / Home Name';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFormData({ ...formData, documentUrl: `https://fake-storage.com/docs/${file.name}` });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative">
      
      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl transform scale-100">
            <div className="text-center mb-6">
               <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <Smartphone size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 font-serif">Verify Phone</h3>
               <p className="text-slate-500 mt-2">
                 Enter the verification code sent to <br/> <span className="font-bold text-slate-800">{formData.phone}</span>
               </p>
            </div>
            
            <div className="mb-6">
               <input 
                 type="text" 
                 maxLength={4}
                 placeholder="1234"
                 className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-b-2 border-slate-200 focus:border-primary-600 outline-none text-slate-800"
                 value={otpInput}
                 onChange={(e) => {
                    // Allow only numbers
                    if (/^\d*$/.test(e.target.value)) {
                       setOtpInput(e.target.value);
                       setOtpError('');
                    }
                 }}
               />
               {otpError && <p className="text-red-500 text-sm mt-3 text-center font-bold">{otpError}</p>}
            </div>

            <button 
              onClick={verifyOtp}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-200 mb-4"
            >
              Verify & Create Account
            </button>
            
            <button 
              onClick={() => setShowOtpModal(false)}
              className="w-full text-slate-500 font-bold text-sm hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-2xl border border-slate-100">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <UtensilsCrossed className="text-primary-600 group-hover:scale-110 transition" size={24} />
            <span className="font-serif text-xl font-bold text-slate-900">ReServe</span>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">Join the Movement</h1>
          <p className="text-slate-500">Create an account to start saving food.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">I am joining as...</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: UserRole.DONOR})}
                className={`p-4 rounded-2xl border-2 text-center transition ${formData.role === UserRole.DONOR ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-200' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}
              >
                <span className="block font-bold text-lg mb-1">Donor</span>
                <span className="text-xs text-slate-500 font-medium">Restaurant / Hotel</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: UserRole.NGO})}
                className={`p-4 rounded-2xl border-2 text-center transition ${formData.role === UserRole.NGO ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-200' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}
              >
                <span className="block font-bold text-lg mb-1">NGO</span>
                <span className="text-xs text-slate-500 font-medium">Charity / Food Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: UserRole.RECIPIENT})}
                className={`p-4 rounded-2xl border-2 text-center transition ${formData.role === UserRole.RECIPIENT ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-200' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}
              >
                <span className="block font-bold text-lg mb-1 flex items-center justify-center gap-1"><Home size={16}/> Orphanage</span>
                <span className="text-xs text-slate-500 font-medium">Receive Food</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {getOrgLabel()}
            </label>
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
            <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
               <span>Phone</span>
               {isPhoneVerified && <span className="text-emerald-600 text-xs flex items-center"><Check size={12} className="mr-1"/> Verified</span>}
            </label>
            <input 
              required 
              type="tel" 
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white ${isPhoneVerified ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
              value={formData.phone} 
              onChange={e => {
                  setFormData({...formData, phone: e.target.value});
                  setIsPhoneVerified(false); // Reset verification if number changes
              }} 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
            <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input required type="password" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition bg-slate-50 focus:bg-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          {/* Document Upload for NGO/Recipient */}
          {(formData.role === UserRole.NGO || formData.role === UserRole.RECIPIENT) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Verification Document (Certificate/License)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${formData.documentUrl ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'}`}>
                    <input type="file" className="hidden" id="doc-upload" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
                    <label htmlFor="doc-upload" className="cursor-pointer block w-full h-full">
                        <Upload size={24} className={`mx-auto mb-2 ${formData.documentUrl ? 'text-primary-600' : 'text-slate-400'}`} />
                        {formData.documentUrl ? (
                            <span className="text-primary-700 font-bold">Document Uploaded Successfully</span>
                        ) : (
                            <>
                                <p className="text-sm text-slate-600 font-medium">Click to upload verification proof</p>
                                <p className="text-xs text-slate-400 mt-1">Required for account approval</p>
                            </>
                        )}
                    </label>
                </div>
              </div>
          )}

          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-200 hover:-translate-y-0.5 flex items-center justify-center">
              {formData.role === UserRole.DONOR && !isPhoneVerified ? (
                 <>Verify Phone & Create Account</>
              ) : (
                 <>Create Account</>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
