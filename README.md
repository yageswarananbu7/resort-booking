# resort-booking
# resort-booking
# J.K.L Resort — Luxury Hotel & Spa Booking Platform

A full-stack resort booking website with a Flask backend and a dynamic vanilla-JS frontend. Guests can browse rooms, dining, and amenities, then complete a live multi-step booking wizard that calculates rates, taxes, and generates a confirmation code — all through a REST API.

## Features

- **Room Browsing** — 7 room categories (Single, Double, Deluxe, VIP, Garden View, Sea Shore View, Nature View), each with its own gallery images and nightly rate.
- **Dynamic Dining Menu** — Breakfast/Lunch/Dinner menu served from the backend via `/api/menu`, filterable by cuisine (Indian, Chinese, Mexican, French) and time of day.
- **Booking Wizard** — Multi-step form capturing guest details, room type, check-in/check-out dates & times, and guest count.
- **Live Price Calculation** — `/api/booking/calculate` computes nights stayed, subtotal, 12% tax, and total in real time based on selected dates and room.
- **Booking Confirmation** — `/api/booking/confirm` generates a unique confirmation code for each completed booking.
- **Amenities Showcase** — Infinity Swimming Pool, Fitness Center, Adventure Play Area, and Samsara Wellness Spa.
- **Dark/Light Theme Toggle** — Persisted with `localStorage`.
- **Responsive Design** — Mobile navigation drawer and adaptive layout for all screen sizes.

## Tech Stack

- **Backend:** Python, Flask
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Data:** In-memory data structures (room rates & food menu) served via Flask REST endpoints

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Serves the main site |
| GET | `/api/menu` | Returns the full dining menu as JSON |
| POST | `/api/booking/calculate` | Calculates nights, subtotal, tax, and total for a booking |
| POST | `/api/booking/confirm` | Confirms a booking and returns a unique confirmation code |

## Getting Started

### Prerequisites
- Python 3.x
- Flask (`pip install flask`)

### Run Locally
\`\`\`bash
git clone https://github.com/yageswarananbu7/resort-booking.git
cd resort-booking
pip install flask
python app.py
\`\`\`
Then open `http://localhost:5000` in your browser.

## Project Structure
\`\`\`
resort-booking/
├── app.py             # Flask backend (routes, room rates, food menu, booking logic)
├── app.js              # Frontend logic (rendering, filters, wizard, theme toggle)
├── index.html          # Main site markup
├── styles.css           # Styling
└── *.jpg / *.png / *.webp   # Room, dining, and amenity images
\`\`\`
