import React from 'react'
import "./header.css"
import DropdownMenu from '../DropdownMenu'
function Header() {
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
                                        { label: "NAS server", href: "/materiales" },
                                        { label: "Gestion de Red", href: "/movimientos" },
                                        { label: "Gestion IP Publicas", href: "/movimientos" }
                                    ]}
                                />
                                <DropdownMenu
                                    title="OLT"
                                    items={[
                                        { label: "OLT", href: "/materiales" },
                                        { label: "Configuraciones", href: "/movimientos" },
                                        { label: "Tablas de trafico", href: "/movimientos" }
                                    ]}
                                />
                                <DropdownMenu
                                    title="ONT"
                                    items={[
                                        { label: "Buscar ONT", href: "/materiales" },
                                        { label: "Listado de ONT", href: "/ont_list" },
                                        { label: "Configuraciones", href: "/movimientos" },
                                        { label: "Tablas de trafico", href: "/movimientos" }
                                    ]}
                                />
                                <DropdownMenu
                                    title="Server"
                                    items={[
                                        { label: "Estado Server", href: "/dashboard" },
                                        { label: "Backup", href: "/movimientos" },
                                        { label: "Configuraciones", href: "/movimientos" }
                                    ]}
                                />
                                <li className="nav-item">
                                    <a className="nav-link active" aria-current="page" href="/about">Acerca de ...</a>
                                </li>
                            </ul>
                            <div className='end'>
                                <DropdownMenu
                                    title="Usuario"
                                    items={[
                                        { label: "Log In", href: "/materiales" },
                                        { label: "Sig In", href: "/movimientos" },
                                        { label: "Configuraciones", href: "/movimientos" }
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