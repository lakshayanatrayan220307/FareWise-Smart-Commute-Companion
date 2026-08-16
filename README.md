# 🚖 FareWise — Smart Commute Companion

> "Travel Smart. Pay Fair."

FareWise is a smart commute companion designed to help users understand whether a transportation fare is reasonable before accepting it.

The application estimates a fair fare based on factors such as **vehicle type, route distance, traffic conditions, and time of day**, and allows users to compare the estimated fare with the driver's quoted price.

FareWise also provides **ride history, expense tracking, travel insights, vehicle usage analysis, monthly budgeting, and expense export** in one platform.

---

## 🎯 Problem Statement

Transportation fares can vary significantly depending on distance, vehicle type, traffic, and time of travel. Commuters often have no easy way to determine whether a quoted fare is reasonable.

This can lead to:

- 💸 Overpaying for rides
- ❓ Uncertainty about fair transportation prices
- 📊 Difficulty tracking transportation expenses
- 📝 No centralized record of previous rides

### 💡 Our Solution

FareWise provides a single platform where users can:

**Calculate → Compare → Save → Track → Analyze**

their transportation expenses.

---

## ✨ Key Features

### 💰 Smart Fare Estimation
- Estimate a fair fare for a ride.
- Supports:
  - 🛺 Auto Rickshaw
  - 🚕 Cab
  - 🏍️ Bike Taxi
- Considers:
  - 📏 Distance
  - 🚦 Traffic conditions
  - 🕐 Time of day
  - 🚖 Vehicle type
- Compare the estimated fare with the driver's quoted fare.
- Identify whether the quoted fare is **Fair, Saved, or Overpaid**.

### 🗺️ Location & Route Calculation
- Search for pickup and destination locations.
- Get location suggestions while typing.
- Display the route on an interactive map.
- Calculate route distance.
- Estimate travel duration.

FareWise uses **Photon**, **OpenStreetMap**, **Leaflet.js**, and **OSRM** for location, mapping, and routing functionality.

### 📜 Ride History
Users can save and manage completed fare estimates.

Ride records contain information such as:

- Vehicle
- Pickup location
- Destination
- Distance
- Duration
- Estimated fare
- Driver's quoted fare
- Money saved
- Traffic
- Time of day
- Date and time

Users can also:

- 🔍 Search rides
- 🚖 Filter rides by vehicle
- 📅 Filter by month
- ↕️ Sort rides
- 👁️ View ride details
- 🗑️ Delete rides

### 📊 Expense Tracker

The Expense Tracker provides a dashboard for analyzing transportation spending.

It includes:

- 💰 Total amount spent
- 🚖 Total number of rides
- 📊 Average cost per ride
- 🏆 Most-used vehicle
- 🛣️ Total distance travelled
- ⏱️ Total travel time
- 📅 Monthly expense overview

### 📈 Travel Insights

FareWise provides additional insights such as:

- 💸 Most expensive ride
- 💰 Cheapest ride
- 🛣️ Longest trip
- 📍 Shortest trip
- 💵 Money saved this month
- 📊 Average daily spending

### 🚖 Vehicle Usage

A visual chart shows how frequently different vehicle types are used.

The project uses **Chart.js** for data visualization.

### 💳 Monthly Budget

Users can set a monthly transportation budget and monitor:

- Total budget
- Amount spent
- Remaining amount
- Budget usage percentage

### 📤 Expense Export

Transportation records can be exported as:

- 📄 CSV
- 🖨️ PDF / Print

---

## 🧠 How FareWise Works

```text
             📍 Pickup Location
                     │
                     ▼
            📍 Destination
                     │
                     ▼
              🗺️ Route API
                     │
              ┌──────┴──────┐
              ▼             ▼
          📏 Distance    ⏱️ Duration
              │
              ▼
       🚖 Select Vehicle
              │
              ▼
       🚦 Traffic Level
              │
              ▼
        🕐 Time of Day
              │
              ▼
        💰 Fair Fare
              │
              ▼
       💵 Driver Quote
              │
              ▼
       ⚖️ Fare Comparison
              │
              ▼
          📜 Save Ride
              │
       ┌──────┴──────┐
       ▼             ▼
   Ride History   Expense Tracker
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Web page structure |
| **CSS3** | User interface and styling |
| **JavaScript** | Frontend functionality |
| **Python** | Backend development |
| **Flask** | REST API and server |
| **SQLite** | Ride data storage |
| **Flask-CORS** | API cross-origin support |
| **Leaflet.js** | Interactive maps |
| **OpenStreetMap** | Map data |
| **Photon** | Location search |
| **OSRM** | Route, distance and duration calculation |
| **Chart.js** | Vehicle usage visualization |
| **Font Awesome** | Icons |

---

## 🏗️ Project Architecture

FareWise follows a **frontend + Flask backend + SQLite database** architecture.

```text
                    ┌─────────────────────────┐
                    │        FareWise         │
                    │  Smart Commute Companion│
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
        ┌──────────────────┐          ┌──────────────────┐
        │     Frontend     │          │     Backend      │
        │   HTML/CSS/JS    │◄────────►│ Python + Flask   │
        └────────┬─────────┘          └────────┬─────────┘
                 │                             │
        ┌────────┴─────────┐                   ▼
        │                  │          ┌────────────────┐
        ▼                  ▼          │     SQLite     │
   Leaflet + OSRM       Photon       │   farewise.db  │
   Maps & Routes       Locations     └────────────────┘
