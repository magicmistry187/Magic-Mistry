import React from 'react';
import MatrixBar from '../components/common/MatrixBar';
import { 
  Banknote, 
  Wrench, 
  Contact, 
  Star, 
  TrendingUp, 
  ClipboardList, 
  UserCog 
} from 'lucide-react';

export default function MatrixDataPassing() {
  return (
    <div className=" bg-slate-50 p-8 flex items-center justify-center font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full max-w-6xl">
        
        {/* Card 1: Total Revenue */}
        <MatrixBar
          delay={0.0}
          title="Total Revenue (MTD)"
          value="$45,289.00"
          watermarkIcon={<Banknote size={48} strokeWidth={1.5} />}
          watermarkColor="text-gray-400"
          footerIcon={<TrendingUp size={14} className="text-emerald-500" />}
          footerContent={
            <>
              <span className="font-semibold text-emerald-500">+12.5%</span>
              <span className="text-gray-500">vs last month</span>
            </>
          }
        />

        {/* Card 2: Active Service Requests */}
        <MatrixBar
          delay={0.1}
          title="Active Service Requests"
          value="142"
          watermarkIcon={<Wrench size={48} strokeWidth={1.5} />}
          watermarkColor="text-orange-300"
          footerIcon={<ClipboardList size={14} className="text-orange-400" />}
          footerContent={
            <span className="font-medium text-orange-400">
              48 awaiting assignment
            </span>
          }
        />

        {/* Card 3: Pending Vendors */}
        <MatrixBar
          delay={0.2}
          title="Pending Vendors"
          value="12"
          watermarkIcon={<Contact size={48} strokeWidth={1.5} />}
          watermarkColor="text-gray-400"
          footerIcon={<UserCog size={14} className="text-gray-500" />}
          footerContent={
            <span className="text-gray-500">
              Requires manual review
            </span>
          }
        />

        {/* Card 4: Avg. Satisfaction */}
        <MatrixBar
          delay={0.3}
          title="Avg. Satisfaction"
          value={
            <div className="flex items-baseline gap-1">
              <span>4.8</span>
              <span className="text-sm font-medium text-gray-500">/ 5.0</span>
            </div>
          }
          watermarkIcon={<Star size={48} strokeWidth={1.5} />}
          watermarkColor="text-orange-300"
          footerIcon={<Star size={14} className="text-orange-400 fill-orange-400" />}
          footerContent={
            <span className="text-gray-500">
              Based on 1.2k reviews
            </span>
          }
        />

      </div>
    </div>
  );
}