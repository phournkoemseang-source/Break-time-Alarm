// Create hour markers and numbers
function createClockFace() {
    const clockFace = document.querySelector('.clock-face');

    for (let i = 0; i < 12; i++) {
        // Create hour markers
        const marker = document.createElement('div');
        marker.className = 'hour-marker';
        marker.style.transform = `rotate(${i * 30}deg)`;
        clockFace.appendChild(marker);

        // Create numbers
        const number = document.createElement('div');
        number.className = 'number';
        number.textContent = i === 0 ? 12 : i;

        // Position numbers around the clock
        const angle = i * 30;
        const radius = 110;
        const x = Math.sin(angle * Math.PI / 180) * radius;
        const y = -Math.cos(angle * Math.PI / 180) * radius;

        number.style.transform = `translate(${x}px, ${y}px)`;
        clockFace.appendChild(number);
    }

    // Create clock hands
    const hourHand = document.createElement('div');
    hourHand.className = 'hand hour-hand';
    clockFace.appendChild(hourHand);

    const minuteHand = document.createElement('div');
    minuteHand.className = 'hand minute-hand';
    clockFace.appendChild(minuteHand);

    const secondHand = document.createElement('div');
    secondHand.className = 'hand second-hand';
    clockFace.appendChild(secondHand);
}

// Update clock hands and digital time
function updateClock() {
    const now = new Date();

    // Get time components
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // Calculate angles for hands
    const secondAngle = (seconds + milliseconds / 1000) * 6; // 360/60 = 6 degrees per second
    const minuteAngle = (minutes + seconds / 60) * 6; // 360/60 = 6 degrees per minute
    const hourAngle = (hours + minutes / 60) * 30; // 360/12 = 30 degrees per hour

    // Update hand positions
    document.querySelector('.hour-hand').style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
    document.querySelector('.minute-hand').style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
    document.querySelector('.second-hand').style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;

    // Update digital time
    const formattedHours = String(now.getHours()).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    document.getElementById('digitalTime').textContent =
        `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');

    if (body.classList.contains('dark')) {
        body.classList.remove('dark');
        body.classList.add('light');
        themeToggle.textContent = 'Dark';
    } else {
        body.classList.remove('light');
        body.classList.add('dark');
        themeToggle.textContent = 'Light';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    // Create clock face
    createClockFace();

    // Set initial time
    updateClock();

    // Update clock every 50ms for smooth animation
    setInterval(updateClock, 50);

    // Add event listener to theme toggle button
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});