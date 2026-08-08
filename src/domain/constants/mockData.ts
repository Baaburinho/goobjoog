import type { UserProfile, House, Application, Transaction, Complaint, AuditLog } from '../entities';

export const INITIAL_USERS: UserProfile[] = [
  { id: 'u1', fullName: 'Abdi Rahman Elmi', roles: ['homeowner'], upgradeStatus: 'none', phone: '+252615551234', email: 'abdi.elmi@goobjoog.so', isVerified: true, username: 'landlord', password: 'landlord123' },
  { id: 'u2', fullName: 'Faduma Omar Ali', roles: ['tenant'], upgradeStatus: 'none', phone: '+252617779876', email: 'faduma.omar@gmail.com', isVerified: true, username: 'tenant', password: 'tenant123' },
  { id: 'u4', fullName: 'Eng. Huda Duale', roles: ['administrator'], upgradeStatus: 'none', phone: '+252619998888', email: 'huda.admin@goobjoog.so', isVerified: true, username: 'admin', password: 'admin123' }
];

export const INITIAL_HOUSES: House[] = [
  {
    id: 'h1',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Mogadishu',
    district: 'Hodan',
    title: 'Luxury 3-Bedroom Villa with Garden',
    description: 'Beautiful modern villa located in the secure Hodan district. Features a private garden, constant water access (drilled well + water tank), high-speed Wi-Fi, and 24/7 guarded security.',
    pricePerMonth: 450,
    depositAmount: 900,
    roomsCount: 3,
    bathroomsCount: 2,
    facilities: { wifi: true, water_24_7: true, parking: true },
    coordinates: { lat: 2.042, lng: 45.318 },
    status: 'available',
    imageUrl: '/somali_house_one.png',
    ratingSum: 14,
    ratingCount: 3,
    reviews: [
      { author: 'Guled Ahmed', rating: 5, comment: 'Amazing property, water supply is indeed 24/7 which is rare here.', date: '2026-06-15' },
      { author: 'Mariam Ali', rating: 4, comment: 'Nice house and secure, landlord is responsive.', date: '2026-06-28' }
    ]
  },
  {
    id: 'h2',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Hargeisa',
    district: '26 June',
    title: 'Cozy 2-Bedroom Apartment',
    description: 'Affordable apartment in the heart of Hargeisa, 26 June district. Close to market hubs and public transport. Secure gates, standard facilities, reliable solar energy backups.',
    pricePerMonth: 220,
    depositAmount: 220,
    roomsCount: 2,
    bathroomsCount: 1,
    facilities: { wifi: true, water_24_7: false, parking: true },
    coordinates: { lat: 9.562, lng: 44.065 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ratingSum: 8,
    ratingCount: 2,
    reviews: [
      { author: 'Khadra Duale', rating: 4, comment: 'Quiet neighborhood, very clean environment.', date: '2026-05-12' }
    ]
  },
  {
    id: 'h3',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Garowe',
    district: 'Hodman',
    title: 'Spacious 4-Bedroom Family Home',
    description: 'Perfect residence for large families. Located in the peaceful Hodman district of Garowe. Includes high perimeter walls, security room, reserve water system, and high-speed fiber internet.',
    pricePerMonth: 550,
    depositAmount: 1100,
    roomsCount: 4,
    bathroomsCount: 3,
    facilities: { wifi: true, water_24_7: true, parking: true },
    coordinates: { lat: 8.406, lng: 48.482 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ratingSum: 5,
    ratingCount: 1,
    reviews: [
      { author: 'Nura Salad', rating: 5, comment: 'Very secure, plenty of space for children.', date: '2026-07-02' }
    ]
  },
  {
    id: 'h4',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Kismayo',
    district: 'Calanley',
    title: 'Coastal 2-Bedroom House near Port',
    description: 'Beautiful traditional Somali styled structure. Cool ocean breeze, constant water supply, close to downtown Calanley and beach areas. Secure and welcoming environment.',
    pricePerMonth: 280,
    depositAmount: 400,
    roomsCount: 2,
    bathroomsCount: 1,
    facilities: { wifi: false, water_24_7: true, parking: false },
    coordinates: { lat: -0.358, lng: 42.545 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ratingSum: 4,
    ratingCount: 1,
    reviews: []
  },
  {
    id: 'h5',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Baidoa',
    district: 'Isha',
    title: 'Modern 3-Bedroom Villa in Isha',
    description: 'Freshly renovated family house in the quiet residential Isha district. Includes 24/7 water access, gated parking slot, and high-speed WiFi connections.',
    pricePerMonth: 320,
    depositAmount: 640,
    roomsCount: 3,
    bathroomsCount: 2,
    facilities: { wifi: true, water_24_7: true, parking: true },
    coordinates: { lat: 3.12, lng: 43.65 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ratingSum: 5,
    ratingCount: 1,
    reviews: [
      { author: 'Salad Nur', rating: 5, comment: 'Very pleasant landlord and beautiful rooms.', date: '2026-07-09' }
    ]
  },
  {
    id: 'h6',
    landlordId: 'u1',
    landlordName: 'Abdi Rahman Elmi',
    landlordPhone: '+252615551234',
    city: 'Bosaso',
    district: 'Bandar',
    title: 'Traditional 2-Bedroom Port House',
    description: 'Standard 2-bedroom home close to the trade zone in Bandar, Bosaso. High security gate, water reserves, and reliable power grids.',
    pricePerMonth: 190,
    depositAmount: 190,
    roomsCount: 2,
    bathroomsCount: 1,
    facilities: { wifi: false, water_24_7: true, parking: false },
    coordinates: { lat: 11.28, lng: 49.18 },
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    ratingSum: 4,
    ratingCount: 1,
    reviews: []
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    tenantId: 'u2',
    tenantName: 'Faduma Omar Ali',
    tenantPhone: '+252617779876',
    houseId: 'h2',
    houseTitle: 'Cozy 2-Bedroom Apartment',
    proposedStartDate: '2026-08-01',
    status: 'pending',
    createdAt: '2026-07-10T14:32:00Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    tenantPhone: '+252617779876',
    landlordName: 'Abdi Rahman Elmi',
    houseTitle: 'Luxury 3-Bedroom Villa with Garden',
    amountTotal: 450.00,
    commissionAmount: 45.00,
    payoutAmount: 405.00,
    currency: 'USD',
    paymentMethod: 'evc_plus',
    paymentStatus: 'successful',
    telecomReference: 'WFI-EVC-994321',
    date: '2026-07-01T09:12:00Z',
    requestTime: '2026-07-01T09:10:00Z',
    completedTime: '2026-07-01T09:12:00Z',
    rentalObligationId: 'a1',
    obligationType: 'Application',
    verified: true
  },
  {
    id: 't2',
    tenantPhone: '+252617779876',
    landlordName: 'Abdi Rahman Elmi',
    houseTitle: 'Luxury 3-Bedroom Villa with Garden',
    amountTotal: 450.00,
    commissionAmount: 45.00,
    payoutAmount: 405.00,
    currency: 'USD',
    paymentMethod: 'sahal',
    paymentStatus: 'failed',
    failureReason: 'Insufficient Balance',
    telecomReference: '',
    date: '2026-06-30T10:00:00Z',
    requestTime: '2026-06-30T10:00:00Z',
    completedTime: '2026-06-30T10:01:00Z',
    rentalObligationId: 'a1',
    obligationType: 'Application',
    verified: false
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    reporterName: 'Faduma Omar Ali',
    reporterPhone: '+252617779876',
    title: 'Hodan Villa Water Pump Failure',
    details: 'The water pump is making a loud noise and no water is reaching the overhead tank. Needs immediate repair.',
    houseTitle: 'Luxury 3-Bedroom Villa with Garden',
    status: 'open',
    createdAt: '2026-07-11T08:00:00Z'
  }
];

export const INITIAL_AUDITS: AuditLog[] = [
  { id: 'ad1', timestamp: '2026-07-12T17:30:00Z', action: 'SYSTEM_BOOT', details: 'System core initialized and seeded successfully.', ipAddress: '127.0.0.1' },
  { id: 'ad2', timestamp: '2026-07-12T18:45:00Z', action: 'USER_REGISTER', details: 'Default profiles registered.', ipAddress: '197.220.35.4' }
];
