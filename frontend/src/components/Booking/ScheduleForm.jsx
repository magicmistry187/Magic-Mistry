import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../../components/Booking/BookingContext';
import { Clock, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const timeSlots = [
  '09:00 AM – 11:00 AM',
  '11:00 AM – 01:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
];

export default function ScheduleForm() {
  const { bookingState, updateBooking, scrollToNextStep } = useBooking();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [curYear, setCurYear]   = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());

  /* ── helpers ─────────────────────────────────────── */
  const daysInMonth   = new Date(curYear, curMonth + 1, 0).getDate();
  const firstWeekday  = new Date(curYear, curMonth, 1).getDay();

  const goPrev = () => {
    if (curMonth === 0) { setCurYear(y => y - 1); setCurMonth(11); }
    else setCurMonth(m => m - 1);
  };
  const goNext = () => {
    if (curMonth === 11) { setCurYear(y => y + 1); setCurMonth(0); }
    else setCurMonth(m => m + 1);
  };

  const isPrevDisabled =
    curYear < today.getFullYear() ||
    (curYear === today.getFullYear() && curMonth <= today.getMonth());

  const handleDayClick = (day) => {
    const d = new Date(curYear, curMonth, day);
    if (d < today) return;
    const iso = [
      curYear,
      String(curMonth + 1).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-');
    updateBooking('date', iso);
  };

  const selectedIso = bookingState.date || '';

  const isoOf = (day) =>
    `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isToday  = (day) =>
    day === today.getDate() &&
    curMonth === today.getMonth() &&
    curYear  === today.getFullYear();

  const isPast   = (day) => new Date(curYear, curMonth, day) < today;
  const isSel    = (day) => isoOf(day) === selectedIso;

  /* ── readable label for banner ───────────────────── */
  const readableDate = selectedIso
    ? new Date(selectedIso + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  /* ── grid cells: blanks + day numbers ───────────── */
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white p-7 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="relative z-10 mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1E40] flex items-center gap-4 tracking-tight">
          <span className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl w-10 h-10 inline-flex items-center justify-center text-lg font-black shadow-lg shadow-blue-500/30">
            3
          </span>
          Schedule Date and Time
        </h2>
      </div>

      {/* ── CALENDAR ────────────────────────────────── */}
      <div className="mb-8 relative z-10">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          <CalendarDays className="w-4 h-4 text-indigo-500" /> Pick a Date
        </label>

        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">

          {/* Month header */}
          <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-6 py-4">
            <button
              onClick={goPrev}
              disabled={isPrevDisabled}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-slate-800 font-extrabold text-base tracking-wide">
              {MONTH_NAMES[curMonth]} {curYear}
            </span>
            <button
              onClick={goNext}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 hover:text-indigo-600 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day-name headers */}
          <div className="grid grid-cols-7 bg-white pt-4 pb-2 px-2">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 bg-white px-2 pb-4">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`blank-${idx}`} className="h-10" />;
              }

              const past = isPast(day);
              const sel  = isSel(day);
              const tod  = isToday(day);

              return (
                <div key={day} className="flex justify-center items-center h-10">
                  <button
                    onClick={() => handleDayClick(day)}
                    disabled={past}
                    className={[
                      'h-10 w-10 flex flex-col items-center justify-center text-sm font-semibold rounded-full transition-all duration-300 relative',
                      sel
                        ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/40 z-10 scale-110'
                        : tod
                        ? 'text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100'
                        : past
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-100 cursor-pointer',
                    ].join(' ')}
                  >
                    {day}
                    {/* Today dot */}
                    {tod && !sel && (
                      <span className="w-1 h-1 rounded-full bg-indigo-600 absolute bottom-1.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 px-6 py-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Selected
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              Not available
            </span>
          </div>
        </div>

        {/* Selected date pill */}
        {readableDate && (
          <div className="mt-4 flex items-center justify-center gap-2 bg-indigo-50/80 border border-indigo-100 rounded-2xl px-5 py-3 text-sm text-indigo-900 font-bold shadow-sm">
            <CalendarDays className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            {readableDate}
          </div>
        )}
      </div>

      {/* ── TIME SLOTS ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedIso && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden relative z-10"
          >
            <div className="pt-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          <Clock className="w-4 h-4 text-indigo-500" /> Preferred Time Slot
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => {
                updateBooking('timeSlot', slot);
                if (scrollToNextStep) scrollToNextStep('step-address-form');
              }}
              className={`py-4 px-4 text-sm rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-0.5 ${
                bookingState.timeSlot === slot
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-extrabold shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:shadow-sm font-semibold'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}