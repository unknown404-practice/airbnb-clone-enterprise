# ROLE & OBJECTIVE
Act as a Principal Full-Stack Architect and Staff Design Engineer (specializing in Airbnb-grade UI/UX and Framer Motion). We are building an enterprise-grade, award-winning **Full-Stack Airbnb Clone** from scratch based on a 5-Module Capstone Architecture. 

Our goal is to win **1st Place**. Every component must feature Awwwards-level micro-interactions, spring physics animations, glassmorphic aesthetics, bulletproof backend overlap validation, and zero broken states. Do not write placeholder/TODO code—write complete, production-ready implementations.

---

# TECH STACK & DESIGN SYSTEM
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion (animations), Lucide React (icons), Axios, React Router v6, `react-day-picker` or `date-fns` (date range logic), Leaflet / React-Leaflet or Mapbox GL (interactive maps).
- **Backend:** Node.js (v18+), Express.js, MongoDB + Mongoose (with database transactions/sessions), JWT (HttpOnly cookies + Bearer support), bcryptjs, Zod/Joi (request validation).
- **Aesthetic & Theme ("Bespoke Luxury Travel"):**
  - Palette: Crisp Alabaster background (`#FAFAFA`), Pure White cards (`#FFFFFF`), Coral/Rausch primary accent (`#FF385C` to `#E61E4D` gradient), Slate Charcoal typography (`#222222`), and subtle borders (`#EBEBEB`).
  - Glassmorphism: Sticky header and floating map controls using `backdrop-blur-md bg-white/80`.

---

# ANIMATION & MICRO-INTERACTION MANIFESTO (CRITICAL FOR 1ST PLACE)
Implement the following animations using **Framer Motion** across the platform:
1. **Morphing Command-Bar Search:** The top navbar search pill smoothly expands into a full multi-tabbed filter modal (Where, Check-in/Check-out, Guests) using shared `layoutId` transitions and backdrop blur.
2. **Staggered Listing Grid & Card Physics:** Listing cards enter with a staggered fade-up (`staggerChildren: 0.06`). Hovering a card triggers a subtle elevation (`y: -4`), image zoom (`scale: 1.04` over `0.4s` ease-out), and smooth image carousel pagination dots.
3. **Interactive Wishlist Heart:** Clicking the heart icon on any card triggers a spring-physics keyframe burst (`scale: [1, 1.35, 0.9, 1]`) with a particle/fill transition.
4. **Synced Map-to-Card Choreography:** Hovering a listing card highlights and bounces its price-pill marker (`$240/night`) on the interactive map (scaling it up and turning it dark charcoal). Clicking a map pin pops open a Framer Motion animated mini-preview card directly on the map.
5. **Booking Widget Price Odometer:** When a user selects check-in and check-out dates, the price breakdown (Nights × Rate + Cleaning Fee + Service Fee = Total) smoothly animates in with height auto-expansion and animated number transitions.
6. **Skeleton Shimmers:** Never show raw text "Loading...". Build bespoke shimmer skeleton cards that mirror the exact geometry of the listing grid and detail page.

---

# 5-MODULE EXECUTION BLUEPRINT

## MODULE 1: Backend Foundation (Data Model, Auth & Core APIs)
1. **Database Schemas:**
   - `User`: name, email, passwordHash, avatar, role (`guest` | `host` | `admin`), createdAt.
   - `Listing`: title, description, host (ref User), location (address, city, country, coordinates `{ lat, lng }`), pricePerNight, cleaningFee, images (array of high-res URLs), category (Beachfront, Cabins, Luxe, Trending, Amazing Pools, etc.), amenities (array), maxGuests, bedrooms, beds, baths, ratingAvg, reviewCount.
   - `Booking`: listing (ref Listing), guest (ref User), checkIn (Date), checkOut (Date), totalPrice, guestsCount, status (`confirmed` | `cancelled` | `completed`), createdAt.
   - `Review`: listing (ref Listing), booking (ref Booking), author (ref User), rating (1-5), subRatings (cleanliness, accuracy, communication, location, value), comment, createdAt.
