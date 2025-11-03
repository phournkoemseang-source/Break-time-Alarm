
// Stopwatch Logic
let swStart = 0, swElapsed = 0, swRunning = false, swInterval;

function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function updateStopwatch() {
    const now = Date.now();
    const elapsed = swElapsed + (swRunning ? now - swStart : 0);
    document.getElementById('stopwatchDisplay').textContent = formatTime(elapsed);
}

function startStopwatch() {
    if (!swRunning) {
        swStart = Date.now();
        swInterval = setInterval(updateStopwatch, 1000);
        swRunning = true;
    }
}

function pauseStopwatch() {
    if (swRunning) {
        clearInterval(swInterval);
        swElapsed += Date.now() - swStart;
        swRunning = false;
    }
}

function continueStopwatch() {
    if (!swRunning && swElapsed > 0) {
        swStart = Date.now();
        swInterval = setInterval(updateStopwatch, 1000);
        swRunning = true;
    }
}

function stopStopwatch() {
    clearInterval(swInterval);
    swRunning = false;
    swStart = 0;
    swElapsed = 0;
    document.getElementById('stopwatchDisplay').textContent = '00:00:00';
    document.getElementById('stopwatchLaps').innerHTML = '';
}

function lapStopwatch() {
    const now = Date.now();
    const elapsed = swElapsed + (swRunning ? now - swStart : 0);
    const lap = document.createElement('li');
    lap.textContent = formatTime(elapsed);
    document.getElementById('stopwatchLaps').appendChild(lap);
}

// Countdown Timer Logic
let cdDuration = 25 * 60 * 1000;
let cdRemaining = cdDuration;
let cdRunning = false;
let cdInterval;

function formatCountdown(ms) {
    const total = Math.floor(ms / 1000);
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function updateCountdown() {
    cdRemaining -= 1000;
    if (cdRemaining <= 0) {
        clearInterval(cdInterval);
        cdRemaining = 0;
        cdRunning = false;
    }
    document.getElementById('countdownDisplay').textContent = formatCountdown(cdRemaining);
}

function setTimer(minutes) {
    clearInterval(cdInterval);
    cdDuration = minutes * 60 * 1000;
    cdRemaining = cdDuration;
    cdRunning = false;
    document.getElementById('countdownDisplay').textContent = formatCountdown(cdRemaining);
    document.getElementById('countdownLaps').innerHTML = '';
}

function startCountdown() {
    if (!cdRunning && cdRemaining > 0) {
        cdInterval = setInterval(updateCountdown, 1000);
        cdRunning = true;
    }
}

function pauseCountdown() {
    if (cdRunning) {
        clearInterval(cdInterval);
        cdRunning = false;
    }
}

function resetCountdown() {
    clearInterval(cdInterval);
    cdRemaining = cdDuration;
    cdRunning = false;
    document.getElementById('countdownDisplay').textContent = formatCountdown(cdRemaining);
    document.getElementById('countdownLaps').innerHTML = '';
}

function lapCountdown() {
    const lap = document.createElement('li');
    lap.textContent = formatCountdown(cdRemaining);
    document.getElementById('countdownLaps').appendChild(lap);
}