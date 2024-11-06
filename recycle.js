// Import Firebase and initialize it
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUmhpscBaunDzJGKgaerNSxBHFT7DSkak",
    authDomain: "sia101-activity2-royando-1bb64.firebaseapp.com",
    projectId: "sia101-activity2-royando-1bb64",
    storageBucket: "sia101-activity2-royando-1bb64.appspot.com",
    messagingSenderId: "733025203912",
    appId: "1:733025203912:web:56e033f569ec939e15d7fd",
    measurementId: "G-0ZXW04HXL9"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Firebase Auth instance to handle authentication
const auth = getAuth(app); // Pass the app instance

// Get the register button element from the HTML
const registerButton = document.getElementById('signup'); // Corrected ID

// Check if the register button exists
if (registerButton) {
    // Add an event listener to handle registration on button click
    registerButton.addEventListener("click", function(event) {
        // Prevent default form submission behavior
        event.preventDefault();

        // Get the email and password entered by the user
        const email = document.getElementById('email').value; // Corrected ID
        const password = document.getElementById('password').value; // Corrected ID

        // Register the user with Firebase Authentication
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // On successful registration, get the registered user's info
                const user = userCredential.user;

                // Show success message to the user
                alert(`Successfully registered! Welcome aboard!`);

                // Send a POST request to the Webhook URL with registration event details
                fetch('https://webhook.site/ead2cb77-952f-46d3-ac0c-3142617da501', {
                    method: 'POST', // Set the request method as POST
                    headers: {
                        'Content-Type': 'application/json', // Specify JSON content
                    },
                    // Create a JSON object with event details (registration event, email, timestamp)
                    body: JSON.stringify({
                        event: 'User Registration',
                        email: email,
                        timestamp: new Date().toISOString() // Current timestamp in ISO format
                    }),
                })
                .then(response => response.json()) // Parse the response to JSON
                .then(data => console.log('Webhook Success:', data)) // Log success response
                .catch((error) => console.error('Webhook Error:', error)); // Log any errors

                // Redirect the user to the map page after a short delay
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000); // 2 seconds delay for users to read the success message
            })
            .catch((error) => {
                // Handle registration errors and display error message to the user
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Error: ${errorMessage} (${errorCode})`);
            });
    });
}





login 

// Import Firebase and initialize it
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUmhpscBaunDzJGKgaerNSxBHFT7DSkak",
    authDomain: "sia101-activity2-royando-1bb64.firebaseapp.com",
    projectId: "sia101-activity2-royando-1bb64",
    storageBucket: "sia101-activity2-royando-1bb64.appspot.com",
    messagingSenderId: "733025203912",
    appId: "1:733025203912:web:56e033f569ec939e15d7fd",
    measurementId: "G-0ZXW04HXL9"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Firebase Auth instance to handle authentication
const auth = getAuth(app); // Pass the app instance

// Get the login button element from the HTML
const loginButton = document.getElementById('login-button');

// Check if the login button exists
if (loginButton) {
    // Add an event listener to handle login on button click
    loginButton.addEventListener("click", function(event) {
        // Prevent default form submission behavior
        event.preventDefault();

        // Get the email and password entered by the user
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Sign in the user with Firebase Authentication
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // On successful login, get the logged-in user's info
                const user = userCredential.user;

                // Show success message to the user
                alert(`Successfully logged in! Welcome back!`);

                // Send a POST request to the Webhook URL with login event details
                fetch('https://webhook.site/ead2cb77-952f-46d3-ac0c-3142617da501', {
                    method: 'POST', // Set the request method as POST
                    headers: {
                        'Content-Type': 'application/json', // Specify JSON content
                    },
                    // Create a JSON object with event details (login event, email, timestamp)
                    body: JSON.stringify({
                        event: 'User Login',
                        email: email,
                        timestamp: new Date().toISOString() // Current timestamp in ISO format
                    }),
                })
                .then(response => response.json()) // Parse the response to JSON
                .then(data => console.log('Success:', data)) // Log success response
                .catch((error) => console.error('Error:', error)); // Log any errors

                // Fetch notifications after successful login
                fetchNotifications(); // Call the fetchNotifications function

                // Redirect the user to the map page after login
                window.location.href = "map.html";
            })
            .catch((error) => {
                // Handle login errors and display error message to the user
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Error: ${errorMessage} (${errorCode})`);
            });
    });
}

// Function to fetch notifications from the webhook
function fetchNotifications() {
    // Fetch notifications from your webhook
    fetch('	https://webhook.site/ead2cb77-952f-46d3-ac0c-3142617da501') // Replace with your actual webhook URL
        .then(response => response.json())
        .then(data => {
            // Assuming data is an array of notification messages
            const notificationList = document.getElementById('notificationItems');
            notificationList.innerHTML = ''; // Clear previous notifications

            data.forEach(notification => {
                const li = document.createElement('li');
                li.textContent = notification.message; // Adjust this based on your data structure
                notificationList.appendChild(li);
            });

            // Optionally show the notification list
            const notificationContainer = document.getElementById('notificationList');
            notificationContainer.style.display = 'block';

            // Update badge count
            const badge = document.getElementById('notificationBadge');
            badge.textContent = data.length; // Update badge count to number of notifications
        })
        .catch(error => console.error('Error fetching notifications:', error));
}
