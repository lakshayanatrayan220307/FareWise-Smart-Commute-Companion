from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
app = Flask(__name__)
CORS(app)
DB_NAME = 'farewise.db'
# --------------------------------------------------
# Database Connection
# --------------------------------------------------
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn
# --------------------------------------------------
# Home Route
# --------------------------------------------------
@app.route('/')
def home():
    return 'FareWise Backend Running Successfully!'
# --------------------------------------------------
# SERVE FRONTEND PAGES
# --------------------------------------------------
@app.route('/estimate')
def estimate_page():
    return send_from_directory('frontend', 'estimate.html')

@app.route('/history')
def history_page():
    return send_from_directory('frontend', 'history.html')

@app.route('/tracker')
def tracker_page():
    return send_from_directory('frontend', 'tracker.html')
# --------------------------------------------------
# SERVE CSS / JS / IMAGES
# --------------------------------------------------
@app.route('/frontend/<path:filename>')
def frontend_files(filename):
    return send_from_directory('frontend', filename)
# --------------------------------------------------
# Health Check
# --------------------------------------------------
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'success',
        'message': 'FareWise API is running'
    })
# --------------------------------------------------
# GET ALL RIDES
# --------------------------------------------------
@app.route('/api/rides', methods=['GET'])
def get_rides():
    conn = get_db_connection()
    rides = conn.execute(
        'SELECT * FROM rides ORDER BY id DESC'
    ).fetchall()
    conn.close()
    return jsonify([dict(ride) for ride in rides])
# --------------------------------------------------
# ADD NEW RIDE
# --------------------------------------------------
@app.route('/api/rides', methods=['POST'])
def add_ride():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO rides (
            vehicle,
            pickup,
            destination,
            distance,
            duration,
            estimated_fare,
            quoted_fare,
            money_saved,
            traffic,
            time_of_day,
            ride_date,
            ride_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['vehicle'],
        data['pickup'],
        data['destination'],
        data['distance'],
        data['duration'],
        data['estimated_fare'],
        data.get('quoted_fare', 0),
        data.get('money_saved', 0),
        data.get('traffic', ''),
        data.get('time_of_day', ''),
        data.get('ride_date', ''),
        data.get('ride_time', '')
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({
        'message': 'Ride saved successfully',
        'id': new_id
    }), 201
# --------------------------------------------------
# DELETE RIDE
# --------------------------------------------------
@app.route('/api/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride(ride_id):
    conn = sqlite3.connect('farewise.db')
    cursor = conn.cursor()
    cursor.execute(
        'DELETE FROM rides WHERE id = ?',
        (ride_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Ride deleted successfully'})
# --------------------------------------------------
# Run Server
# --------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True)