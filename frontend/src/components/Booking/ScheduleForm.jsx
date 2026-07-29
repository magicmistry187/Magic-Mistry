import React, { useState } from 'react';
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
  const { bookingState, updateBooking } = useBooking();

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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-extrabold text-[#0B1E40] mb-5 flex items-center gap-3">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
          3
        </span>
        Schedule Date and Time
      </h2>

      {/* ── CALENDAR ────────────────────────────────── */}
      <div className="mb-6">
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          <CalendarDays className="w-3.5 h-3.5" /> Pick a Date
        </label>

        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Month header */}
          <div className="flex items-center justify-between bg-[#0B1E40] px-5 py-3.5">
            <button
              onClick={goPrev}
              disabled={isPrevDisabled}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-sm tracking-wide">
              {MONTH_NAMES[curMonth]} {curYear}
            </span>
            <button
              onClick={goNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/15 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day-name headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-gray-100">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 p-0">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`blank-${idx}`} className="bg-white h-10" />;
              }

              const past = isPast(day);
              const sel  = isSel(day);
              const tod  = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={past}
                  className={[
                    'bg-white h-10 w-full flex flex-col items-center justify-center text-sm font-medium transition-all',
                    sel
                      ? 'bg-[#0B1E40] text-white font-bold z-10'
                      : tod
                      ? 'text-blue-700 font-bold'
                      : past
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer',
                  ].join(' ')}
                  style={sel ? { backgroundColor: '#0B1E40', color: '#fff' } : {}}
                >
                  {day}
                  {/* Today dot — blue ring + small dot when not selected */}
                  {tod && !sel && (
                    <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5 block" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-50 border-t border-gray-100 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-blue-700 font-bold text-xs border-2 border-blue-400 bg-white">
                {today.getDate()}
              </span>
              Today
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#0B1E40] text-white font-bold text-xs">
                ✓
              </span>
              Selected
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-gray-300 text-xs">
                ✕
              </span>
              Not available
            </span>
          </div>
        </div>

        {/* Selected date pill */}
        {readableDate && (
          <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-blue-800 font-semibold">
            <CalendarDays className="w-4 h-4 text-blue-500 flex-shrink-0" />
            {readableDate}
          </div>
        )}
      </div>

      {/* ── TIME SLOTS ──────────────────────────────── */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          <Clock className="w-3.5 h-3.5" /> Preferred Time Slot
        </label>
        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => updateBooking('timeSlot', slot)}
              className={`py-2.5 px-3 text-sm rounded-xl border-2 transition-all ${
                bookingState.timeSlot === slot
                  ? 'border-blue-700 bg-blue-50 text-blue-900 font-semibold shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50 text-gray-700'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}