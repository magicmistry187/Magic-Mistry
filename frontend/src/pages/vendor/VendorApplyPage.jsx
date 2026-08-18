import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, User, Phone,
  Mail, MapPin, Briefcase, Wrench, FileText, Shield,
  Upload, ChevronDown, Sparkles, AlertCircle, ExternalLink
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { submitVendorApplication } from '../../services/api';

/* ─── Animation Variants ─────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const slideIn = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.3 } },
};

/* ─── Service Categories ─────────────────────────────────────────── */
const serviceOptions = [
  'AC Repair', 'Refrigerator Repair', 'Washing Machine Repair', 'Microwave Repair',
  'Mixer Grinder Repair', 'Pump Motor Repair', 'Air Cooler Repair',
  'Induction Cooktop Repair', 'Stabilizer Repair', 'Press Iron Repair',
  'TV Repair', 'Ceiling Fan Repair', 'Geyser Repair', 'Wiring / Switch Board',
  'Other Appliances',
];

const experienceOptions = [
  'Less than 1 year', '1-2 years', '3-5 years', '5-10 years', '10+ years',
];

/* ─── Reusable Input Field ───────────────────────────────────────── */
const InputField = ({ label, id, type = 'text', placeholder, value, onChange, icon: Icon, error, required }) => (
  <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-[#0B1E40]">
      {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-sm bg-slate-50 border ${
          error ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-orange-300'
        } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 placeholder-slate-400 transition-all`}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3.5 h-3.5" />{error}
      </p>
    )}
  </motion.div>
);

const SelectField = ({ label, id, value, onChange, options, placeholder, error, required }) => (
  <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-[#0B1E40]">
      {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full pl-4 pr-10 py-3 text-sm bg-slate-50 border ${
          error ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-orange-300'
        } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 appearance-none transition-all`}
      >
        <option value="" disabled>{placeholder || 'Select an option'}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3.5 h-3.5" />{error}
      </p>
    )}
  </motion.div>
);

