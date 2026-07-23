/* ==========================================================
                FAREWISE ESTIMATE PAGE
========================================================== */
// ---------------------------
// Selected Vehicle
// ---------------------------
let selectedVehicle = "auto";
// ---------------------------
// Fare Rates
// ---------------------------
const fareRates = {
    auto: {
        base: 40,
        perKm: 13,
        peak: 1.3,
        night: 1.2,
        latenight: 1.4,
        high: 1.2
    },
    cab: {
        base: 100,
        perKm: 15,
        peak: 1.4,
        night: 1.3,
        latenight: 1.5,
        high: 1.25
    },
    bike: {
        base: 15,
        perKm: 10,
        peak: 1.2,
        night: 1.5,
        latenight: 1.3,
        high: 1.15
    }
};
// ---------------------------
// Map Variables
// ---------------------------
let map;
let pickupMarker;
let destinationMarker;
let routeLine;
let pickupLat = null;
let pickupLng = null;
let destinationLat = null;
let destinationLng = null;
let distanceKm = 0;
let durationMin = 0;

// ==========================================================
// VEHICLE SELECTION
// ==========================================================
function initializeVehicleCards(){
    const cards = document.querySelectorAll(".vehicle-card");
    cards.forEach(card=>{
        card.addEventListener("click",()=>{
            cards.forEach(c=>c.classList.remove("active"));
            card.classList.add("active");
            const name = card.querySelector("h3").innerText.toLowerCase();
            if(name.includes("auto"))
                selectedVehicle="auto";
            else if(name.includes("cab"))
                selectedVehicle="cab";
            else
                selectedVehicle="bike";
        });
    });
}
// ==========================================================
// MAP INITIALIZATION
// ==========================================================
function initializeMap(){
    map = L.map("map").setView([13.0827,80.2707],12);
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:"© OpenStreetMap"
        }
    ).addTo(map);
}
// ==========================================================
// SEARCH BOXES
// ==========================================================
function initializeSearchBoxes(){
    const pickupInput=document.getElementById("pickup");
    const destinationInput=document.getElementById("destination");
    const pickupSuggestions=document.getElementById("pickupSuggestions");
    const destinationSuggestions=document.getElementById("destinationSuggestions");
    let pickupTimer;
    let destinationTimer;
    pickupInput.addEventListener("input",()=>{
        clearTimeout(pickupTimer);
        pickupTimer=setTimeout(()=>{
            searchLocation(
                pickupInput.value,
                pickupSuggestions,
                "pickup"
            );
        },500);
    });
    destinationInput.addEventListener("input",()=>{
        clearTimeout(destinationTimer);
        destinationTimer=setTimeout(()=>{
            searchLocation(
                destinationInput.value,
                destinationSuggestions,
                "destination"
            );
        },500);
    });
}
// ==========================================================
// PHOTON SEARCH
// ==========================================================
async function searchLocation(query,suggestionBox,type){
    if(query.length<3){
        suggestionBox.innerHTML="";
        suggestionBox.style.display="none";
        return;
    }
    try{
        const response=await fetch(
`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
        );
        const data=await response.json();
        showSuggestions(
            data.features,
            suggestionBox,
            type
        );
    }
    catch(error){
        console.log(error);
    }
}
// ==========================================================
// SHOW SUGGESTIONS
// ==========================================================
function showSuggestions(features,suggestionBox,type){
    suggestionBox.innerHTML="";
    if(features.length===0){
        suggestionBox.style.display="none";
        return;
    }
    suggestionBox.style.display="block";
    features.forEach(place=>{
        const item=document.createElement("div");
        item.className="suggestion-item";
        item.textContent=place.properties.name+
        ", "+place.properties.city;
        item.onclick=()=>{
            const lat=place.geometry.coordinates[1];
            const lng=place.geometry.coordinates[0];
            if(type==="pickup"){
                document.getElementById("pickup").value=item.textContent;
                pickupLat=lat;
                pickupLng=lng;
                if(pickupMarker)
                    map.removeLayer(pickupMarker);
                pickupMarker=L.marker([lat,lng]).addTo(map);
            }
            else{
                document.getElementById("destination").value=item.textContent;
                destinationLat=lat;
                destinationLng=lng;
                if(destinationMarker)
                    map.removeLayer(destinationMarker);
                destinationMarker=L.marker([lat,lng]).addTo(map);
            }
            suggestionBox.innerHTML="";
            suggestionBox.style.display="none";
        };
        suggestionBox.appendChild(item);
    });
}
/* ==========================================================
                PART 2
        OSRM ROUTE CALCULATION
==========================================================*/
async function calculateDistance() {
    if (
        pickupLat === null ||
        destinationLat === null
    ) {
        alert("Please select both Pickup and Destination.");
        return;
    }
    try {
        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${pickupLng},${pickupLat};${destinationLng},${destinationLat}` +
            `?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.code !== "Ok") {
            alert("Unable to calculate route.");
            return;
        }
        const route = data.routes[0];
        // ----------------------------------
        // Distance
        // ----------------------------------
        distanceKm = (route.distance / 1000).toFixed(2);
        // ----------------------------------
        // Duration
        // ----------------------------------
        durationMin = Math.ceil(route.duration / 60);
        // ----------------------------------
        // Journey Summary
        // ----------------------------------
        document.getElementById("distanceDisplay").textContent =
            distanceKm + " km";
        document.getElementById("timeDisplay").textContent =
            durationMin + " mins";
        const traffic =
            document.getElementById("traffic").value;
        if (traffic === "")
            document.getElementById("trafficDisplay").textContent = "--";
        else if (traffic === "low")
            document.getElementById("trafficDisplay").textContent = "Low";
        else if (traffic === "moderate")
            document.getElementById("trafficDisplay").textContent = "Moderate";
        else
            document.getElementById("trafficDisplay").textContent = "High";
        // ----------------------------------
        // Remove previous route
        // ----------------------------------
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        // ----------------------------------
        // Draw Blue Route
        // ----------------------------------
        routeLine = L.geoJSON(route.geometry, {
            style: {
                color: "#0A3D91",
                weight: 6,
                opacity: 0.9
            }
        }).addTo(map);
        // ----------------------------------
        // Zoom to route
        // ----------------------------------
        map.fitBounds(routeLine.getBounds(), {
            padding: [40, 40]
        });
    }
    catch (error) {
        console.error(error);
        alert("Failed to calculate distance.");
    }
}
/* ==========================================================
                PART 3
        FAIR FARE ESTIMATION
==========================================================*/
async function estimateFare(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    // Check whether distance has been calculated
    if (distanceKm === 0) {
        alert("Please calculate the distance first.");
        return;
    }
    const traffic = document.getElementById("traffic").value;
    const timeofday = document.getElementById("timeofday").value;
    const quoted = parseFloat(document.getElementById("quotedFare").value);
    if (!traffic || !timeofday) {
        alert("Please select Traffic Level and Time of Day.");
        return;
    }
    const distance = parseFloat(distanceKm);
    const rate = fareRates[selectedVehicle];
    let fare = rate.base + (distance * rate.perKm);
    // Time Multiplier
    if (timeofday === "peak")
        fare *= rate.peak;
    if (timeofday === "night")
        fare *= rate.night;
    if (timeofday === "latenight")
        fare *= rate.latenight;
    // Traffic Multiplier
    if (traffic === "moderate")
        fare *= 1.10;
    if (traffic === "high")
        fare *= rate.high;
    const minFare = Math.round(fare * 0.90);
    const maxFare = Math.round(fare * 1.10);
    // -----------------------------
    // Show Fare
    // -----------------------------
    document.getElementById("minFare").textContent =
        "₹" + minFare;
    document.getElementById("maxFare").textContent =
        "₹" + maxFare;
    document.getElementById("priceNote").textContent =
        `Estimated fair fare for a ${distanceKm} km ${selectedVehicle} ride.`;
    // -----------------------------
    // Negotiation Tips
    // -----------------------------
    const tips = {
        auto:
            `Try negotiating between ₹${minFare} and ₹${maxFare}. Avoid paying more than ₹${maxFare}.`,
        cab:
            `Offline cabs should stay within ₹${maxFare}. Compare with Ola or Uber before confirming.`,
        bike:
            `Bike taxis are economical. If quoted above ₹${maxFare}, consider booking through an app.`
    };
    document.getElementById("negotiationTip").textContent =
        tips[selectedVehicle];
    // -----------------------------
    // Overcharge Analysis
    // -----------------------------
    const card =
        document.getElementById("overchargeCard");
    if (!isNaN(quoted) && quoted > 0) {
        card.style.display = "block";
        const status =
            document.getElementById("overchargeStatus");
        const detail =
            document.getElementById("overchargeDetail");
        if (quoted <= maxFare) {
            status.textContent = "✅ Fair Price";
            status.className = "overcharge-status fair";
            detail.textContent =
                "The quoted fare is within the expected range.";
        }
        else {
            const extra = quoted - maxFare;
            const percent =
                Math.round((extra / maxFare) * 100);
            status.textContent = "🔴 Overpriced";
            status.className =
                "overcharge-status overpriced";
            detail.textContent =
                `The driver is charging ₹${extra} extra (${percent}% higher than expected).`;
        }
    }
    else {
        card.style.display = "none";
    }
    // -----------------------------
    // Show Results
    // -----------------------------
    document.getElementById("resultContainer").style.display =
    "block";
    await saveRide();
    document.getElementById("resultContainer")
    .scrollIntoView({
        behavior:"smooth"
    });
}
/* ==========================================================
                PART 4
      SAVE RIDE TO LOCAL STORAGE
==========================================================*/
/* ==========================================================
                SAVE RIDE TO FLASK + SQLITE
==========================================================*/
async function saveRide() {
    const ride = {
        vehicle: selectedVehicle,
        pickup:
            document.getElementById('pickup').value,
        destination:
            document.getElementById('destination').value,
        distance: parseFloat(distanceKm),
        duration: parseInt(durationMin),
        estimated_fare: parseInt(
            document.getElementById('maxFare')
            .textContent.replace('₹','')
        ),
        quoted_fare:
            Number(document.getElementById('quotedFare').value) || 0,
        money_saved: (() => {
            const quoted =
                Number(document.getElementById('quotedFare').value);
            const max =
                parseInt(
                    document.getElementById('maxFare')
                    .textContent.replace('₹','')
                );
            if (quoted === 0 || isNaN(quoted))
                return 0;
            if (quoted > max)
                return quoted - max;
            return -(max - quoted);
        })(),
        traffic:
            document.getElementById('traffic').value,
        time_of_day:
            document.getElementById('timeofday').value,
        ride_date:
            new Date().toLocaleDateString(),
        ride_time:
            new Date().toLocaleTimeString()
    };
    try {
        const response = await fetch(
            'http://127.0.0.1:5000/api/rides',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ride)
            }
        );
        const result = await response.json();
        console.log('Ride saved to database:', result);
    }
    catch(error) {
        console.error('Error saving ride:', error);
        alert('Backend connection failed. Make sure Flask server is running.');
    }
}
/* ==========================================================
                BUTTON EVENT LISTENER
==========================================================*/
document.addEventListener('DOMContentLoaded', () => {
    // Initialize everything
    initializeVehicleCards();
    initializeMap();
    initializeSearchBoxes();
    // Force search boxes to activate
    const pickupInput = document.getElementById('pickup');
    const destinationInput = document.getElementById('destination');
    pickupInput.dispatchEvent(new Event('input'));
    destinationInput.dispatchEvent(new Event('input'));
    // Calculate fare button
    const calculateBtn = document.getElementById('calculateFareBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await estimateFare();
        });
    }
});
