import React from 'react'
import "./header.css"
import DropdownMenu from '../DropdownMenu'
import { signOut } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { auth } from '../../services/firebase';

function Header() {
    const { user } = useAuth();
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log("Sesión cerrada.");
            })
            .catch(error => {
                console.error("Error al cerrar sesión:", error);
            });
    };
    return (
        <>
            <header>
                <nav className="navbar navbar-dark bg-primary navbar-expand-lg glass-nav">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="#">SGISP 3</a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarScroll">
                            <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
                                <li className="nav-item">
                                    <a className="nav-link active" aria-current="page" href="/home">Home</a>
                                </li>
                                <DropdownMenu
                                    title="Abonados"
                                    items={[
                                        { label: "Crear Abonado", href: "/clientes" },
                                        { label: "Listado de Abonados", href: "/clientes" },
                                        { label: "Clientes Cards", href: "/clientescard" }
                                    ]}
                                />
                                <DropdownMenu
                                    title="Infraestructura"
                                    items={[
                                        { label: "NAS server", href: "/construccion" },
                                        { label: "Gestion de Red", href: "/construccion" },
                                        { label: "Gestion IP Publicas", href: "/construccion" }
                                    ]}
                                />
                                <DropdownMenu
                                    title="OLT"
                                    items={[
                                        { label: "OLT", href: "/construccion" },
                                        { label: "Configuraciones", href: "/construccion" },
                                        { label: "Tablas de trafico", href: "/construccion" }
                                    ]}
                                />
                                <DropdownMenu
                                    title="ONT"
                                    items={[
                                        { label: "Buscar ONT", href: "/construccion" },
                                        { label: "Listado de ONT", href: "/ont_list" },
                                        { label: "Configuraciones", href: "/construccion" },
                                        { label: "Tablas de trafico", href: "/construccion" }
                                    ]}
                                />
                                <DropdownMenu
                                    title="Server"
                                    items={[
                                        { label: "Estado Server", href: "/dashboard" },
                                        { label: "Backup", href: "/construccion" },
                                        { label: "Configuraciones", href: "/construccion" }
                                    ]}
                                />
                                <li className="nav-item">
                                    <a className="nav-link active" aria-current="page" href="/about">Acerca de ...</a>
                                </li>
                            </ul>
                            <div className='end'>
                                <DropdownMenu
                                    title={user ? user.email : "Usuario"}
                                    items={[
                                        { label: "Log In", href: "/" },
                                        { label: "Sig In", href: "/" },
                                        { label: "Cerrar Sessión", action: handleLogout }
                                    ]}
                                    icon="bi-person-circle"
                                />
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    )
}

export default Header