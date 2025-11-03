# app.py
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__, template_folder='template')
app.config['SECRET_KEY'] = 'your_secret_key_here'  # Change this to a random secret
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"connect_args": {"check_same_thread": False}}

db = SQLAlchemy(app)

# User model for login/register
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

# Alarm model to store alarms
class Alarm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    alarm_time = db.Column(db.String(5), nullable=False)  # Format: HH:MM
    repeat_type = db.Column(db.String(20), nullable=False, default='once')  # once, daily, weekdays, weekends
    sound_type = db.Column(db.String(20), nullable=False, default='bell')  # bell, chime, digital, voice
    volume = db.Column(db.Integer, nullable=False, default=80)  # 0-100
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# Study session model
class StudySession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in minutes
    status = db.Column(db.String(20), nullable=False, default='upcoming')  # upcoming, active, completed
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=True)

# Book model for library management
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(200))  # URL or path to book cover
    status = db.Column(db.String(20), default='available')  # available, borrowed
    total_pages = db.Column(db.Integer)
    current_page = db.Column(db.Integer, default=0)
    reading_progress = db.Column(db.Float, default=0.0)  # percentage
    study_sessions = db.relationship('StudySession', backref='book', lazy=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# Create DB if not exists
with app.app_context():
    db.create_all()
    
@app.route('/')
def main():
    return render_template('auth/main.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username, password=password).first()
        if user:
            session['user_id'] = user.id
            flash('Welcome back!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password!')
            return redirect(url_for('login'))
    
    return render_template('auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if not username or not password or not confirm_password:
            flash('All fields are required!')
            return redirect(url_for('register'))
            
        if len(password) < 6:
            flash('Password must be at least 6 characters long!')
            return redirect(url_for('register'))
        
        if password != confirm_password:
            flash('Passwords do not match!')
            return redirect(url_for('register'))
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Email already registered! Please login.')
            return redirect(url_for('login'))
        
        try:
            new_user = User(username=username, password=password)
            db.session.add(new_user)
            db.session.commit()
            
            session['user_id'] = new_user.id
            flash('Account created successfully! Welcome to LibraryAlarm!')
            return redirect(url_for('dashboard'))
        except Exception as e:
            db.session.rollback()
            flash('An error occurred during registration. Please try again.')
            return redirect(url_for('register'))

from functools import wraps
from flask import jsonify

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    try:
        user = User.query.get(session['user_id'])
        if not user:
            session.pop('user_id', None)
            return redirect(url_for('login'))
        
        # Get active alarms count
        active_alarms = 0
        try:
            active_alarms = Alarm.query.filter_by(
                user_id=session['user_id'],
                is_active=True
            ).count()
        except Exception as e:
            print(f"Error getting alarms: {e}")
        
        # Get today's study sessions
        today_sessions = 0
        try:
            today = datetime.now()
            today_sessions = StudySession.query.filter(
                StudySession.user_id == session['user_id'],
                StudySession.start_time >= today.replace(hour=0, minute=0, second=0),
                StudySession.start_time <= today.replace(hour=23, minute=59, second=59)
            ).count()
        except Exception as e:
            print(f"Error getting sessions: {e}")
        
        # Get active books
        active_books = 0
        try:
            active_books = Book.query.filter(
                Book.reading_progress > 0,
                Book.reading_progress < 100
            ).count()
        except Exception as e:
            print(f"Error getting books: {e}")
        
        # Calculate total study time today
        today_study_time = 0
        try:
            result = StudySession.query.with_entities(
                db.func.sum(StudySession.duration)
            ).filter(
                StudySession.user_id == session['user_id'],
                StudySession.start_time >= today.replace(hour=0, minute=0, second=0),
                StudySession.start_time <= today.replace(hour=23, minute=59, second=59),
                StudySession.status == 'completed'
            ).scalar()
            today_study_time = result if result is not None else 0
        except Exception as e:
            print(f"Error getting study time: {e}")
        
        return render_template('dashboard.html',
                             user=user,
                             active_alarms=active_alarms,
                             today_sessions=today_sessions,
                             active_books=active_books,
                             today_study_time=today_study_time)
                             
    except Exception as e:
        print(f"Dashboard error: {e}")
        db.session.rollback()
        flash("An error occurred while loading the dashboard. Please try again.", "error")
        return redirect(url_for('login'))

@app.route('/clock')
def clock():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('clock.html')

@app.route('/alarm')
def alarm():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('alarm-clock.html')

@app.route('/schedule')
def schedule():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('schedule.html')

# @app.route('/start')
@app.route('/stop-watch')
def stop_watch():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("stop-watch.html")

    # Get active alarms
    active_alarms = Alarm.query.filter_by(
        user_id=session['user_id'],
        is_active=True
    ).order_by(Alarm.alarm_time).all()

    # Get study sessions
    now = datetime.now()
    study_sessions = StudySession.query.filter_by(
        user_id=session['user_id']
    ).filter(
        StudySession.start_time >= now
    ).order_by(StudySession.start_time).all()

    # The UI file for the stopwatch/timer is named `stop-watch.html` in the
    # repository. Render that template for both /start and /stop-watch routes.
    return render_template('stop-watch.html',
                         active_alarms=active_alarms,
                         study_sessions=study_sessions,
                         current_time=now.strftime("%I:%M:%S %p"),
                         current_date=now.strftime("%B %d, %Y"))

@app.route('/api/user/info')
@login_required
def get_user_info():
    user = User.query.get(session['user_id'])
    return jsonify({
        'id': user.id,
        'email': user.username,
        'role': 'Admin'  # You can extend User model to include role
    })

@app.route('/api/alarms', methods=['GET'])
@login_required
def get_alarms():
    alarms = Alarm.query.filter_by(user_id=session['user_id']).all()
    return jsonify({
        'data': [{
            'id': alarm.id,
            'name': alarm.name,
            'alarm_time': alarm.alarm_time,
            'repeat_type': alarm.repeat_type,
            'sound_type': alarm.sound_type,
            'volume': alarm.volume,
            'is_active': alarm.is_active
        } for alarm in alarms]
    })

@app.route('/api/alarms', methods=['POST'])
@login_required
def create_alarm():
    data = request.get_json()
    new_alarm = Alarm(
        user_id=session['user_id'],
        name=data['name'],
        alarm_time=data['alarm_time'],
        repeat_type=data.get('repeat_type', 'once'),
        sound_type=data.get('sound_type', 'bell'),
        volume=data.get('volume', 80),
        is_active=True
    )
    db.session.add(new_alarm)
    db.session.commit()
    return jsonify({
        'message': 'Alarm created successfully',
        'id': new_alarm.id
    })

@app.route('/api/alarms/<int:alarm_id>', methods=['PUT'])
@login_required
def update_alarm(alarm_id):
    alarm = Alarm.query.filter_by(id=alarm_id, user_id=session['user_id']).first_or_404()
    data = request.get_json()
    
    for field in ['name', 'alarm_time', 'repeat_type', 'sound_type', 'volume', 'is_active']:
        if field in data:
            setattr(alarm, field, data[field])
    
    db.session.commit()
    return jsonify({'message': 'Alarm updated successfully'})

@app.route('/api/alarms/<int:alarm_id>', methods=['DELETE'])
@login_required
def delete_alarm(alarm_id):
    alarm = Alarm.query.filter_by(id=alarm_id, user_id=session['user_id']).first_or_404()
    db.session.delete(alarm)
    db.session.commit()
    return jsonify({'message': 'Alarm deleted successfully'})

@app.route('/api/study-sessions', methods=['GET'])
@login_required
def get_study_sessions():
    sessions = StudySession.query.filter_by(user_id=session['user_id']).order_by(StudySession.start_time).all()
    return jsonify({
        'data': [{
            'id': session.id,
            'subject': session.subject,
            'start_time': session.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            'duration': session.duration,
            'status': session.status,
            'notes': session.notes
        } for session in sessions]
    })

@app.route('/api/study-sessions', methods=['POST'])
@login_required
def create_study_session():
    data = request.get_json()
    new_session = StudySession(
        user_id=session['user_id'],
        subject=data['subject'],
        start_time=datetime.strptime(data['start_time'], "%Y-%m-%d %H:%M:%S"),
        duration=data['duration'],
        status='upcoming',
        notes=data.get('notes', '')
    )
    db.session.add(new_session)
    db.session.commit()
    return jsonify({
        'message': 'Study session created successfully',
        'id': new_session.id
    })

@app.route('/api/study-sessions/<int:session_id>', methods=['PUT'])
@login_required
def update_study_session(session_id):
    study_session = StudySession.query.filter_by(
        id=session_id, 
        user_id=session['user_id']
    ).first_or_404()
    
    data = request.get_json()
    if 'subject' in data:
        study_session.subject = data['subject']
    if 'start_time' in data:
        study_session.start_time = datetime.strptime(data['start_time'], "%Y-%m-%d %H:%M:%S")
    if 'duration' in data:
        study_session.duration = data['duration']
    if 'status' in data:
        study_session.status = data['status']
    if 'notes' in data:
        study_session.notes = data['notes']
    
    db.session.commit()
    return jsonify({'message': 'Study session updated successfully'})

@app.route('/api/study-sessions/<int:session_id>', methods=['DELETE'])
@login_required
def delete_study_session(session_id):
    study_session = StudySession.query.filter_by(
        id=session_id, 
        user_id=session['user_id']
    ).first_or_404()
    db.session.delete(study_session)
    db.session.commit()
    return jsonify({'message': 'Study session deleted successfully'})

# Book routes
@app.route('/book-view')
@login_required
def book_view():
    books = Book.query.all()
    active_sessions = StudySession.query.filter_by(
        user_id=session['user_id'],
        status='active'
    ).all()
    return render_template('book-view.html', 
                         books=books,
                         active_sessions=active_sessions)

@app.route('/api/books', methods=['GET'])
@login_required
def get_books():
    books = Book.query.all()
    return jsonify({
        'data': [{
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'category': book.category,
            'description': book.description,
            'cover_image': book.cover_image,
            'status': book.status,
            'total_pages': book.total_pages,
            'current_page': book.current_page,
            'reading_progress': book.reading_progress,
            'study_sessions': len(book.study_sessions)
        } for book in books]
    })

@app.route('/api/books/<int:book_id>', methods=['GET'])
@login_required
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    recent_sessions = StudySession.query.filter_by(
        book_id=book_id
    ).order_by(StudySession.start_time.desc()).limit(5).all()
    
    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'category': book.category,
        'description': book.description,
        'cover_image': book.cover_image,
        'status': book.status,
        'total_pages': book.total_pages,
        'current_page': book.current_page,
        'reading_progress': book.reading_progress,
        'recent_sessions': [{
            'id': session.id,
            'start_time': session.start_time.strftime("%Y-%m-%d %H:%M"),
            'duration': session.duration,
            'status': session.status
        } for session in recent_sessions]
    })

@app.route('/api/books/<int:book_id>/progress', methods=['PUT'])
@login_required
def update_book_progress(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    if 'current_page' in data:
        book.current_page = min(data['current_page'], book.total_pages)
        book.reading_progress = (book.current_page / book.total_pages) * 100
        
    db.session.commit()
    return jsonify({
        'message': 'Progress updated successfully',
        'current_page': book.current_page,
        'reading_progress': book.reading_progress
    })

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)