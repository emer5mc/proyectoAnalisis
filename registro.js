import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAkvBQuwKf5Itf2wpos3VeImgTYDWf3B7A",
    authDomain: "calendario-8809d.firebaseapp.com",
    projectId: "calendario-8809d",
    storageBucket: "calendario-8809d.firebasestorage.app",
    messagingSenderId: "151836369050",
    appId: "1:151836369050:web:611b8042ee89954e603f23"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos del DOM
const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

// Registrar usuario
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Usuario registrado:", userCredential.user);
            window.location.href = "calendario.html"; // Redirigir a calendario.html
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
        });
});
