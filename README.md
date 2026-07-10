# ☕ Café Azzura - Interactive Coffee Shop Website

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF?style=for-the-badge&logo=vite)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.18.1-FF0080?style=for-the-badge&logo=framer)

A beautiful, fully animated React.js website for a coffee shop with a warm café theme. Built with modern web technologies and smooth animations.

## ✨ Features

### 🎨 **Visual Design**
- **Café Theme**: Warm brown, cream, and coffee-inspired color palette
- **Custom Typography**: Dancing Script and Poppins fonts for an authentic café feel
- **Smooth Animations**: Powered by Framer Motion for engaging user experience
- **Responsive Design**: Fully responsive across all devices

### 📱 **Sections**

1. **Hero Section**
   - Animated coffee bean particles falling
   - Rotating coffee cup icon
   - Call-to-action buttons with hover effects

2. **Menu Section**
   - Categorized menu items (Hot/Cold Beverages, Pastries, Specialty)
   - Interactive cards with hover animations
   - Price display with elegant styling

3. **Virtual Tour**
   - Interactive carousel showcasing different café areas
   - Smooth transitions between spots
   - Floating particle effects
   - Navigation indicators

4. **Brew Service**
   - Step-by-step brewing process visualization
   - Animated coffee cup with steam effect
   - Different brewing methods showcase
   - Interactive hover effects

5. **Booking Section**
   - Fully functional reservation form
   - Real-time form validation
   - Success animation on submission
   - Contact information cards

6. **Gallery**
   - Animated photo grid
   - Statistics showcase
   - Icon-based visual elements

7. **Footer**
   - Social media links
   - Newsletter subscription
   - Contact information
   - Animated decorative elements

## 🌐 API Integration

This project includes a **mock REST API** using JSON Server for development.

### Start API Server
```bash
npm run api
```
API runs on: **http://localhost:3001**

### Start Both Frontend + API
```bash
npm run dev:all
```

### API Endpoints
- `GET /menu` - All menu items
- `GET /bookings` - All bookings
- `POST /bookings` - Create booking
- `GET /reviews` - Customer reviews
- `GET /events` - Upcoming events
- `GET /staff` - Staff members
- `GET /stats` - Cafe statistics

📚 **Full API Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

🗺️ **Quick Routes Reference**: See [API_ROUTES.md](API_ROUTES.md)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The optimized files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

### Run Linter

```bash
npm run lint
```

## 🎨 Color Palette

```css
--cafe-brown: #6F4E37      /* Primary brown */
--cafe-cream: #F5E6D3      /* Light cream */
--cafe-dark: #3E2723       /* Dark brown */
--cafe-light: #FFF8E7      /* Light background */
--cafe-accent: #D4A574     /* Gold accent */
--cafe-espresso: #2C1810   /* Deep espresso */
--cafe-latte: #E8D5C4      /* Latte color */
--cafe-mocha: #8B4513      /* Mocha brown */
```

## 🛠️ Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **CSS3** - Styling with custom properties

## 📦 Project Structure

```
cafe-ui/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx/css
│   │   ├── Hero.jsx/css
│   │   ├── Menu.jsx/css
│   │   ├── VirtualTour.jsx/css
│   │   ├── BrewService.jsx/css
│   │   ├── Booking.jsx/css
│   │   ├── Gallery.jsx/css
│   │   └── Footer.jsx/css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 🎭 Animations

All sections feature custom animations:
- **Fade in/out effects**
- **Slide transitions**
- **Scale transformations**
- **Rotation animations**
- **Particle systems**
- **Hover interactions**
- **Form submit animations**

## 📱 Responsive Breakpoints

- Desktop: > 968px
- Tablet: 768px - 968px
- Mobile: < 768px

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔧 Customization

### Changing Colors
Edit the CSS variables in `src/index.css`:
```css
:root {
  --cafe-brown: #YOUR_COLOR;
  /* ... other colors */
}
```

### Modifying Content
Each component has its own data structure. Edit the arrays/objects in component files to customize content.

### Adding New Sections
1. Create new component in `src/components/`
2. Import in `App.jsx`
3. Add to the component tree

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 👨‍💻 Author

Built with ❤️ and lots of ☕

---

**Enjoy your coffee and happy coding!** ☕✨
