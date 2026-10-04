import StaffSidebar from "../components/StaffSidebar";
import RegisterationPatient from "../components/RegistrationPatient";
import StaffDashboard from "../components/StaffDashboard";
import Patients from "../components/Patients";
import ScanQR from "../components/ScanQR";
import Reports from "../components/Reports";
import Treatments from "../components/Treatments";
import Prescriptions from "../components/Prescription";

function Staff() {
  return (
    // 1. Flex layout lets the sidebar and content sit side-by-side
    <div className="flex bg-gray-100 h-screen overflow-hidden">
      
      {/* Left side navigation */}
      <StaffSidebar />
      
      {/* Right side content pane wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar Header */}
        <header className="bg-white p-4 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Register Patient</h1>
          <div className="bg-gray-300 w-9 h-9 rounded-full"></div>
        </header>

        {/* Form View Body Container */}
        <main className="p-6">
          <RegisterationPatient />
          <StaffDashboard />
          < Patients />
          <ScanQR />
          <Reports />
          <Treatments />
          <Prescriptions />
        </main>

      </div>
    </div>
  );
}

export default Staff;