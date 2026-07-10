# 🌐 Café Azzura - API Documentation

## 📡 Base URL
```
http://localhost:3001
```

## 🚀 Starting the API

### Option 1: API Only
```bash
npm run api
```
Starts JSON Server on port **3001**

### Option 2: Dev + API Together
```bash
npm run dev:all
```
Starts both Vite dev server (5173) and API server (3001)

---

## 📚 Available Endpoints

### 1. Menu Items

#### Get All Menu Items
```http
GET /menu
```

**Response:**
```json
[
  {
    "id": 1,
    "category": "Hot Beverages",
    "name": "Espresso",
    "price": 3.50,
    "description": "Rich and bold Italian espresso",
    "image": "☕",
    "available": true,
    "popular": true
  }
]
```

#### Get Single Menu Item
```http
GET /menu/:id
```

**Example:**
```bash
curl http://localhost:3001/menu/1
```

#### Filter by Category
```http
GET /menu?category=Hot Beverages
```

#### Filter Popular Items
```http
GET /menu?popular=true
```

#### Search by Name
```http
GET /menu?name_like=Latte
```

---

### 2. Bookings

#### Get All Bookings
```http
GET /bookings
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "date": "2026-07-10",
    "time": "18:00",
    "guests": 4,
    "message": "Window seat please",
    "status": "confirmed"
  }
]
```

#### Create New Booking
```http
POST /bookings
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "date": "2026-07-10",
  "time": "18:00",
  "guests": 4,
  "message": "Window seat please",
  "status": "pending"
}
```

#### Update Booking
```http
PUT /bookings/:id
PATCH /bookings/:id
```

#### Delete Booking
```http
DELETE /bookings/:id
```

---

### 3. Reviews

#### Get All Reviews
```http
GET /reviews
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Sarah Johnson",
    "rating": 5,
    "comment": "Best coffee in town!",
    "date": "2026-07-01",
    "avatar": "👩"
  }
]
```

#### Create New Review
```http
POST /reviews
Content-Type: application/json

{
  "name": "Your Name",
  "rating": 5,
  "comment": "Amazing coffee!",
  "date": "2026-07-07",
  "avatar": "👤"
}
```

---

### 4. Gallery

#### Get All Gallery Items
```http
GET /gallery
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Morning Brew",
    "description": "Fresh espresso shot",
    "image": "☕",
    "category": "Coffee"
  }
]
```

#### Filter by Category
```http
GET /gallery?category=Coffee
GET /gallery?category=Interior
GET /gallery?category=Food
```

---

### 5. Events

#### Get All Events
```http
GET /events
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Jazz Night",
    "date": "2026-07-15",
    "time": "19:00",
    "description": "Live jazz music",
    "price": "Free entry",
    "image": "🎵"
  }
]
```

#### Get Upcoming Events
```http
GET /events?date_gte=2026-07-07
```

---

### 6. Staff

#### Get All Staff Members
```http
GET /staff
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Alessandro Rossi",
    "position": "Head Barista",
    "experience": "15 years",
    "specialty": "Espresso & Latte Art",
    "image": "👨‍🍳"
  }
]
```

#### Filter by Position
```http
GET /staff?position=Barista
```

---

### 7. Stats

#### Get Cafe Statistics
```http
GET /stats
```

**Response:**
```json
{
  "customers": "10,000+",
  "varieties": "50+",
  "experience": "15+",
  "rating": 5.0,
  "daily_cups": "500+",
  "locations": 1
}
```

---

## 🔍 Query Parameters

### Pagination
```http
GET /menu?_page=1&_limit=10
```

### Sorting
```http
GET /menu?_sort=price&_order=asc
GET /menu?_sort=name&_order=desc
```

### Full-text Search
```http
GET /menu?q=coffee
```

### Filtering
```http
GET /menu?category=Hot Beverages&available=true
```

### Relations
```http
GET /bookings?_embed=reviews
```

---

## 📝 Example Usage with Fetch

### Get Menu Items
```javascript
fetch('http://localhost:3001/menu')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Create Booking
```javascript
fetch('http://localhost:3001/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    date: '2026-07-10',
    time: '18:00',
    guests: 4,
    message: 'Window seat please',
    status: 'pending'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Get Popular Menu Items
```javascript
fetch('http://localhost:3001/menu?popular=true')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## 🧪 Testing Endpoints

### Using cURL

**Get all menu items:**
```bash
curl http://localhost:3001/menu
```

**Get specific item:**
```bash
curl http://localhost:3001/menu/1
```

**Create booking:**
```bash
curl -X POST http://localhost:3001/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "date": "2026-07-15",
    "time": "19:00",
    "guests": 2,
    "message": "Test booking",
    "status": "pending"
  }'
```

**Update booking:**
```bash
curl -X PATCH http://localhost:3001/bookings/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

**Delete booking:**
```bash
curl -X DELETE http://localhost:3001/bookings/1
```

---

## 📊 Data Structure

### Menu Item Schema
```typescript
{
  id: number;
  category: "Hot Beverages" | "Cold Beverages" | "Pastries" | "Specialty";
  name: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
  popular: boolean;
}
```

### Booking Schema
```typescript
{
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guests: number;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
}
```

### Review Schema
```typescript
{
  id: number;
  name: string;
  rating: number; // 1-5
  comment: string;
  date: string; // YYYY-MM-DD
  avatar: string;
}
```

---

## 🔧 CORS Configuration

JSON Server automatically enables CORS, so you can make requests from any origin.

---

## 🚀 Production Deployment

For production, consider:
1. **Use a real database** (PostgreSQL, MongoDB)
2. **Add authentication** (JWT tokens)
3. **Rate limiting**
4. **Input validation**
5. **Error handling**

### Recommended Stack:
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma or TypeORM
- **Auth**: JWT + bcrypt

---

## 📝 Notes

- **Development Only**: This is a mock API for development
- **Data Persistence**: Data is stored in `db.json`
- **Auto-reload**: Server watches `db.json` for changes
- **RESTful**: Follows REST conventions

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
json-server --watch db.json --port 3002
```

### CORS Issues
JSON Server enables CORS by default. If issues persist:
```bash
json-server --watch db.json --port 3001 --middlewares ./cors.js
```

---

## 📚 Additional Resources

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [REST API Best Practices](https://restfulapi.net/)

---

**API Status**: ✅ Running on http://localhost:3001

**Last Updated**: July 7, 2026
