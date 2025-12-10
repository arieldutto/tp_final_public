import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "../styles/login.css"; //Importación de CSS personalizado

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Usuario:", email, "Contraseña:", password);
        // Aquí podrías hacer la petición a API (POST /login)
        const result = await loginUser(email, password);
        if (result.ok) {
            // 🔹 Guardar usuario en localStorage
            localStorage.setItem("user", JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName
            }));

            // Redirigir a la ruta privada
            navigate("/home"); // Si el login es correcto
        } else {
            setErrorMsg(result.error);
        }
    };
    return (
        <>
            <div className="container d-flex justify-content-center align-items-center">
                <div className='login-card'>
                    <h2 className="text-center mb-4">Acceso al Sistema</h2>
                    <form className="row g-3" onSubmit={handleSubmit}>
                        <label htmlFor="staticEmail2" className="">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="staticEmail2"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        >
                        </input>
                        <label htmlFor="inputPassword2" className="">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="inputPassword2"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        >
                        </input>
                        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

                        <button type="submit" className="btn btn-primary btn-login">Log in</button>
                        <a href='#'>Registrese</a>
                        <a href='#'>No recuerda su Password?</a>
                    </form>
                </div>
            </div>
        </>
    )
}
