
// API Base URL (Flask backend)
const API_BASE = '/api';

// Current user data (will be loaded from API)
let currentUser = null;
let activeAlarms = [];
let alarmAudio = null;
let currentAlarm = null;

// Alarm sounds configuration
const alarmSounds = {
    bell: '/static/sounds/bell.mp3',
    chime: '/static/sounds/chime.mp3',
    digital: '/static/sounds/digital.mp3',
    voice: '/static/sounds/voice.mp3'
};

// API Service for Flask backend
const apiService = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE}/${endpoint}`;
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options,
            credentials: 'same-origin'  // Send cookies for Flask session
        };

        if (config.body) config.body = JSON.stringify(config.body);

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                if (response.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = '/';
                    return;
                }
                throw new Error('Request failed');
            }
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // User info
    async getUserInfo() {
        return this.request('user/info');
    },

    // Alarm methods
    async getAlarms() {
        return this.request('alarms');
    },

    async createAlarm(alarmData) {
        return this.request('alarms', {
            method: 'POST',
            body: alarmData
        });
    },

    async updateAlarm(alarmData) {
        return this.request(`alarms/${alarmData.id}`, {
            method: 'PUT',
            body: alarmData
        });
    },

    async deleteAlarm(id) {
        return this.request(`alarms/${id}`, { 
            method: 'DELETE' 
        });
    }
};

// Alarm Management Functions
function playAlarmSound(soundType, volume) {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio = null;
    }

    alarmAudio = new Audio(alarmSounds[soundType]);
    alarmAudio.volume = volume / 100;
    alarmAudio.loop = true;

    // For voice alarms, use speech synthesis
    if (soundType === 'voice') {
        const speech = new SpeechSynthesisUtterance("Alarm! It's time for your break!");
        speech.volume = volume / 100;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    } else {
        alarmAudio.play().catch(e => console.log('Audio play failed:', e));
    }
}

function stopAlarmSound() {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio = null;
    }
    window.speechSynthesis.cancel();
}

function showAlarmNotification(alarm) {
    currentAlarm = alarm;
    const notification = document.getElementById('alarm-notification');
    const message = document.getElementById('alarm-message');

    message.textContent = `Alarm: ${alarm.name}`;
    notification.style.display = 'block';

    // Play alarm sound
    playAlarmSound(alarm.sound_type, alarm.volume);

    // Log to database
    apiService.logAlarm(alarm.id, 'triggered');
}

function hideAlarmNotification() {
    const notification = document.getElementById('alarm-notification');
    notification.style.display = 'none';
    stopAlarmSound();
    currentAlarm = null;
}

// Check for active alarms
function checkAlarms() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    activeAlarms.forEach(alarm => {
        if (!alarm.is_active || currentAlarm) return;

        const shouldTrigger =
            alarm.alarm_time === currentTime &&
            checkRepeatCondition(alarm.repeat_type, currentDay);

        if (shouldTrigger) {
            showAlarmNotification(alarm);
        }
    });
}

function checkRepeatCondition(repeatType, currentDay) {
    switch (repeatType) {
        case 'once': return true;
        case 'daily': return true;
        case 'weekdays': return currentDay >= 1 && currentDay <= 5; // Mon-Fri
        case 'weekends': return currentDay === 0 || currentDay === 6; // Sat-Sun
        default: return true;
    }
}

// Update UI functions
async function updateUI() {
    try {
        // Get user info first
        if (!currentUser) {
            currentUser = await apiService.getUserInfo();
        }
        
        document.getElementById('welcome-message').textContent =
            `Welcome back, ${currentUser.email}`;
        document.getElementById('user-role').textContent = currentUser.role;

        // Get alarms
        const alarmsData = await apiService.getAlarms();
        activeAlarms = alarmsData.data || [];
        const activeCount = activeAlarms.filter(a => a.is_active).length;

        document.getElementById('active-alarms-count').textContent = activeCount;
        document.getElementById('total-books-count').textContent = '0';  // Books not implemented yet

        renderAlarms(activeAlarms);

    } catch (error) {
        console.error('Error updating UI:', error);
        if (error.message === 'Unauthorized') {
            window.location.href = '/';  // Redirect to login
        }
    }
}

function renderAlarms(alarms) {
    const alarmListEl = document.getElementById('alarm-list');
    alarmListEl.innerHTML = '';

    if (alarms.length === 0) {
        alarmListEl.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No alarms set</p>';
        return;
    }

    alarms.forEach(alarm => {
        const alarmItem = document.createElement('div');
        alarmItem.className = `alarm-item ${alarm.is_active ? 'alarm-active' : 'alarm-inactive'}`;
        alarmItem.innerHTML = `
                    <div class="alarm-details">
                        <div class="alarm-title">${alarm.name}</div>
                        <div class="alarm-time">
                            ${alarm.alarm_time} - ${formatRepeatText(alarm.repeat_type)}
                            <br><small>Sound: ${alarm.sound_type} | Volume: ${alarm.volume}%</small>
                        </div>
                    </div>
                    <div class="alarm-actions">
                        <label class="toggle-switch">
                            <input type="checkbox" ${alarm.is_active ? 'checked' : ''} 
                                   onchange="toggleAlarm(${alarm.id}, this.checked)">
                            <span class="slider"></span>
                        </label>
                        <button class="action-btn delete-btn" onclick="deleteAlarm(${alarm.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        alarmListEl.appendChild(alarmItem);
    });
}