2. **Auth & Role Middleware:**
   - Implement `/api/auth/register`, `/api/auth/login`, `/api/auth/me` with JWT.
   - Create `requireAuth` and `requireRole(['host'])` middleware gating write operations.
3. **Rich Database Seeder (`seed.js`):**
   - Create an automated seed script with 15+ architectural luxury listings across global destinations (Malibu, Kyoto, Swiss Alps, Santorini, Bali, Amalfi), realistic coordinates, 5 high-res Unsplash architectural images per listing, demo Host and Guest accounts, and sample reviews.

## MODULE 2: Frontend Listings, Dynamic Search & Filter UI
1. **Horizontal Category Bar:** Scrollable category bar with custom icons, active underline layout animation (`layoutId="categoryUnderline"`), and instant filtering.
2. **Live Search & Filter Engine:**
   - Connect frontend to `GET /api/listings` supporting query params: `location`, `category`, `minPrice`, `maxPrice`, `guests`, `checkIn`, `checkOut` (filtering out listings already booked in that date range).
   - Build a sleek Filter Modal with a dual-thumb price range slider, room counters, and amenity checkboxes.
3. **Empty & Error States:** Illustrated, animated empty state with a "Reset all filters" magnetic button when no listings match.

## MODULE 3: End-to-End Booking Flow & Overlap Validation
1. **Bento-Grid Listing Detail Page:**
   - 5-photo architectural Bento gallery with a "Show all photos" full-screen animated lightbox modal.
   - Sticky right-hand Booking Reserve Card with interactive calendar date-range picker.
2. **Bulletproof Overlap Validation (Frontend + Backend):**
   - Fetch booked dates for the listing (`GET /api/listings/:id/booked-dates`) and visually disable/strike-through unavailable dates in the date picker.
   - On `POST /api/bookings`, execute a **database-level overlap query**: reject any request where an existing confirmed booking has `(existing.checkIn < newCheckOut) AND (existing.checkOut > newCheckIn)`.
   - Build a celebratory Booking Confirmation Drawer/Modal with an animated checkmark, trip itinerary code, and downloadable/printable summary receipt.

## MODULE 4: Maps Integration, Review Aggregation & Role-Based Dashboards
1. **Interactive Split-Screen & Toggle Map:**
   - Add a floating "Show Map / Show List" pill button at the bottom center (and split-screen view on desktop).
   - Render custom HTML price markers on the map that dynamically update as the user pans/zooms or filters.
2. **Review System & Aggregation Pipeline:**
   - Guests with completed stays can submit multi-category ratings (Cleanliness, Accuracy, Location, Value).
   - Backend automatically recalculates and updates `Listing.ratingAvg` and `Listing.reviewCount` upon review creation.
   - Frontend renders animated progress bars for rating breakdowns.
3. **Role-Based Dashboards (Guest vs. Host Mode):**
   - **One-Click Role Switcher ("Switch to Hosting"):** Smoothly transitions the UI into the Host Portal.
   - **Host Dashboard:** Revenue & occupancy summary cards, interactive multi-step "Create/Edit Listing" wizard with live map pin drop, and a reservations manager.
   - **Guest Trips Dashboard:** Upcoming and past stays timeline, booking cancellation flow, and "Leave a Review" modal trigger.

## MODULE 5: Performance Polish & Deployment Readiness
1. **Environment Separation:** Clean `.env.example` files for client and server, centralized Axios instance with interceptors, and production CORS configuration.
2. **Image & UX Optimization:** Lazy-loaded images with blur-up fade transitions, keyboard accessibility (`Esc` closes modals), and responsive mobile bottom navigation bar.

---

# EXECUTION PROTOCOL
Let's build this systematically so every file is complete and bug-free:
1. First, scaffold the project folder structure (`/server` and `/client`), install all required dependencies, and build **Module 1 (Backend Foundation + Rich Seed Script)** in full.
2. After completing Module 1, verify the server starts cleanly and wait for my confirmation before proceeding to Module 2.