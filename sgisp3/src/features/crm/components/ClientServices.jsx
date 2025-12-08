import React from 'react'
import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";
import { useServicio } from '../hooks/useServicio';

function ClientServices(numclient) {
    // Llamo al hooks para traer los datos del cliente
    const { servicio: DatosArray, loading, error } = useServicio(numclient);
    console.log("Datos del cliente:", DatosArray, "Loading:", loading, "Error:", error, "Numero de Cliente:", numclient);

    const servicio = DatosArray && DatosArray.length > 0 ? DatosArray[0] : null;
    if (!servicio) return <p>No se encontró información de servicio.</p>;


    return (
        <>
            <div>
                <div>Servicio del Cliente</div>
                <p><strong>Framed:</strong> {servicio.framed}</p>
                <p><strong>Board:</strong> {servicio.board}</p>
                <p><strong>PON:</strong> {servicio.pon}</p>
                <p><strong>ONT ID:</strong> {servicio.ont_id}</p>
                <p><strong>Velocidad:</strong> {servicio.ont_mapping}</p>
                <p><strong>ONT Serial:</strong> {servicio.ont_sn}</p>
                <p><strong>ONT Vlan Internet:</strong> {servicio.ont_vlan}</p>
                <p><strong>ONT Vlan Management:</strong> {servicio.mng_vlan}</p>
            </div>
        </>
    )
}

export default ClientServices