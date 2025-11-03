// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const clockDisplay = document.querySelector('.current-time');
    const currentDate = document.querySelector('.current-date');
    const alarmForm = document.querySelector('#alarm-form');
    const alarmList = document.querySelector('#alarm-list');
    const modal = document.querySelector('#alarms-modal');
    const modalClose = document.querySelector('.close-btn');
    const quickAddAlarm = document.querySelector('.quick-actions .action-btn');
    const volumeSlider = document.querySelector('#alarm-volume');
    const volumeValue = document.querySelector('#volume-value');
    const soundOptions = document.querySelectorAll('.sound-option');

    // State
    let alarms = loadAlarms();
    let isAlarmRinging = false;
    let activeAlarm = null;
    let volume = 80;

    // Initialize the dashboard
    function init() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        setupEventListeners();
        updateStats();
        renderAlarms();
        initializeUI();
    }

    // Update Clock and Date
    function updateDateTime() {
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        
        if (currentDate) {
            currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);
        }
        
        if (clockDisplay) {
            clockDisplay.textContent = now.toLocaleTimeString('en-US', timeOptions);
        }

        checkAlarms(now);
    }

    // Event Listeners
    function setupEventListeners() {
        // Menu toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                document.querySelector('.main-content').classList.toggle('expanded');
            });
        }

        // Quick add alarm
        if (quickAddAlarm) {
            quickAddAlarm.addEventListener('click', () => {
                if (modal) {
                    modal.classList.add('show');
                }
            });
        }

        // Modal close
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Alarm form submission
        if (alarmForm) {
            alarmForm.addEventListener('submit', handleAlarmSubmit);
        }

        // Volume slider
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                volume = e.target.value;
                if (volumeValue) {
                    volumeValue.textContent = `${volume}%`;
                }
            });
        }

        // Sound options
        soundOptions.forEach(option => {
            option.addEventListener('click', () => {
                soundOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    // Initialize UI elements
    function initializeUI() {
        // Initialize volume slider
        if (volumeSlider) {
            volumeSlider.value = volume;
            if (volumeValue) {
                volumeValue.textContent = `${volume}%`;
            }
        }

        // Initialize stats
        updateStats();
        
        // Add hover effects to cards
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.classList.add('card-hover');
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('card-hover');
            });
        });

        // Initialize date range buttons
        document.querySelectorAll('.date-range button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.date-range button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                updateStats(button.textContent.toLowerCase());
            });
        });
    }

    // Alarm Functions
    function handleAlarmSubmit(e) {
        e.preventDefault();

        const name = e.target['alarm-name'].value;
        const time = e.target['alarm-time'].value;
        const days = e.target['alarm-days'].value;
        const sound = document.querySelector('.sound-option.selected').dataset.sound;

        if (!time) return;

        const alarm = {
            id: Date.now(),
            name: name || 'Alarm',
            time,
            days,
            sound,
            isActive: true,
            volume
        };

        alarms.push(alarm);
        saveAlarms();
        renderAlarms();
        updateStats();
        closeModal();
        e.target.reset();

        // Show success notification
        showNotification('Alarm set successfully', 'success');
    }

    function loadAlarms() {
        const savedAlarms = localStorage.getItem('alarms');
        return savedAlarms ? JSON.parse(savedAlarms) : [];
    }

    function saveAlarms() {
        localStorage.setItem('alarms', JSON.stringify(alarms));
    }

    function renderAlarms() {
        if (!alarmList) return;

        alarmList.innerHTML = '';
        
        if (alarms.length === 0) {
            alarmList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No alarms set</p>
                    <button class="card-btn" onclick="document.querySelector('.quick-actions .action-btn').click()">
                        Add Alarm
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            return;
        }

        alarms.forEach(alarm => {
            const alarmElement = document.createElement('div');
            alarmElement.className = 'alarm-item';
            alarmElement.innerHTML = `
                <div class="alarm-info">
                    <div class="alarm-time">${formatTime(alarm.time)}</div>
                    <div class="alarm-details">
                        <div class="alarm-name">${alarm.name}</div>
                        <div class="alarm-days">${formatDays(alarm.days)}</div>
                    </div>
                </div>
                <div class="alarm-actions">
                    <button class="alarm-toggle ${alarm.isActive ? '' : 'off'}" 
                            onclick="toggleAlarm(${alarm.id})" 
                            title="${alarm.isActive ? 'Disable' : 'Enable'} alarm">
                        <i class="fas fa-${alarm.isActive ? 'bell' : 'bell-slash'}"></i>
                    </button>
                    <button class="alarm-delete" 
                            onclick="deleteAlarm(${alarm.id})"
                            title="Delete alarm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            alarmList.appendChild(alarmElement);
        });
    }

    // Utility Functions
    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    }

    function formatDays(days) {
        const daysMap = {
            'once': 'Once',
            'daily': 'Every day',
            'weekdays': 'Mon-Fri',
            'weekends': 'Sat-Sun'
        };
        return daysMap[days] || days;
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Stats and Activity Functions
    function updateStats(timeRange = 'today') {
        const now = new Date();
        let stats = {
            studyTime: 0,
            completedTasks: 0,
            totalTasks: 0,
            activeAlarms: alarms.filter(a => a.isActive).length,
            upcomingAlarms: getUpcomingAlarms().length
        };

        // Simulate different stats for different time ranges
        switch(timeRange) {
            case 'week':
                stats.studyTime = 15.5;
                stats.completedTasks = 35;
                stats.totalTasks = 40;
                break;
            case 'month':
                stats.studyTime = 62.5;
                stats.completedTasks = 142;
                stats.totalTasks = 160;
                break;
            default: // today
                stats.studyTime = 2.5;
                stats.completedTasks = 8;
                stats.totalTasks = 10;
                break;
        }

        // Update study time card
        const studyTimeEl = document.querySelector('.study-time .main-stat');
        if (studyTimeEl) {
            studyTimeEl.textContent = `${stats.studyTime}h`;
        }

        // Update completed tasks card
        const tasksEl = document.querySelector('.completed-tasks .main-stat');
        if (tasksEl) {
            tasksEl.textContent = `${stats.completedTasks}/${stats.totalTasks}`;
            const progressBar = document.querySelector('.completed-tasks .progress');
            if (progressBar) {
                const percentage = (stats.completedTasks / stats.totalTasks) * 100;
                progressBar.style.width = `${percentage}%`;
            }
        }

        // Update active alarms in status badges
        document.querySelectorAll('.status-badge').forEach(badge => {
            const text = badge.querySelector('span');
            if (text && text.textContent.includes('Active')) {
                text.textContent = `${stats.activeAlarms} Active`;
            }
        });
    }

    function getUpcomingAlarms() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        return alarms.filter(alarm => {
            if (!alarm.isActive) return false;
            
            const [hours, minutes] = alarm.time.split(':').map(Number);
            const alarmTime = hours * 60 + minutes;
            
            if (alarm.days === 'once') {
                return alarmTime > currentTime;
            }
            
            return true; // For recurring alarms
        });
    }

    // Modal Functions
    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // Initialize the dashboard
    init();

    // Export functions that need to be accessed globally
    window.toggleAlarm = function(id) {
        const alarm = alarms.find(a => a.id === id);
        if (alarm) {
            alarm.isActive = !alarm.isActive;
            saveAlarms();
            renderAlarms();
            updateStats();
            showNotification(`Alarm ${alarm.isActive ? 'enabled' : 'disabled'}`, 'info');
        }
    };

    window.deleteAlarm = function(id) {
        const alarmIndex = alarms.findIndex(a => a.id === id);
        if (alarmIndex !== -1) {
            const alarm = alarms[alarmIndex];
            alarms.splice(alarmIndex, 1);
            saveAlarms();
            renderAlarms();
            updateStats();
            showNotification('Alarm deleted', 'info');
        }
    };
});