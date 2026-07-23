import React from 'react';
import DispatchQueue from '../components/common/DispatchQueue'; 
import { Snowflake, Refrigerator, WashingMachine, Wrench, Tv, Fan } from 'lucide-react';

export default function DispatchDataPassing() {
  // Expanded data so pagination is visible
  const queueData = [
    {
      id: '#FX-8092',
      appliance: { name: 'LG Split AC', icon: <Snowflake size={18} strokeWidth={1.5} /> },
      customer: 'Sarah Jenkins',
      technician: { name: 'Mike R.', avatar: 'https://i.pravatar.cc/150?u=mike' },
      status: { label: 'Assigned', type: 'assigned' },
      action: 'View'
    },
    {
      id: '#FX-8091',
      appliance: { name: 'Samsung Fridge', icon: <Refrigerator size={18} strokeWidth={1.5} /> },
      customer: 'David Chen',
      technician: null,
      status: { label: 'Awaiting Tech', type: 'awaiting' },
      action: 'Assign'
    },
    {
      id: '#FX-8088',
      appliance: { name: 'Bosch Washer', icon: <WashingMachine size={18} strokeWidth={1.5} /> },
      customer: 'Elena Rodriguez',
      technician: { name: 'John D.', initials: 'JD', avatar: null },
      status: { label: 'Under Diagnosis', type: 'diagnosis', icon: <Wrench size={12} strokeWidth={2} /> },
      action: 'View'
    },
    {
      id: '#FX-8087',
      appliance: { name: 'Sony OLED TV', icon: <Tv size={18} strokeWidth={1.5} /> },
      customer: 'Marcus Johnson',
      technician: { name: 'Sarah L.', initials: 'SL', avatar: null },
      status: { label: 'Assigned', type: 'assigned' },
      action: 'View'
    },
    {
      id: '#FX-8086',
      appliance: { name: 'Dyson Fan', icon: <Fan size={18} strokeWidth={1.5} /> },
      customer: 'Amanda Lee',
      technician: null,
      status: { label: 'Awaiting Tech', type: 'awaiting' },
      action: 'Assign'
    },
    {
      id: '#FX-8085',
      appliance: { name: 'LG Split AC', icon: <Snowflake size={18} strokeWidth={1.5} /> },
      customer: 'Tom Baker',
      technician: { name: 'Mike R.', avatar: 'https://i.pravatar.cc/150?u=mike' },
      status: { label: 'Completed', type: 'default' },
      action: 'View'
    },
    {
      id: '#FX-8084',
      appliance: { name: 'Whirlpool Fridge', icon: <Refrigerator size={18} strokeWidth={1.5} /> },
      customer: 'Nina Patel',
      technician: { name: 'John D.', initials: 'JD', avatar: null },
      status: { label: 'Under Diagnosis', type: 'diagnosis', icon: <Wrench size={12} strokeWidth={2} /> },
      action: 'View'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-start justify-center pt-20">
      {/* 
        Pass itemsPerPage={5} to show 5 items per page. 
        Since we have 7 items, it will create 2 pages total.
      */}
      <DispatchQueue 
        title="Centralized Dispatch Queue" 
        data={queueData} 
        itemsPerPage={5}
      />
    </div>
  );
}