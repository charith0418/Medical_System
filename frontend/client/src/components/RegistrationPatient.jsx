import React, { useState, useEffect } from 'react';
import { FaPlusSquare, FaPhoneAlt, FaPrint, FaDownload, FaUserShield } from "react-icons/fa";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Sanitize base URL by stripping trailing slashes or duplicate '/api'
const rawUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://medical-system-5fwx.onrender.com';

const API_BASE_URL = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

const RegistrationPatient = () => {
  const initialFormState = {
    fullName: '',
    nic: '',
    dob: '',
    gender: '',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    email: '',
    password: '',
    guardianName: '',   
    guardianPhone: ''   
  };

  const [formData, setFormData] = useState(initialFormState);
  const [generatedPatientId, setGeneratedPatientId] = useState("Awaiting ID...");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill security password with DOB digits (YYYYMMDD) when date changes
  useEffect(() => {
    if (formData.dob) {
      const formattedPassword = formData.dob.replace(/-/g, '');
      setFormData(prev => ({
        ...prev,
        password: formattedPassword
      }));
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToast = toast.loading("Saving to secure medical database...");

    // Input Sanitization
    const trimmedFullName = formData.fullName.trim();
    const trimmedNic = formData.nic.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedGuardianName = formData.guardianName.trim();
    const trimmedGuardianPhone = formData.guardianPhone.trim();
    const finalPassword = formData.password.trim() || trimmedNic || 'Medicare@123';

    try {
      const token = localStorage.getItem('token'); 

      // Fallback unique identifiers matching backend schemas
      const generatedTempId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedTempQR = `MEDNET-VALIDATION-NODE-${generatedTempId}-${trimmedNic || Date.now()}`;

      // Clean single /api/auth/register endpoint call
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        {
          role: 'Patient',
          fullName: trimmedFullName,
          nic: trimmedNic,
          dob: formData.dob,
          gender: formData.gender,
          phone: trimmedPhone,
          address: trimmedAddress,
          bloodGroup: formData.bloodGroup,
          email: trimmedEmail,
          password: finalPassword,
          guardianName: trimmedGuardianName,   
          guardianPhone: trimmedGuardianPhone, 
          patientId: generatedTempId,
          qrCodeData: generatedTempQR
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true
        }
      );

      // Handle 200/201 success responses cleanly
      if (response.data && (response.data.success || response.status === 200 || response.status === 201)) {
        const serverPatient = response.data.patientProfile;
        const assignedId = serverPatient?.patientId || response.data?.user?.patientId || generatedTempId;
        
        setGeneratedPatientId(assignedId);
        setIsRegistered(true);

        toast.success(response.data?.message || "Patient Profile Registered Successfully!", {
          id: loadingToast,
          duration: 4000,
          style: {
            background: '#078a72',
            color: '#ffffff',
            fontWeight: 'bold',
          }
        });
      }
    } catch (error) {
      console.error("API error during registration:", error);
      
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Error reaching database server.";
      
      toast.error(`Registry Error: ${errorMessage}`, {
        id: loadingToast,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadManifest = () => {
    const manifestData = {
      ...formData,
      patientId: generatedPatientId,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifestData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `patient_manifest_${generatedPatientId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Manifest downloaded locally");
  };

  // QR Code URL based on assigned Patient ID or NIC fallback
  const qrDataValue = generatedPatientId !== "Awaiting ID..." ? generatedPatientId : (formData.nic || "MEDICARE-PREVIEW");
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=0A2540&data=${encodeURIComponent(qrDataValue)}`;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 text-slate-800 p-6 lg:p-10 space-y-8">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* PATIENT REGISTRATION FORM */}
        <div className="xl:col-span-2 bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 print:hidden">
          <div className="pb-4 border-b border-slate-100 mb-6 text-left">
            <h2 className="text-2xl font-black text-slate-950 tracking-wide">Hospital Admission Registry</h2>
            <p className="text-sm lg:text-base text-slate-500 mt-1">
              Input new patient demographics to initialize secure hardware identification access profiles.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 text-left">
                <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Patient Full Name</label>
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName" 
                  value={formData.fullName}
                  placeholder="e.g. John Doe" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="text-left">
                <label htmlFor="nic" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">NIC / National ID Number</label>
                <input 
                  type="text" 
                  id="nic"
                  name="nic" 
                  value={formData.nic}
                  placeholder="Enter identity registration code" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="text-left">
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Contact Phone Vector</label>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone" 
                  value={formData.phone}
                  placeholder="e.g. 0771234567" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="text-left">
                <label htmlFor="guardianName" className="block text-xs font-bold uppercase tracking-wider text-[#078a72] mb-2 flex items-center gap-1.5">
                  <FaUserShield /> Emergency Guardian Full Name
                </label>
                <input 
                  type="text" 
                  id="guardianName"
                  name="guardianName" 
                  value={formData.guardianName}
                  placeholder="e.g. Jane Doe (Spouse / Guardian)" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-[#078a72]/30 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="text-left">
                <label htmlFor="guardianPhone" className="block text-xs font-bold uppercase tracking-wider text-[#078a72] mb-2 flex items-center gap-1.5">
                  <FaPhoneAlt className="text-[10px]" /> Guardian Emergency Phone Vector
                </label>
                <input 
                  type="tel" 
                  id="guardianPhone"
                  name="guardianPhone" 
                  value={formData.guardianPhone}
                  placeholder="e.g. 0779876543" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-[#078a72]/30 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="text-left">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  name="email" 
                  value={formData.email}
                  placeholder="e.g. patient@domain.com" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="text-left">
                <label htmlFor="dob" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  id="dob"
                  name="dob" 
                  value={formData.dob}
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="text-left">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400">Security Password</label>
                  <a 
                    href="/login"
                    className="text-xs font-bold text-[#078a72] hover:underline"
                  >
                    Change Password?
                  </a>
                </div>
                <input 
                  type="text" 
                  id="password"
                  name="password" 
                  value={formData.password}
                  placeholder="Auto-fills with DOB (YYYYMMDD)" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label htmlFor="gender" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gender</label>
                  <select 
                    id="gender"
                    name="gender" 
                    value={formData.gender}
                    onChange={handleChange} 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bloodGroup" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Blood Type</label>
                  <select 
                    id="bloodGroup"
                    name="bloodGroup" 
                    value={formData.bloodGroup}
                    onChange={handleChange} 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                    required
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 text-left">
                <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Residential Street Address</label>
                <input 
                  type="text" 
                  id="address"
                  name="address" 
                  value={formData.address}
                  placeholder="Enter physical residential locator details" 
                  onChange={handleChange} 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-950 focus:bg-white focus:ring-2 focus:ring-[#078a72] focus:outline-none transition-all" 
                  required 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-4 text-white font-bold text-sm rounded-xl shadow-md transition-colors tracking-wide ${
                  isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#078a72] hover:bg-[#056b58] cursor-pointer'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Register & Save to Database'}
              </button>
            </div>
          </form>
        </div>

        {/* SMART CARD PREVIEW */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-between text-center min-h-[580px]">
          <div className="w-full flex flex-col items-center">
            <div className="pb-4 border-b border-slate-100 mb-6 text-left w-full print:hidden">
              <h2 className="text-2xl font-black text-slate-950 tracking-wide">Live Card Matrix</h2>
              <p className="text-sm text-slate-500 mt-1">Real-time verification layout output generator</p>
            </div>
            
            <div id="printable-health-card" className="w-[360px] sm:w-[420px] h-[260px] bg-gradient-to-br from-[#1C4E80] to-[#0A2540] text-white rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-slate-950 group transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5 z-10">
                <div className="flex items-center gap-2.5">
                  <FaPlusSquare className="text-xl text-emerald-400" />
                  <div className="text-left">
                    <h1 className="text-xs font-black tracking-widest uppercase leading-none">Medicare Health Network</h1>
                    <p className="text-[8px] text-slate-400 uppercase font-semibold mt-0.5 tracking-wider">Secure Identification Profile</p>
                  </div>
                </div>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 font-black text-[8px] px-2 py-0.5 rounded tracking-wide">EMERGENCY DATA</span>
              </div>

              <div className="flex flex-1 items-center justify-between gap-4 py-3 z-10 text-left">
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Full Registered Name</p>
                    <h2 className="text-sm font-bold truncate max-w-[200px] text-white mt-0.5 tracking-wide">
                      {formData.fullName || "Awaiting Registry Input"}
                    </h2>
                  </div>
                  
                  <div>
                    <p className="text-[7px] text-[#078a72] uppercase font-bold tracking-widest">Emergency Guardian</p>
                    <h3 className="text-xs font-semibold truncate max-w-[200px] text-slate-200 leading-tight">
                      {formData.guardianName || "Not Provided"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Patient File ID</p>
                      <p className="text-xs font-mono font-bold tracking-wider mt-0.5 text-slate-200">{generatedPatientId}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Blood Type</p>
                      <p className="text-sm font-black text-emerald-400 mt-0.5">{formData.bloodGroup}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-lg border border-slate-200/20">
                  <img 
                    src={qrCodeUrl} 
                    alt="Patient QR Code" 
                    className="w-16 h-16 sm:w-20 sm:h-20"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between z-10 text-slate-300">
                <div className="flex flex-col gap-0.5 text-[8px]">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Primary Contact:</span>
                    <span className="font-bold font-mono text-white">{formData.phone || "--- --- ----"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#078a72]">ICE Phone:</span>
                    <span className="font-bold font-mono text-emerald-400">{formData.guardianPhone || "--- --- ----"}</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono opacity-40 tracking-widest self-end">ISO CR-80</span>
              </div>
            </div>

            <div className="mt-6 px-6 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-black text-slate-700 tracking-wide print:hidden">
              System Assigned Node ID: <span className="text-[#078a72] font-mono">{generatedPatientId}</span>
            </div>
          </div>

          <div className="w-full space-y-2 mt-6 print:hidden">
            <button 
              type="button" 
              onClick={handlePrint}
              disabled={!isRegistered}
              className={`w-full py-3.5 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 tracking-wide ${
                isRegistered 
                  ? 'bg-slate-900 text-white hover:bg-black cursor-pointer shadow-md' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <FaPrint /> Print Secure Smart Card
            </button>
            <button 
              type="button" 
              onClick={handleDownloadManifest}
              disabled={!isRegistered}
              className={`w-full py-3 border font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 tracking-wide ${
                isRegistered 
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm' 
                  : 'border-transparent text-slate-300 cursor-not-allowed'
              }`}
            >
              <FaDownload /> Cache Local Manifest
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-health-card, #printable-health-card * { visibility: visible !important; }
          #printable-health-card {
            position: absolute !important;
            left: 50% !important;
            top: 40% !important;
            transform: translate(-50%, -50%) scale(1.4) !important;
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationPatient;