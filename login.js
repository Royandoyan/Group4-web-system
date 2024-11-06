import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Flag to prevent duplicate notifications
let loginInProgress = false;

// Function to handle login and store notifications
// Function to handle login and store notifications
async function handleLogin(email) {
    if (loginInProgress) return; // Prevent duplicate login actions
    loginInProgress = true;

    const notification = {
        action: 'Login',
        email: email,
        message: 'Login successfully',
        timestamp: new Date().toISOString(),
        uniqueId: Date.now()
    };

    // Send POST request to your Node.js server for login notifications
    try {
        const response = await axios.post('http://localhost:3000/send-webhook', notification);
        console.log('Login notification sent to server:', response.data);
    } catch (error) {
        console.error('Error sending login notification to server:', error);
    }

    // Store only the latest login notification in localStorage
    localStorage.setItem('loginNotifications', JSON.stringify([notification])); // Only store the new login notification

    // Log to confirm it's stored
    console.log("Login Notifications Stored:", JSON.parse(localStorage.getItem('loginNotifications')));

    // Show a success message
    showMessage('Login successful! Redirecting...', () => {
        window.location.href = "map.html"; // Redirect to map page
    });
}



// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationContainer = document.getElementById('notificationContainer');
    const overlay = document.getElementById('overlay');
    const closeNotification = document.getElementById('closeNotification');
    const loginButton = document.getElementById('login-button');

    // Login button event listener
    if (loginButton) {
        loginButton.addEventListener("click", function(event) {
            event.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    handleLogin(user.email);
                })
                .catch((error) => {
                    console.error("Error logging in:", error);
                    showMessage("Wrong email or password.", clearInputs);
                });
        });
    }

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            overlay.style.display = 'block';
            notificationContainer.style.display = 'block';
            displayNotifications();
        });
    }

    if (closeNotification) {
        closeNotification.addEventListener('click', () => {
            notificationContainer.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
});

// Function to display notifications
function displayNotifications() {
    const notificationContent = document.getElementById('notificationContent');
    if (!notificationContent) {
        console.error("Notification content element not found. Please check your HTML.");
        return;
    }

    const storedNotifications = JSON.parse(localStorage.getItem('loginNotifications')) || [];
    notificationContent.innerHTML = storedNotifications.map(n => `
        <div class="notification-item">
            <strong>Action:</strong> ${n.action} 
            <strong>Email:</strong> ${n.email} 
            <strong>Message:</strong> ${n.message} 
            <strong>Timestamp:</strong> ${n.timestamp} 
            <strong>Unique ID:</strong> ${n.uniqueId} <br><br>
        </div>
    `).join('');
}

// Function to show a message with an optional callback
function showMessage(message, callback) {
    const messageContainer = document.getElementById('messageContainer');
    const messageText = document.getElementById('messageText');
    messageText.textContent = message;
    messageContainer.style.display = 'block';

    const okButton = document.getElementById('okButton');
    if (okButton) {
        okButton.onclick = () => {
            messageContainer.style.display = 'none';
            if (callback) callback();
        };
    } else {
        console.error("OK button not found.");
    }
}

// Optional: Clear input fields
function clearInputs() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}
