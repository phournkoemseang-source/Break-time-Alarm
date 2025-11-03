# Break Time Alarm - Library Study Timer Application

A comprehensive web application built with Flask for managing study time and breaks in a library setting. This application helps students and library users manage their study sessions, set alarms, and track their progress.

## Features

### 1. User Authentication
- User registration and login system
- Secure password handling
- Session management for authenticated users

### 2. Dashboard
- Overview of all activities
- Quick access to all features
- Real-time clock display
- Activity statistics and progress tracking

### 3. Clock Features
- Digital clock with current time display
- Multiple timezone support
- Time tracking functionality

### 4. Alarm System
- Set multiple alarms
- Customizable alarm sounds
- Recurring alarm options (Once, Daily, Weekdays, Weekends)
- Volume control
- Snooze functionality

### 5. Schedule Management
- Create and manage study schedules
- View daily, weekly, and monthly plans
- Track study sessions
- Progress monitoring

### 6. Productivity Timer
- Stopwatch functionality
- Focus timer with predefined durations:
  - Focus Mode (25 minutes)
  - Short Break (5 minutes)
  - Long Break (30 minutes)
- Lap timing feature
- Session history

## Technical Setup

### Prerequisites
- Python 3.x
- Flask
- SQLAlchemy
- Web browser with JavaScript enabled

### Installation

1. Clone the repository or download the source code:
```bash
git clone [repository-url]
cd Alarm-clock-app
```

2. Create and activate a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install required dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python init_db.py
```

5. Run the application:
```bash
python run.py
```

6. Access the application:
Open your web browser and navigate to `http://127.0.0.1:5000`

### Project Structure
```
Alarm-clock-app/
├── app.py              # Main application file
├── instance/           # Database storage
├── static/            
│   ├── css/           # Stylesheet files
│   ├── js/            # JavaScript files
│   ├── sound/         # Alarm sound files
│   └── img/           # Image assets
├── template/          
│   ├── main.html      # Landing page
│   ├── login.html     # Login page
│   ├── register.html  # Registration page
│   ├── dashboard.html # Main dashboard
│   ├── clock.html     # Clock page
│   ├── stop-watch.html # Stopwatch/Timer page
│   └── alarm-clock.html # Alarm settings page
└── README.md
```

## Usage

### 1. Registration and Login
- Create a new account using the registration page
- Log in with your credentials
- Access your personalized dashboard

### 2. Setting Alarms
1. Navigate to the Alarms section
2. Click "Add Alarm"
3. Set the desired time
4. Choose repeat options
5. Select alarm sound and volume
6. Save your alarm

### 3. Using the Productivity Timer
1. Go to the Booked Alarm section
2. Choose between:
   - Stopwatch for continuous timing
   - Focus Timer for structured study sessions
3. Use lap function to track intervals
4. View your timing history

### 4. Managing Schedule
1. Access the Schedule section
2. Add new study sessions
3. Set duration and reminders
4. Track your progress

## Contributing

If you'd like to contribute to this project:
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### Common Issues and Solutions

1. Database Connection Issues
   - Ensure the instance folder exists and has write permissions
   - Check if the database file is created properly

2. Sound Not Playing
   - Verify browser autoplay settings
   - Check if sound files are present in static/sound directory

3. Login Problems
   - Clear browser cache and cookies
   - Reset your password if necessary

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons from Font Awesome
- Sound effects from [source]
- Bootstrap for UI components