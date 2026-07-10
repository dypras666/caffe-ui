# ⚡ Quick Start Guide - Café Azzura

## 🚀 Get Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
cd ~/development/cafe-ui
npm install
```

### 2️⃣ Start Development Server
```bash
npm run dev
```

### 3️⃣ Open Browser
Navigate to: **http://localhost:5173** (or the port shown in terminal)

---

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check code quality with Oxlint |

---

## 🎨 What You'll See

### Homepage Features:
✅ **Hero Section** - Animated welcome with falling coffee beans  
✅ **Menu** - Full menu with prices (4 categories)  
✅ **Virtual Tour** - Interactive carousel (5 locations)  
✅ **Brew Service** - 6-step brewing process with animations  
✅ **Booking Form** - Complete reservation system  
✅ **Gallery** - Photo showcase with statistics  
✅ **Footer** - Social media, newsletter, contact info  

---

## 🎯 Quick Customization

### Change Colors
Edit `/src/index.css`:
```css
:root {
  --cafe-brown: #6F4E37;    /* Change this */
  --cafe-accent: #D4A574;   /* And this */
}
```

### Edit Menu Items
Edit `/src/components/Menu.jsx`:
```javascript
const menuCategories = [
  {
    title: 'Your Category',
    items: [
      { name: 'Item Name', price: '$5.00', desc: 'Description' }
    ]
  }
];
```

### Change Café Name
Edit `/src/components/Navbar.jsx` and `/src/components/Footer.jsx`:
```javascript
<span>Your Café Name</span>
```

---

## 🔧 Tech Stack

- **React 19.2.7** - UI Framework
- **Vite 6.0.5** - Build Tool
- **Framer Motion 12.42.2** - Animations
- **Lucide React 1.23.0** - Icons

---

## 📱 Responsive Design

The website is fully responsive:
- 💻 **Desktop** - Multi-column layouts
- 📱 **Tablet** - Adjusted spacing
- 📱 **Mobile** - Hamburger menu, single column

---

## 🎭 Key Features

### Animations:
- Falling coffee bean particles
- Rotating icons
- Smooth page transitions
- Hover effects on all interactive elements
- Form submission animations
- Carousel transitions

### Interactive Elements:
- Smooth scroll navigation
- Mobile hamburger menu
- Booking form with validation
- Virtual tour carousel
- Hover animations on cards

---

## 🐛 Common Issues

### Port Already in Use?
Vite will automatically try another port (5174, 5175, etc.)

### Animations Not Working?
Make sure `framer-motion` is installed:
```bash
npm install framer-motion
```

### Icons Not Showing?
Verify `lucide-react` is installed:
```bash
npm install lucide-react
```

---

## 📂 Project Structure

```
cafe-ui/
├── src/
│   ├── components/       # All UI components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Menu.jsx
│   │   ├── VirtualTour.jsx
│   │   ├── BrewService.jsx
│   │   ├── Booking.jsx
│   │   ├── Gallery.jsx
│   │   └── Footer.jsx
│   ├── App.jsx          # Main app component
│   ├── index.css        # Global styles & colors
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

---

## 🎓 Next Steps

1. **Customize Content** - Edit component files
2. **Change Colors** - Modify CSS variables
3. **Add Features** - Create new components
4. **Deploy** - Build and host on Vercel/Netlify

---

## 📚 Documentation

- **Full Features**: See `FEATURES.md`
- **README**: See `README.md`
- **Component Details**: Check individual `.jsx` files

---

## 🆘 Need Help?

Check these files:
- `README.md` - Full documentation
- `FEATURES.md` - Detailed feature list
- `package.json` - All dependencies

---

**Happy Coding! ☕✨**

Built with React + Vite + Framer Motion
