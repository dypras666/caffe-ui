# 🔌 API Integration Guide

## ✅ Implemented Components

### 1. **Menu Component** (`/src/components/Menu.jsx`)

#### Features:
- ✅ Fetches menu items from API
- ✅ Groups items by category dynamically
- ✅ Shows loading spinner while fetching
- ✅ Displays error fallback
- ✅ Shows item count badge
- ✅ Popular badge for popular items
- ✅ Unavailable tag for out-of-stock items
- ✅ Item emoji/icons

#### API Endpoint:
```javascript
GET http://localhost:3001/menu
```

#### Data Structure:
```javascript
{
  id: 1,
  category: "Hot Beverages",
  name: "Espresso",
  price: 3.50,
  description: "Rich and bold Italian espresso",
  image: "☕",
  available: true,
  popular: true
}
```

#### Usage:
```javascript
import { useMenu } from '../hooks/useApi';

const { data: menuItems, loading, error } = useMenu();
```

---

### 2. **Booking Component** (`/src/components/Booking.jsx`)

#### Features:
- ✅ POST booking data to API
- ✅ Loading state with spinner
- ✅ Error handling with user feedback
- ✅ Success message with booking ID
- ✅ Auto-reset form after submission
- ✅ Disabled button during submission

#### API Endpoint:
```javascript
POST http://localhost:3001/bookings
```

#### Request Body:
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  date: "2026-07-15",
  time: "19:00",
  guests: 2,
  message: "Window seat please",
  status: "pending"
}
```

#### Response:
```javascript
{
  id: 3,
  name: "John Doe",
  // ... rest of booking data
  status: "pending"
}
```

#### Usage:
```javascript
import { usePost } from '../hooks/useApi';

const { postData, loading, error } = usePost();

const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await postData('/bookings', bookingData);
  console.log('Booking ID:', result.id);
};
```

---

### 3. **Gallery Component** (`/src/components/Gallery.jsx`)

#### Features:
- ✅ Fetches gallery items from API
- ✅ Fetches statistics from API
- ✅ Dynamic color coding by category
- ✅ Emoji/icon display
- ✅ Real-time stats display

#### API Endpoints:
```javascript
GET http://localhost:3001/gallery
GET http://localhost:3001/stats
```

#### Data Structure:
```javascript
// Gallery Item
{
  id: 1,
  title: "Morning Brew",
  description: "Fresh espresso shot",
  image: "☕",
  category: "Coffee"
}

// Stats
{
  customers: "10,000+",
  varieties: "50+",
  experience: "15+",
  rating: 5.0,
  daily_cups: "500+",
  locations: 1
}
```

#### Usage:
```javascript
import { useGallery, useStats } from '../hooks/useApi';

const { data: galleryItems } = useGallery();
const { data: statsData } = useStats();
```

---

## 🎣 Custom Hooks

### Location: `/src/hooks/useApi.js`

### Available Hooks:

#### 1. `useFetch(endpoint)`
Generic hook for GET requests
```javascript
const { data, loading, error } = useFetch('/menu');
```

#### 2. `useMenu()`
Fetch all menu items
```javascript
const { data, loading, error } = useMenu();
```

#### 3. `useBookings()`
Fetch all bookings
```javascript
const { data, loading, error } = useBookings();
```

#### 4. `useReviews()`
Fetch all reviews
```javascript
const { data, loading, error } = useReviews();
```

#### 5. `useGallery()`
Fetch gallery items
```javascript
const { data, loading, error } = useGallery();
```

#### 6. `useEvents()`
Fetch events
```javascript
const { data, loading, error } = useEvents();
```

#### 7. `useStaff()`
Fetch staff members
```javascript
const { data, loading, error } = useStaff();
```

#### 8. `useStats()`
Fetch cafe statistics
```javascript
const { data, loading, error } = useStats();
```

#### 9. `usePost()`
POST data to any endpoint
```javascript
const { postData, loading, error } = usePost();

const result = await postData('/bookings', data);
```

---

## 🎨 UI States

### Loading State
```jsx
if (loading) {
  return (
    <div className="loading">
      <Loader /> {/* Spinning icon */}
      <p>Loading...</p>
    </div>
  );
}
```

### Error State
```jsx
if (error) {
  return (
    <div className="error">
      <p>❌ Error: {error}</p>
      <p>Using fallback data...</p>
    </div>
  );
}
```

### Success State (Booking)
```jsx
<div className="success-message">
  <CheckCircle size={80} />
  <h3>Booking Confirmed!</h3>
  <p>Booking ID: #{bookingId}</p>
