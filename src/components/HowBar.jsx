import { KeySquare } from 'lucide-react';
import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdOutlineDashboard } from "react-icons/md";

const HowBar = () => {
  return (
    <div className='flex flex-col py-10'>
        <h1 className='text-6xl font-bold text-white text-center'>How it works?</h1>
    <div className="flex mt-10 items-center justify-center  text-white space-x-12 px-4">
       
      {/* Step 1 - Login */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Breathing wave rings */}
          <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-sky-400/30 animate-pulse scale-110"></div>
          <div className="absolute inset-0 rounded-full bg-sky-400/10 animate-ping animation-delay-1000 scale-125"></div>
          
          {/* Main circle */}
          <div className="relative p-4 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <KeySquare className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="mt-4 font-semibold text-lg">Step 1</h1>
        <p className="text-sm text-center text-gray-300 max-w-40">
          Login to your account and get started.
        </p>
      </div>

      {/* Connecting Line */}
      <div className="flex-1 h-[2px] bg-gradient-to-r from-sky-500/50 via-green-500/50 to-green-500/50 relative">
        <div className="absolute inset-0 h-full bg-gradient-to-r from-sky-500/30 via-green-500/30 to-green-500/30 blur-sm"></div>
      </div>

      {/* Step 2 - Market */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Breathing wave rings */}
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping animation-delay-500"></div>
          <div className="absolute inset-0 rounded-full bg-green-400/30 animate-pulse scale-110 animation-delay-300"></div>
          <div className="absolute inset-0 rounded-full bg-green-400/10 animate-ping animation-delay-1500 scale-125"></div>
          
          {/* Main circle */}
          <div className="relative p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shadow-green-500/25">
            <FaIndianRupeeSign className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="mt-4 font-semibold text-lg">Step 2</h1>
        <p className="text-sm text-center text-gray-300 max-w-40">
          Explore the market, choose a company, and invest.
        </p>
      </div>

      {/* Connecting Line */}
      <div className="flex-1 h-[2px] bg-gradient-to-r from-green-500/50 via-yellow-500/50 to-yellow-500/50 relative">
        <div className="absolute inset-0 h-full bg-gradient-to-r from-green-500/30 via-yellow-500/30 to-yellow-500/30 blur-sm"></div>
      </div>

      {/* Step 3 - Dashboard */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Breathing wave rings */}
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping animation-delay-1000"></div>
          <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-pulse scale-110 animation-delay-600"></div>
          <div className="absolute inset-0 rounded-full bg-yellow-400/10 animate-ping animation-delay-2000 scale-125"></div>
          
          {/* Main circle */}
          <div className="relative p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shadow-yellow-500/25">
            <MdOutlineDashboard className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="mt-4 font-semibold text-lg">Step 3</h1>
        <p className="text-sm text-center text-gray-300 max-w-40">
          Track your portfolio and manage stocks in the dashboard.
        </p>
      </div>
    </div>
    </div>
  );
};

export default HowBar;