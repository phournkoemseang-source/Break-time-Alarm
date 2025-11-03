
// Current date information
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Month names
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Day names
const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// DOM elements
const currentMonthElement = document.getElementById('current-month');
const calendarDaysElement = document.getElementById('calendar-days');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const todayButton = document.getElementById('today-btn');

// Time display elements
const localTimeElement = document.getElementById('local-time');
const localDateElement = document.getElementById('local-date');
const cambodiaTimeElement = document.getElementById('cambodia-time');
const cambodiaDateElement = document.getElementById('cambodia-date');
const newyorkTimeElement = document.getElementById('newyork-time');
const newyorkDateElement = document.getElementById('newyork-date');
const londonTimeElement = document.getElementById('london-time');
const londonDateElement = document.getElementById('london-date');

// Initialize calendar
function initCalendar() {
    updateCalendar();
    updateTimeDisplays();
    setInterval(updateTimeDisplays, 1000);
}

// Update calendar display
function updateCalendar() {
    // Update month and year display
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Clear previous calendar days
    calendarDaysElement.innerHTML = '';

    // Get first day of month and number of days in month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get number of days in previous month
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Add days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day', 'other-month');
        dayElement.textContent = daysInPrevMonth - i;
        calendarDaysElement.appendChild(dayElement);
    }

    // Add days from current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');

        // Check if this is the current day
        if (i === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()) {
            dayElement.classList.add('current-day');
        }

        dayElement.textContent = i;
        calendarDaysElement.appendChild(dayElement);
    }

    // Calculate how many days from next month to add
    const totalCells = 42; // 6 rows x 7 days
    const daysSoFar = firstDay + daysInMonth;
    const daysFromNextMonth = totalCells - daysSoFar;

    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day', 'other-month');
        dayElement.textContent = i;
        calendarDaysElement.appendChild(dayElement);
    }
}

// Update time displays for different time zones
function updateTimeDisplays() {
    const now = new Date();

    // Local time
    localTimeElement.textContent = now.toLocaleTimeString();
    localDateElement.textContent = formatDate(now);

    // Cambodia time (UTC+7)
    const cambodiaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    cambodiaTimeElement.textContent = cambodiaTime.toUTCString().split(' ')[4];
    cambodiaDateElement.textContent = formatDate(cambodiaTime);

    // New York time (UTC-4 or UTC-5 depending on DST)
    const newYorkTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    newyorkTimeElement.textContent = newYorkTime.toLocaleTimeString();
    newyorkDateElement.textContent = formatDate(newYorkTime);

    // London time (UTC+0 or UTC+1 depending on DST)
    const londonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
    londonTimeElement.textContent = londonTime.toLocaleTimeString();
    londonDateElement.textContent = formatDate(londonTime);
}

// Format date as "Day, Month Date, Year"
function formatDate(date) {
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Event listeners for navigation
prevMonthButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
});

todayButton.addEventListener('click', () => {
    currentDate = new Date();
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();
    updateCalendar();
});

// Initialize the calendar when page loads
window.onload = initCalendar;