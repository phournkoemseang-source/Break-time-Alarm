const clock = document.getElementById('clock');
const alarmList = document.getElementById('alarms');
const setAlarmBtn = document.getElementById('setAlarmBtn');
const alarmSound = document.getElementById('alarmSound');
const themeSwitch = document.getElementById('themeSwitch');

// Unlock audio flag
let audioUnlocked = false;

let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let alarmPlaying = false;
let alarmTimeout = null;

// Fill dropdowns
for (let i = 1; i <= 12; i++) {
    hour.innerHTML += `<option value="${i}">${i}</option>`;
}
for (let i = 0; i < 60; i++) {
    const val = i < 10 ? '0' + i : i;
    minute.innerHTML += `<option value="${val}">${val}</option>`;
}

// Update time every second
setInterval(() => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    clock.innerText = currentTime;

    checkAlarm(`${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')} ${ampm}`);
}, 1000);

// If user clicks anywhere (or clicks the enable button) we try to unlock audio
function tryUnlockAudio() {
    if (!alarmSound) return;
    // Attempt a short play/pause to satisfy browser gesture requirement
    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        audioUnlocked = true;
        const btn = document.getElementById('enableSoundBtn');
        if (btn) btn.style.display = 'none';
    }).catch(() => {
        // still locked; show hint (UI already has a hint)
        audioUnlocked = false;
    });
}

document.addEventListener('click', function onFirstClick() {
    tryUnlockAudio();
    // remove this listener after first click
    document.removeEventListener('click', onFirstClick);
});

// Also bind to explicit enable button if present
const enableBtn = document.getElementById('enableSoundBtn');
if (enableBtn) {
    enableBtn.addEventListener('click', () => {
        tryUnlockAudio();
    });
}

// Add alarm
setAlarmBtn.addEventListener('click', () => {
    const hourVal = document.getElementById('hour').value;
    const minuteVal = document.getElementById('minute').value;
    const ampmVal = document.getElementById('ampm').value;
    const label = document.getElementById('alarmLabel').value || "No Label";

    const time = `${hourVal.padStart(2, '0')}:${minuteVal.padStart(2, '0')} ${ampmVal}`;
    alarms.push({ time, label, active: true });
    localStorage.setItem('alarms', JSON.stringify(alarms));
    renderAlarms();
});

// Render alarms
function renderAlarms() {
    alarmList.innerHTML = '';
    alarms.forEach((alarm, index) => {
        const icon = alarm.time.includes('AM') ? '☀️' : '🌙';
        alarmList.innerHTML += `
      <li class="alarm-item">
        <div class="alarm-info">
          <div><span class="icon">${icon}</span><strong>${alarm.time}</strong></div>
          <small>${alarm.label}</small>
        </div>
        <label class="switch">
          <input type="checkbox" ${alarm.active ? 'checked' : ''} data-index="${index}">
          <span class="slider"></span>
        </label>
      </li>
    `;
    });
}

// Check alarm time and play sound
function checkAlarm(currentShortTime) {
    alarms.forEach(alarm => {
        if (alarm.time === currentShortTime && alarm.active && !alarmPlaying) {
            alarmSound.currentTime = 0;
            // Try to play; if blocked, notify via console and keep trying once audioUnlocked
            alarmSound.play().then(() => {
                // playing
            }).catch(() => {
                console.log("Audio playback blocked by browser. User interaction required to enable sound.");
            });
            alarmPlaying = true;

            // Auto stop after 10 seconds
            clearTimeout(alarmTimeout);
            alarmTimeout = setTimeout(() => {
                alarmSound.pause();
                alarmPlaying = false;
            }, 10000);
        }
    });
}

// Toggle alarm on/off manually
alarmList.addEventListener('change', e => {
    if (e.target.type === 'checkbox') {
        const index = e.target.dataset.index;
        alarms[index].active = e.target.checked;
        localStorage.setItem('alarms', JSON.stringify(alarms));
        if (!e.target.checked) {
            alarmSound.pause();
            alarmPlaying = false;
            clearTimeout(alarmTimeout);
        }
    }
});

// Delete alarm
alarmList.addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const index = e.target.dataset.index;
        alarms.splice(index, 1); // remove from array
        localStorage.setItem('alarms', JSON.stringify(alarms));
        renderAlarms(); // refresh list
    }
});


// Theme toggle (light/dark)
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('light');
});

renderAlarms();

function renderAlarms() {
    alarmList.innerHTML = '';
    alarms.forEach((alarm, index) => {
        const icon = alarm.time.includes('AM') ? '☀️' : '🌙';
        alarmList.innerHTML += `
      <li class="alarm-item">
        <div class="alarm-info">
          <div><span class="icon">${icon}</span><strong>${alarm.time}</strong></div>
          <small>${alarm.label}</small>
        </div>
        <div class="alarm-controls">
          <label class="switch">
            <input type="checkbox" ${alarm.active ? 'checked' : ''} data-index="${index}">
            <span class="slider"></span>
          </label>
          <button class="delete-btn" data-index="${index}">🗑️</button>
        </div>
      </li>
    `;
    });
}

