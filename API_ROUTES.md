# 🗺️ API Routes Quick Reference

## 🔗 All Available Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/menu` | Get all menu items |
| `GET` | `/menu/:id` | Get specific menu item |
| `GET` | `/menu?category=X` | Filter by category |
| `GET` | `/menu?popular=true` | Get popular items |
| `POST` | `/menu` | Create new menu item |
| `PUT` | `/menu/:id` | Update menu item |
| `DELETE` | `/menu/:id` | Delete menu item |
| | | |
| `GET` | `/bookings` | Get all bookings |
| `GET` | `/bookings/:id` | Get specific booking |
| `GET` | `/bookings?status=confirmed` | Filter by status |
| `POST` | `/bookings` | Create new booking |
| `PATCH` | `/bookings/:id` | Update booking |
| `DELETE` | `/bookings/:id` | Cancel booking |
| | | |
| `GET` | `/reviews` | Get all reviews |
| `GET` | `/reviews/:id` | Get specific review |
| `GET` | `/reviews?rating=5` | Filter by rating |
| `POST` | `/reviews` | Create new review |
| `DELETE` | `/reviews/:id` | Delete review |
| | | |
| `GET` | `/gallery` | Get all gallery items |
| `GET` | `/gallery?category=Coffee` | Filter by category |
| `POST` | `/gallery` | Add gallery item |
| | | |
| `GET` | `/events` | Get all events |
| `GET` | `/events?date_gte=2026-07-07` | Upcoming events |
| `POST` | `/events` | Create new event |
| | | |
| `GET` | `/staff` | Get all staff |
| `GET` | `/staff?position=Barista` | Filter by position |
| | | |
| `GET` | `/stats` | Get cafe statistics |

---

## 🎯 Quick Test Commands

### Get Menu
```bash
curl http://localhost:3001/menu
```

### Get Popular Items
```bash
curl http://localhost:3001/menu?popular=true
```

### Get Hot Beverages Only
```bash
curl "http://localhost:3001/menu?category=Hot%20Beverages"
```

### Create Booking
```bash
curl -X POST http://localhost:3001/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "date": "2026-07-15",
    "time": "19:00",
    "guests": 2,
    "status": "pending"
  }'
```

### Get Reviews
```bash
curl http://localhost:3001/reviews
```

### Get Stats
```bash
curl http://localhost:3001/stats
```

---

## 📱 Integration Examples

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function MenuList() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {menu.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>${item.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Booking Form Integration

```jsx
async function submitBooking(formData) {
  const response = await fetch('http://localhost:3001/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  console.log('Booking created:', data);
}
```

---

## 🔍 Query Parameters

### Pagination
```
?_page=1&_limit=10
```

### Sorting
```
?_sort=price&_order=asc
?_sort=name&_order=desc
```

### Full-text Search
```
?q=coffee
```

### Multiple Filters
```
?category=Hot Beverages&available=true&popular=true
```

---

## 🌐 Base URL

**Local Development:**
```
http://localhost:3001
```

---

**Quick Start:**
```bash
# Terminal 1: Start API
npm run api

# Terminal 2: Start Frontend
npm run dev

# Or both together:
npm run dev:all
```
