/* ==========================================================
                FareWise
                history.js
                PART 1
========================================================== */
// ==========================================================
// LOAD RIDES FROM LOCAL STORAGE
// ==========================================================
let rides = [];
/* ==========================================================
   LOAD RIDES FROM FLASK DATABASE
==========================================================*/
async function loadRidesFromDatabase() {
    try {
        const response = await fetch(
            'http://127.0.0.1:5000/api/rides'
        );
        const data = await response.json();
        rides = data.map(ride => ({
            id: ride.id,
            vehicle: ride.vehicle,
            from: ride.pickup,
            to: ride.destination,
            distance: ride.distance + ' km',
            duration: ride.duration + ' mins',
            fare: ride.estimated_fare,
            quotedFare: ride.quoted_fare,
            saved: ride.money_saved,
            date: ride.ride_date,
            time: ride.ride_time
        }));
        filterRides();
        updateStatistics();
    }
    catch(error) {
        console.error('Error loading rides:', error);
        alert('Unable to load rides from database.');
    }
}
// ==========================================================
// VEHICLE DETAILS
// ==========================================================
const vehicleEmoji = {
    auto: "🛺",
    cab: "🚕",
    bike: "🏍️"
};
const vehicleLabel = {
    auto: "Auto Rickshaw",
    cab: "Cab",
    bike: "Bike Taxi"
};
const vehicleColor = {
    auto: "#F59E0B",
    cab: "#2563EB",
    bike: "#10B981"
};
// ==========================================================
// SAVE HISTORY
// ==========================================================
function saveHistory(){
    localStorage.setItem(
        "farewiseRides",
        JSON.stringify(rides)
    );
}
// ==========================================================
// UPDATE DASHBOARD STATISTICS
// ==========================================================
function updateStatistics(){
    document.getElementById("totalRides").textContent =
    rides.length;
    let totalFare = 0;
    let totalSaved = 0;
    const vehicleCount = {
        auto:0,
        cab:0,
        bike:0
    };
    rides.forEach(ride => {
    // Use the mapped fields
    totalFare += Number(ride.fare || 0);
    totalSaved += Number(ride.saved || 0);
    if (vehicleCount[ride.vehicle] !== undefined) {
        vehicleCount[ride.vehicle]++;
    }
});
    document.getElementById("moneySaved").textContent =
    "₹" + totalSaved;
    document.getElementById("averageFare").textContent =
    rides.length
    ?
    "₹" + Math.round(totalFare / rides.length)
    :
    "₹0";
    let favourite = "--";
    let max = 0;
    Object.keys(vehicleCount).forEach(vehicle=>{
        if(vehicleCount[vehicle] > max){
            max = vehicleCount[vehicle];
            favourite = vehicleLabel[vehicle];
        }
    });
    const favouriteCard =
document.querySelector(".stat-card:last-child .stat-value");
if(favouriteCard){
    favouriteCard.textContent = favourite;
}
}
/* ==========================================================
                PART 2
            RENDER RIDE CARDS
==========================================================*/
function renderRides(list){
    const ridesGrid =
    document.getElementById("ridesGrid");
    const emptyState =
    document.getElementById("emptyState");
    const resultsCount =
    document.getElementById("resultsCount");
    ridesGrid.innerHTML = "";
    if(list.length === 0){
        emptyState.style.display = "block";
        resultsCount.textContent =
        "Showing 0 rides";
        return;
    }
    emptyState.style.display = "none";
    resultsCount.textContent =
    `Showing ${list.length} Ride${list.length>1?"s":""}`;
    list.forEach((ride,index)=>{
        const card =
        document.createElement("div");
        card.className = "ride-card";
        card.innerHTML = `
<div class="ride-card-header">
<div class="vehicle-badge">
<span style="font-size:22px;">
${vehicleEmoji[ride.vehicle]}
</span>
<span>
${vehicleLabel[ride.vehicle]}
</span>
</div>
<div class="ride-date">
<div>${ride.date}</div>
<div>${ride.time}</div>
</div>
</div>
<div class="ride-card-body">
<div class="route">
<div class="route-point">
<div class="route-dot from"></div>
<div>
<div class="route-label">
PICKUP
</div>
<div class="route-place">
${ride.from}
</div>
</div>
</div>
<div class="route-line"></div>
<div class="route-point">
<div class="route-dot to"></div>
<div>
<div class="route-label">
DROP
</div>
<div class="route-place">
${ride.to}
</div>
</div>
</div>
</div>
<div class="ride-meta">
<div class="meta-item">
<div class="meta-label">
DISTANCE
</div>
<div class="meta-value">
${ride.distance}
</div>
</div>
<div class="meta-item">
<div class="meta-label">
DURATION
</div>
<div class="meta-value">
${ride.duration}
</div>
</div>
</div>
<div class="fare-row">
<div>
<div class="fare-label">
Estimated Fare
</div>
<div class="fare-amount">
${ride.fare}
</div>
</div>
<div>
<div class="fare-label">
Quoted Fare
</div>
<div class="fare-amount">
₹${ride.quotedFare}
</div>
</div>
</div>
</div>
<div class="ride-card-footer">
<button
class="btn-view"
onclick="viewRide(${ride.id})">
📋 View Details
</button>
<button
class="btn-delete"
onclick="deleteRide(${ride.id})">
🗑 Delete
</button>
</div>
`;
        ridesGrid.appendChild(card);
    });
}
/* ==========================================================
                PART 3
      SEARCH • FILTER • SORT RIDES
==========================================================*/
function filterRides(){
    const search =
    document.getElementById("searchInput")
    .value
    .toLowerCase();
    const vehicle =
    document.getElementById("vehicleFilter")
    .value;
    const sort =
    document.getElementById("sortFilter")
    .value;
    let filtered = rides.filter(ride=>{
        const matchVehicle =
            vehicle === "all" ||
            ride.vehicle === vehicle;
        const matchSearch =
            ride.from.toLowerCase().includes(search) ||
            ride.to.toLowerCase().includes(search) ||
            vehicleLabel[ride.vehicle]
            .toLowerCase()
            .includes(search);
        return matchVehicle && matchSearch;
    });
    // ==========================
    // SORTING
    // ==========================
    switch(sort){
        case "newest":
            filtered.sort((a,b)=>
                new Date(b.date+" "+b.time) -
                new Date(a.date+" "+a.time)
            );
            break;
        case "oldest":
            filtered.sort((a,b)=>
                new Date(a.date+" "+a.time) -
                new Date(b.date+" "+b.time)
            );
            break;
        case "fare-high":
            filtered.sort((a,b)=>
                Number(b.fare)-Number(a.fare)
            );
            break;
        case "fare-low":
            filtered.sort((a,b)=>
                Number(a.fare)-Number(b.fare)
            );
            break;
    }
    renderRides(filtered);
}
/* ==========================================================
                PART 4
      VIEW • DELETE • INITIALIZE PAGE
==========================================================*/
// ==========================================================
// VIEW RIDE DETAILS
// ==========================================================
function viewRide(id){
    const ride = rides.find(r => r.id === id);
    if(!ride){
        alert("Ride not found.");
        return;
    }
    alert(
`🚖 FareWise Ride Details
Vehicle : ${vehicleLabel[ride.vehicle]}
Pickup : ${ride.from}
Destination : ${ride.to}
Distance : ${ride.distance}
Duration : ${ride.duration}
Estimated Fare : ₹${ride.fare}
Quoted Fare : ₹${ride.quotedFare}
Date : ${ride.date}
Time : ${ride.time}`
    );
}
// ==========================================================
// DELETE RIDE
// ==========================================================
async function deleteRide(id){
    if(!confirm("Delete this ride permanently?"))
        return;
    try{
        const response = await fetch(
            `http://127.0.0.1:5000/api/rides/${id}`,
            {
                method:"DELETE"
            }
        );
        if(response.ok){
            // Remove from local array
            rides = rides.filter(r => r.id !== id);
            // Refresh UI
            updateStatistics();
            filterRides();
        }else{
            alert("Failed to delete ride from database.");
        }
    }catch(error){
        console.error(error);
        alert("Backend connection failed.");
    }
}
// ==========================================================
// INITIALIZE PAGE
// ==========================================================
// ==========================================================
// INITIALIZE PAGE
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
    // Load rides from Flask + SQLite
    await loadRidesFromDatabase();
    // Update statistics AFTER rides are loaded
    updateStatistics();
});