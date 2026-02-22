export type Language = "en" | "ta";

export const translations: Record<string, Record<Language, string>> = {
    // ─── Common ───
    "app.name": { en: "S Kumaran Tailors", ta: "எஸ் குமரன் டெய்லர்ஸ்" },
    "app.tagline": { en: "Since 1990 • Cuddalore", ta: "1990 முதல் • கடலூர்" },
    "common.save": { en: "Save", ta: "சேமி" },
    "common.cancel": { en: "Cancel", ta: "ரத்து" },
    "common.close": { en: "Close", ta: "மூடு" },
    "common.logout": { en: "Logout", ta: "வெளியேறு" },
    "common.admin": { en: "Admin", ta: "நிர்வாகி" },
    "common.customer": { en: "Customer", ta: "வாடிக்கையாளர்" },
    "common.loading": { en: "Loading...", ta: "ஏற்றுகிறது..." },
    "common.due": { en: "Due", ta: "நிலுவை" },
    "common.rush": { en: "Rush", ta: "அவசரம்" },

    // ─── Navbar ───
    "nav.dashboard": { en: "Dashboard", ta: "முகப்பு" },
    "nav.orders": { en: "Orders", ta: "ஆர்டர்கள்" },
    "nav.myOrders": { en: "My Orders", ta: "எனது ஆர்டர்கள்" },

    // ─── Login Page ───
    "login.welcome": { en: "Welcome to S Kumaran", ta: "எஸ் குமரன் - வரவேற்கிறோம்" },
    "login.subtitle": { en: "Sign in to manage your tailoring orders", ta: "உங்கள் தையல் ஆர்டர்களை நிர்வகிக்க உள்நுழையுங்கள்" },
    "login.phoneLabel": { en: "Phone Number", ta: "தொலைபேசி எண்" },
    "login.phonePlaceholder": { en: "Enter your mobile number", ta: "உங்கள் கைபேசி எண்ணை உள்ளிடவும்" },
    "login.sendOtp": { en: "Send OTP", ta: "OTP அனுப்பு" },
    "login.sendingOtp": { en: "Sending OTP...", ta: "OTP அனுப்புகிறது..." },
    "login.verifySignIn": { en: "Verify & Sign In", ta: "சரிபார்த்து உள்நுழை" },
    "login.verifying": { en: "Verifying...", ta: "சரிபார்க்கிறது..." },
    "login.changeNumber": { en: "Change number", ta: "எண்ணை மாற்று" },
    "login.otpSentTo": { en: "Enter the 6-digit code sent to", ta: "அனுப்பிய 6 இலக்க குறியீட்டை உள்ளிடவும்" },
    "login.resendOtp": { en: "Resend OTP", ta: "OTP மீண்டும் அனுப்பு" },
    "login.didntReceive": { en: "Didn't receive the code?", ta: "குறியீடு வரவில்லையா?" },
    "login.terms": { en: "By signing in, you agree to our Terms of Service", ta: "உள்நுழைவதன் மூலம், நீங்கள் எங்கள் சேவை விதிமுறைகளை ஏற்கிறீர்கள்" },
    "login.demoMode": { en: "Demo Mode", ta: "டெமோ பயன்முறை" },
    "login.demoOn": { en: "ON", ta: "ஆன்" },
    "login.demoOff": { en: "OFF", ta: "ஆஃப்" },
    "login.demoHint": { en: "Any phone works. OTP is", ta: "எந்த எண்ணும் செல்லும். OTP" },
    "login.demoAdminHint": { en: "for Admin role", ta: "நிர்வாகி பயன்முறைக்கு" },

    // Login errors
    "login.error.invalidPhone": { en: "Please enter a valid 10-digit phone number", ta: "சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்" },
    "login.error.incompleteOtp": { en: "Please enter the complete 6-digit OTP", ta: "முழுமையான 6 இலக்க OTP-ஐ உள்ளிடவும்" },
    "login.error.demoOtp": { en: "Demo OTP is 123456", ta: "டெமோ OTP 123456" },
    "login.error.sessionExpired": { en: "Session expired. Please request a new OTP.", ta: "அமர்வு காலாவதியானது. புதிய OTP கோரவும்." },
    "login.error.tooMany": { en: "Too many attempts. Please try again later.", ta: "அதிக முயற்சிகள். பின்னர் மீண்டும் முயற்சிக்கவும்." },
    "login.error.invalidPhoneFormat": { en: "Invalid phone number format.", ta: "தவறான தொலைபேசி எண் வடிவம்." },
    "login.error.sendFailed": { en: "Failed to send OTP. Please try again.", ta: "OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்." },
    "login.error.invalidOtp": { en: "Invalid OTP. Please check and try again.", ta: "தவறான OTP. சரிபார்த்து மீண்டும் முயற்சிக்கவும்." },
    "login.error.otpExpired": { en: "OTP expired. Please request a new one.", ta: "OTP காலாவதியானது. புதியது கோரவும்." },
    "login.error.verifyFailed": { en: "Verification failed. Please try again.", ta: "சரிபார்ப்பு தோல்வி. மீண்டும் முயற்சிக்கவும்." },

    // ─── Dashboard ───
    "dash.title": { en: "Admin Dashboard", ta: "நிர்வாக முகப்பு" },
    "dash.subtitle": { en: "Manage orders, customers, and settings", ta: "ஆர்டர்கள், வாடிக்கையாளர்கள் மற்றும் அமைப்புகளை நிர்வகிக்கவும்" },
    "dash.tab.overview": { en: "Overview", ta: "மேலோட்டம்" },
    "dash.tab.orders": { en: "Orders", ta: "ஆர்டர்கள்" },
    "dash.tab.customers": { en: "Customers", ta: "வாடிக்கையாளர்கள்" },
    "dash.tab.settings": { en: "Settings", ta: "அமைப்புகள்" },

    // Dashboard stats
    "dash.stat.activeOrders": { en: "Active Orders", ta: "செயலில் ஆர்டர்கள்" },
    "dash.stat.todayLoad": { en: "Today's Load", ta: "இன்றைய சுமை" },
    "dash.stat.readyPickup": { en: "Ready for Pickup", ta: "எடுக்க தயார்" },
    "dash.stat.pendingApproval": { en: "Pending Approval", ta: "ஒப்புதல் நிலுவை" },

    // Dashboard overview
    "dash.todayCapacity": { en: "Today's Capacity", ta: "இன்றைய திறன்" },
    "dash.recentOrders": { en: "Recent Orders", ta: "சமீபத்திய ஆர்டர்கள்" },
    "dash.viewAll": { en: "View All", ta: "அனைத்தும் காண்க" },
    "dash.ordersOf": { en: "of", ta: "/" },
    "dash.ordersText": { en: "orders", ta: "ஆர்டர்கள்" },

    // Dashboard orders
    "dash.allOrders": { en: "All Orders", ta: "அனைத்து ஆர்டர்கள்" },
    "dash.newOrder": { en: "New Order", ta: "புதிய ஆர்டர்" },
    "dash.binPlaceholder": { en: "Bin", ta: "நிலை" },
    "dash.searchPlaceholder": { en: "Search by name, order ID, garment...", ta: "பெயர், ஆர்டர் ID, ஆடை வகை..." },
    "dash.dateFrom": { en: "From", ta: "தொடக்கம்" },
    "dash.dateTo": { en: "To", ta: "முடிவு" },
    "dash.allStatuses": { en: "All Statuses", ta: "அனைத்து நிலைகள்" },
    "dash.clearFilters": { en: "Clear", ta: "அழி" },
    "dash.noResults": { en: "No orders found", ta: "ஆர்டர்கள் கிடைக்கவில்லை" },
    "dash.noResultsHint": { en: "Try adjusting your search or filters", ta: "தேடல் அல்லது வடிகட்டிகளை சரிசெய்யவும்" },
    "dash.showing": { en: "Showing", ta: "காட்டுகிறது" },
    "dash.of": { en: "of", ta: "/" },
    "dash.listView": { en: "List", ta: "பட்டியல்" },
    "dash.gridView": { en: "Grid", ta: "கட்டம்" },
    "dash.page": { en: "Page", ta: "பக்கம்" },
    "dash.prev": { en: "Previous", ta: "முந்தைய" },
    "dash.next": { en: "Next", ta: "அடுத்த" },
    "dash.loadMore": { en: "Load More", ta: "மேலும் காண்க" },
    "dash.loadingMore": { en: "Loading...", ta: "ஏற்றுகிறது..." },
    "dash.allLoaded": { en: "All orders loaded", ta: "அனைத்து ஆர்டர்களும் ஏற்றப்பட்டன" },

    // Dashboard create order modal
    "dash.createOrder": { en: "Create New Order", ta: "புதிய ஆர்டர் உருவாக்கு" },
    "dash.customerPhone": { en: "Customer Phone", ta: "வாடிக்கையாளர் தொலைபேசி" },
    "dash.customerName": { en: "Customer Name", ta: "வாடிக்கையாளர் பெயர்" },
    "dash.garmentType": { en: "Garment Type", ta: "ஆடை வகை" },
    "dash.garmentPlaceholder": { en: "Shirt, Suit...", ta: "சட்டை, சூட்..." },
    "dash.basePrice": { en: "Base Price (₹)", ta: "அடிப்படை விலை (₹)" },
    "dash.deliveryIn": { en: "Delivery in", ta: "டெலிவரி" },
    "dash.days": { en: "days", ta: "நாட்கள்" },
    "dash.notes": { en: "Notes", ta: "குறிப்புகள்" },
    "dash.detailsPlaceholder": { en: "Details...", ta: "விவரங்கள்..." },
    "dash.createOrderBtn": { en: "Create Order", ta: "ஆர்டர் உருவாக்கு" },
    "dash.namePlaceholder": { en: "Name", ta: "பெயர்" },

    // Dashboard customers
    "dash.customers": { en: "Customers", ta: "வாடிக்கையாளர்கள்" },
    "dash.unnamed": { en: "Unnamed", ta: "பெயரிடப்படாதது" },
    "dash.orderCount": { en: "order(s)", ta: "ஆர்டர்(கள்)" },
    "dash.editCustomer": { en: "Edit Customer", ta: "வாடிக்கையாளரை திருத்து" },
    "dash.name": { en: "Name", ta: "பெயர்" },
    "dash.measurements": { en: "Measurements (inches)", ta: "அளவுகள் (அங்குலம்)" },
    "dash.saveChanges": { en: "Save Changes", ta: "மாற்றங்களை சேமி" },

    // Measurement labels
    "measure.chest": { en: "chest", ta: "மார்பு" },
    "measure.waist": { en: "waist", ta: "இடுப்பு" },
    "measure.shoulder": { en: "shoulder", ta: "தோள்" },
    "measure.sleeve": { en: "sleeve", ta: "கை" },
    "measure.inseam": { en: "inseam", ta: "உள்தையல்" },
    "measure.neck": { en: "neck", ta: "கழுத்து" },

    // Dashboard settings
    "dash.capacitySettings": { en: "Capacity Settings", ta: "திறன் அமைப்புகள்" },
    "dash.dailyStitchCapacity": { en: "Daily Stitch Capacity", ta: "தினசரி தையல் திறன்" },
    "dash.maxOrders": { en: "Maximum orders the shop can handle per day", ta: "கடை ஒரு நாளில் கையாளக்கூடிய அதிகபட்ச ஆர்டர்கள்" },
    "dash.7dayCapacity": { en: "7-Day Capacity Overview", ta: "7 நாள் திறன் கண்ணோட்டம்" },

    // ─── Tracking / Customer portal ───
    "track.title": { en: "My Orders", ta: "எனது ஆர்டர்கள்" },
    "track.subtitle": { en: "Track your tailoring orders", ta: "உங்கள் தையல் ஆர்டர்களை கண்காணிக்கவும்" },
    "track.newOrder": { en: "New Order", ta: "புதிய ஆர்டர்" },
    "track.noOrders": { en: "No Orders Yet", ta: "இன்னும் ஆர்டர்கள் இல்லை" },
    "track.noOrdersHint": { en: "Place your first tailoring order and track it in real-time!", ta: "உங்கள் முதல் தையல் ஆர்டரை வைத்து நிகழ்நேரத்தில் கண்காணிக்கவும்!" },
    "track.placeFirst": { en: "Place Your First Order", ta: "முதல் ஆர்டர் செய்யுங்கள்" },

    // Tracking status steps
    "status.Pending": { en: "Placed", ta: "பதிவு" },
    "status.Cutting": { en: "Cutting", ta: "வெட்டுதல்" },
    "status.Stitching": { en: "Stitching", ta: "தையல்" },
    "status.Alteration": { en: "Alteration", ta: "மாற்றம்" },
    "status.Ready": { en: "Ready", ta: "தயார்" },
    "status.Delivered": { en: "Delivered", ta: "ஒப்படைப்பு" },

    // Tracking new order modal
    "track.placeOrder": { en: "Place New Order", ta: "புதிய ஆர்டர் செய்" },
    "track.garmentType": { en: "Garment Type", ta: "ஆடை வகை" },
    "track.garmentPlaceholder": { en: "e.g. Shirt, Suit, Kurta...", ta: "எ.கா. சட்டை, சூட், குர்தா..." },
    "track.deliveryTimeline": { en: "Delivery Timeline", ta: "டெலிவரி காலம்" },
    "track.days": { en: "days", ta: "நாட்கள்" },
    "track.express": { en: "Express", ta: "அவசர" },
    "track.priority": { en: "Priority", ta: "முன்னுரிமை" },
    "track.standard": { en: "Standard", ta: "நிலையான" },
    "track.dayExpress": { en: "1 day (Express)", ta: "1 நாள் (அவசர)" },
    "track.15days": { en: "15 days", ta: "15 நாட்கள்" },

    // Pricing
    "track.pricing": { en: "Pricing", ta: "விலை" },
    "track.basePrice": { en: "Base Price", ta: "அடிப்படை விலை" },
    "track.rushFee": { en: "Rush Fee", ta: "அவசர கட்டணம்" },
    "track.total": { en: "Total", ta: "மொத்தம்" },

    // Capacity warning
    "track.capacityFull": { en: "Capacity Full for", ta: "இதற்கான திறன் நிரம்பியது" },
    "track.rushRequest": { en: "Your order will be sent as a rush request for admin approval.", ta: "உங்கள் ஆர்டர் நிர்வாகி ஒப்புதலுக்கான அவசர கோரிக்கையாக அனுப்பப்படும்." },

    // Notes
    "track.notesLabel": { en: "Notes (optional)", ta: "குறிப்புகள் (விரும்பினால்)" },
    "track.notesPlaceholder": { en: "Any special instructions...", ta: "சிறப்பு அறிவுறுத்தல்கள்..." },

    // Submit
    "track.placingOrder": { en: "Placing Order...", ta: "ஆர்டர் செய்கிறது..." },
    "track.emergencyRush": { en: "Request Emergency Rush Order", ta: "அவசர ஆர்டர் கோரிக்கை" },
    "track.placeOrderBtn": { en: "Place Order", ta: "ஆர்டர் செய்" },

    // ─── Home Page ───
    "home.hero.title": { en: "Crafting Elegance, One Stitch at a Time", ta: "ஒவ்வொரு தையலிலும் நேர்த்தி" },
    "home.hero.subtitle": { en: "Premium tailoring services in Cuddalore since 1990. Custom-made garments with precision, quality, and care.", ta: "1990 முதல் கடலூரில் தரமான தையல் சேவை. துல்லியம், தரம் மற்றும் அக்கறையுடன் தனிப்பயன் ஆடைகள்." },
    "home.hero.cta": { en: "Get Started", ta: "தொடங்குங்கள்" },
    "home.hero.trackOrder": { en: "Track Order", ta: "ஆர்டர் பின்தொடர்" },
    "home.services.title": { en: "Our Services", ta: "எங்கள் சேவைகள்" },
    "home.services.custom": { en: "Custom Tailoring", ta: "தனிப்பயன் தையல்" },
    "home.services.customDesc": { en: "Perfectly fitted garments tailored to your exact measurements and preferences.", ta: "உங்கள் துல்லியமான அளவுகள் மற்றும் விருப்பங்களுக்கு ஏற்ப தையல் செய்யப்பட்ட ஆடைகள்." },
    "home.services.alteration": { en: "Alterations & Repairs", ta: "மாற்றங்கள் & பழுது" },
    "home.services.alterationDesc": { en: "Expert alterations to give your existing garments the perfect fit.", ta: "உங்கள் தற்போதைய ஆடைகளுக்கு சரியான பொருத்தம் தர நிபுணர் மாற்றங்கள்." },
    "home.services.wedding": { en: "Wedding Collection", ta: "திருமண ஆடைகள்" },
    "home.services.weddingDesc": { en: "Exquisite wedding attire — sherwanis, suits, kurtas, and traditional wear.", ta: "அழகிய திருமண ஆடைகள் — ஷெர்வானி, சூட், குர்தா, பாரம்பரிய உடை." },
    "home.services.express": { en: "Express Delivery", ta: "அவசர டெலிவரி" },
    "home.services.expressDesc": { en: "Rush orders available with priority stitching and quick turnaround.", ta: "முன்னுரிமை தையல் மற்றும் விரைவான டெலிவரி உடன் அவசர ஆர்டர்கள்." },
    "home.about.title": { en: "About Us", ta: "எங்களை பற்றி" },
    "home.about.text": { en: "S Kumaran Tailors has been Cuddalore's most trusted tailoring shop for over 30 years. Founded in 1990, we specialize in men's and women's custom tailoring, wedding collections, and alteration services. Our master tailors bring decades of experience to every stitch, ensuring each garment reflects your unique style with impeccable quality.", ta: "எஸ் குமரன் டெய்லர்ஸ் 30 ஆண்டுகளுக்கும் மேலாக கடலூரின் மிகவும் நம்பகமான தையல் கடையாக உள்ளது. 1990 இல் நிறுவப்பட்ட இது, ஆண்கள் மற்றும் பெண்கள் தனிப்பயன் தையல், திருமண ஆடைகள் மற்றும் மாற்ற சேவைகளில் நிபுணத்துவம் பெற்றது." },
    "home.contact.title": { en: "Contact Us", ta: "தொடர்பு" },
    "home.contact.phone": { en: "Phone", ta: "தொலைபேசி" },
    "home.contact.email": { en: "Email", ta: "மின்னஞ்சல்" },
    "home.contact.address": { en: "Address", ta: "முகவரி" },
    "home.contact.directions": { en: "Get Directions", ta: "வழியறிய" },
    "home.contact.hours": { en: "Working Hours", ta: "பணி நேரம்" },
    "home.contact.hoursValue": { en: "Mon - Sat: 9:00 AM - 9:00 PM", ta: "திங்கள் - சனி: காலை 9:00 - இரவு 9:00" },

    // ─── Measurements ───
    "dash.noVisualizer": { en: "Select a profile to view visualizer", ta: "விஷுவலைசரை காண சுயவிவரத்தை தேர்ந்தெடுக்கவும்" },
    "measure.length": { en: "Length", ta: "உயரம்" },
    "measure.thigh": { en: "Thigh", ta: "தொடை" },
    "measure.groin": { en: "Groin/Crotch", ta: "கவட்டை" },
    "measure.bottom": { en: "Bottom/Hem", ta: "கால் வாய்" },
    "measure.armhole": { en: "Armhole", ta: "அக்குள்" },
    "measure.shirtChest": { en: "Shirt Chest", ta: "சட்டை மார்பு" },
    "measure.shirtLength": { en: "Shirt Length", ta: "சட்டை உயரம்" },
    "measure.pantWaist": { en: "Pant Waist", ta: "பேண்ட் இடுப்பு" },
    "measure.pantLength": { en: "Pant Length", ta: "பேண்ட் உயரம்" },
    "measure.skirtLength": { en: "Skirt Length", ta: "பாவாடை உயரம்" },
    "measure.bicep": { en: "Bicep", ta: "குறை விட்டம்" },
    "measure.frontNeck": { en: "Front Neck", ta: "முன் கழுத்து" },
    "measure.backNeck": { en: "Back Neck", ta: "பின் கழுத்து" },
    "measure.topLength": { en: "Top Length", ta: "மேல் உயரம்" },
    "measure.hip": { en: "Hip", ta: "இடுப்பு சுற்றளவு" },
    "measure.bottomLength": { en: "Bottom Length", ta: "கீழ் உயரம்" },
    "measure.bottomWaist": { en: "Bottom Waist", ta: "கீழ் இடுப்பு" },
};
