import React, { useMemo } from 'react'
import OntsCard from '../components/OntsCard'
import DataList from '../../../components/DataList';
import { useOntAcsApi } from '../hooks/useOntAcsApi';
import '../styles/ontslist.css';

function OntsListPage() {
    const { statusBar, ontsList, loading, error } = useOntAcsApi();

    // Función para calcular el porcentaje
    const calcularPorcentaje = (cantidad, total) => {
        if (!total || total === 0) return 0;
        return ((cantidad / total) * 100).toFixed(1);
    };

    // Valores por defecto mientras carga o si hay error
    const statusData = statusBar || {
        unregister: 0,
        register: 0,
        devil: 0,
        offline: 0,
        contador: 0
    };

    const total = statusData.contador || 0;

    // Mapear los datos de la API al formato esperado por DataList
    const ontsDataFormatted = useMemo(() => {
        return ontsList.map(ont => ({
            Id: ont.id,
            Abonado: ont.abonado || 'Sin asignar',
            Estado: ont.RX_Estado === 'success' ? 'En línea' : ont.RX_Estado === 'danger' ? 'Señal baja' : 'Desconocido',
            Productclass: ont.productclass || '-',
            Serie: ont.serialnumber || '-',
            Potencia: ont.RX_Power !== null && ont.RX_Power !== undefined
                ? `${ont.RX_Power.toFixed(2)} dbm`
                : '-',
            Reporte: ont.ont_lastinform_local || '-'
        }));
    }, [ontsList]);

    return (
        <>
            <div className="container p-4">
                {loading && (
                    <div className="text-center text-light mb-4">
                        <p>Cargando datos...</p>
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        Error al cargar los datos: {error}
                    </div>
                )}
                <div className="row g-4 justify-content-center">

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='ONT Sin Registrar'
                            tipo='primary'
                            textLine1={statusData.unregister?.toString() || '0'}
                            textLine2={`% de Equipos: ${calcularPorcentaje(statusData.unregister || 0, total)}`}
                            icono={<i className="bi bi-info-circle-fill"></i>}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='ONT ON Line'
                            tipo='success'
                            textLine1={statusData.register?.toString() || '0'}
                            textLine2={`% de Equipos: ${calcularPorcentaje(statusData.register || 0, total)}`}
                            icono={<i className="bi bi-check-circle-fill"></i>}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='ONT Señal Insuficiente'
                            tipo='warning'
                            textLine1={statusData.devil?.toString() || '0'}
                            textLine2={`% de Equipos: ${calcularPorcentaje(statusData.devil || 0, total)}`}
                            icono={<i className="bi bi-exclamation-triangle-fill"></i>}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <OntsCard
                            titulo='Ont Fuera de Linea'
                            tipo='danger'
                            textLine1={statusData.offline?.toString() || '0'}
                            textLine2={`% de Equipos: ${calcularPorcentaje(statusData.offline || 0, total)}`}
                            icono={<i className="bi bi-radioactive"></i>}
                        />
                    </div>

                </div>
            </div>
            <div className="container mt-5">
                {loading ? (
                    <div className="text-center text-light">
                        <p>Cargando listado de ONTs...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">
                        Error al cargar el listado: {error}
                    </div>
                ) : (
                    <DataList
                        data={ontsDataFormatted}
                        itemsPerPage={10}
                        titulo='Listado de ONT'
                        getRowClassName={(row) => row.Estado === 'Señal baja' ? 'table-danger ont-signal-low' : ''}
                    />
                )}
            </div>
        </>
    )
}

export default OntsListPage