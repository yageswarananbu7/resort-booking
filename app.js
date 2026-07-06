// Food Menu Database (fetched dynamically from backend)
let foodMenu = [];


// Global State
let activeTimeTab = "morning";
let activeCuisineFilter = "all";
let bookingData = {};

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
    // Fetch menu from Flask backend
    fetch('/api/menu')
        .then(res => res.json())
        .then(data => {
            foodMenu = data;
            renderMenu();
        })
        .catch(err => {
            console.error("Error fetching menu:", err);
            renderMenu();
        });

    // Set Date Inputs Default Values in Search Bar & Wizard
    const today = new Date().toISOString().split("T")[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split("T")[0];

    document.getElementById("searchCheckIn").min = today;
    document.getElementById("searchCheckIn").value = today;
    document.getElementById("searchCheckOut").min = tomorrow;
    document.getElementById("searchCheckOut").value = tomorrow;

    document.getElementById("bookCheckIn").min = today;
    document.getElementById("bookCheckIn").value = today;
    document.getElementById("bookCheckOut").min = tomorrow;
    document.getElementById("bookCheckOut").value = tomorrow;

    // Hook Up Mobile Nav
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const closeDrawer = document.getElementById("closeDrawer");

    mobileMenuBtn.addEventListener("click", () => {
        mobileDrawer.classList.add("open");
    });

    closeDrawer.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
    });

    // Close drawer when clicking nav links
    document.querySelectorAll(".mobile-nav-link").forEach(link => {
        link.addEventListener("click", () => {
            mobileDrawer.classList.remove("open");
        });
    });

    // Theme Switcher Logic
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("jkl-resort-theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", nextTheme);
        localStorage.setItem("jkl-resort-theme", nextTheme);
    });

    // Dining Filter Events
    const timeTabs = document.querySelectorAll("#diningTimeTabs .tab-btn");
    timeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            timeTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeTimeTab = tab.getAttribute("data-time");
            renderMenu();
        });
    });

    const cuisineBtns = document.querySelectorAll("#cuisineFilters .filter-btn");
    cuisineBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            cuisineBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeCuisineFilter = btn.getAttribute("data-cuisine");
            renderMenu();
        });
    });

    // Quick Search Form Submit
    const quickSearchForm = document.getElementById("quickSearchForm");
    quickSearchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const checkIn = document.getElementById("searchCheckIn").value;
        const checkOut = document.getElementById("searchCheckOut").value;
        const roomType = document.getElementById("searchRoomType").value;

        // Open Modal and populate Step 1
        openBookingModal(roomType);
        document.getElementById("bookCheckIn").value = checkIn;
        document.getElementById("bookCheckOut").value = checkOut;
    });
});