```

---

## 📁 Project Structure

```text
FareWise-Smart-Commute-Companion/
│
├── app.py
├── database.py
├── fare_calculator.py
├── farewise.db
├── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   │
│   ├── estimate.html
│   ├── estimate.css
│   ├── estimate.js
│   │
│   ├── history.html
│   ├── history.css
│   ├── history.js
│   │
│   ├── tracker.html
│   ├── tracker.css
│   ├── tracker.js
│   │
│   └── farewise-logo.png
│
└── README.md
```

---

## 🔌 Backend API

The Flask backend provides REST API endpoints for managing ride data.

### Health Check

```http
GET /api/health
```

Checks whether the FareWise backend is running.

### Get Rides

```http
GET /api/rides
```

Retrieves all saved rides from the SQLite database.

### Add Ride

```http
POST /api/rides
```

Adds a new ride to the database.

Example request:

```json
{
  "vehicle": "auto",
  "pickup": "Chennai",
  "destination": "Guindy",
  "distance": 8.5,
  "duration": 25,
  "estimated_fare": 160,
  "quoted_fare": 180,
  "money_saved": 20,
  "traffic": "moderate",
  "time_of_day": "peak"
}
```

### Delete Ride

```http
DELETE /api/rides/<ride_id>
```

Deletes a specific ride using its database ID.

---

## 🗄️ Database

FareWise uses **SQLite** to store ride information.

The main `rides` table contains:

```text
id
vehicle
pickup
destination
distance
duration
estimated_fare
quoted_fare
money_saved
traffic
time_of_day
ride_date
ride_time
```

The database is initialized using:

```bash
python database.py
```

---

## 🚀 Run FareWise Locally

### 1. Clone the repository

```bash
git clone https://github.com/lakshayanatrayan220307/FareWise-Smart-Commute-Companion.git
```

### 2. Open the project

```bash
cd FareWise-Smart-Commute-Companion
```

### 3. Create a virtual environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Initialize the database

```bash
python database.py
```

### 6. Start the Flask server

```bash
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

Then open the FareWise frontend.

---

## 🌐 External Services

FareWise uses the following external services:

### 🗺️ OpenStreetMap
Provides map data used by the application.

### 📍 Photon
Provides location search and autocomplete suggestions.

### 🛣️ OSRM
Provides route calculation, distance and estimated travel duration.

### 📊 Chart.js
Provides vehicle usage visualization in the Expense Tracker.

---

## ⚠️ Current Limitations

FareWise is currently an evolving project.

Some current limitations include:

- SQLite is currently used as the database.
- The Flask backend is configured primarily for local development.
- External routing and location services depend on their availability.
- The current fare calculation uses predefined fare logic.
- Authentication and user accounts are not currently implemented.
- Production deployment requires additional configuration.

---

## 🔮 Future Improvements

The project can be extended with:

### 🤖 Advanced Fare Prediction
Use machine learning and historical ride data to improve fare predictions.

### 🚦 Real-Time Traffic
Integrate real-time traffic information for more accurate estimates.

### 🌦️ Weather Integration
Consider weather conditions when estimating travel costs and duration.

### 🔐 User Authentication
Add secure user accounts with personalized ride history.

### ☁️ Cloud Database
Move from SQLite to a production database such as PostgreSQL.

### 📱 Mobile Application
Develop Android and iOS versions of FareWise.

### 🤖 AI Travel Assistant
Add an intelligent assistant for personalized commute recommendations.

### 📍 Improved Route Intelligence
Use additional transportation and location data to improve route and fare estimation.

---

## 🎯 Vision

FareWise aims to make everyday transportation **more transparent, informed, and manageable**.

Instead of simply asking:

> **"How much is the driver asking?"**

FareWise helps users ask:

> **"What is a fair price for this ride?"**

---

## 🤝 Contributing

Contributions and suggestions are welcome!

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push your branch.
6. Open a Pull Request.

---

## ⭐ Support FareWise

If you find this project useful or interesting:

⭐ **Star the repository**  
🍴 **Fork the project**  
🐛 **Report issues**  
💡 **Suggest improvements**  
🤝 **Contribute**

---

## 👩‍💻 Author

### Lakshaya N. K.

**FareWise — Smart Commute Companion**

> 🚖 **Travel Smart. Pay Fair.**