</div>
```

---

## 🔧 Configuration

### API Base URL
```javascript
// In /src/hooks/useApi.js
const API_BASE_URL = 'http://localhost:3001';
```

### Change API URL
For production, update to your deployed API:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

Then create `.env` file:
```env
REACT_APP_API_URL=https://api.cafeazzura.com
```

---

## 📦 Features Added

### Menu Component:
- ✅ Item count display
- ✅ Popular badges (⭐ Popular)
- ✅ Unavailable tags
- ✅ Item emojis
- ✅ Dynamic category grouping
- ✅ Loading spinner
- ✅ Error handling

### Booking Component:
- ✅ API integration
- ✅ Loading button state
- ✅ Spinner animation
- ✅ Booking ID display
- ✅ Status message
- ✅ Error feedback
- ✅ Auto form reset

### Gallery Component:
- ✅ Real-time stats from API
- ✅ Dynamic gallery items
- ✅ Category color coding
- ✅ Item descriptions

---

## 🚀 How to Test

### 1. Start Both Servers
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: API
npm run api

# Or both together:
npm run dev:all
```

### 2. Test Menu
- Open http://localhost:5174
- Scroll to Menu section
- Should see 16 items loaded from API
- Check for "⭐ Popular" badges
- Verify item emojis display

### 3. Test Booking
- Scroll to Booking section
- Fill out the form
- Click "Confirm Reservation"
- Should see loading spinner
- Then success message with booking ID
- Check API: `curl http://localhost:3001/bookings`

### 4. Test Gallery
- Scroll to Gallery section
- Should see 6 gallery items
- Stats should show real numbers
- Check categories (Coffee, Interior, Food)

---

## 🧪 Testing API Directly

### View All Bookings
```bash
curl http://localhost:3001/bookings | jq
```

### View Menu
```bash
curl http://localhost:3001/menu | jq
```

### View Stats
```bash
curl http://localhost:3001/stats | jq
```

### Create Test Booking
```bash
curl -X POST http://localhost:3001/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "phone": "+1234567890",
    "date": "2026-07-20",
    "time": "18:00",
    "guests": 4,
    "message": "Test booking",
    "status": "pending"
  }' | jq
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch"
**Cause:** API server not running
**Solution:**
```bash
npm run api
```

### Issue: CORS Error
**Cause:** Different ports
**Solution:** JSON Server enables CORS by default, should work

### Issue: Data not updating
**Solution:** Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)

### Issue: Loading forever
**Cause:** Wrong API URL
**Check:** Console for error messages

---

## 📊 Performance

### Bundle Size Impact
- Custom hooks: ~2KB
- Total API code: ~2KB
- No external HTTP library (using fetch)

### Caching
Currently no caching. Future improvements:
- React Query for caching
- Service Worker for offline
- Local Storage fallback

---

## 🔮 Future Enhancements

### Planned Features:
- [ ] React Query integration
- [ ] Optimistic updates
- [ ] Real-time updates (WebSocket)
- [ ] Pagination for menu
- [ ] Search/filter functionality
- [ ] Authentication
- [ ] User accounts
- [ ] Order history
- [ ] Reviews CRUD

### Potential Components to Add:
- [ ] Reviews display (useReviews)
- [ ] Events calendar (useEvents)
- [ ] Staff showcase (useStaff)
- [ ] User dashboard
- [ ] Admin panel

---

## 📝 Component Status

| Component | API Integrated | Status |
|-----------|---------------|--------|
| Menu | ✅ | Complete |
| Booking | ✅ | Complete |
| Gallery | ✅ | Complete |
| Hero | ❌ | Static |
| Virtual Tour | ❌ | Static |
| Brew Service | ❌ | Static |
| Navbar | ❌ | Static |
| Footer | ❌ | Static |

---

## 🎯 Best Practices Used

1. ✅ **Custom Hooks** - Reusable API logic
2. ✅ **Error Handling** - User-friendly messages
3. ✅ **Loading States** - Visual feedback
4. ✅ **Fallback Data** - Graceful degradation
5. ✅ **Form Validation** - HTML5 validation
6. ✅ **Optimistic UI** - Immediate feedback
7. ✅ **Clean Code** - Readable and maintainable

---

**Integration Status:** ✅ **3/8 Components Integrated**

**Last Updated:** July 7, 2026
