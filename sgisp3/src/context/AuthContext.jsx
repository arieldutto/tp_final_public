// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);       // usuario de Firebase (null si no hay)
    const [loading, setLoading] = useState(true); // evita parpadeos mientras verificamos

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // opcional: obtener token para usar en backend
                const token = await getIdToken(firebaseUser);
                // Puedes enriquecer el objeto user si querés
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    token, // token JWT de Firebase ID (válido para intercambio con backend)
                    raw: firebaseUser, // si necesitás el objeto completo
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            { /* Esperamos hasta que loading sea false para renderizar hijos */}
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}