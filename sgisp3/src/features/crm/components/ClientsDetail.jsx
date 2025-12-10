// Detalles del cliente 

import React, { useState } from "react";
import "./clientsdetail.css";
import { useCliente } from "../hooks/useCliente";
import { useServicio } from "../hooks/useServicio";
import { useClienteCompleto } from "../hooks/useClienteCompleto";
// importo los componentes con los contenidos de las tabs
import ClientInfo from "./ClientInfo";
import ClientServices from "./ClientServices";
import ClientOntData from "./ClientOntData";

function ClientsDetail({ idCliente }) {
    // Llamo al hooks para traer los datos del cliente
    //const { cliente: datos, loading, error } = useCliente(idCliente);
    const { infocliente, loading, error } = useClienteCompleto(idCliente);

    // Estado para manejar las tabs 
    const [activeTab, setActiveTab] = useState("info");
    // Agrego un log para ver que hace mi función
    console.log("Datos desde el hooks:", infocliente,
        "Loading:", loading,
        "Error:", error,
        "cliente:", idCliente);

    if (loading) return <p>Cargando datos del cliente...</p>;
    if (error) return <p>Error al cargar el cliente.</p>;
    if (!infocliente) return <p>No se encontró el cliente.</p>;
    const cliente = infocliente.cliente;
    const servicios = infocliente.servicios[0];
    const serie = infocliente.serie;
    console.log("Datos desde el hooks servicios:", servicios)
    // Función para renderizar el componente activo
    const renderTabContent = () => {
        switch (activeTab) {
            case "info":
                // Le pasamos los props que necesita (datos, idCliente)
                return <ClientInfo datos={cliente} idCliente={idCliente} />;
            case "servicios":
                // Le pasamos los datos si los necesita
                return <ClientServices numclient={idCliente} />;
            case "ont":
                // Le pasamos el idCliente
                return <ClientOntData ont_serial={serie} />;
            default:
                return null;
        }
    };
    return (
        <>
            <div className="container py-4">
                <h2 className="mb-4 text-light">
                    Detalles del Cliente: {cliente?.Razonsocial}
                </h2>

                <div className="card shadow-lg rounded-4 p-4 bg-light bg-opacity-75">
                    {/*Navegación con pestañas  */}
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${activeTab === "info" ? "active" : ""}`}
                                onClick={() => setActiveTab("info")}
                            >
                                Info
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${activeTab === "servicios" ? "active" : ""}`}
                                onClick={() => setActiveTab("servicios")}

                            >
                                Servicios
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#"
                                className={`nav-link ${activeTab === "ont" ? "active" : ""}`}
                                onClick={() => setActiveTab("ont")}

                            >
                                ONT
                            </a>
                        </li>
                    </ul>

                    {/*Tabs con el contenido */}
                    <div className="tab-content p-3">
                        {/* renderizamos el contenido activo */}
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ClientsDetail;