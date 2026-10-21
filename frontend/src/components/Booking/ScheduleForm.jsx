import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from './BookingContext';
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Sunrise,
  Check,
  Calendar,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_SLOTS = [
  { id: '09:00 AM – 11:00 AM', label: '09:00 AM – 11:00 AM', period: 'Morning Slot', Icon: Sunrise },
  { id: '11:00 AM – 01:00 PM', label: '11:00 AM – 01:00 PM', period: 'Midday Slot', Icon: Sun },
  { id: '02:00 PM – 04:00 PM', label: '02:00 PM – 04:00 PM', period: 'Afternoon Slot', Icon: Sun },
  { id: '04:00 PM – 06:00 PM', label: '04:00 PM – 06:00 PM', period: 'Evening Slot', Icon: Sunset },
];

export default function ScheduleForm() {
  const { bookingState, updateBooking, nextStep, prevStep, isStep2Valid } = useBooking();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [curYear, setCurYear]   = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  // Quick pick dates: Today, Tomorrow, Day After
  const quickDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-');

      let tag = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      dates.push({
        iso,
        tag,
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        isFastest: i === 0,
      });
    }
    return dates;
  }, [today]);

  /* Calendar helpers */
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

  const handleSelectIsoDate = (iso) => {
    updateBooking('date', iso);
  };

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

  const readableDate = selectedIso
    ? new Date(selectedIso + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  /* Calendar cells */
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-indigo-50/20">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Step 2 of 4
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1E40] tracking-tight">
          Choose Date &amp; Arrival Window
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Select a convenient day and a 2-hour window for our verified technician to arrive.
        </p>
      </div>

      <div className="p-5 sm:p-6 md:p-8 space-y-8">
        {/* Section 1: Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" /> Select Date
            </label>
            <button
              type="button"
              onClick={() => setShowFullCalendar(p => !p)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              {showFullCalendar ? 'Show Quick Dates' : 'Pick another date from calendar'}
            </button>
          </div>

          {/* Quick Date Chips */}
          {!showFullCalendar ? (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {quickDates.map((q) => {
                const isSelected = selectedIso === q.iso;
                return (
                  <button
                    key={q.iso}
                    type="button"
                    onClick={() => handleSelectIsoDate(q.iso)}
                    className={`p-3 sm:p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer relative h-full min-h-[96px] flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-50/90 to-blue-50/40 border-2 border-indigo-600 shadow-sm ring-2 ring-indigo-500/10'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    {q.isFastest && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        Fastest
                      </span>
                    )}
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {q.tag}
                    </span>
                    <span className={`text-xl sm:text-2xl font-black block my-0.5 ${
                      isSelected ? 'text-indigo-950 font-black' : 'text-slate-800'
                    }`}>
                      {q.dayNum}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 block">
                      {q.month}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Modern Full Month Calendar */
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              {/* Month Header */}
              <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-200">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={isPrevDisabled}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-extrabold text-[#0B1E40]">
                  {MONTH_NAMES[curMonth]} {curYear}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-white pt-3 pb-1 px-2">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7 gap-1 p-2">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`blank-${idx}`} className="h-9 sm:h-10" />;

                  const d = new Date(curYear, curMonth, day);
                  const iso = [
                    curYear,
                    String(curMonth + 1).padStart(2, '0'),
                    String(day).padStart(2, '0'),
                  ].join('-');
                  const isPast = d < today;
                  const isSel = iso === selectedIso;
                  const isCurrentDay = d.getTime() === today.getTime();

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleDayClick(day)}
                      className={`h-9 w-9 sm:h-10 sm:w-10 mx-auto rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                        isSel
                          ? 'bg-indigo-600 text-white shadow-xs font-black scale-105'
                          : isCurrentDay
                          ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200'
                          : isPast
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Date Summary Pill */}
          {readableDate && (
            <div className="mt-3.5 flex items-center gap-2 text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-100 rounded-xl px-4 py-2.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Selected Date: <strong className="font-extrabold">{readableDate}</strong></span>
            </div>
          )}
        </div>

        {/* Section 2: Arrival Window Chips */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" /> Preferred Arrival Window
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
            {TIME_SLOTS.map((slot) => {
              const isSelected = bookingState.timeSlot === slot.id;
              const { Icon } = slot;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => updateBooking('timeSlot', slot.id)}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer h-full min-h-[72px] ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-50/90 to-blue-50/40 border-indigo-600 shadow-sm ring-2 ring-indigo-500/10'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                        {slot.period}
                      </div>
                      <div className={`text-sm font-bold truncate leading-tight ${isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-800'}`}>
                        {slot.label}
                      </div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ml-2 ${
                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-transparent'
                  }`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Technician will call 30 minutes before arrival to confirm availability.
          </p>
        </div>

        {/* Step 2 Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            className="h-11 px-5 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            ← Back to Service
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={!isStep2Valid}
            className={`h-11 px-7 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
              isStep2Valid
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-md hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Continue to Address <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}