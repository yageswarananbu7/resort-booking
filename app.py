import os
import random
import string
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory

# Serve files from current directory
app = Flask(__name__, static_url_path='', static_folder='.')

# Food Menu Database
food_menu = [
    # Morning Menu (Breakfast)
    {
        "name": "Masala Dosa & Sambar",
        "price": 12.00,
        "desc": "Crispy rice crepes stuffed with spiced potato mash, served with aromatic lentil soup and coconut chutney.",
        "cuisine": "indian",
        "time": "morning"
    },
    {
        "name": "Stuffed Aloo Paratha",
        "price": 10.00,
        "desc": "Whole wheat flatbread filled with seasoned potato mixtures, pan-grilled and served with fresh yogurt and home pickle.",
        "cuisine": "indian",
        "time": "morning"
    },
    {
        "name": "Dim Sum Steamed Basket",
        "price": 15.00,
        "desc": "Handcrafted shrimp and chicken dumplings steamed to perfection, served with garlic soy broth.",
        "cuisine": "chinese",
        "time": "morning"
    },
    {
        "name": "Savory Chicken Congee",
        "price": 11.00,
        "desc": "Slow-cooked rice porridge served with shredded chicken, ginger slivers, fried shallots, and fresh scallions.",
        "cuisine": "chinese",
        "time": "morning"
    },
    {
        "name": "Authentic Huevos Rancheros",
        "price": 13.00,
        "desc": "Warm corn tortillas topped with fried farm eggs, ranchera salsa, refried black beans, and fresh avocado slices.",
        "cuisine": "mexican",
        "time": "morning"
    },
    {
        "name": "Spiced Breakfast Tacos",
        "price": 11.50,
        "desc": "Three soft flour tortillas filled with scrambled eggs, chorizo, jalapeños, and jack cheese.",
        "cuisine": "mexican",
        "time": "morning"
    },
    {
        "name": "French Croissant Basket",
        "price": 9.00,
        "desc": "A basket of freshly baked buttery croissants and pain au chocolat, served with premium fruit preserves.",
        "cuisine": "french",
        "time": "morning"
    },
    {
        "name": "Classic Quiche Lorraine",
        "price": 14.00,
        "desc": "Buttery pastry crust filled with savory egg custard, smoked bacon, and aged Gruyère cheese.",
        "cuisine": "french",
        "time": "morning"
    },

    # Lunch Menu
    {
        "name": "Premium Awadhi Biryani",
        "price": 22.00,
        "desc": "Fragrant basmati rice layered with spiced tender chicken, saffron, and mint, cooked under seal pressure (dum).",
        "cuisine": "indian",
        "time": "lunch"
    },
    {
        "name": "Shahi Paneer Thali",
        "price": 19.50,
        "desc": "Rich cottage cheese curry cooked in buttery tomato-cashew gravy, served with dal makhani, naan, and rice.",
        "cuisine": "indian",
        "time": "lunch"
    },
    {
        "name": "Kung Pao Chicken",
        "price": 18.00,
        "desc": "Stir-fried chicken cubes with peanuts, bell peppers, and dried red chilies in a savory-sweet garlic sauce.",
        "cuisine": "chinese",
        "time": "lunch"
    },
    {
        "name": "Wok Hakka Noodles",
        "price": 15.00,
        "desc": "Fresh egg noodles tossed with shredded garden vegetables, chicken strips, and dark soy sauce.",
        "cuisine": "chinese",
        "time": "lunch"
    },
    {
        "name": "Enchiladas Verdes",
        "price": 17.50,
        "desc": "Soft corn tortillas stuffed with shredded beef, baked in tangy green tomatillo sauce and topped with sour cream.",
        "cuisine": "mexican",
        "time": "lunch"
    },
    {
        "name": "Loaded Burrito Bowl",
        "price": 16.00,
        "desc": "Cilantro-lime rice topped with grilled chicken, black beans, sweet corn salsa, guacamole, and lime wedges.",
        "cuisine": "mexican",
        "time": "lunch"
    },
    {
        "name": "Classic Croque Monsieur",
        "price": 16.50,
        "desc": "Grilled ham and Gruyère cheese sandwich topped with velvety Béchamel sauce, served with organic salad.",
        "cuisine": "french",
        "time": "lunch"
    },
    {
        "name": "Traditional Coq au Vin",
        "price": 24.00,
        "desc": "Tender chicken thighs slow-braised in red Burgundy wine with pearl onions, mushrooms, and bacon lardons.",
        "cuisine": "french",
        "time": "lunch"
    },

    # Dinner Menu
    {
        "name": "Lamb Rogan Josh",
        "price": 26.00,
        "desc": "A signature Kashmiri dish featuring tender lamb chunks slow-cooked in a rich gravy of yogurt, saffron, and spices.",
        "cuisine": "indian",
        "time": "dinner"
    },
    {
        "name": "Tandoori Sizzling Platter",
        "price": 28.00,
        "desc": "An assortment of chicken tikka, seekh kebabs, and fish tandoori, served smoking hot with mint dip.",
        "cuisine": "indian",
        "time": "dinner"
    },
    {
        "name": "Imperial Peking Duck",
        "price": 32.00,
        "desc": "Crispy roasted duck carved tableside, served with thin pancakes, sweet bean sauce, cucumber, and leeks.",
        "cuisine": "chinese",
        "time": "dinner"
    },
    {
        "name": "Szechuan Pepper Beef",
        "price": 24.50,
        "desc": "Sliced flank steak wok-fried with crushed Szechuan peppercorns, scallions, and broccoli in a fiery sauce.",
        "cuisine": "chinese",
        "time": "dinner"
    },
    {
        "name": "Sizzling Fajitas Combo",
        "price": 23.00,
        "desc": "Marinated grilled steak and chicken served on a sizzling skillet with onions, bell peppers, tortillas, and pico de gallo.",
        "cuisine": "mexican",
        "time": "dinner"
    },
    {
        "name": "Slow-Cooked Mole Poblano",
        "price": 25.00,
        "desc": "Succulent chicken breast smothered in an authentic rich sauce made of chili peppers, nuts, and dark cacao chocolate.",
        "cuisine": "mexican",
        "time": "dinner"
    },
    {
        "name": "Beef Bourguignon",
        "price": 29.50,
        "desc": "Beef chunks slow-stewed in French Pinot Noir with carrots, garlic, and fresh herbs, served over buttered purée.",
        "cuisine": "french",
        "time": "dinner"
    },
    {
        "name": "Provencal Ratatouille",
        "price": 21.00,
        "desc": "Layers of thinly sliced eggplant, zucchini, squash, and bell peppers slow-roasted on a rich tomato-garlic coulis.",
        "cuisine": "french",
        "time": "dinner"
    }
]

