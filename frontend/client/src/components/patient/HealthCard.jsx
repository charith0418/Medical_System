import React, { useRef, useState } from "react";
import { FaPlusSquare, FaPhoneAlt, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas";

export default function HealthCard({ user = {}, emergencyContact = { phone: "+94 77 123 4567" } }) {
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate QR code using public API for simple, clean static images
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=14427D&data=${user.patientId || "Patient"}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);

      // Render the specific card target frame element only
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Boosts resolution for physical print clarity
        useCORS: true, // Crucial for loading the external QR Code API image
        backgroundColor: null, // Transparent corners outside rounded frame
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${user.patientId || "Patient"}_HealthCard.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Card download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm w-full h-full flex flex-col justify-between">
      
      {/* Action Header Row */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Your Smart Health Card</h3>
          <p className="text-xs text-slate-400 mt-1">
            Download a high-resolution offline copy.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-[#1E5FAD] hover:bg-[#14427D] disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer select-none shrink-0"
        >
          <FaDownload className={isDownloading ? "animate-bounce" : ""} />
          {isDownloading ? "Saving..." : "Download Card"}
        </button>
      </div>

      {/* Visual Canvas Card Frame Container */}
      <div className="flex-1 py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center min-h-[250px]">
        
        {/* Capturable ID Card - Target Container */}
        <div 
          ref={cardRef}
          className="w-[380px] h-[230px] bg-gradient-to-br from-[#1E5FAD] to-[#14427D] text-white rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden shrink-0 border border-blue-900"
        >
          {/* Subtle background overlay designs */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

          {/* Top Banner Row */}
          <div className="flex justify-between items-start border-b border-white/20 pb-2.5 z-10">
            <div className="flex items-center gap-2">
              <FaPlusSquare className="text-2xl text-emerald-300 shrink-0" />
              <div>
                <h1 className="text-xs font-bold tracking-wide uppercase leading-none">Medicare Network</h1>
                <p className="text-[8px] text-blue-200 tracking-wider uppercase font-medium mt-1">Smart Health Profile</p>
              </div>
            </div>
            <span className="bg-red-500/20 text-red-200 border border-red-400/30 font-black text-[9px] px-2 py-0.5 rounded-md tracking-wider">
              EMERGENCY
            </span>
          </div>

          {/* Dynamic Core Body Row */}
          <div className="flex flex-1 items-center justify-between gap-4 py-2 z-10">
            
            <div className="flex-1 space-y-2.5 text-left">
              <div>
                <p className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Patient Name</p>
                <h2 className="text-sm font-black truncate max-w-[190px] tracking-tight text-white">{user.name || "Patient Name"}</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Patient ID</p>
                  <p className="text-xs font-mono font-bold tracking-wide">{user.patientId || "P00001"}</p>
                </div>
                <div>
                  <p className="text-[8px] text-blue-200 uppercase font-bold tracking-wider">Blood Type</p>
                  <p className="text-xs font-black text-emerald-300">{user.bloodGroup || "--"}</p>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-1.5 rounded-xl shrink-0 flex items-center justify-center shadow-md">
              <img 
                src={qrCodeUrl}
                alt="Verification QR"
                className="w-16 h-16 object-contain"
                crossOrigin="anonymous" // Essential config for cross-origin image loads into canvas
              />
            </div>
          </div>

          {/* Bottom ICE bar Row */}
          <div className="border-t border-white/10 pt-2 flex items-center justify-between z-10 text-[9px]">
            <div className="flex items-center gap-1.5 text-blue-100">
              <FaPhoneAlt className="text-[8px] text-emerald-300" />
              <span className="font-medium opacity-80">ICE Contact:</span>
              <span className="font-bold font-mono tracking-wide">{emergencyContact.phone}</span>
            </div>
            <span className="text-[7px] font-mono opacity-35 tracking-tight">ISO CR-80 Secure Spec</span>
          </div>

        </div>
      </div>

    </div>
  );
}