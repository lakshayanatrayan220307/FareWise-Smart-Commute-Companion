import sqlite3

DB_NAME = 'farewise.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle TEXT NOT NULL,
            pickup TEXT NOT NULL,
            destination TEXT NOT NULL,
            distance REAL NOT NULL,
            duration INTEGER NOT NULL,
            estimated_fare INTEGER NOT NULL,
            quoted_fare INTEGER DEFAULT 0,
            money_saved INTEGER DEFAULT 0,
            traffic TEXT,
            time_of_day TEXT,
            ride_date TEXT,
            ride_time TEXT
        )
    ''')

    conn.commit()
    conn.close()
    print('FareWise database initialized successfully!')

if __name__ == '__main__':
    init_db()