// Render Food Menu
function renderMenu() {
    const diningGrid = document.getElementById("diningGrid");
    diningGrid.innerHTML = "";

    // Filter Items
    const filteredItems = foodMenu.filter(item => {
        const matchesTime = item.time === activeTimeTab;
        const matchesCuisine = activeCuisineFilter === "all" || item.cuisine === activeCuisineFilter;
        return matchesTime && matchesCuisine;
    });

    if (filteredItems.length === 0) {
        diningGrid.innerHTML = `
            <div class="col-span-full text-center" style="grid-column: 1 / -1; padding: 4rem 0;">
                <i class="fa-solid fa-utensils text-gold" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                <p style="color: var(--color-text-muted);">No dishes found matching this combination. Try another filter.</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "menu-item-card";

        card.innerHTML = `
            <div>
                <div class="menu-item-header">
                    <h3>${item.name}</h3>
                    <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <p class="menu-item-desc">${item.desc}</p>
            </div>
            <div class="menu-item-footer">
                <span class="cuisine-badge">${item.cuisine} cuisine</span>
                <span class="complementary-badge"><i class="fa-solid fa-gift"></i> Complementary</span>
            </div>
        `;

        diningGrid.appendChild(card);
    });
}

// Room Card Image Toggle
function toggleRoomImage(button) {
    const container = button.closest(".room-media-container");
    const mainImg = container.querySelector(".room-image");
    const altImg = container.querySelector(".room-image-alt");

    if (mainImg.classList.contains("active")) {
        // Switch to Bathroom View
        mainImg.classList.remove("active");
        altImg.classList.add("active");
        button.innerHTML = '<i class="fa-solid fa-bed"></i> View Room';
    } else {
        // Switch back to Room View
        altImg.classList.remove("active");
        mainImg.classList.add("active");
        button.innerHTML = '<i class="fa-solid fa-bath"></i> View Bathroom';
    }
}

// Booking Modal Controls
function openBookingModal(roomType) {
    const modal = document.getElementById("bookingModal");
    modal.classList.add("open");

    if (roomType) {
        document.getElementById("bookRoomType").value = roomType;
    }

    goToWizardStep(1);
}

function closeBookingModal() {
    const modal = document.getElementById("bookingModal");
    modal.classList.remove("open");

    // Reset panes
    document.querySelectorAll(".wizard-pane").forEach(pane => {
        pane.classList.remove("active");
    });
    document.getElementById("pane1").classList.add("active");

    // Reset step bars
    document.querySelectorAll(".wizard-step").forEach(step => {
        step.classList.remove("active");
    });
    document.querySelector(".wizard-step[data-step='1']").classList.add("active");

    // Hide booking steps bar if it was hidden
    document.querySelector(".booking-wizard-steps").style.display = "flex";
}

// Wizard Navigation & Step Computations
function goToWizardStep(stepNum) {
    // Basic Form validation before proceeding to next steps
    if (stepNum === 2) {
        const checkIn = document.getElementById("bookCheckIn").value;
        const checkOut = document.getElementById("bookCheckOut").value;
        const guests = document.getElementById("bookGuests").value;

        if (!checkIn || !checkOut || !guests) {
            alert("Please fill in all room details.");
            return;
        }

        if (new Date(checkOut) <= new Date(checkIn)) {
            alert("Check-Out date must be after Check-In date.");
            return;
        }
    }

    if (stepNum === 3) {
        const guestName = document.getElementById("guestName").value;
        const guestEmail = document.getElementById("guestEmail").value;
        const guestPhone = document.getElementById("guestPhone").value;

        if (!guestName || !guestEmail || !guestPhone) {
            alert("Please fill in all guest contact details.");
            return;
        }

        // Calculate and Populate Review Summary
        computeBookingTotals();
    }

    // Toggle Panes
    document.querySelectorAll(".wizard-pane").forEach(pane => {
        pane.classList.remove("active");
    });
    document.getElementById(`pane${stepNum}`).classList.add("active");

    // Toggle Navigation indicators
    document.querySelectorAll(".wizard-step").forEach(step => {
        step.classList.remove("active");
        if (parseInt(step.getAttribute("data-step")) <= stepNum) {
            step.classList.add("active");
        }
    });
}

async function computeBookingTotals() {
    const roomType = document.getElementById("bookRoomType").value;
    const checkInVal = document.getElementById("bookCheckIn").value;
    const checkOutVal = document.getElementById("bookCheckOut").value;
    const checkInTime = document.getElementById("bookCheckInTime").value;
    const checkOutTime = document.getElementById("bookCheckOutTime").value;
    const guestName = document.getElementById("guestName").value;

    try {
        const response = await fetch('/api/booking/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomType,
                checkIn: checkInVal,
                checkOut: checkOutVal,
                checkInTime,
                checkOutTime,
                guestName,
                email: document.getElementById("guestEmail").value,
                phone: document.getElementById("guestPhone").value
            })
        });
        const data = await response.json();

        // Populate billing pane fields
        document.getElementById("summaryRoom").textContent = data.roomName;
        document.getElementById("summaryCheckIn").textContent = data.checkInDisplay;
        document.getElementById("summaryCheckOut").textContent = data.checkOutDisplay;
        document.getElementById("summaryDates").textContent = `${data.nights} Night${data.nights > 1 ? 's' : ''}`;
        document.getElementById("summaryGuest").textContent = data.guest;
        document.getElementById("summaryRate").textContent = `$${data.rate.toFixed(2)}`;
        document.getElementById("summarySubtotal").textContent = `$${data.subtotal.toFixed(2)}`;
        document.getElementById("summaryTax").textContent = `$${data.tax.toFixed(2)}`;
        document.getElementById("summaryTotal").textContent = `$${data.total.toFixed(2)}`;

        // Cache computed details for success pass & email
        bookingData = data;
    } catch (err) {
        console.error("Error computing totals:", err);
    }
}

// Backend checkout submission + email to customer & resort
async function submitBookingOrder(event) {
    event.preventDefault();
    const submitBtn = document.querySelector(".btn-book-final");
    const btnText = submitBtn.querySelector(".btn-text");
    const loader = submitBtn.querySelector(".spinner-loader");

    // Start loading transition
    submitBtn.disabled = true;
    btnText.style.opacity = "0.3";
    loader.classList.remove("hidden");

    try {
        const response = await fetch('/api/booking/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const result = await response.json();

        // Complete booking order
        submitBtn.disabled = false;
        btnText.style.opacity = "1";
        loader.classList.add("hidden");

        if (result.success) {
            // Open Success pane
            document.querySelectorAll(".wizard-pane").forEach(pane => {
                pane.classList.remove("active");
            });
            document.getElementById("paneSuccess").classList.add("active");

            // Hide Step Indicators
            document.querySelector(".booking-wizard-steps").style.display = "none";

            // Update voucher code from backend
            bookingData.code = result.code;

            // Populate Voucher Pass
            document.getElementById("voucherGuest").textContent = bookingData.guest;
            document.getElementById("voucherCode").textContent = bookingData.code;
            document.getElementById("voucherRoom").textContent = bookingData.room;
            document.getElementById("voucherCheckIn").textContent = bookingData.checkInShort;
            document.getElementById("voucherCheckOut").textContent = bookingData.checkOutShort;
            document.getElementById("voucherDates").textContent = `${bookingData.nights} Night${bookingData.nights > 1 ? 's' : ''}`;

            // Send booking emails via mailto (opens email client)
            sendBookingEmails();
        } else {
            alert("Booking confirmation failed: " + result.message);
        }
    } catch (err) {
        submitBtn.disabled = false;
        btnText.style.opacity = "1";
        loader.classList.add("hidden");
        console.error("Error submitting booking:", err);
        alert("An error occurred during booking. Please try again.");
    }
}

// Opens email client to send booking details to both the customer and resort
function sendBookingEmails() {
    const RESORT_EMAIL = "yageswaran578@gmail.com";
    const subject = encodeURIComponent(`[J.K.L Resort] Booking Confirmation — ${bookingData.code}`);

    const body = encodeURIComponent(
        `J.K.L RESORT — BOOKING CONFIRMATION
=====================================
Confirmation Code : ${bookingData.code}
Guest Name        : ${bookingData.guest}
Guest Email       : ${bookingData.email}
Guest Phone       : ${bookingData.phone}

Room              : ${bookingData.room}
Check-In          : ${bookingData.checkInDisplay}
Check-Out         : ${bookingData.checkOutDisplay}
Duration          : ${bookingData.nights} Night${bookingData.nights > 1 ? 's' : ''}

Rate / Night      : $${bookingData.rate.toFixed(2)}
Subtotal          : $${bookingData.subtotal.toFixed(2)}
Resort Tax (12%)  : $${bookingData.tax.toFixed(2)}
Estimated Total   : $${bookingData.total.toFixed(2)}

Complimentary Benefits:
  - Infinity Swimming Pool
  - Samsara Wellness Spa
  - Fitness Center
  - Kids Adventure Play Area
  - Breakfast, Lunch & Dinner Menus

Thank you for choosing J.K.L Resort.
We look forward to welcoming you!
=====================================`);

    // Single mailto with resort as To: and guest as CC:
    // This ensures both receive the confirmation in one email action (no popup blocking)
    const cc = bookingData.email ? encodeURIComponent(bookingData.email) : '';
    const mailtoLink = `mailto:${RESORT_EMAIL}?cc=${cc}&subject=${subject}&body=${body}`;

    // Use a hidden anchor to trigger without popup blocking
    const a = document.createElement('a');
    a.href = mailtoLink;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Download Voucher Card as text file
function downloadVoucher() {
    const textVoucher = `
=========================================
          J.K.L RESORT BOARDING PASS     
=========================================
Confirmation Code: ${bookingData.code}
Guest Name       : ${bookingData.guest}
Guest Email      : ${bookingData.email}
Guest Phone      : ${bookingData.phone}
Accommodation    : ${bookingData.room}
Check-In         : ${bookingData.checkInDisplay}
Check-Out        : ${bookingData.checkOutDisplay}
Duration         : ${bookingData.nights} Night${bookingData.nights > 1 ? 's' : ''}
Estimated Charges: $${bookingData.total.toFixed(2)} (Tax Inc.)

Complimentary Benefits Included:
- Infinite Pool Access
- Samsara Spa Sessions
- Luxury Gym & Fitness Center
- Kids Playground Entry
- Full Morning, Lunch, and Dinner Menus
=========================================
    Thank you for choosing J.K.L Resort  
=========================================
`;
    const blob = new Blob([textVoucher], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `JKL-Reservation-${bookingData.code}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
