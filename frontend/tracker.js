/* ==========================================================
                FareWise
             EXPENSE TRACKER
                 PART 1
==========================================================*/
/* ==========================================================
                LOAD RIDES FROM FLASK DATABASE
========================================================== */
let rides = [];
async function fetchRidesFromAPI(){
    try{
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
    }catch(error){
        console.error('Error loading rides:', error);
        alert('Unable to load rides from database.');
    }
}
/* ==========================================================
                VEHICLE DETAILS
==========================================================*/
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
/* ==========================================================
                PAGE LOAD
==========================================================*/
document.addEventListener("DOMContentLoaded", async () => {
    // Load rides from Flask database
    await fetchRidesFromAPI();
    // Now update the tracker UI
    updateSummaryCards();
    renderMonthlyOverview();
    loadMonthFilter();
    filterRides();
    updateInsights();
    loadBudget();
    renderVehicleChart();
    updateBudgetCard();
});
/* ==========================================================
                SAVE RIDES
==========================================================*/
// No localStorage anymore — rides are stored in SQLite via Flask
function saveRides(){}
/* ==========================================================
                FORMAT CURRENCY
==========================================================*/
function formatCurrency(amount){
    return "₹" + Number(amount).toLocaleString("en-IN");
}
/* ==========================================================
                FORMAT STATUS
==========================================================*/
function getStatus(saved){
    saved = Number(saved);
    if(saved > 0){
        return `
        <span class="status-badge saved">
            Saved
        </span>
        `;
    }
    if(saved < 0){
        return `
        <span class="status-badge overpaid">
            Overpaid
        </span>
        `;
    }
    return `
    <span class="status-badge fair">
        Fair
    </span>
    `;
}
/* ==========================================================
                PART 2
            SUMMARY DASHBOARD
==========================================================*/
function updateSummaryCards() {
    let totalSpent = 0;
    let totalDistance = 0;
    let totalDuration = 0;
    const vehicleCount = {
        auto: 0,
        cab: 0,
        bike: 0
    };
    rides.forEach(ride => {
        totalSpent += Number(ride.fare);
        totalDistance += parseFloat(ride.distance);
        totalDuration += parseFloat(ride.duration);
        if(vehicleCount[ride.vehicle] !== undefined){
            vehicleCount[ride.vehicle]++;
        }
    });
    // -----------------------------
    // Total Amount Spent
    // -----------------------------
    document.getElementById("totalSpent").textContent =
        formatCurrency(totalSpent);
    // -----------------------------
    // Total Rides
    // -----------------------------
    document.getElementById("totalRides").textContent =
        rides.length;
    // -----------------------------
    // Average Cost Per Ride
    // -----------------------------
    document.getElementById("avgCostPerRide").textContent =
        rides.length > 0
        ? formatCurrency(Math.round(totalSpent / rides.length))
        : "₹0";
    // -----------------------------
    // Favourite Vehicle
    // -----------------------------
    let favourite = "--";
    let highest = 0;
    for(const vehicle in vehicleCount){
        if(vehicleCount[vehicle] > highest){
            highest = vehicleCount[vehicle];
            favourite = vehicleLabel[vehicle];
        }
    }
    document.getElementById("mostUsedVehicle").textContent =
        favourite;
    // -----------------------------
    // Total Distance
    // -----------------------------
    document.getElementById("totalDistance").textContent =
        totalDistance.toFixed(1) + " km";
    // -----------------------------
    // Total Travel Time
    // -----------------------------
    const hours = Math.floor(totalDuration / 60);
    const minutes = Math.round(totalDuration % 60);
    if(hours > 0){
        document.getElementById("totalTravelTime").textContent =
            `${hours} hr ${minutes} min`;
    }
    else{
        document.getElementById("totalTravelTime").textContent =
            `${minutes} min`;

    }
}
/* ==========================================================
                PART 3
        MONTHLY EXPENSE OVERVIEW
==========================================================*/
function renderMonthlyOverview(){
    const container =
        document.getElementById(
            "monthlyOverviewContainer"
        );
    container.innerHTML = "";
    if(rides.length === 0){
        container.innerHTML = `
        <div class="no-data-card">
            <div class="no-data-icon">
                📊
            </div>
            <h3>No Expense Data Yet</h3>
            <p>
                Estimate your first ride to start
                tracking your monthly
                transportation expenses.
            </p>
            <a
                href="estimate.html"
                class="start-btn">
                Estimate Your First Ride
            </a>
        </div>
        `;
        return;
    }
    const monthlyData = {};
    rides.forEach(ride=>{
        const date = new Date(ride.date);
        const month =
            date.toLocaleString(
                "default",
                {
                    month:"long",
                    year:"numeric"
                }
            );
        if(!monthlyData[month]){
            monthlyData[month] = {
                fare:0,
                rides:0
            };
        }
        monthlyData[month].fare +=
            Number(ride.fare);
        monthlyData[month].rides++;
    });
    for(const month in monthlyData){
        const card =
            document.createElement("div");
        card.className = "month-card";
        card.innerHTML = `
        <h3>${month}</h3>
        <div class="month-amount">
            ${formatCurrency(monthlyData[month].fare)}
        </div>
        <p>
            ${monthlyData[month].rides}
            Ride${monthlyData[month].rides>1?"s":""}
        </p>
        `;
        container.appendChild(card);
    }
}
/* ==========================================================
                PART 4
        EXPENSE TABLE RENDERING
==========================================================*/
function getStatusBadge(saved){
    if(saved > 0){
        return `
        <span class="status-badge saved">
            Saved
        </span>
        `;
    }
    if(saved < 0){
        return `
        <span class="status-badge overpaid">
            Overpaid
        </span>
        `;
    }
    return `
    <span class="status-badge fair">
        Fair
    </span>
    `;
}
function renderExpenseTable(list){
    const tableBody =
        document.getElementById(
            "expenseTableBody"
        );
    tableBody.innerHTML = "";
    if(list.length===0){
        document.getElementById(
            "expenseTableContainer"
        ).style.display="none";
        document.getElementById(
            "emptyState"
        ).style.display="block";
        document.getElementById(
            "resultsCount"
        ).textContent="0 rides found";
        return;
    }
    document.getElementById(
        "expenseTableContainer"
    ).style.display="block";
    document.getElementById(
        "emptyState"
    ).style.display="none";
    document.getElementById(
        "resultsCount"
    ).textContent=
        list.length+" rides found";
    list.forEach((ride,index)=>{
        const saved =
            Number(ride.saved);
        const row =
            document.createElement("tr");
        row.innerHTML=`
<td>${ride.date}</td>
<td>
${vehicleLabel[ride.vehicle]}
</td>
<td>${ride.from}</td>
<td>${ride.to}</td>
<td>${ride.distance}</td>
<td>${ride.duration}</td>
<td class="fare-cell">
${formatCurrency(ride.fare)}
</td>
<td>
${formatCurrency(ride.quotedFare)}
</td>
<td>
${formatCurrency(Math.abs(saved))}
</td>
<td>
${getStatusBadge(saved)}
</td>
<td>
<div class="table-actions">
<button
class="btn-view"
onclick="viewRide(${index})">
View
</button>
<button
class="btn-delete"
onclick="deleteRide(${index})">
Delete
</button>
</div>
</td>
`;
        tableBody.appendChild(row);
    });
}
/* ==========================================================
                PART 5
        SEARCH • FILTER • SORT
==========================================================*/
function filterRides(){
    let filtered = [...rides];
    // -------------------------
    // Search
    // -------------------------
    const search =
        document.getElementById(
            "searchRide"
        ).value.toLowerCase();
    if(search){
        filtered = filtered.filter(ride=>
            ride.from.toLowerCase().includes(search) ||
            ride.to.toLowerCase().includes(search)
        );
    }
    // -------------------------
    // Vehicle Filter
    // -------------------------
    const vehicle =
        document.getElementById(
            "vehicleFilter"
        ).value;
    if(vehicle !== "all"){
        filtered = filtered.filter(
            ride=>ride.vehicle===vehicle
        );
    }
    // -------------------------
    // Month Filter
    // -------------------------
    const month =
        document.getElementById(
            "monthFilter"
        ).value;
    if(month !== "all"){
        filtered = filtered.filter(ride=>{
            const rideMonth =
                new Date(ride.date)
                .toLocaleString(
                    "default",
                    {
                        month:"long",
                        year:"numeric"
                    }
                );
            return rideMonth===month;
        });
    }
    // -------------------------
    // Sorting
    // -------------------------
    const sort =
        document.getElementById(
            "sortFilter"
        ).value;
    switch(sort){
        case "oldest":
            filtered.sort(
                (a,b)=>
                new Date(a.date)-new Date(b.date)
            );
            break;
        case "highest":
            filtered.sort(
                (a,b)=>b.fare-a.fare
            );
            break;
        case "lowest":
            filtered.sort(
                (a,b)=>a.fare-b.fare
            );
            break;
        default:
            filtered.sort(
                (a,b)=>
                new Date(b.date)-new Date(a.date)
            );
    }
    renderExpenseTable(filtered);
}
/* ==========================================================
        LOAD MONTH FILTER
==========================================================*/
function loadMonthFilter(){
    const monthFilter =
        document.getElementById(
            "monthFilter"
        );
    monthFilter.innerHTML =
        `<option value="all">
            All Months
        </option>`;
    const months = [];
    rides.forEach(ride=>{
        const month =
            new Date(ride.date)
            .toLocaleString(
                "default",
                {
                    month:"long",
                    year:"numeric"
                }
            );
        if(!months.includes(month)){
            months.push(month);
        }
    });
    months.forEach(month=>{
        monthFilter.innerHTML +=
        `<option value="${month}">
            ${month}
        </option>`;
    });
}
/* ==========================================================
                PART 6
            TRAVEL INSIGHTS
==========================================================*/
function updateInsights(){
    if(rides.length===0){
        document.getElementById("mostExpensiveRide").textContent="--";
        document.getElementById("cheapestRide").textContent="--";
        document.getElementById("longestTrip").textContent="--";
        document.getElementById("shortestTrip").textContent="--";
        document.getElementById("moneySavedThisMonth").textContent="₹0";
        document.getElementById("avgDailySpending").textContent="₹0";
        return;
    }
    // -------------------------
    // Most Expensive Ride
    // -------------------------
    const expensive = rides.reduce((a,b)=>
        a.fare>b.fare ? a : b
    );
    document.getElementById(
        "mostExpensiveRide"
    ).textContent =
    `₹${expensive.fare}`;
    // -------------------------
    // Cheapest Ride
    // -------------------------
    const cheap = rides.reduce((a,b)=>
        a.fare<b.fare ? a : b
    );
    document.getElementById(
        "cheapestRide"
    ).textContent =
    `₹${cheap.fare}`;
    // -------------------------
    // Longest Trip
    // -------------------------
    const longest = rides.reduce((a,b)=>
        parseFloat(a.distance)>
        parseFloat(b.distance)
        ? a : b
    );
    document.getElementById(
        "longestTrip"
    ).textContent =
    longest.distance;
    // -------------------------
    // Shortest Trip
    // -------------------------
    const shortest = rides.reduce((a,b)=>
        parseFloat(a.distance)<
        parseFloat(b.distance)
        ? a : b
    );
    document.getElementById(
        "shortestTrip"
    ).textContent =
    shortest.distance;
    // -------------------------
    // Money Saved This Month
    // -------------------------
    const now = new Date();
    let saved = 0;
    rides.forEach(ride=>{
        const d = new Date(ride.date);
        if(
            d.getMonth()===now.getMonth() &&
            d.getFullYear()===now.getFullYear()
        ){
            if(ride.saved>0){
                saved += ride.saved;
            }
        }
    });
    document.getElementById(
        "moneySavedThisMonth"
    ).textContent =
    "₹"+saved;
    // -------------------------
    // Average Daily Spending
    // -------------------------
    const totalFare = rides.reduce(
        (sum,ride)=>sum+ride.fare,
        0
    );
    const days = new Date().getDate();
    document.getElementById(
        "avgDailySpending"
    ).textContent =
    "₹"+Math.round(totalFare/days);
}
/* ==========================================================
                PART 7
            MONTHLY BUDGET
==========================================================*/
// Load Budget
function loadBudget(){
    const budget =
        Number(localStorage.getItem("fareBudget")) || 0;
    document.getElementById("monthlyBudget").value =
        budget;
    updateBudgetCard();
}
// Save Budget
document.getElementById("saveBudgetBtn")
.addEventListener("click",()=>{
    const budget =
        Number(
            document.getElementById("monthlyBudget").value
        );
    if(budget<=0){
        alert("Please enter a valid monthly budget.");
        return;
    }
    localStorage.setItem(
        "fareBudget",
        budget
    );
    updateBudgetCard();
    alert("✅ Monthly budget saved successfully!");
});
// Update Budget Card
function updateBudgetCard(){
    const budget =
        Number(localStorage.getItem("fareBudget")) || 0;
    const spent =
        rides.reduce(
            (sum,ride)=>sum+ride.fare,
            0
        );
    const remaining =
        budget-spent;
    document.getElementById("budgetAmount").textContent =
        "₹"+budget;
    document.getElementById("budgetSpent").textContent =
        "₹"+spent;
    document.getElementById("budgetRemaining").textContent =
        "₹"+remaining;
    const progress =
        budget>0
        ? Math.min((spent/budget)*100,100)
        : 0;
    const bar =
        document.getElementById("budgetProgressFill");
    bar.style.width =
        progress+"%";
    // Change bar color based on usage
    if(progress<60){
        bar.style.background="#27ae60";
    }
    else if(progress<90){
        bar.style.background="#f4a213";
    }
    else{
        bar.style.background="#e74c3c";
    }
}
/* ==========================================================
                PART 8
        ACTIONS • EXPORT • CLEAR HISTORY
==========================================================*/
// ----------------------------------------------------------
// VIEW RIDE DETAILS
// ----------------------------------------------------------
function viewRide(index){
    const ride = rides[index];
    alert(
`🚖 FareWise Ride Details
Vehicle : ${vehicleLabel[ride.vehicle]}
Pickup : ${ride.from}
Destination : ${ride.to}
Distance : ${ride.distance}
Duration : ${ride.duration}
Estimated Fare : ₹${ride.fare}
Driver Fare : ₹${ride.quotedFare}
Money Saved : ₹${Math.abs(ride.saved)}
Status : ${
ride.saved>0
?"Saved":
ride.saved<0
?"Overpaid"
:"Fair"
}
Date : ${ride.date}
Time : ${ride.time}`
    );
}
// ----------------------------------------------------------
// DELETE RIDE
// ----------------------------------------------------------
function deleteRide(index){
    if(
        !confirm(
            "Delete this ride from Expense Tracker?"
        )
    ){
        return;
    }
    rides.splice(index,1);
    saveRides();
    updateSummaryCards();
    renderMonthlyOverview();
    updateInsights();
    loadMonthFilter();
    filterRides();
    updateBudgetCard();
    renderVehicleChart();
}
// ----------------------------------------------------------
// CLEAR HISTORY
// ----------------------------------------------------------
document.querySelectorAll(".btn-export")[2]
.addEventListener("click",()=>{
    if(
        !confirm(
            "Delete ALL ride history?"
        )
    ){
        return;
    }
    rides=[];
    saveRides();
    updateSummaryCards();
    renderMonthlyOverview();
    updateInsights();
    loadMonthFilter();
    filterRides();
    updateBudgetCard();
    renderVehicleChart();
    alert("History Cleared.");
});
// ----------------------------------------------------------
// EXPORT CSV
// ----------------------------------------------------------
document.getElementById("exportCsvBtn")
.addEventListener("click",()=>{
    if(rides.length===0){
        alert("No rides to export.");
        return;
    }
    let csv =
`Date,Vehicle,Pickup,Destination,Distance,Duration,Estimated Fare,Driver Fare,Saved
`;
    rides.forEach(ride=>{
        csv +=
`${ride.date},
${vehicleLabel[ride.vehicle]},
${ride.from},
${ride.to},
${ride.distance},
${ride.duration},
${ride.fare},
${ride.quotedFare},
${ride.saved}
`;
    });
    const blob =
        new Blob([csv],
        {type:"text/csv"});
    const url =
        URL.createObjectURL(blob);
    const a =
        document.createElement("a");
    a.href=url;
    a.download="FareWise_Expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
});
// ----------------------------------------------------------
// EXPORT PDF
// ----------------------------------------------------------
document.getElementById("exportPdfBtn")
.addEventListener("click",()=>{
    window.print();
});
/* ==========================================================
                VEHICLE USAGE GRAPH
==========================================================*/
let vehicleChart;
function renderVehicleChart(){
    const autoCount =
        rides.filter(r=>r.vehicle==="auto").length;
    const cabCount =
        rides.filter(r=>r.vehicle==="cab").length;
    const bikeCount =
        rides.filter(r=>r.vehicle==="bike").length;
    const ctx =
        document.getElementById("vehicleChart");
    // Destroy old chart before drawing new one
    if(vehicleChart){
        vehicleChart.destroy();
    }
    vehicleChart = new Chart(ctx,{
        type:"doughnut",
        data:{
            labels:[
                "🚕 Cab",
                "🛺 Auto",
                "🏍️ Bike Taxi"
            ],
            datasets:[{
                data:[
                    cabCount,
                    autoCount,
                    bikeCount
                ],
                backgroundColor:[
                    "#4F46E5",
                    "#F59E0B",
                    "#10B981"
                ],
                borderWidth:2
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    position:"bottom"
                }
            }
        }
    });
}