const BASE_URL = 'http://localhost:5000';

const results = [];

function logPass(name, detail = '') {
  results.push({ test: name, status: 'PASS', detail });
  console.log(`[PASS] ${name} ${detail ? '(' + detail + ')' : ''}`);
}

function logFail(name, error) {
  results.push({ test: name, status: 'FAIL', error: error?.message || String(error) });
  console.error(`[FAIL] ${name}:`, error?.message || error);
}

async function run() {
  console.log('====================================================');
  console.log('   AIRBNB CLONE BACKEND SHADOW RUN TEST SUITE       ');
  console.log('====================================================\n');

  let guestToken = null;
  let hostToken = null;
  let sampleListingId = null;
  let createdBookingId = null;

  // 1. Root index endpoint
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'ok') {
      logPass('1. GET / (API Root)', `Status: ${data.status}, Message: "${data.message}"`);
    } else {
      throw new Error(`Unexpected status ${res.status}`);
    }
  } catch (err) {
    logFail('1. GET / (API Root)', err);
  }

  // 2. Health check endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'ok') {
      logPass('2. GET /api/health (System Health)', `Timestamp: ${data.timestamp}`);
    } else {
      throw new Error(`Health check failed with status ${res.status}`);
    }
  } catch (err) {
    logFail('2. GET /api/health (System Health)', err);
  }

  // 3. Informational GET /api/auth/login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`);
    const data = await res.json();
    if (res.status === 200 && data.demoAccounts) {
      logPass('3. GET /api/auth/login (Auth Info)', 'Returns demo account dictionary');
    } else {
      throw new Error(`Unexpected response: ${res.status}`);
    }
  } catch (err) {
    logFail('3. GET /api/auth/login (Auth Info)', err);
  }

  // 4. Guest Login (POST /api/auth/login)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sophia@traveller.io', password: 'password123' }),
    });
    const data = await res.json();
    if (res.status === 200 && data.token && data.user) {
      guestToken = data.token;
      logPass('4. POST /api/auth/login (Guest Auth)', `Logged in as ${data.user.name} (${data.user.role})`);
    } else {
      throw new Error(data.message || `Status: ${res.status}`);
    }
  } catch (err) {
    logFail('4. POST /api/auth/login (Guest Auth)', err);
  }

  // 5. Host Login (POST /api/auth/login)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'host@luxuryretreats.com', password: 'password123' }),
    });
    const data = await res.json();
    if (res.status === 200 && data.token && data.user) {
      hostToken = data.token;
      logPass('5. POST /api/auth/login (Host Auth)', `Logged in as ${data.user.name} (${data.user.role})`);
    } else {
      throw new Error(data.message || `Status: ${res.status}`);
    }
  } catch (err) {
    logFail('5. POST /api/auth/login (Host Auth)', err);
  }

  // 6. Invalid credentials rejection
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sophia@traveller.io', password: 'wrongpassword' }),
    });
    if (res.status === 401) {
      logPass('6. POST /api/auth/login (Invalid Password)', 'Rejected with 401 Unauthorized');
    } else {
      throw new Error(`Expected 401 but got ${res.status}`);
    }
  } catch (err) {
    logFail('6. POST /api/auth/login (Invalid Password)', err);
  }

  // 7. Verify /api/auth/me with Bearer token
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.user && data.user.email === 'sophia@traveller.io') {
      logPass('7. GET /api/auth/me (JWT Verification)', `User verified: ${data.user.email}`);
    } else {
      throw new Error(data.message || `Status: ${res.status}`);
    }
  } catch (err) {
    logFail('7. GET /api/auth/me (JWT Verification)', err);
  }

  // 8. Fetch all listings (GET /api/listings)
  try {
    const res = await fetch(`${BASE_URL}/api/listings`);
    const data = await res.json();
    const listings = data.listings || data;
    if (res.status === 200 && Array.isArray(listings) && listings.length >= 16) {
      sampleListingId = listings[0]._id;
      logPass('8. GET /api/listings (All Stays)', `Retrieved ${listings.length} luxury architectural listings`);
    } else {
      throw new Error(`Expected array with >= 16 items, got ${listings?.length}`);
    }
  } catch (err) {
    logFail('8. GET /api/listings (All Stays)', err);
  }

  // 9. Category filter query
  try {
    const res = await fetch(`${BASE_URL}/api/listings?category=Beachfront`);
    const data = await res.json();
    const listings = data.listings || data;
    if (res.status === 200 && Array.isArray(listings) && listings.length > 0) {
      const allBeachfront = listings.every(l => l.category === 'Beachfront');
      if (allBeachfront) {
        logPass('9. GET /api/listings?category=Beachfront', `Filtered ${listings.length} Beachfront stays`);
      } else {
        throw new Error('Not all results matched the Beachfront category');
      }
    } else {
      throw new Error(`Expected beachfront listings, got status ${res.status}`);
    }
  } catch (err) {
    logFail('9. GET /api/listings?category=Beachfront', err);
  }

  // 10. Search query filter
  try {
    const res = await fetch(`${BASE_URL}/api/listings?search=Kyoto`);
    const data = await res.json();
    const listings = data.listings || data;
    if (res.status === 200 && Array.isArray(listings) && listings.length > 0) {
      logPass('10. GET /api/listings?search=Kyoto', `Found "${listings[0].title}" in Kyoto, Japan`);
    } else {
      throw new Error(`Search failed with status ${res.status}`);
    }
  } catch (err) {
    logFail('10. GET /api/listings?search=Kyoto', err);
  }

  // 11. Single listing detail by ID
  try {
    const res = await fetch(`${BASE_URL}/api/listings/${sampleListingId}`);
    const data = await res.json();
    const listing = data.listing || data;
    if (res.status === 200 && listing._id === sampleListingId) {
      logPass('11. GET /api/listings/:id', `Title: "${listing.title}", Images: ${listing.images?.length}, Rating: ${listing.ratingAvg}★`);
    } else {
      throw new Error(`Failed to retrieve listing ${sampleListingId}`);
    }
  } catch (err) {
    logFail('11. GET /api/listings/:id', err);
  }

  // 12. Booked dates for calendar blackout
  try {
    const res = await fetch(`${BASE_URL}/api/listings/${sampleListingId}/booked-dates`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.bookedDates)) {
      logPass('12. GET /api/listings/:id/booked-dates', `Retrieved ${data.bookedDates.length} blackout date ranges`);
    } else {
      throw new Error(`Unexpected booked dates payload: ${res.status}`);
    }
  } catch (err) {
    logFail('12. GET /api/listings/:id/booked-dates', err);
  }

  // 13. Create a valid confirmed booking (POST /api/bookings)
  const randomDays = 100 + Math.floor(Math.random() * 800);
  const targetCheckIn = new Date();
  targetCheckIn.setDate(targetCheckIn.getDate() + randomDays);
  const targetCheckOut = new Date();
  targetCheckOut.setDate(targetCheckOut.getDate() + randomDays + 4);

  try {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        listingId: sampleListingId,
        checkIn: targetCheckIn.toISOString(),
        checkOut: targetCheckOut.toISOString(),
        guestsCount: 2,
        totalPrice: 2450,
      }),
    });
    const data = await res.json();
    const booking = data.booking || data;
    if ((res.status === 201 || res.status === 200) && booking._id) {
      createdBookingId = booking._id;
      logPass('13. POST /api/bookings (Create Reservation)', `Itinerary Code: ${booking.itineraryCode}, Status: ${booking.status}`);
    } else {
      throw new Error(data.message || `Status: ${res.status}`);
    }
  } catch (err) {
    logFail('13. POST /api/bookings (Create Reservation)', err);
  }

  // 14. Double-Booking Conflict Prevention Shield
  try {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({
        listingId: sampleListingId,
        checkIn: targetCheckIn.toISOString(),
        checkOut: targetCheckOut.toISOString(),
        guestsCount: 2,
        totalPrice: 2450,
      }),
    });
    if (res.status === 400 || res.status === 409) {
      const data = await res.json();
      logPass('14. POST /api/bookings (Double-Booking Conflict Shield)', `Blocked collision with code ${res.status}: "${data.message}"`);
    } else {
      throw new Error(`Expected 400/409 duplicate block but received status ${res.status}`);
    }
  } catch (err) {
    logFail('14. POST /api/bookings (Double-Booking Conflict Shield)', err);
  }

  // 15. Guest Trips Dashboard (GET /api/bookings/my-trips)
  try {
    const res = await fetch(`${BASE_URL}/api/bookings/my-trips`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    const data = await res.json();
    const trips = data.bookings || data;
    if (res.status === 200 && Array.isArray(trips)) {
      logPass('15. GET /api/bookings/my-trips (Guest Trips Timeline)', `Retrieved ${trips.length} active/past reservations`);
    } else {
      throw new Error(`Failed with status ${res.status}`);
    }
  } catch (err) {
    logFail('15. GET /api/bookings/my-trips (Guest Trips Timeline)', err);
  }

  // 16. Host Dashboard Listings & Reservations (GET /api/listings/host/my-listings)
  try {
    const res = await fetch(`${BASE_URL}/api/listings/host/my-listings`, {
      headers: { Authorization: `Bearer ${hostToken}` },
    });
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.listings) && Array.isArray(data.bookings)) {
      logPass('16. GET /api/listings/host/my-listings (Host Dashboard)', `Retrieved ${data.listings.length} hosted listings, ${data.bookings.length} reservations, revenue: $${data.stats?.totalRevenue || 0}`);
    } else {
      throw new Error(`Failed with status ${res.status}`);
    }
  } catch (err) {
    logFail('16. GET /api/listings/host/my-listings (Host Dashboard)', err);
  }

  // 17. Create Review (POST /api/reviews) with a dynamic verified guest
  try {
    const reviewerEmail = `reviewer-${Date.now()}@test.io`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Verified Reviewer',
        email: reviewerEmail,
        password: 'password123',
        role: 'guest',
      }),
    });
    const regData = await regRes.json();
    const reviewerToken = regData.token;

    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${reviewerToken}`,
      },
      body: JSON.stringify({
        listingId: sampleListingId,
        rating: 5,
        subRatings: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'Shadow Run Verification: Exceptional hospitality and magnificent architecture. 10/10 stay.',
      }),
    });
    const data = await res.json();
    if (res.status === 201 || res.status === 200) {
      logPass('17. POST /api/reviews (Review & Rating Pipeline)', `Submitted 5★ review via ${reviewerEmail}; updated listing rating averages`);
    } else {
      throw new Error(data.message || `Status: ${res.status}`);
    }
  } catch (err) {
    logFail('17. POST /api/reviews (Review & Rating Pipeline)', err);
  }

  // 18. Host Create Listing (POST /api/listings)
  try {
    const res = await fetch(`${BASE_URL}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hostToken}`,
      },
      body: JSON.stringify({
        title: 'Shadow Run Villa: Modernist Glass Pavilion',
        description: 'Spectacular cliffside estate verified during automated integration dry-run.',
        location: {
          address: '100 Ocean Drive',
          city: 'Monaco',
          country: 'Monaco',
          coordinates: { lat: 43.7384, lng: 7.4246 },
        },
        pricePerNight: 1200,
        cleaningFee: 150,
        category: 'Luxe',
        amenities: ['Wifi', 'Pool', 'Hot tub', 'Air conditioning', 'Dedicated workspace'],
        maxGuests: 6,
        bedrooms: 3,
        beds: 4,
        baths: 3,
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        ],
      }),
    });
    const data = await res.json();
    const newListing = data.listing || data;
    if ((res.status === 201 || res.status === 200) && newListing._id) {
      logPass('18. POST /api/listings (Host Create Stay)', `Created new stay: "${newListing.title}" in Monaco`);
    } else {
      throw new Error(data.message || `Status: ${res.status}`);
    }
  } catch (err) {
    logFail('18. POST /api/listings (Host Create Stay)', err);
  }

  console.log('\n====================================================');
  console.log('   SHADOW RUN SUMMARY RESULTS                       ');
  console.log('====================================================');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`Total Endpoints Tested : ${results.length}`);
  console.log(`Passed                 : ${passCount}`);
  console.log(`Failed                 : ${failCount}`);
  console.log(`Success Rate           : ${Math.round((passCount / results.length) * 100)}%\n`);

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
