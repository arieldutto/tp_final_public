// Servicio de autenticación de firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAieykD8NSKUHUngLtXvV59T9EVdnlMX3Q",
    authDomain: "my-sgisp3-auth.firebaseapp.com",
    projectId: "my-sgisp3-auth",
    storageBucket: "my-sgisp3-auth.firebasestorage.app",
    messagingSenderId: "777249873362",
    appId: "1:777249873362:web:10b7480b8a48440347bc0b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;