# Room Data
room_rates = {
    "single": {"name": "Single Room", "price": 150.0},
    "double": {"name": "Double Room", "price": 250.0},
    "deluxe": {"name": "Deluxe Room", "price": 400.0},
    "vip": {"name": "VIP Room", "price": 750.0},
    "garden": {"name": "Garden View Room", "price": 220.0},
    "sea": {"name": "Sea Shore View Room", "price": 350.0},
    "nature": {"name": "Nature View Room", "price": 280.0}
}

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/menu')
def get_menu():
    return jsonify(food_menu)

@app.route('/api/booking/calculate', methods=['POST'])
def calculate_booking():
    data = request.json
    if not data:
        return jsonify({"error": "Missing payload"}), 400

    room_type = data.get("roomType")
    check_in_val = data.get("checkIn")
    check_out_val = data.get("checkOut")
    check_in_time = data.get("checkInTime", "15:00")
    check_out_time = data.get("checkOutTime", "10:00")
    guest_name = data.get("guestName", "")
    email = data.get("email", "")
    phone = data.get("phone", "")

    if not room_type or not check_in_val or not check_out_val:
        return jsonify({"error": "Missing required details"}), 400

    if room_type not in room_rates:
        return jsonify({"error": f"Invalid room type: {room_type}"}), 400

    rate = room_rates[room_type]["price"]
    room_name = room_rates[room_type]["name"]

    try:
        date1 = datetime.strptime(check_in_val, "%Y-%m-%d")
        date2 = datetime.strptime(check_out_val, "%Y-%m-%d")
        time_diff = date2 - date1
        nights = time_diff.days
        if nights <= 0:
            nights = 1
    except Exception as e:
        return jsonify({"error": f"Invalid date format: {str(e)}"}), 400

    subtotal = rate * nights
    tax = subtotal * 0.12
    total = subtotal + tax

    # Formatting time helper
    def format_time_ampm(time_str):
        try:
            h, m = map(int, time_str.split(':'))
            ampm = 'PM' if h >= 12 else 'AM'
            h12 = h % 12 or 12
            return f"{h12}:{m:02d} {ampm}"
        except Exception:
            return time_str

    formatted_check_in_time = format_time_ampm(check_in_time)
    formatted_check_out_time = format_time_ampm(check_out_time)

    # Format dates
    check_in_display = f"{date1.strftime('%B %d')} — {formatted_check_in_time}"
    check_out_display = f"{date2.strftime('%B %d')} — {formatted_check_out_time}"
    check_in_short = f"{date1.strftime('%b %d')} — {formatted_check_in_time}"
    check_out_short = f"{date2.strftime('%b %d')} — {formatted_check_out_time}"

    return jsonify({
        "guest": guest_name,
        "email": email,
        "phone": phone,
        "room": room_name,
        "roomType": room_type,
        "roomName": room_name,
        "checkInShort": check_in_short,
        "checkOutShort": check_out_short,
        "checkInDisplay": check_in_display,
        "checkOutDisplay": check_out_display,
        "nights": nights,
        "rate": rate,
        "subtotal": subtotal,
        "tax": tax,
        "total": total
    })

@app.route('/api/booking/confirm', methods=['POST'])
def confirm_booking():
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "Missing payload"}), 400

    # Generate a unique confirmation code
    code = f"JKL-{random.randint(1000, 9999)}-{random.choice(string.ascii_uppercase)}"
    
    # In a real app we would save to a database here
    # For now, return success and the generated code
    return jsonify({
        "success": True,
        "code": code
    })

if __name__ == '__main__':
    # Listen on all interfaces
    app.run(host='0.0.0.0', port=5000, debug=True)
