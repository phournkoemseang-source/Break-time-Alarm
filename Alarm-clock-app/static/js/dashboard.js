document.addEventListener('DOMContentLoaded', function() {
    // Update date and time
    function updateDateTime() {
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        
        document.querySelector('.current-date').textContent = now.toLocaleDateString('en-US', dateOptions);
        document.querySelectorAll('.current-time').forEach(el => {
            el.textContent = now.toLocaleTimeString('en-US', timeOptions);
        });
    }

    // Initialize date/time updates
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Profile dropdown toggle
    function setupProfileDropdown() {
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const dropdownMenu = document.getElementById('profileMenu');
        
        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            document.addEventListener('click', function(e) {
                if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    }

    // Sidebar toggle
    function setupSidebarToggle() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (menuToggle && sidebar && mainContent) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            });
        }
    }

    // Initialize all interactive components
    setupProfileDropdown();
    setupSidebarToggle();

    // Add smooth transitions for cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('card-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('card-hover');
        });
    });

    // Update stats through API
    function updateDashboardStats() {
        fetch('/api/study-sessions')
            .then(response => response.json())
            .then(data => {
                // Update session stats
                const todaySessionsEl = document.querySelector('.today-sessions');
                if (todaySessionsEl) {
                    todaySessionsEl.textContent = `${data.today_count || 0} Sessions Today`;
                }
            });

        fetch('/api/alarms')
            .then(response => response.json())
            .then(data => {
                // Update alarm stats
                const activeAlarmsEl = document.querySelector('.active-alarms');
                if (activeAlarmsEl) {
                    activeAlarmsEl.textContent = `${data.data.filter(a => a.is_active).length} Active Alarms`;
                }
            });
    }

    // Initial stats update
    updateDashboardStats();
    // Update stats every 5 minutes
    setInterval(updateDashboardStats, 300000);
});