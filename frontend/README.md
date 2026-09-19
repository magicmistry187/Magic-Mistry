<div align="center">

# 🛠️ Magic Mistry

### ⚡ On-Demand Home Services & Repair Platform


<!-- Tech Stack Badges -->
[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.42.2-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

<!-- Status Badges -->
[![Build Status](https://img.shields.io/badge/Build-Passing-10b981?style=flat-square&logo=vite&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-Proprietary-02182e?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-0ea5e9?style=flat-square)](#-contributing)

<br/>

<!-- Quick Navigation Pills -->
[<img src="https://img.shields.io/badge/📌_Overview-02182e?style=for-the-badge" />](#-overview)
[<img src="https://img.shields.io/badge/✨_Features-0ea5e9?style=for-the-badge" />](#-key-features)
[<img src="https://img.shields.io/badge/🏗️_Architecture-10b981?style=for-the-badge" />](#-architecture)
[<img src="https://img.shields.io/badge/🚀_Quick_Start-7c3aed?style=for-the-badge" />](#-getting-started)

</div>

---

## 📌 Overview

**Magic Mistry** is a production-grade, responsive single-page web application for on-demand home electronics and appliance repair services. Built on **React 19** with **Vite 8** and **Tailwind CSS v4**, it delivers a seamless experience for three distinct user roles:

| Role | Dashboard | Capabilities |
|------|-----------|-------------|
| 🏠 **Customer** | `UserDashboardPage` | Book repairs, track technicians, view invoices, rate services |
| 🔧 **Vendor / Technician** | `VendorDashboardPage` | Accept jobs, manage work radius, submit fuel claims, view payouts |
| 🛡️ **Admin** | `AdminDashboardPage` | Approve vendors, manage inventory, dispatch queue, user management |

> [!NOTE]
> The frontend communicates with a Node.js/Express backend API via Axios. All API calls are centralized in the `services/` layer with dedicated modules for auth, bookings, addresses, and vendor operations.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎯 Booking & Services
- **Dynamic Appliance Selection** — Choose from AC, Washing Machine, Refrigerator, Microwave, and more with real-time base pricing
- **Interactive Calendar & Time Slots** — Date picker with auto-disabled past dates and available time windows
- **Transparent Pricing** — Full breakdown of inspection charges vs. optional spare part costs
- **Appliance Photo Upload** — Drag-and-drop zone supporting up to 5 damage photos
- **Flexible Payment** — Cash After Service or UPI After Service

</td>
<td width="50%">

### 🔐 Authentication & Security
- **Dual Login System** — Separate tabs for Customer and Vendor login flows
- **Google OAuth 2.0** — One-click sign-in via `@react-oauth/google`
- **Email OTP Verification** — Animated 6-digit OTP input with cooldown timer
- **Role-Based Route Protection** — `ProtectedRoute` and `PublicRoute` guards
- **JWT Token Management** — Secure storage and auto-refresh via `AuthContext`

</td>
</tr>
<tr>
<td width="50%">

### 📍 Location & Geolocation
- **Browser Geolocation API** — Auto-detect user coordinates
- **OpenStreetMap Reverse Geocoding** — Convert coordinates to structured addresses
- **Service Area Validation** — West Bengal coverage verification
- **Smart Address Parsing** — Intelligent extraction of PIN, district, state from raw input

</td>
<td width="50%">

### 🎬 Animations & UX
- **Framer Motion** throughout — Page transitions, modal entrances, micro-interactions
- **Animated Page Loader** — Custom `PageLoader` with branded skeleton states
- **Confetti Celebrations** — Booking confirmation success animations
- **Staggered Lists** — Smooth cascade reveals on tables and card grids
- **Spring Physics** — Login tab indicator with spring-based layout animations

</td>
</tr>
</table>

---

## 🏗️ Architecture

### Component Hierarchy

```
App.jsx
├── RouteLoaderListener          ← Global route transition handler
├── ScrollToTop                  ← Auto-scroll on navigation
└── Suspense (PageLoader)        ← Lazy-loaded route boundaries
    ├── Public Pages
    │   ├── HomePage             ← HeroSection, ServiceCategories, HowItWorks, WhyTrustUs
    │   ├── BookingPage          ← Multi-step booking wizard
    │   ├── PricingPage          ← Transparent service pricing
    │   ├── AboutPage / ContactPage / FaqPage
    │   └── BecomeAVendorPage / VendorApplyPage
    ├── Auth Pages (PublicRoute guard)
    │   ├── LoginPage            ← Dual-tab Customer/Vendor login
    │   ├── CreateAccountModal   ← Signup with OTP verification
    │   └── ForgotPasswordPage   ← Password reset flow
    └── Protected Dashboards (ProtectedRoute guard)
        ├── UserDashboardPage    ← Customer booking management
        ├── VendorDashboardPage  ← Technician job management
        └── AdminDashboardPage   ← Full platform administration
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   React UI  │────▶│  AuthContext  │────▶│ API Services │────▶│ Backend  │
│ Components  │◀────│  (JWT Store)  │◀────│  (Axios)     │◀────│ REST API │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                              ┌─────┴─────┐      ┌─────┴──────┐
                              │  authAPI   │      │ bookingAPI │
                              │  vendorAPI │      │ addressAPI │
                              └───────────┘      └────────────┘
```

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| ⚛️ **Core** | [React](https://react.dev/) | `19.2.7` | UI library with Hooks, Suspense, lazy loading |
| ⚡ **Bundler** | [Vite](https://vitejs.dev/) | `8.1.1` | Lightning-fast HMR and optimized production builds |
| 🎨 **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `4.3.3` | Utility-first CSS with JIT compilation |
| 🧭 **Routing** | [React Router DOM](https://reactrouter.com/) | `7.11.0` | Client-side routing with nested layouts |
| 🎬 **Animations** | [Framer Motion](https://www.framer.com/motion/) | `12.42.2` | Declarative animations, gestures, layout transitions |
| 🔷 **Icons** | [Lucide React](https://lucide.dev/) | `1.25.0` | Tree-shakeable SVG icon library |
| 🎨 **Icons (Alt)** | [React Icons](https://react-icons.github.io/react-icons/) | `5.7.0` | Extended icon packs (Font Awesome, Ionicons, etc.) |
| 🌐 **HTTP** | [Axios](https://axios-http.com/) | `1.18.1` | Promise-based HTTP client with interceptors |
| 🔑 **OAuth** | [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) | `0.13.5` | Google Sign-In integration |
| 📅 **Date Picker** | [React Day Picker](https://daypicker.dev/) | `10.0.1` | Accessible date selection component |
| 📊 **Charts** | [Recharts](https://recharts.org/) | `3.10.1` | Composable charting library for dashboards |
| 💅 **CSS-in-JS** | [Styled Components](https://styled-components.com/) | `6.4.4` | Dynamic component-level styles |
| 🧹 **Linting** | [Oxlint](https://oxc.rs/docs/guide/usage/linter) | `1.71.0` | Blazing-fast Rust-based linter |

</div>

---

## 📁 Project Structure

```text
frontend/
├── public/                          # Static assets served at root
├── src/
│   ├── assets/                      # Brand logos, images, illustrations
│   │
│   ├── components/                  # Reusable UI — grouped by feature domain
│   │   ├── auth/                    # Authentication modals
│   │   │   ├── CreateAccountModal   #   → Multi-step signup with OTP
│   │   │   ├── LoginRequiredModal   #   → Prompt unauthenticated users
│   │   │   └── OTPVerificationModal #   → 6-digit animated OTP input
│   │   │
│   │   ├── Booking/                 # Booking wizard components
│   │   │   ├── ApplianceSelector    #   → Appliance grid with icons
│   │   │   ├── AddressForm          #   → Geolocation + manual address
│   │   │   ├── ScheduleForm         #   → Calendar & time slot picker
│   │   │   ├── PaymentMethod        #   → Payment option selector
│   │   │   ├── PricingTransparency  #   → Cost breakdown display
│   │   │   ├── ProblemSelector      #   → Issue description input
│   │   │   ├── ApplianceImageUploader # → Drag-drop photo upload
│   │   │   ├── BookingSummary       #   → Final review before submit
│   │   │   └── BookingContext       #   → Shared booking state provider
│   │   │
│   │   ├── common/                  # App-wide shared components
│   │   │   ├── Navbar               #   → Responsive navigation bar
│   │   │   ├── Footer               #   → Site-wide footer
│   │   │   ├── PageLoader           #   → Branded loading skeleton
│   │   │   ├── ProtectedRoute       #   → Role-based route guard
│   │   │   ├── PublicRoute          #   → Guest-only route guard
│   │   │   ├── ScrollToTop          #   → Scroll reset on navigation
│   │   │   ├── RouteLoaderListener  #   → Route transition handler
│   │   │   ├── LazyImage            #   → Intersection Observer lazy images
│   │   │   ├── LocationSelectorModal#   → Map-based location picker
│   │   │   ├── ApplianceIcon        #   → Dynamic appliance icon resolver
│   │   │   ├── ApplicationsTable    #   → Vendor applications data table
│   │   │   ├── DispatchQueue        #   → Dispatch management table
│   │   │   ├── InventoryTable       #   → Spare parts inventory table
│   │   │   ├── UserTable            #   → User management data table
│   │   │   └── MatrixBar            #   → Dashboard metric bar chart
│   │   │
│   │   ├── dashboard/               # Dashboard-specific modals by role
│   │   │   ├── admin/               #   → 9 admin modals (credentials, dispatch, inventory, etc.)
│   │   │   ├── user/                #   → 4 customer modals (address, invoice, rating, map)
│   │   │   └── vendor/              #   → 6 vendor modals (payout, fuel claim, tax invoice, etc.)
│   │   │
│   │   └── home/                    # Landing page sections
│   │       ├── HeroSection          #   → Animated hero banner
│   │       ├── ServiceCategories    #   → Service category grid
│   │       ├── HowItWorks           #   → Step-by-step process flow
│   │       └── WhyTrustUs           #   → Trust & credibility section
│   │
│   ├── context/                     # React Context providers
│   │   └── AuthContext              #   → JWT auth state, login/logout, user data
│   │
│   ├── pages/                       # Route-level page components (lazy-loaded)
│   │   ├── home/                    #   → HomePage
│   │   ├── BookingPage/             #   → BookingPage, BookingConfirmation
│   │   ├── pricing/                 #   → PricingPage
│   │   ├── auth/                    #   → LoginPage, ForgotPasswordPage
│   │   ├── dashboard/               #   → Admin / User / Vendor Dashboard Pages
│   │   ├── aboutus/                 #   → AboutPage
│   │   ├── contactus/               #   → ContactPage
│   │   ├── faq/                     #   → FaqPage
│   │   ├── vendor/                  #   → BecomeAVendorPage, VendorApplyPage
│   │   └── term & policy/           #   → TermsAndConditions, PrivacyPolicy
│   │
│   ├── services/                    # API integration layer
│   │   ├── api.js                   #   → Centralized API re-exports
│   │   ├── apiConnector.js          #   → Axios instance with interceptors
│   │   └── operations/              #   → Feature-specific API modules
│   │       ├── authAPI.js           #     → Login, signup, OTP, Google OAuth, password reset
│   │       ├── bookingAPI.js        #     → Create/fetch/cancel bookings
│   │       ├── addressAPI.js        #     → Address CRUD & geolocation
│   │       └── vendorAPI.js         #     → Vendor auth, profile, credentials, applications
│   │
│   ├── utils/                       # Shared utilities
│   │   ├── addressParser.js         #   → Smart address string extraction
│   │   └── otpCooldown.js           #   → OTP resend cooldown manager
│   │
│   ├── App.jsx                      # Root component with route definitions
│   ├── main.jsx                     # React DOM entry point
│   ├── index.css                    # Global styles + Tailwind CSS imports
│   └── App.css                      # Component-level custom styles
│
├── index.html                       # HTML shell template
├── package.json                     # Dependencies & npm scripts
├── vite.config.js                   # Vite + Tailwind CSS plugin config
└── README.md                        # ← You are here
```

---

## 🎬 Animation System

Magic Mistry uses **Framer Motion** extensively to create a polished, app-like experience:

<table>
<tr>
<td width="33%" align="center">

**🚪 Page Transitions**
```jsx
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  />
</AnimatePresence>
```
Smooth fade + slide transitions between route changes

</td>
<td width="33%" align="center">

**🪟 Modal Entrances**
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
/>
```
Scale-in with backdrop blur across 19+ modals

</td>
<td width="33%" align="center">

**🏷️ Tab Indicators**
```jsx
<motion.div
  layoutId="activeTab"
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 30
  }}
/>
```
Spring-physics shared layout for tab switching

</td>
</tr>
<tr>
<td width="33%" align="center">

**📋 Staggered Lists**
```jsx
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={fadeInUp}
    />
  ))}
</motion.div>
```

</td>
<td width="33%" align="center">

**🔄 Loading Spinners**
```jsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    repeat: Infinity,
    duration: 1,
    ease: "linear"
  }}
/>
```

</td>
<td width="33%" align="center">

**🎊 Confetti Effects**
```jsx
// Booking confirmation
// celebration animation
// with particle burst
// and gravity physics
```
Celebratory animations on successful bookings

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| [Node.js](https://nodejs.org/) | `≥ 18.x` |
| [npm](https://www.npmjs.com/) | `≥ 9.x` |

### Installation

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install all dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the `frontend/` root:

```env
# ── API Configuration ──────────────────────────
VITE_API_BASE_URL=https://magic-mistry.localhost/api

# ── Google OAuth ───────────────────────────────
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Launch Development Server

```bash
npm run dev
```

> The app will be available at **`http://localhost:5173`** with hot module replacement enabled.

---

## ⚙️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🔥 Start Vite dev server with HMR |
| `npm run build` | 📦 Create optimized production build in `dist/` |
| `npm run preview` | 👁️ Preview the production build locally |
| `npm run lint` | 🧹 Run Oxlint code diagnostics |

---

## 🗺️ Route Map

<div align="center">

| Route | Page | Auth | Role |
|-------|------|:----:|------|
| `/` | Home | — | Public |
| `/booking` | Booking Wizard | — | Public |
| `/booking/confirmation` | Booking Confirmation | 🔒 | Customer |
| `/pricing` | Pricing | — | Public |
| `/login` | Login (Customer + Vendor) | 🚫 | Guest Only |
| `/signup` `/create-account` | Create Account Modal | 🚫 | Guest Only |
| `/forgot-password` | Password Reset | 🚫 | Guest Only |
| `/about` | About Us | — | Public |
| `/contact` | Contact Us | — | Public |
| `/faq` | FAQ | — | Public |
| `/terms` | Terms & Conditions | — | Public |
| `/privacy` `/cookies` | Privacy Policy | — | Public |
| `/become-a-vendor` | Vendor Recruitment | — | Public |
| `/vendor-apply` | Vendor Application Form | — | Public |
| `/dashboard` `/my-bookings` | Customer Dashboard | 🔒 | Customer |
| `/vendor-dashboard` `/vendor-portal` | Vendor Dashboard | 🔒 | Vendor / Admin |
| `/admin-dashboard` `/admin` | Admin Dashboard | 🔒 | Admin |

</div>

> **Legend:** 🔒 = Requires authentication &nbsp;|&nbsp; 🚫 = Redirects if already authenticated &nbsp;|&nbsp; — = Open access

---

## 📊 Dashboard Breakdown

<details>
<summary><b>🛡️ Admin Dashboard</b> — Full platform control center</summary>

<br/>

| Module | Description | Components Used |
|--------|-------------|----------------|
| **Vendor Applications** | Review, approve, or reject technician applications | `ApplicationsTable`, `AdminApplicationModal` |
| **Vendor Credentials** | View generated Vendor IDs and registered emails | `AdminViewCredsModal`, `AdminCredsSuccessModal` |
| **Dispatch Queue** | Assign and track service bookings to vendors | `DispatchQueue`, `AdminDispatchModal` |
| **Inventory Management** | Track spare parts stock levels and restock | `InventoryTable`, `AdminAddInventoryModal`, `AdminRestockModal` |
| **User Management** | View, edit, block/unblock users and partners | `UserTable`, `AdminEditUserModal` |
| **Work Reports** | Review completed job reports and export data | `AdminWorkReportModal`, `AdminExportModal` |

</details>

<details>
<summary><b>🏠 Customer Dashboard</b> — Booking lifecycle management</summary>

<br/>

| Module | Description | Components Used |
|--------|-------------|----------------|
| **Active Bookings** | Track live service requests and technician status | Inline booking cards |
| **Booking History** | View past completed and cancelled bookings | History list with filters |
| **Service Rating** | Rate technician performance after service | `UserRatingModal` |
| **Invoices** | View and download service invoices | `UserInvoiceModal` |
| **Saved Addresses** | Manage home, office, and custom addresses | `UserAddressModal` |
| **Technician Tracking** | View assigned technician location on map | `UserTechnicianMapModal` |

</details>

<details>
<summary><b>🔧 Vendor Dashboard</b> — Technician workspace</summary>

<br/>

| Module | Description | Components Used |
|--------|-------------|----------------|
| **Job Queue** | View and accept incoming service requests | Inline job cards |
| **Active Services** | Start service, update status, complete jobs | `VendorStartServiceModal` |
| **Work Radius** | Set and visualize service coverage area | `VendorRadiusModal` |
| **Earnings & Payouts** | Track revenue, view payout history | `VendorPayoutModal` |
| **Fuel Claims** | Submit fuel expense reimbursement requests | `VendorFuelClaimModal` |
| **Tax Invoices** | Generate and view GST tax invoices | `VendorTaxInvoiceModal` |
| **Address Management** | Update workshop/home address | `VendorAddressModal` |

</details>

---

## 🔧 API Service Layer

The frontend's API layer follows a clean separation pattern:

```
services/
├── apiConnector.js     → Axios instance with base URL, auth headers, interceptors
├── api.js              → Centralized re-exports for all API functions
└── operations/
    ├── authAPI.js       → login, signup, verifyOTP, googleAuth, forgotPassword, resetPassword
    ├── bookingAPI.js    → createBooking, getBookings, cancelBooking, getBookingDetails
    ├── addressAPI.js    → saveAddress, getAddresses, deleteAddress, reverseGeocode
    └── vendorAPI.js     → vendorLogin, vendorProfile, approveApplication, getCredentials
```

> [!TIP]
> All API functions return standardized `{ success, message, data? }` response objects for consistent error handling across the UI.

---

## 🎨 Styling Conventions

| Convention | Details |
|-----------|---------|
| **Framework** | Tailwind CSS v4 (utility-first, JIT compiled) |
| **Color Palette** | Primary: `#02182e` (Navy) · Accent: `#0ea5e9` (Sky) · Success: `#10b981` (Emerald) |
| **Typography** | System font stack with `font-extrabold` headings |
| **Borders** | Rounded corners (`rounded-xl`, `rounded-2xl`, `rounded-3xl`) |
| **Shadows** | Subtle box shadows (`shadow-sm`, `shadow-md`, `shadow-2xl`) |
| **Responsive** | Mobile-first with `sm:`, `md:`, `lg:` breakpoints |
| **Dark Text** | Body: `text-slate-800` · Labels: `text-slate-400` · Headings: `text-[#02182e]` |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

> [!IMPORTANT]
> Run `npm run lint` and `npm run build` before submitting your PR to ensure zero errors.

---

## 📜 License

This project is proprietary software. All rights reserved.

---

<div align="center">

---

**Built with ❤️ by the Magic Mistry Team**

`React 19` • `Vite 8` • `Tailwind CSS v4` • `Framer Motion`

</div>
