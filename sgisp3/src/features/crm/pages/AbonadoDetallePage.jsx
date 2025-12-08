import React from 'react'
import { useParams } from "react-router-dom";
import ClientsDetail from "../components/ClientsDetail";

function AbonadoDetallePage() {
    const { id } = useParams();

    return (
        <>
            <div className="container py-4">
                <ClientsDetail idCliente={id} />
            </div>
        </>
    )
}

export default AbonadoDetallePage