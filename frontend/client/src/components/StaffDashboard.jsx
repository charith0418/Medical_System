import React, { useState, useEffect, useRef } from 'react';
import {
  FaSearch,
  FaQrcode,
  FaFileMedical,
  FaPrescription,
  FaUserCheck,
  FaTimes,
  FaCalendarAlt,
  FaStethoscope,
  FaUserMd,
  FaClock,
  FaCapsules,
  FaPrint,
  FaPlusSquare,
  FaPhoneAlt,
  FaCamera,
  FaStop,
  FaCheckCircle,
  FaHistory,
  FaExclamationCircle,
  FaConciergeBell,
  FaPills,
  FaClinicMedical
} from 'react-icons/fa';

import { Html5Qrcode } from 'html5-qrcode';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const StaffDashboard = () => {
  // Detect role from localStorage or default to receptionist
  const savedRole = localStorage.getItem('userRole') || 'receptionist'; // 'receptionist' | 'pharmacist'
  const [activeRole, setActiveRole] = useState(savedRole);

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showMedicalCards, setShowMedicalCards] = useState(false);
  const [loading, setLoading] = useState(true);

  // Receptionist states
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState('');

  // Pharmacist states
  const [showPrescriptionHistory, setShowPrescriptionHistory] = useState(false);
  const [dispensedStatus, setDispensedStatus] = useState({});

  // QR Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [scannerMessage, setScannerMessage] = useState('');

  const scannerRef = useRef(null);
  const scanLockRef = useRef(false);

  useEffect(() => {
    const fetchLiveRecords = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/patients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed connecting to internal medical API');
        }

        const data = await response.json();

        const normalized = data.map((p) => ({
          id: p.patientId || (p._id ? p._id.substring(18).toUpperCase() : 'N/A'),
          _id: p._id,
          name: p.fullName || 'Registered Patient',
          nic: p.nic || 'N/A',
          dob: p.dob && typeof p.dob === 'string' ? p.dob.split('T')[0] : 'N/A',
          gender: p.gender || 'Not Specified',
          phone: p.phone || 'N/A',
          bloodGroup: p.bloodGroup || 'N/A',
          history: Array.isArray(p.history) ? p.history : [],
          prescriptions: Array.isArray(p.prescriptions) ? p.prescriptions : [],
          date: p.updatedAt
            ? new Date(p.updatedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            : 'Recent'
        }));

        setPatients(normalized);
      } catch (err) {
        console.error('Database connection error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveRecords();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.id.toLowerCase().includes(value.toLowerCase()) ||
        p.nic.toLowerCase().includes(value.toLowerCase())
    );

    setSearchResults(filtered);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setSearchResults([]);
    setCheckInSuccess('');
    setShowMedicalCards(true);
    setShowPrescriptionHistory(false);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (error) {
        console.warn('Scanner cleanup error:', error);
      }
      scannerRef.current = null;
    }
  };

  const closeScanner = async () => {
    await stopScanner();
    scanLockRef.current = false;
    setScannerError('');
    setScannerMessage('');
    setShowScanner(false);
  };

  const startScanner = async () => {
    setShowScanner(true);
    setScannerError('');
    setScannerMessage('Starting camera...');
    scanLockRef.current = false;

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1
          },
          async (decodedText) => {
            if (scanLockRef.current) return;

            scanLockRef.current = true;
            const scannedValue = decodedText.trim();

            setScannerMessage(`Scanned: ${scannedValue}`);

            const patient = patients.find(
              (p) =>
                String(p.id).toLowerCase() === scannedValue.toLowerCase() ||
                String(p.nic).toLowerCase() === scannedValue.toLowerCase() ||
                String(p._id).toLowerCase() === scannedValue.toLowerCase()
            );

            if (patient) {
              await stopScanner();
              setShowScanner(false);
              setScannerMessage('');
              setScannerError('');
              setSelectedPatient(patient);
              setSearchQuery('');
              setSearchResults([]);
              setShowMedicalCards(true);
              setShowPrescriptionHistory(false);
            } else {
              setScannerError(
                `No patient found for "${scannedValue}". Please scan a valid patient QR code.`
              );

              setTimeout(() => {
                scanLockRef.current = false;
                setScannerError('');
              }, 2000);
            }
          },
          () => {}
        );

        setScannerMessage('Point the camera at the patient QR code.');
      } catch (error) {
        console.error('Camera scanner error:', error);
        setScannerError(
          'Could not open camera. Please ensure camera permissions are allowed.'
        );
        setScannerMessage('');
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const parseSingleScript = (script) => {
    if (!script) return [];

    if (typeof script === 'string') {
      return [
        {
          name: script,
          dosage: '',
          instruction: 'Take as directed',
          duration: 'N/A',
          date: new Date()
        }
      ];
    }

    const scriptDate = script.createdAt || script.date || script.updatedAt;

    const subList = Array.isArray(script.medicines)
      ? script.medicines
      : Array.isArray(script.medications)
      ? script.medications
      : Array.isArray(script.items)
      ? script.items
      : Array.isArray(script.prescriptions)
      ? script.prescriptions
      : null;

    if (subList && subList.length > 0) {
      return subList.map((med) => {
        if (typeof med === 'string') {
          return {
            name: med,
            dosage: '',
            instruction: 'Take as directed',
            duration: 'N/A',
            date: scriptDate,
            doctorName: script.doctorName || script.doctor
          };
        }
        return {
          name:
            med.medicineName ||
            med.drug ||
            med.name ||
            (med.medicineMasterId && typeof med.medicineMasterId === 'object'
              ? med.medicineMasterId.medicineName || med.medicineMasterId.name
              : null) ||
            'Prescribed Item',
          dosage: med.dosage || '',
          instruction:
            med.instruction ||
            med.frequency ||
            med.dosageInstructions ||
            'Take as directed',
          duration: med.duration || 'N/A',
          date: scriptDate,
          doctorName: script.doctorName || script.doctor
        };
      });
    }

    const directName =
      script.medicineName ||
      script.drug ||
      script.name ||
      (script.medicineMasterId && typeof script.medicineMasterId === 'object'
        ? script.medicineMasterId.medicineName || script.medicineMasterId.name
        : null);

    if (directName) {
      return [
        {
          name: directName,
          dosage: script.dosage || '',
          instruction:
            script.instruction ||
            script.frequency ||
            script.dosageInstructions ||
            'Take as directed',
          duration: script.duration || 'N/A',
          date: scriptDate,
          doctorName: script.doctorName || script.doctor
        }
      ];
    }

    return [];
  };

  const categorizePrescriptions = (prescriptionList) => {
    if (!Array.isArray(prescriptionList) || prescriptionList.length === 0) {
      return { todayPrescriptions: [], pastPrescriptions: [] };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const todayList = [];
    const pastList = [];

    prescriptionList.forEach((script) => {
      const parsedItems = parseSingleScript(script);
      const scriptDate = script.createdAt || script.date || script.updatedAt;

      const isToday =
        scriptDate && new Date(scriptDate).toISOString().split('T')[0] === todayStr;

      if (isToday || prescriptionList.indexOf(script) === prescriptionList.length - 1) {
        todayList.push(...parsedItems);
      } else {
        pastList.push(...parsedItems);
      }
    });

    return {
      todayPrescriptions: todayList,
      pastPrescriptions: pastList
    };
  };

  const toggleDispensed = (drugIndex) => {
    setDispensedStatus((prev) => ({
      ...prev,
      [drugIndex]: !prev[drugIndex]
    }));
  };

  const handleRegisterCheckIn = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setCheckInSuccess(
      `Patient ${selectedPatient.name} checked in successfully${
        selectedDepartment ? ` and assigned to ${selectedDepartment}` : ''
      }.`
    );
    setSelectedDepartment('');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 text-slate-800 p-6 lg:p-10 space-y-8">
      {/* MODE SWITCHER / HEADER BAR */}
      <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#078a72]/10 text-[#078a72] rounded-xl text-xl">
            {activeRole === 'receptionist' ? <FaConciergeBell /> : <FaPills />}
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              Staff Workstation
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Current Active Mode:{' '}
              <span className="font-bold text-[#078a72] capitalize">
                {activeRole}
              </span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveRole('receptionist');
              setShowMedicalCards(true);
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
              activeRole === 'receptionist'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaConciergeBell />
            Receptionist View
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('pharmacist');
              setShowMedicalCards(true);
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
              activeRole === 'pharmacist'
                ? 'bg-[#078a72] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaPills />
            Pharmacist View
          </button>
        </div>
      </div>

      {/* SCANNER BANNER */}
      <div className="w-full bg-white p-6 lg:p-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/10 via-transparent to-transparent flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden print:hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 opacity-60" />

        <div className="flex items-center gap-6 text-left">
          <div className="p-5 bg-emerald-50 text-[#078a72] rounded-xl text-4xl shadow-2xs shrink-0 ring-4 ring-emerald-500/5">
            <FaQrcode />
          </div>

          <div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-950 tracking-wide">
              {activeRole === 'receptionist'
                ? 'Reception QR Card Scanner'
                : 'Pharmacy QR Prescription Scanner'}
            </h2>
            <p className="text-sm lg:text-base text-slate-500 mt-1 max-w-2xl">
              {activeRole === 'receptionist'
                ? "Scan patient's Smart Health Card to confirm identity and process visit check-in."
                : "Scan patient's Smart Health Card to load today's doctor prescriptions for medicine issuing."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={startScanner}
          className="flex items-center gap-2 px-6 py-3 bg-[#078a72] hover:bg-[#056b58] text-white border border-emerald-600 rounded-xl font-bold text-xs tracking-wide uppercase shadow-md whitespace-nowrap transition-colors cursor-pointer"
        >
          <FaCamera />
          Scan Patient Card
        </button>
      </div>

      {/* MODAL CAMERA SCANNER */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Scan Patient Card
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Point camera at the QR code.
                </p>
              </div>

              <button
                type="button"
                onClick={closeScanner}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5">
              <div
                id="qr-reader"
                className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950"
              />

              {scannerMessage && (
                <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-medium">
                  {scannerMessage}
                </div>
              )}

              {scannerError && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                  {scannerError}
                </div>
              )}

              <button
                type="button"
                onClick={closeScanner}
                className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <FaStop />
                Stop Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL SEARCH LOOKUP */}
      <div className="w-full bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 relative shadow-xs print:hidden">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block text-left">
          Manual Medical Registry Database Lookup
        </label>

        <div className="flex w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#078a72] transition-all">
          <input
            type="text"
            placeholder="Type patient registration ID, name, or NIC..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-transparent px-5 py-4 outline-none text-base font-medium placeholder-slate-400 text-slate-950"
          />

          <button
            type="button"
            className="bg-[#078a72] hover:bg-[#056b58] text-white px-8 flex items-center justify-center text-lg gap-2 font-bold transition-colors"
          >
            <FaSearch />
            <span className="hidden sm:inline text-sm tracking-wide">
              Search
            </span>
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-[120px] left-6 right-6 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
            {searchResults.map((p) => (
              <div
                key={p._id || p.id}
                onClick={() => handleSelectPatient(p)}
                className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-slate-200 text-[#078a72] flex items-center justify-center font-bold text-lg border border-slate-300">
                    {p.name.charAt(0)}
                  </div>

                  <div className="text-left">
                    <h4 className="text-base font-bold text-slate-900">
                      {p.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {p.id} • NIC: {p.nic}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold bg-[#078a72]/10 text-[#078a72] px-4 py-1.5 rounded-md tracking-wide">
                  Select Patient
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SELECTED PATIENT QUICK BAR */}
      {selectedPatient && (
        <div className="w-full bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn print:hidden">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-full ring-2 ring-emerald-500 bg-slate-800 text-white flex items-center justify-center font-bold text-xl">
              {selectedPatient.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-wide">
                  {selectedPatient.name}
                </h3>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700">
                  {selectedPatient.id}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 font-medium">
                NIC: {selectedPatient.nic} • DOB: {selectedPatient.dob} • Group:{' '}
                <span className="font-bold text-emerald-400">
                  {selectedPatient.bloodGroup}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeRole === 'receptionist' && (
              <button
                onClick={() => setShowMedicalCards(!showMedicalCards)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 tracking-wide cursor-pointer border border-slate-700"
              >
                <FaPrint />
                {showMedicalCards ? 'Print Health Card View' : 'Back to Reception View'}
              </button>
            )}

            <button
              onClick={() => {
                setSelectedPatient(null);
                setShowMedicalCards(false);
                setCheckInSuccess('');
              }}
              className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition text-sm cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* ROLE VIEW 1: RECEPTIONIST INTERFACE */}
      {selectedPatient && activeRole === 'receptionist' && showMedicalCards && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slideUp text-left">
          {/* PATIENT SUMMARY & CHECK-IN FORM */}
          <div className="xl:col-span-2 bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">
                  <FaUserCheck />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    Check-In Patient Visit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register today's arrival and assign the patient to a hospital department/clinic.
                  </p>
                </div>
              </div>

              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">
                Card Verified
              </span>
            </div>

            {checkInSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium text-sm flex items-center gap-2">
                <FaCheckCircle className="text-emerald-600 text-lg" />
                {checkInSuccess}
              </div>
            )}

            <form onSubmit={handleRegisterCheckIn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DEPARTMENT ONLY SELECTION */}
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                    Assign Clinic / Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#078a72]"
                  >
                    <option value="">-- Select Department --</option>
                    <option value="General OPD">General OPD</option>
                    <option value="Cardiology Clinic">Cardiology Clinic</option>
                    <option value="Pediatrics Clinic">Pediatrics Clinic</option>
                    <option value="Orthopedics Clinic">Orthopedics Clinic</option>
                    <option value="ENT Clinic">ENT Clinic</option>
                    <option value="Dental Clinic">Dental Clinic</option>
                    <option value="OPD / Emergency">OPD / Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedPatient.phone}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#078a72] hover:bg-[#056b58] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaCheckCircle />
                Confirm & Send to Department Queue
              </button>
            </form>

            {/* PREVIOUS VISITS HISTORY */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Previous Consultation Logs
              </h4>

              {selectedPatient.history.length > 0 ? (
                <div className="space-y-2">
                  {selectedPatient.history.slice(0, 3).map((h, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {h.diagnosis || 'General Visit'}
                        </span>
                        <span className="text-slate-400 block font-mono">
                          Department: {h.department || h.clinic || 'Outpatient'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {h.date ? new Date(h.date).toLocaleDateString() : 'Previous'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No previous visit logs recorded.</p>
              )}
            </div>
          </div>

          {/* QUICK PRINT CARD SIDEBAR */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between shadow-xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <FaQrcode /> Smart Health Card Actions
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                If the patient lost their card or requires a printed duplicate, click below to launch the CR-80 card print preview.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowMedicalCards(false)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaPrint />
              Print Smart Health Card
            </button>
          </div>
        </div>
      )}

      {/* ROLE VIEW 2: PHARMACIST INTERFACE */}
      {selectedPatient && activeRole === 'pharmacist' && showMedicalCards && (
        <div className="space-y-6 animate-slideUp text-left">
          {(() => {
            const { todayPrescriptions, pastPrescriptions } =
              categorizePrescriptions(selectedPatient.prescriptions);

            return (
              <>
                {/* TODAY'S PRESCRIPTIONS */}
                <div className="bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg p-6 lg:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 text-[#078a72] rounded-xl text-2xl">
                        <FaCapsules />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-wide">
                            Today's Active Prescription
                          </h2>
                          <span className="bg-emerald-500 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                            Active Order
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Issued today by doctor for immediate medicine dispensing.
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                      Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {todayPrescriptions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {todayPrescriptions.map((drug, dIdx) => {
                          const isDone = dispensedStatus[dIdx];

                          return (
                            <div
                              key={dIdx}
                              className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                isDone
                                  ? 'bg-slate-50 border-slate-200 opacity-60'
                                  : 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1 text-[#078a72] font-black text-lg">
                                  {dIdx + 1}.
                                </div>

                                <div>
                                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                                    {drug.name}
                                    {drug.dosage && (
                                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                        {drug.dosage}
                                      </span>
                                    )}
                                  </h4>

                                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 mt-2">
                                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                                      <FaStethoscope className="text-emerald-600" />
                                      {drug.instruction}
                                    </span>

                                    <span className="flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                                      <FaClock className="text-slate-400" />
                                      Duration: {drug.duration}
                                    </span>

                                    {drug.doctorName && (
                                      <span className="flex items-center gap-1 text-slate-500">
                                        <FaUserMd />
                                        Dr. {drug.doctorName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleDispensed(dIdx)}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer self-start md:self-auto ${
                                  isDone
                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    : 'bg-[#078a72] hover:bg-[#056b58] text-white shadow-sm'
                                }`}
                              >
                                <FaCheckCircle />
                                {isDone ? 'Marked as Issued' : 'Dispense Medicine'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                      <FaExclamationCircle className="mx-auto text-slate-400 text-2xl" />
                      <p className="text-slate-600 font-medium text-sm">
                        No active prescription issued for today yet.
                      </p>
                    </div>
                  )}

                  {/* PRESCRIPTION HISTORY TOGGLE BUTTON */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Need to review previous doctor visits or medications?
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowPrescriptionHistory(!showPrescriptionHistory)}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <FaHistory />
                      {showPrescriptionHistory
                        ? 'Hide History'
                        : `Visualize History (${pastPrescriptions.length + selectedPatient.history.length})`}
                    </button>
                  </div>
                </div>

                {/* HISTORICAL DATA */}
                {showPrescriptionHistory && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <FaPrescription className="text-slate-500 text-lg" />
                          <h3 className="font-bold text-slate-900 text-base">
                            Past Prescriptions
                          </h3>
                        </div>
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                          {pastPrescriptions.length} Records
                        </span>
                      </div>

                      {pastPrescriptions.length > 0 ? (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                          {pastPrescriptions.map((drug, idx) => (
                            <div key={idx} className="p-4 bg-white hover:bg-slate-50/50 transition space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {drug.name} {drug.dosage ? `(${drug.dosage})` : ''}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  {drug.date ? new Date(drug.date).toLocaleDateString() : 'Previous'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500">{drug.instruction}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                          No previous prescriptions found.
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <FaFileMedical className="text-slate-500 text-lg" />
                          <h3 className="font-bold text-slate-900 text-base">
                            Consultation History
                          </h3>
                        </div>
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                          {selectedPatient.history.length} Visits
                        </span>
                      </div>

                      {selectedPatient.history && selectedPatient.history.length > 0 ? (
                        selectedPatient.history.map((record, index) => (
                          <div
                            key={record._id || index}
                            className="border border-slate-100 rounded-xl p-4 bg-slate-50/60 space-y-2 text-xs"
                          >
                            <div className="font-bold text-slate-900">
                              Diagnosis: {record.diagnosis || 'General Visit'}
                            </div>
                            <div className="text-slate-500">
                              Department: {record.department || record.clinic || 'Outpatient'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                          No consultation records found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* CARD PRINT PREVIEW (COMMON) */}
      {selectedPatient && !showMedicalCards && (
        <div className="w-full flex flex-col items-center justify-center animate-fadeIn print:p-0">
          <div
            id="printable-health-card"
            className="w-[500px] h-[300px] bg-gradient-to-br from-[#1C4E80] to-[#0A2540] text-white rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-slate-950"
          >
            <div className="absolute -right-4 -top-4 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />

            <div className="flex justify-between items-center border-b border-white/10 pb-3 z-10">
              <div className="flex items-center gap-3">
                <FaPlusSquare className="text-2xl text-emerald-400" />
                <div className="text-left">
                  <h1 className="text-sm font-black tracking-widest uppercase leading-none">
                    Medicare Health Network
                  </h1>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold mt-1 tracking-wider">
                    Secure Identification Profile
                  </p>
                </div>
              </div>

              <span className="bg-red-500/20 text-red-300 border border-red-500/30 font-black text-[10px] px-3 py-1 rounded-md tracking-wide">
                EMERGENCY DATA
              </span>
            </div>

            <div className="flex flex-1 items-center justify-between gap-6 py-4 z-10 text-left">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                    Full Registered Name
                  </p>
                  <h2 className="text-lg font-bold truncate max-w-[260px] text-white mt-0.5 tracking-wide">
                    {selectedPatient.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                      Patient File ID
                    </p>
                    <p className="text-sm font-mono font-bold tracking-wider mt-0.5">
                      {selectedPatient.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                      Blood Type
                    </p>
                    <p className="text-base font-black text-emerald-400 mt-0.5">
                      {selectedPatient.bloodGroup}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded-2xl shrink-0 shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0A2540&data=${encodeURIComponent(
                    selectedPatient.id
                  )}`}
                  alt="QR Verification"
                  className="w-24 h-24"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between z-10 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <FaPhoneAlt className="text-[10px] text-emerald-400" />
                <span className="text-[10px] tracking-wide text-slate-400">
                  ICE Contact:
                </span>
                <span className="font-bold font-mono tracking-wide">
                  {selectedPatient.phone}
                </span>
              </div>

              <span className="text-[9px] font-mono opacity-40 tracking-widest">
                ISO CR-80 COMPLIANT
              </span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-[500px] mt-6 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 print:hidden cursor-pointer tracking-wide"
          >
            <FaPrint />
            Print Smart Health Card
          </button>
        </div>
      )}

      {/* RECENT SESSIONS LIST */}
      {!selectedPatient && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 w-full text-left print:hidden shadow-xs">
          <h3 className="text-xs font-bold mb-4 text-slate-400 uppercase tracking-wider">
            Recent Patient Check-ins
          </h3>

          {loading ? (
            <div className="py-10 text-center text-slate-400 font-medium">
              Loading current database profiles...
            </div>
          ) : patients.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-medium">
              No medical database patient entries detected.
            </div>
          ) : (
            <div className="space-y-2">
              {patients.slice(0, 5).map((p) => (
                <div
                  key={p._id || p.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-[#078a72] flex items-center justify-center font-black">
                      {p.name.charAt(0)}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-800">
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {p.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 font-medium">
                      {p.date}
                    </span>

                    <button
                      onClick={() => handleSelectPatient(p)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer tracking-wide"
                    >
                      {activeRole === 'receptionist'
                        ? 'Check-In Patient'
                        : 'Dispense Medicine'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #printable-health-card,
          #printable-health-card * {
            visibility: visible !important;
          }

          #printable-health-card {
            position: absolute !important;
            left: 50% !important;
            top: 40% !important;
            transform: translate(-50%, -50%) scale(1.4) !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;