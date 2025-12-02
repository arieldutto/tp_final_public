import React from 'react'
import GraficoConsumo from '../../components/GraficoConsumo'
import { useServerCpu } from "./hooks/useServerCpu"
import { useServerMem } from './hooks/useServerMem'
import CardBase from '../../components/CardBase'
function DashboardServer() {
    return (
        <>
            <div className='container p-4'>
                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                        <CardBase titulo='Consumo de CPU'
                            tipo='primary'
                            icono={<i className="bi bi-cpu-fill"></i>}
                            contenido={<GraficoConsumo data={useServerCpu()} />} />
                    </div>
                    <div className="col-12 col-sm-6 col-md-6 col-lg-6">
                        <CardBase titulo='Consumo de Memoria'
                            tipo='primary'
                            icono={<i className="bi bi-memory"></i>}
                            contenido={<GraficoConsumo data={useServerMem()} />} />
                    </div>
                </div>

            </div>
        </>
    )
}

export default DashboardServer