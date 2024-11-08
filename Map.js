document.addEventListener("DOMContentLoaded", function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('search');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationContainer = document.getElementById('notificationContainer');
    const notificationContent = document.getElementById('notificationContent');
    const closeNotification = document.getElementById('closeNotification');
    const overlay = document.getElementById('overlay');
    const logoutBtn = document.getElementById('logoutBtn'); // Added logout button reference

    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    let notifications = [];
    let requestQueue = [];
    let isRequestProcessing = false;

    // Function to process the request queue
    async function processQueue() {
        if (isRequestProcessing || requestQueue.length === 0) return;

        isRequestProcessing = true;
        const notification = requestQueue.shift();

        try {
            await sendToServer(notification);
        } catch (error) {
            console.error("Failed to send request:", error);
        } finally {
            isRequestProcessing = false;
            if (requestQueue.length > 0) {
                setTimeout(processQueue, 1000); // Space out requests by 1 second
            }
        }
    }

    // Function to add a request to the queue
    function queueNotification(notification) {
        requestQueue.push(notification);
        processQueue(); // Start processing the queue
    }

    // Function to send event data to the server
    async function sendToServer(notification) {
        const serverUrl = 'http://localhost:3000/send-webhook';

        try {
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notification)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error Response from Server:', errorData);
                return;
            }

            const data = await response.json();
            console.log('Server Response:', data);
        } catch (error) {
            console.error('Network Error:', error);
        }
    }

    // Function to display notifications
    function displayNotifications() {
        if (!notificationContent) {
            console.error("Notification content element not found. Please check your HTML.");
            return; // Exit if the element is not found
        }
    
        // Retrieve stored login notifications from localStorage
        const storedLoginNotifications = JSON.parse(localStorage.getItem('loginNotifications')) || [];
        const locationNotifications = [...notifications]; // Existing location notifications
    
        // Create a single array to hold the notifications in the desired order
        const allNotifications = [...storedLoginNotifications, ...locationNotifications];
    
        // Sort notifications by timestamp, with the most recent first
        allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
        // If no notifications are available, show a blank notification area
        if (allNotifications.length === 0) {
            notificationContent.innerHTML = `<div class="notification-empty">No notifications available.</div>`;
            return;
        }
    
        // Display all notifications
        notificationContent.innerHTML = `
            <div>
                <h3>Notifications</h3>
                ${allNotifications.map(n => `
                    <div class="notification-item">
                        <strong>${n.action || 'Login'}:</strong> ${n.email || n.location || 'N/A'} 
                        <strong>Timestamp:</strong> ${n.timestamp} <br><br>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Search button click event listener
    searchBtn.addEventListener('click', async () => {
        if (overlay.style.display === 'block') {
            alert('Please close the notification before searching for another location.');
            return;
        }

        const location = searchInput.value.trim();
        if (!location) {
            alert('Please enter a location to search.');
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
            const data = await response.json();

            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;

                map.setView([lat, lon], 14);
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(data[0].display_name)
                    .openPopup();

                const notification = {
                    event: 'Location Search',
                    location: data[0].display_name,
                    timestamp: new Date().toISOString(),
                    latitude: lat,
                    longitude: lon
                };

                notifications.unshift(notification);
                queueNotification(notification);
                notificationBtn.style.display = 'block';
                displayNotifications();
            } else {
                alert('Location not found!');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    });

    // Notification button click event listener
    notificationBtn.addEventListener('click', () => {
        overlay.style.display = 'block';
        notificationContainer.style.display = 'block';
        displayNotifications(); // Refresh the notifications when the button is clicked
    });

    // Close notification event listener
    closeNotification.addEventListener('click', () => {
        notificationContainer.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Logout button click event listener
    logoutBtn.addEventListener('click', () => {
        // Clear notifications (both in localStorage and current session)
        localStorage.removeItem('loginNotifications'); // Clear stored login notifications
        notifications = []; // Clear current session notifications

        // Redirect to index.html
        window.location.href = 'index.html';

        // Reset notifications display (optional)
        notificationBtn.style.display = 'none'; // Hide the notification button if you want
        displayNotifications(); // Optionally clear notifications from the view
    });

    // Initial display of notifications on page load
    displayNotifications();
});
