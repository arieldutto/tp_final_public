import React from 'react'
import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";
import { useOntSerial } from '../hooks/useOntSerial';

function RenderObject({ obj, level = 1 }) {
    // Si el objeto tiene "_value", mostrar solo eso
    if (obj && typeof obj === "object" && "_value" in obj) {
        return (
            <div style={{ marginLeft: level * 15 }}>
                <span>{obj._value}</span>
            </div>
        );
    }

    // Si no hay _value, recorrer normalmente
    return (
        <div style={{ marginLeft: level * 15 }}>
            {Object.entries(obj).map(([key, value]) => (
                <div key={key}>
                    <strong>{key}:</strong>

                    {typeof value === "object" && value !== null ? (
                        <RenderObject obj={value} level={level + 1} />
                    ) : (
                        <span> {String(value)}</span>
                    )}
                </div>
            ))}
        </div>
    );
}


function ClientOntData(ont_serial) {
    // Llamo al hooks para traer los datos del cliente
    const { ont_data: DatosArray, loading, error } = useOntSerial(ont_serial);
    console.log("Datos del cliente:", DatosArray, "Loading:", loading,
        "Error:", error,
        "Numero de ONT:", ont_serial);

    const ont_datos = DatosArray && DatosArray.length > 0 ? DatosArray[0] : null;
    if (!ont_datos) return <p>No se encontró información de servicio.</p>;


    return (
        <>
            {Object.entries(ont_datos).map(([groupName, groupObj]) => (
                <div key={groupName}>
                    <h2>{groupName}</h2>

                    <RenderObject obj={groupObj} />

                    <hr />
                </div>
            ))}
        </>
    )
}

export default ClientOntData