// Alarm control functions
async function toggleAlarm(alarmId, isActive) {
    try {
        const alarm = activeAlarms.find(a => a.id == alarmId);
        if (alarm) {
            await apiService.updateAlarm({
                ...alarm,
                is_active: isActive ? 1 : 0
            });
            await updateUI();
        }
    } catch (error) {
        alert('Error updating alarm: ' + error.message);
    }
}

async function deleteAlarm(alarmId) {
    if (confirm('Are you sure you want to delete this alarm?')) {
        try {
            await apiService.deleteAlarm(alarmId);
            await updateUI();
        } catch (error) {
            alert('Error deleting alarm: ' + error.message);
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    updateUI();

    // Update clock every second and check alarms
    setInterval(() => {
        const now = new Date();
        document.getElementById('current-time-display').textContent =
            now.toLocaleTimeString();
        checkAlarms();
    }, 1000);

    // Alarm form submission
    document.getElementById('alarm-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('alarm-name').value;
        const time = document.getElementById('alarm-time').value;
        const repeat = document.getElementById('alarm-days').value;
        const sound = document.querySelector('.sound-option.selected').dataset.sound;
        const volume = document.getElementById('alarm-volume').value;

        try {
            await apiService.createAlarm({
                name,
                alarm_time: time,
                repeat_type: repeat,
                sound_type: sound,
                volume: parseInt(volume)
            });
            await updateUI();
            this.reset();
            alert('Alarm added successfully!');
        } catch (error) {
            alert('Error adding alarm: ' + error.message);
        }
    });

    // Sound selection
    document.querySelectorAll('.sound-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Volume slider
    document.getElementById('alarm-volume').addEventListener('input', function () {
        document.getElementById('volume-value').textContent = this.value + '%';
    });

    // Alarm notification buttons
    document.getElementById('snooze-alarm').addEventListener('click', function () {
        if (currentAlarm) {
            apiService.logAlarm(currentAlarm.id, 'snoozed');
            // Implement snooze logic here (disable alarm for 5 minutes)
            setTimeout(() => {
                // Re-enable alarm after 5 minutes
            }, 5 * 60 * 1000);
        }
        hideAlarmNotification();
    });

    document.getElementById('dismiss-alarm').addEventListener('click', function () {
        if (currentAlarm) {
            apiService.logAlarm(currentAlarm.id, 'dismissed');
        }
        hideAlarmNotification();
    });

    // ... rest of your event listeners
});

// Format repeat text
function formatRepeatText(repeat) {
    switch (repeat) {
        case 'once': return 'Once';
        case 'daily': return 'Daily';
        case 'weekdays': return 'Weekdays';
        case 'weekends': return 'Weekends';
        default: return repeat;
    }
}