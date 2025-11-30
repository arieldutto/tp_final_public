// src/features/auth/services/authService.js
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../../services/firebase";

export async function loginUser(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return {
            ok: true,
            user: result.user
        };
    } catch (error) {
        console.error("Error al iniciar sesión:", error);

        return {
            ok: false,
            error: mapFirebaseError(error.code)
        };
    }
}

export async function logoutUser() {
    await signOut(auth);
}

function mapFirebaseError(code) {
    const errors = {
        "auth/user-not-found": "El usuario no existe",
        "auth/wrong-password": "Contraseña incorrecta",
        "auth/invalid-email": "Formato de email inválido",
        "auth/missing-password": "Debes ingresar una contraseña"
    };

    return errors[code] || "Error desconocido al iniciar sesión";
}