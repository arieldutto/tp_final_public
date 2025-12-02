import React from 'react'
import OntsCard from '../components/OntsCard'
import DataList from '../../../components/DataList';
const personas = [
    { Id: 1, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 2, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 3, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 4, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 5, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 6, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 7, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 8, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 9, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 10, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 11, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
    { Id: 12, status: true, Abonado: "Abonado 1", Reporte: "2025-11-21 23:07:57", Productclass: "DN-HG8421A", Serie: "4857544396215740", Potencia: "-19.14 dbm", link: "ref" },
];

function OntsListPage() {
    return (
        <>
            <div className="container p-4">
                <div className="row g-4 justify-content-center">

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='ONT Sin Registrar'
                            tipo='primary'
                            textLine1='0'
                            textLine2='% de Equipos: 0.0'
                            icono={<i className="bi bi-info-circle-fill"></i>}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='ONT ON Line'
                            tipo='success'
                            textLine1='0'
                            textLine2='% de Equipos: 0.0'
                            icono={<i className="bi bi-check-circle-fill"></i>}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='ONT Señal Insuficiente'
                            tipo='warning'
                            textLine1='0'
                            textLine2='% de Equipos: 0.0'
                            icono={<i className="bi bi-exclamation-triangle-fill"></i>}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='Ont Fuera de Linea'
                            tipo='danger'
                            textLine1='0'
                            textLine2='% de Equipos: 0.0'
                            icono={<i className="bi bi-radioactive"></i>}
                        />
                    </div>

                </div>
            </div>
            <div className="container mt-5">
                <DataList data={personas} itemsPerPage={5} titulo='Listado de ONT' />
            </div>
        </>
    )
}

export default OntsListPage