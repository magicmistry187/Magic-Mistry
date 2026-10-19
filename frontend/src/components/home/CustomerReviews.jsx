import React from 'react';
import { Star, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export default function CustomerReviews() {
  const reviews = [
    {
      id: 1,
      name: 'Sourav Mukherjee',
      location: 'Salt Lake Sector II, Kolkata',
      appliance: 'LG Double-Door Refrigerator',
      issue: 'Defrost sensor replaced & cooling restored',
      rating: 5,
      date: '2 days ago',
      review:
        'My fridge stopped cooling right before the weekend. Booked at 8 AM and the technician, Ratan Da, arrived by 9:30 AM. He tested the PCB, found a faulty defrost sensor, and replaced it with an original part. Tested everything before I paid via UPI. Super professional.',
      verified: true,
    },
    {
      id: 2,
      name: 'Ananya Roy Chowdhury',
      location: 'Shibpur, Howrah',
      appliance: 'Daikin 1.5 Ton Split AC',
      issue: 'Deep jet pump cleaning & water leakage fix',
      rating: 5,
      date: '1 week ago',
      review:
        'Two local mechanics couldn’t figure out why my AC was dripping water inside the bedroom. Magic Mistry technician cleared the choked drain pipe and did a foam jet cleaning. My AC is chilling like day one now. Upfront pricing with zero hidden charges.',
      verified: true,
    },
    {
      id: 3,
      name: 'Debashis Sen',
      location: 'New Town Action Area 1, Kolkata',
      appliance: 'IFB Front Load Washing Machine',
      issue: 'Drum vibration & drain pump motor service',
      rating: 5,
      date: '2 weeks ago',
      review:
        'Very transparent pricing. The technician showed me the worn-out belt and gave me the option to decide whether to replace it or adjust it. No advance payment demanded. Cleaned up the area after work was done. Will definitely recommend.',
      verified: true,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Verified Customer Stories
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E40] tracking-tight">
            Loved by 12,000+ Homes in West Bengal
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Real feedback from verified repair visits across Kolkata, Howrah, and nearby districts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#0B1E40]">4.9 out of 5</p>
            <p className="text-xs text-slate-500 font-medium">Google &amp; Direct Reviews</p>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Top rating & verified tag */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Visit
                </span>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-5 italic">
                "{rev.review}"
              </p>

              {/* Serviced Appliance Tag */}
              <div className="bg-slate-50 rounded-xl p-2.5 mb-5 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-700">{rev.appliance}</p>
                <p className="text-[10px] text-slate-500">{rev.issue}</p>
              </div>
            </div>

            {/* Reviewer Details */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-[#0B1E40]">{rev.name}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {rev.location}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {rev.date}
              </span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
