# Neon Portfolio

![License](https://img.shields.io/badge/license-MIT-blue)
![PHP](https://img.shields.io/badge/PHP-8%2B-777BB4)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4)
![Three.js](https://img.shields.io/badge/Three.js-0.160-000000)

A world-class, futuristic personal portfolio website with ultra-modern UI/UX, built with modern technologies.

## Tech Stack

- **Frontend:** HTML5, Tailwind CSS 3.4, JavaScript ES2024+
- **3D/Animation:** Three.js 0.160, GSAP 3.12 + ScrollTrigger, Lenis 1.0
- **Build:** Vite 5.4
- **Backend:** PHP 8+, PHPMailer 6.9
- **Icons:** Font Awesome 6.5
- **Fonts:** Inter, JetBrains Mono, Orbitron

## Features

### Frontend
- Fully responsive neon cyberpunk design with glassmorphism
- Three.js animated background (particles, stars, wireframe sphere, grid, floating cubes)
- GSAP scroll animations & reveal effects
- Lenis smooth scrolling
- Custom animated cursor with hover states
- Magnetic buttons & 3D card tilts (skills + projects)
- Glassmorphism cards with neon glow borders
- Scroll progress bar
- Dark/Light theme toggle
- Mobile responsive navigation with hamburger menu
- Typing animation in hero
- Loading screen with spinner
- Cookie consent banner
- Sound toggle
- Back to top button
- Active navigation spy
- Noise texture overlay
- Aurora gradient animations

### Sections
1. Hero - Full screen with typing animation, CTA buttons, floating avatar
2. About - Bio, mission, contact info
3. Skills - 12 skill cards with 3D hover tilt
4. Experience - Animated timeline with glowing nodes
5. Education - 3 education cards
6. Services - 3 service offerings
7. Achievements - 4 stat cards
8. Projects - 3 project cards with tech badges
9. Certifications - 3 certification cards
10. Testimonials - 3 testimonial cards
11. GitHub Stats - 4 stat cards
12. Blog - 3 blog post cards
13. Resume - Download CV section
14. Contact - Glassmorphism form with file upload

### Backend
- Secure PHPMailer contact endpoint (JSON + multipart/form-data)
- HTML admin email + auto-reply confirmation
- Input sanitization (XSS/SQL injection prevention)
- Rate limiting per email (sliding window)
- File upload validation with secure random naming
- JSON logging to `messages/contact_logs.json`
- Environment variables via `.env`
- CSRF protection utilities

### PWA & SEO
- Installable PWA with manifest
- Service worker with offline caching
- 404 and offline pages
- OpenGraph + Twitter Cards
- Schema.org JSON-LD structured data
- `robots.txt` and `sitemap.xml`

### Security
- CSP, HSTS, X-Frame-Options headers
- Directory protection via `.htaccess`
- Rate limiting, input sanitization
- No credentials in source code

## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and configure SMTP credentials
4. Run `composer install` in the `php/` directory
5. Run `npm run start` to start both frontend (port 3000) and PHP backend (port 8000)
   - Or run them separately:
     - `npm run dev` — frontend at `http://localhost:3000`
     - `npm run php` — PHP backend at `http://localhost:8000`
6. Open `http://localhost:3000` in your browser

## Troubleshooting

### "Unexpected token '<'" error on contact form
This means the PHP backend isn't running. The contact form requires a PHP server.

**Fix:** Run `npm run php` in a separate terminal, or use `npm run start` to run both.

### npm not recognized in PowerShell
Use the full path: `& "C:\Program Files\nodejs\npm.cmd" install`

### Port 3000 or 8000 already in use
Change ports in `vite.config.js` (server.port) or use `npm run php -- --port 8001`

## Deployment

### Quick Deploy
```bash
# Windows
deploy.bat

# Linux/Mac
bash deploy.sh
```

### Manual Deployment
1. Run `npm run build`
2. Upload `dist/` contents to your PHP hosting server
3. Ensure these directories are writable:
   - `php/vendor/`
   - `php/messages/`
   - `php/uploads/`
4. Configure `.env` variables in production

## Project Structure

```
neon-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .htaccess
├── .gitignore
├── LICENSE
├── deploy.sh / deploy.bat
├── src/
│   ├── main.js
│   └── style.css
├── php/
│   ├── contact.php
│   └── src/
│       ├── Sanitizer.php
│       ├── Logger.php
│       ├── RateLimiter.php
│       └── CsrfProtection.php
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   ├── service-worker.js
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── 404.html
│   └── offline.html
├── .env.example
├── composer.json
└── README.md
```

## Customization

- Replace placeholder content in `index.html` (name, email, social links, projects)
- Update `.env` with your SMTP credentials
- Modify `tailwind.config.js` to change neon colors
- Update `src/main.js` typing phrases and Three.js colors

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with ES2020 support

## License

MIT © 2025 Neon Portfolio