/* ─── Reusable File Input Field ──────────────────────────────────────── */
const FileInputField = ({ label, id, onChange, error, required, accept, file, helperText }) => {
  const [pdfUrl, setPdfUrl] = React.useState(null);

  React.useEffect(() => {
    if (!file) {
      setPdfUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-[#0B1E40]">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={onChange}
          className={`w-full px-4 py-2.5 text-sm bg-slate-50 border ${
            error ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-orange-300'
          } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 transition-all cursor-pointer`}
        />
      </div>
      {file && pdfUrl && (
        <div className="mt-2 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500 shrink-0" />
            <span className="text-xs font-semibold truncate max-w-[200px]">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={() => window.open(pdfUrl, '_blank')}
            className="text-[11px] font-extrabold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-4"
          >
            Preview <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 font-medium italic mt-0.5">
          * {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5" />{error}
        </p>
      )}
    </motion.div>
  );
};


/* ─── Step Indicator ─────────────────────────────────────────────── */
const steps = ['Personal Info', 'Work Details', 'Review & Submit'];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {steps.map((label, i) => {
      const done    = i < current;
      const active  = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{
                backgroundColor: done ? '#16a34a' : active ? '#FF7200' : '#e2e8f0',
                scale: active ? 1.12 : 1,
              }}
              transition={{ duration: 0.35 }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
              style={{ color: done || active ? '#fff' : '#94a3b8' }}
            >
              {done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </motion.div>
            <span className={`text-[11px] font-semibold whitespace-nowrap ${active ? 'text-orange-500' : done ? 'text-green-600' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <motion.div
              className="h-0.5 w-12 sm:w-20 mx-1 mb-5 rounded-full"
              animate={{ backgroundColor: i < current ? '#16a34a' : '#e2e8f0' }}
              transition={{ duration: 0.4 }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
export default function VendorApplyPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    fullName:     '',
    email:        '',
    phone:        '',
    city:         '',
    pincode:      '',
    specialOption:'',
    serviceType:  '',
    experience:   '',
    about:        '',
    photo:        null,
    aadhar:       null,
    resume:       null,
  });

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));
  const setFile = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.files[0] }));

  /* ── Validation ── */
  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.fullName.trim())  e.fullName = 'Full name is required.';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required.';
      if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))     e.phone = 'Enter a valid 10-digit phone number.';
      if (!form.city.trim())      e.city = 'City is required.';
      if (!form.specialOption)    e.specialOption = 'Please select a special option.';
    }
    if (s === 1) {
      if (!form.serviceType) e.serviceType = 'Please select a service type.';
      if (!form.experience)  e.experience  = 'Please select your experience level.';
      if (!form.about.trim() || form.about.trim().split(/\s+/).length < 5) e.about = 'Please write at least a few words about yourself.';
      const isPdfOrImage = (file) =>
        file &&
        (file.type === 'application/pdf' ||
          file.type.startsWith('image/') ||
          /\.(pdf|jpg|jpeg|png|webp)$/i.test(file.name));

      if (!form.photo) e.photo = 'Photo is required.';
      else if (!isPdfOrImage(form.photo)) e.photo = 'Upload a valid image (JPG, PNG) or PDF.';

      if (!form.aadhar) e.aadhar = 'Aadhar upload is required.';
      else if (!isPdfOrImage(form.aadhar)) e.aadhar = 'Only PDF or image files are allowed.';

      if (!form.resume) e.resume = 'Resume is required.';
      else if (!isPdfOrImage(form.resume)) e.resume = 'Only PDF or image files are allowed.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setStep(s => s - 1);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setErrors(prev => ({ ...prev, agreed: 'You must agree to the terms to proceed.' }));
      return;
    }
    
    const parseExperience = (exp) => {
      if (exp === 'Less than 1 year') return 0;
      if (exp === '1-2 years') return 1;
      if (exp === '3-5 years') return 3;
      if (exp === '5-10 years') return 5;
      if (exp === '10+ years') return 10;
      return parseInt(exp) || 0;
    };
    
    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('email', form.email);
    formData.append('phoneNumber', form.phone);
    formData.append('city', form.city);
    formData.append('specialOption', form.specialOption);
    formData.append('serviceType', form.serviceType);
    formData.append('experience', parseExperience(form.experience));
    formData.append('experienceDescription', form.about);
    
    // Add documents
    if (form.photo) formData.append('documents', form.photo);
    if (form.aadhar) formData.append('documents', form.aadhar);
    if (form.resume) formData.append('documents', form.resume);

    try {
      const res = await submitVendorApplication(formData);
      if (res.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrors(prev => ({ ...prev, agreed: res.message || 'Failed to submit application.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, agreed: 'An error occurred while submitting.' }));
    }
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-12 sm:p-16 text-center max-w-lg w-full"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E40] mb-3">Application Submitted!</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Thank you, <strong className="text-[#0B1E40]">{form.fullName}</strong>! Our team will review your
              application and get back to you within 24–48 hours on <strong className="text-[#0B1E40]">{form.email}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/become-a-vendor')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B1E40] text-white rounded-full font-semibold text-sm shadow-lg hover:bg-blue-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Vendor Page
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold text-sm shadow-lg hover:bg-orange-400 transition-colors cursor-pointer"
              >
                Go to Home
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans relative overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-0 w-[360px] h-[360px] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-0 w-[360px] h-[360px] bg-orange-100/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 z-10">
        {/* ── Page Hero ── */}
        <section className="relative w-full bg-[#0B1E40] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
              alt="Apply to become a vendor"
              className="w-full h-full object-cover opacity-20 scale-105 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1E40]/90 to-[#0B1E40]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-300 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Vendor Application
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                Start Your Application
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
                Fill in the form below and our team will review your profile within 24–48 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Form Card ── */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/60 p-8 sm:p-12"
          >
            {/* Step Indicator */}
            <StepIndicator current={step} />

            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">

                {/* ── STEP 0: Personal Info ── */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
                      <motion.h3 variants={fadeUp} className="text-xl font-extrabold text-[#0B1E40] mb-1 flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-500" />
                        Personal Information
                      </motion.h3>
                      <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-6">
                        Tell us who you are so we can get in touch with you.
                      </motion.p>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <InputField
                          label="Full Name" id="fullName" placeholder="Eg. John Doe"
                          value={form.fullName} onChange={set('fullName')}
                          icon={User} error={errors.fullName} required
                        />
                        <InputField
                          label="Email Address" id="email" type="email" placeholder="email@example.com"
                          value={form.email} onChange={set('email')}
                          icon={Mail} error={errors.email} required
                        />
                        <InputField
                          label="Phone No. (10 digit)" id="phone" type="tel" placeholder="+91 00000 00000"
                          value={form.phone} onChange={set('phone')}
                          icon={Phone} error={errors.phone} required
                        />
                        <SelectField
                          label="Special Option" id="special" value={form.specialOption} onChange={set('specialOption')}
                          options={['Self-employed', 'Small Business', 'Freelancer']}
                          placeholder="Select Option"
                          error={errors.specialOption}
                          required
                        />
                      </div>

                      <InputField
                        label="Your City / Area" id="city" placeholder="Enter your city or area name"
                        value={form.city} onChange={set('city')}
                        icon={MapPin} error={errors.city} required
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* ── STEP 1: Work Details ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
                      <motion.h3 variants={fadeUp} className="text-xl font-extrabold text-[#0B1E40] mb-1 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-orange-500" />
                        Work Details
                      </motion.h3>
                      <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-6">
                        Help us understand your skills and experience.
                      </motion.p>

                      <SelectField
                        label="Service Type" id="serviceType"
                        value={form.serviceType} onChange={set('serviceType')}
                        options={serviceOptions}
                        placeholder="Select Your Service"
                        error={errors.serviceType} required
                      />

                      <SelectField
                        label="Years of Experience" id="experience"
                        value={form.experience} onChange={set('experience')}
                        options={experienceOptions}
                        placeholder="Select Experience"
                        error={errors.experience} required
                      />

                      <div className="flex flex-col gap-4 mt-2">
                        <FileInputField
                          label="Photo Upload" id="photo" accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
                          onChange={setFile('photo')} error={errors.photo} required file={form.photo}
                          helperText="Upload image (JPG, PNG) or PDF"
                        />
                        <FileInputField
                          label="Aadhar Upload" id="aadhar" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                          onChange={setFile('aadhar')} error={errors.aadhar} required file={form.aadhar}
                          helperText="Upload PDF or image of Aadhar card"
                        />
                        <FileInputField
                          label="Resume Upload" id="resume" accept=".pdf,.doc,.docx,application/pdf"
                          onChange={setFile('resume')} error={errors.resume} required file={form.resume}
                          helperText="Upload resume (PDF or DOC)"
                        />
                      </div>

                      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
                        <label htmlFor="about" className="text-sm font-semibold text-[#0B1E40]">
                          Tell us about your experience<span className="text-orange-500 ml-0.5">*</span>
                        </label>
                        <textarea
                          id="about"
                          rows={4}
                          placeholder="Briefly describe your business and areas of expertise..."
                          value={form.about}
                          onChange={set('about')}
                          className={`w-full px-4 py-3 text-sm bg-slate-50 border ${
                            errors.about ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-orange-300'
                          } rounded-xl focus:outline-none focus:ring-2 focus:bg-white text-slate-800 placeholder-slate-400 transition-all resize-none`}
                        />
                        {errors.about && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />{errors.about}
                          </p>
                        )}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── STEP 2: Review & Submit ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
                      <motion.h3 variants={fadeUp} className="text-xl font-extrabold text-[#0B1E40] mb-1 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        Review Your Application
                      </motion.h3>
                      <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-2">
                        Please verify all details before submitting.
                      </motion.p>

                      {/* Review Card */}
                      <motion.div variants={fadeUp} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Personal Info</h4>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          {[
                            { label: 'Full Name',  val: form.fullName },
                            { label: 'Email',      val: form.email },
                            { label: 'Phone',      val: form.phone },
                            { label: 'City',       val: form.city },
                          ].map(({ label, val }) => (
                            <div key={label}>
                              <span className="text-slate-400 font-medium">{label}: </span>
                              <span className="text-[#0B1E40] font-semibold">{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                        <hr className="border-slate-200" />
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Work Details</h4>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          {[
                            { label: 'Service Type', val: form.serviceType },
                            { label: 'Experience',   val: form.experience },
                          ].map(({ label, val }) => (
                            <div key={label}>
                              <span className="text-slate-400 font-medium">{label}: </span>
                              <span className="text-[#0B1E40] font-semibold">{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                        {form.about && (
                          <div className="text-sm">
                            <span className="text-slate-400 font-medium">About: </span>
                            <span className="text-[#0B1E40] font-semibold">{form.about}</span>
                          </div>
                        )}
                        <hr className="border-slate-200 mt-2" />
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Documents</h4>
                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                          {[
                            { label: 'Photo', val: form.photo ? form.photo.name : '' },
                            { label: 'Aadhar', val: form.aadhar ? form.aadhar.name : '' },
                            { label: 'Resume', val: form.resume ? form.resume.name : '' },
                          ].map(({ label, val }) => (
                            <div key={label} className="truncate">
                              <span className="text-slate-400 font-medium block mb-0.5">{label}: </span>
                              <span className="text-[#0B1E40] font-semibold truncate block" title={val}>{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Terms Agreement */}
                      <motion.div variants={fadeUp} className="flex items-start gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="agreed"
                          checked={agreed}
                          onChange={e => { setAgreed(e.target.checked); setErrors(prev => ({ ...prev, agreed: undefined })); }}
                          className="mt-1 w-4 h-4 rounded accent-orange-500 cursor-pointer"
                        />
                        <label htmlFor="agreed" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                          I agree to the Magic Mistry{' '}
                          <Link to="/terms" target="_blank" className="text-orange-500 font-bold hover:underline">Terms of Service</Link>
                          {' '}and{' '}
                          <Link to="/privacy" target="_blank" className="text-orange-500 font-bold hover:underline">Privacy Policy</Link>,
                          and consent to share provided information to process my vendor application.
                        </label>
                      </motion.div>
                      {errors.agreed && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <span>{errors.agreed}</span>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* ── Navigation Buttons ── */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
                {step > 0 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, x: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={back}
                    className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-full font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, x: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/become-a-vendor')}
                    className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 rounded-full font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </motion.button>
                )}

                {step < 2 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={next}
                    className="flex items-center gap-2.5 bg-[#0B1E40] hover:bg-blue-900 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg transition-colors cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-orange-500/30 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Application
                  </motion.button>
                )}
              </div>
            </form>

            {/* Bottom note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-slate-400 text-center mt-6 flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Your data is protected with 256-bit SSL encryption
            </motion.p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
