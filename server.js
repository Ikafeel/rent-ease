/**
 * RentEase Backend — Express REST API
 * In-memory data store (swap db.* calls for real SQL queries to migrate to PostgreSQL/MySQL)
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'rentease_jwt_secret_2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────────
//  IN-MEMORY DATABASE
// ──────────────────────────────────────────────
const db = {
  users: [
    { id: 1, name: 'Admin User',    email: 'admin@rentease.in',   password: bcrypt.hashSync('admin123', 10),  role: 'admin',    created: '2026-01-01' },
    { id: 2, name: 'SpeedRide Co.', email: 'vendor@rentease.in',  password: bcrypt.hashSync('vendor123', 10), role: 'vendor',   created: '2026-01-15', vendorId: 1 },
    { id: 3, name: 'Priya Mehta',   email: 'priya@example.com',   password: bcrypt.hashSync('user123', 10),   role: 'customer', created: '2026-02-10' },
    { id: 4, name: 'Rahul Shah',    email: 'rahul@example.com',   password: bcrypt.hashSync('user123', 10),   role: 'customer', created: '2026-02-20' },
  ],
  nextUserId: 5,

  vendors: [
    { id: 1, name: 'SpeedRide Rentals', city: 'Ahmedabad', email: 'vendor@rentease.in', fleetSize: 18, revenue: 120000, rating: 4.7, status: 'Active',  joinedDate: '2026-01-15' },
    { id: 2, name: 'Swift Rentals',     city: 'Surat',     email: 'swift@example.com', fleetSize: 9,  revenue: 64000,  rating: 4.4, status: 'Pending', joinedDate: '2026-03-01' },
    { id: 3, name: 'City Wheels',       city: 'Vadodara',  email: 'city@example.com',  fleetSize: 24, revenue: 210000, rating: 4.8, status: 'Active',  joinedDate: '2026-01-10' },
    { id: 4, name: 'Rajpath Cars',      city: 'Rajkot',    email: 'rajpath@example.com',fleetSize: 6, revenue: 28000,  rating: 3.9, status: 'Inactive',joinedDate: '2026-02-05' },
  ],
  nextVendorId: 5,

  vehicles: [
    { id: 1,  vendorId: 1, name: 'Hyundai i20',       type: 'hatchback', emoji: '🚗', price: 1200, seats: 5, fuel: 'Petrol',   transmission: 'Manual',    available: true,  rating: 4.7 },
    { id: 2,  vendorId: 3, name: 'Toyota Innova',      type: 'suv',       emoji: '🚙', price: 2800, seats: 7, fuel: 'Diesel',   transmission: 'Manual',    available: true,  rating: 4.9 },
    { id: 3,  vendorId: 2, name: 'Maruti Swift',       type: 'hatchback', emoji: '🚗', price: 900,  seats: 5, fuel: 'Petrol',   transmission: 'Manual',    available: true,  rating: 4.5 },
    { id: 4,  vendorId: 1, name: 'Honda City',         type: 'sedan',     emoji: '🚘', price: 1600, seats: 5, fuel: 'Petrol',   transmission: 'Automatic', available: false, rating: 4.6 },
    { id: 5,  vendorId: 3, name: 'BMW 3 Series',       type: 'luxury',    emoji: '🏎️', price: 5500, seats: 5, fuel: 'Petrol',   transmission: 'Automatic', available: true,  rating: 4.8 },
    { id: 6,  vendorId: 3, name: 'Mahindra XUV700',    type: 'suv',       emoji: '🚙', price: 3200, seats: 7, fuel: 'Diesel',   transmission: 'Automatic', available: true,  rating: 4.7 },
    { id: 7,  vendorId: 4, name: 'Tata Nexon EV',      type: 'suv',       emoji: '🚙', price: 1800, seats: 5, fuel: 'Electric', transmission: 'Automatic', available: true,  rating: 4.3 },
    { id: 8,  vendorId: 1, name: 'Hyundai Verna',      type: 'sedan',     emoji: '🚘', price: 1500, seats: 5, fuel: 'Petrol',   transmission: 'Manual',    available: true,  rating: 4.6 },
    { id: 9,  vendorId: 3, name: 'Mercedes C-Class',   type: 'luxury',    emoji: '🏎️', price: 7200, seats: 5, fuel: 'Petrol',   transmission: 'Automatic', available: false, rating: 4.9 },
  ],
  nextVehicleId: 10,

  bookings: [
    { id: 1001, vehicleId: 2, customerId: 3, vendorId: 3, customerName: 'Priya Mehta', from: '2026-05-12', to: '2026-05-15', amount: 9600,  status: 'Active',    createdAt: '2026-05-10', location: 'Ahmedabad Central', phone: '+91 98765 43210' },
    { id: 1002, vehicleId: 1, customerId: 4, vendorId: 1, customerName: 'Rahul Shah',  from: '2026-05-11', to: '2026-05-12', amount: 1400,  status: 'Completed', createdAt: '2026-05-09', location: 'Surat Bus Stand',   phone: '+91 87654 32109' },
    { id: 1003, vehicleId: 3, customerId: 3, vendorId: 2, customerName: 'Anjali Patel',from: '2026-05-10', to: '2026-05-13', amount: 3100,  status: 'Completed', createdAt: '2026-05-08', location: 'Vadodara Airport',  phone: '+91 76543 21098' },
    { id: 1004, vehicleId: 6, customerId: 4, vendorId: 3, customerName: 'Dev Joshi',   from: '2026-05-15', to: '2026-05-18', amount: 10500, status: 'Pending',   createdAt: '2026-05-14', location: 'Rajkot Station',   phone: '+91 65432 10987' },
    { id: 1005, vehicleId: 4, customerId: 3, vendorId: 1, customerName: 'Neha Rao',    from: '2026-05-09', to: '2026-05-10', amount: 1900,  status: 'Cancelled', createdAt: '2026-05-07', location: 'Ahmedabad Airport',phone: '+91 54321 09876' },
  ],
  nextBookingId: 1006,

  activityLog: [
    { msg: 'New booking confirmed — Hyundai i20, Rahul Shah', time: '2 min ago', dot: 'green', amount: '₹1,400' },
    { msg: 'Vendor onboarded — Swift Rentals, Surat',          time: '14 min ago', dot: 'blue', amount: '' },
    { msg: 'Payment retry triggered — Booking #1004',          time: '31 min ago', dot: 'yellow', amount: '₹10,500' },
    { msg: 'Vehicle listing approved — Maruti Swift',          time: '1 hour ago', dot: 'green', amount: '' },
    { msg: 'User registration — anjali.patel@email.com',       time: '1 hour ago', dot: '', amount: '' },
  ],
};

// ──────────────────────────────────────────────
//  AUTH MIDDLEWARE
// ──────────────────────────────────────────────
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// ──────────────────────────────────────────────
//  AUTH ROUTES
// ──────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (db.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: db.nextUserId++, name, email, password: hashed, role, created: new Date().toISOString().split('T')[0] };
  db.users.push(user);

  if (role === 'vendor') {
    const vendor = { id: db.nextVendorId++, name, city: req.body.city || 'India', email, fleetSize: 0, revenue: 0, rating: 0, status: 'Pending', joinedDate: user.created };
    db.vendors.push(vendor);
    user.vendorId = vendor.id;
    db.activityLog.unshift({ msg: `Vendor onboarded — ${name}`, time: 'just now', dot: 'blue', amount: '' });
  }

  const token = jwt.sign({ id: user.id, name, email, role, vendorId: user.vendorId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name, email, role } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user.id, name: user.name, email, role: user.role, vendorId: user.vendorId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ──────────────────────────────────────────────
//  VEHICLES
// ──────────────────────────────────────────────
app.get('/api/vehicles', (req, res) => {
  const { type, available } = req.query;
  let result = db.vehicles.map(v => {
    const vendor = db.vendors.find(ve => ve.id === v.vendorId);
    return { ...v, vendorName: vendor?.name || 'Unknown' };
  });
  if (type && type !== 'all') result = result.filter(v => v.type === type);
  if (available === 'true') result = result.filter(v => v.available);
  res.json(result);
});

app.get('/api/vehicles/:id', (req, res) => {
  const v = db.vehicles.find(v => v.id === +req.params.id);
  if (!v) return res.status(404).json({ error: 'Not found' });
  const vendor = db.vendors.find(ve => ve.id === v.vendorId);
  res.json({ ...v, vendorName: vendor?.name });
});

app.post('/api/vehicles', auth, requireRole('vendor', 'admin'), (req, res) => {
  const { name, type, price, seats, fuel, transmission, emoji } = req.body;
  if (!name || !type || !price) return res.status(400).json({ error: 'name, type, price required' });
  const vendorId = req.user.vendorId || req.body.vendorId;
  const vehicle = { id: db.nextVehicleId++, vendorId: +vendorId, name, type, emoji: emoji || '🚗', price: +price, seats: +seats || 5, fuel: fuel || 'Petrol', transmission: transmission || 'Manual', available: true, rating: 0 };
  db.vehicles.push(vehicle);
  // Update vendor fleet size
  const vendor = db.vendors.find(v => v.id === +vendorId);
  if (vendor) vendor.fleetSize++;
  db.activityLog.unshift({ msg: `Vehicle listing approved — ${name}`, time: 'just now', dot: 'green', amount: '' });
  res.status(201).json(vehicle);
});

app.put('/api/vehicles/:id', auth, requireRole('vendor', 'admin'), (req, res) => {
  const v = db.vehicles.find(v => v.id === +req.params.id);
  if (!v) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'vendor' && v.vendorId !== req.user.vendorId) return res.status(403).json({ error: 'Forbidden' });
  Object.assign(v, req.body);
  res.json(v);
});

app.delete('/api/vehicles/:id', auth, requireRole('vendor', 'admin'), (req, res) => {
  const idx = db.vehicles.findIndex(v => v.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.vehicles.splice(idx, 1);
  res.json({ success: true });
});

// ──────────────────────────────────────────────
//  BOOKINGS
// ──────────────────────────────────────────────
app.get('/api/bookings', auth, (req, res) => {
  let result = [...db.bookings];
  if (req.user.role === 'customer') result = result.filter(b => b.customerId === req.user.id);
  if (req.user.role === 'vendor')   result = result.filter(b => b.vendorId === req.user.vendorId);
  // Enrich with vehicle name
  result = result.map(b => {
    const vehicle = db.vehicles.find(v => v.id === b.vehicleId);
    return { ...b, vehicleName: vehicle?.name || 'Unknown', vehicleEmoji: vehicle?.emoji || '🚗' };
  });
  res.json(result);
});

app.post('/api/bookings', auth, (req, res) => {
  const { vehicleId, from, to, location, phone, customerName } = req.body;
  if (!vehicleId || !from || !to) return res.status(400).json({ error: 'vehicleId, from, to required' });

  const vehicle = db.vehicles.find(v => v.id === +vehicleId);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  if (!vehicle.available) return res.status(409).json({ error: 'Vehicle is not available' });

  // Double-booking check
  const conflict = db.bookings.find(b =>
    b.vehicleId === +vehicleId &&
    b.status !== 'Cancelled' &&
    b.status !== 'Completed' &&
    !(to <= b.from || from >= b.to)
  );
  if (conflict) return res.status(409).json({ error: 'Vehicle is already booked for those dates' });

  const days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000));
  const base = vehicle.price * days;
  const fee  = Math.round(base * 0.05);
  const amount = base + fee + 200;

  const booking = {
    id: db.nextBookingId++,
    vehicleId: +vehicleId,
    customerId: req.user.id,
    vendorId: vehicle.vendorId,
    customerName: customerName || req.user.name,
    from, to, amount, location: location || '',
    phone: phone || '',
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
  };
  db.bookings.push(booking);

  // Mark vehicle as booked
  vehicle.available = false;

  // Update vendor revenue
  const vendor = db.vendors.find(v => v.id === vehicle.vendorId);
  if (vendor) vendor.revenue += amount;

  db.activityLog.unshift({ msg: `New booking confirmed — ${vehicle.name}, ${booking.customerName}`, time: 'just now', dot: 'green', amount: `₹${amount.toLocaleString('en-IN')}` });

  res.status(201).json({ ...booking, vehicleName: vehicle.name, vehicleEmoji: vehicle.emoji });
});

app.put('/api/bookings/:id/status', auth, requireRole('vendor', 'admin'), (req, res) => {
  const booking = db.bookings.find(b => b.id === +req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const { status } = req.body;
  booking.status = status;
  if (status === 'Completed' || status === 'Cancelled') {
    const vehicle = db.vehicles.find(v => v.id === booking.vehicleId);
    if (vehicle) vehicle.available = true;
  }
  res.json(booking);
});

app.delete('/api/bookings/:id', auth, (req, res) => {
  const booking = db.bookings.find(b => b.id === +req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'customer' && booking.customerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  booking.status = 'Cancelled';
  const vehicle = db.vehicles.find(v => v.id === booking.vehicleId);
  if (vehicle) vehicle.available = true;
  res.json({ success: true });
});

// ──────────────────────────────────────────────
//  VENDOR ROUTES
// ──────────────────────────────────────────────
app.get('/api/vendor/dashboard', auth, requireRole('vendor', 'admin'), (req, res) => {
  const vendorId = req.user.vendorId;
  const myVehicles = db.vehicles.filter(v => v.vendorId === vendorId);
  const myBookings = db.bookings.filter(b => b.vendorId === vendorId);
  const activeBookings = myBookings.filter(b => b.status === 'Active' || b.status === 'Pending');
  const monthEarnings = myBookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.amount, 0);
  const avgRating = myVehicles.length ? (myVehicles.reduce((s, v) => s + v.rating, 0) / myVehicles.length).toFixed(1) : 0;
  const recentBookings = myBookings.slice(-5).reverse().map(b => {
    const v = db.vehicles.find(veh => veh.id === b.vehicleId);
    return { ...b, vehicleName: v?.name || 'Unknown' };
  });
  res.json({ totalVehicles: myVehicles.length, activeRentals: activeBookings.length, monthEarnings, avgRating, recentBookings, vehicles: myVehicles });
});

// ──────────────────────────────────────────────
//  ADMIN ROUTES
// ──────────────────────────────────────────────
app.get('/api/admin/dashboard', auth, requireRole('admin'), (req, res) => {
  const totalUsers     = db.users.filter(u => u.role === 'customer').length;
  const activeVendors  = db.vendors.filter(v => v.status === 'Active').length;
  const totalRevenue   = db.bookings.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + b.amount, 0);
  const openTickets    = 7;
  const weeklyBookings = [82, 74, 91, 88, 76, 95, db.bookings.length];
  res.json({ totalUsers, activeVendors, totalRevenue, openTickets, weeklyBookings, activityLog: db.activityLog.slice(0, 8) });
});

app.get('/api/admin/vendors', auth, requireRole('admin'), (req, res) => res.json(db.vendors));
app.get('/api/admin/users',   auth, requireRole('admin'), (req, res) => res.json(db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, created: u.created }))));

app.put('/api/admin/vendors/:id', auth, requireRole('admin'), (req, res) => {
  const vendor = db.vendors.find(v => v.id === +req.params.id);
  if (!vendor) return res.status(404).json({ error: 'Not found' });
  Object.assign(vendor, req.body);
  res.json(vendor);
});

// ──────────────────────────────────────────────
//  STATS (public)
// ──────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  res.json({
    totalBookings: db.bookings.length,
    fleetSize:     db.vehicles.length,
    revenue:       db.bookings.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + b.amount, 0),
    uptime:        '99.9%',
  });
});

// Serve frontend
app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`🚗 RentEase running on http://localhost:${PORT}`));
module.exports = app;
