import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useEstadisticasOnt } from '../hooks/useEstadisticasOnt';
import './estadisticasont.css';

// Constantes de capacidad
const CAPACIDAD_MAX_PON = 64; // Máximo de ONTs por puerto PON
const CAPACIDAD_MAX_BOARD = 16; // Máximo de puertos PON por board
const CAPACIDAD_MAX_FRAME = 15; // Máximo de boards por frame

function EstadisticasOnt() {
    const { estadisticas, loading, error } = useEstadisticasOnt();

    // Colores para gráficas
    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

    // Datos para gráfica de ONT por Frame
    const datosPorFrame = useMemo(() => {
        if (!estadisticas?.data) return [];
        return estadisticas.data.map(frame => {
            const capacidadMaxFrame = frame.total_boards * CAPACIDAD_MAX_BOARD * CAPACIDAD_MAX_PON;
            const usoPorcentual = capacidadMaxFrame > 0 ? ((frame.total_onts / capacidadMaxFrame) * 100).toFixed(1) : 0;
            return {
                name: `Frame ${frame.framed}`,
                ont: frame.total_onts,
                boards: frame.total_boards,
                pons: frame.total_pons,
                capacidadMax: capacidadMaxFrame,
                uso: parseFloat(usoPorcentual),
                disponibles: capacidadMaxFrame - frame.total_onts
            };
        });
    }, [estadisticas]);

    // Datos para gráfica de distribución por Board
    const datosPorBoard = useMemo(() => {
        if (!estadisticas?.data) return [];
        const boardData = [];
        estadisticas.data.forEach(frame => {
            frame.boards.forEach(board => {
                const capacidadMaxBoard = board.total_pons * CAPACIDAD_MAX_PON;
                const usoPorcentual = capacidadMaxBoard > 0 ? ((board.total_onts / capacidadMaxBoard) * 100).toFixed(1) : 0;
                boardData.push({
                    name: `F${frame.framed}/B${board.board}`,
                    ont: board.total_onts,
                    pons: board.total_pons,
                    capacidadMax: capacidadMaxBoard,
                    uso: parseFloat(usoPorcentual),
                    disponibles: capacidadMaxBoard - board.total_onts
                });
            });
        });
        return boardData.sort((a, b) => b.ont - a.ont);
    }, [estadisticas]);

    // Datos para gráfica de uso de PONs
    // Agrupar correctamente: cada PON debe mostrarse individualmente con su Frame/Board/PON
    const datosPorPon = useMemo(() => {
        if (!estadisticas?.data) return [];
        const ponData = [];
        
        // Iterar sobre cada frame
        estadisticas.data.forEach(frame => {
            // Iterar sobre cada board del frame
            frame.boards.forEach(board => {
                // Iterar sobre cada PON del board
                board.pons.forEach(pon => {
                    const usoPorcentual = ((pon.total_onts / CAPACIDAD_MAX_PON) * 100).toFixed(1);
                    ponData.push({
                        nombre: `F${frame.framed}/B${board.board}/P${pon.pon}`,
                        frame: frame.framed,
                        board: board.board,
                        pon: pon.pon,
                        ont: pon.total_onts,
                        capacidad: CAPACIDAD_MAX_PON,
                        disponibles: CAPACIDAD_MAX_PON - pon.total_onts,
                        uso: parseFloat(usoPorcentual),
                        // Información adicional para debugging
                        frameId: frame.framed,
                        boardId: board.board,
                        ponId: pon.pon
                    });
                });
            });
        });
        
        // Ordenar por Frame, luego Board, luego PON (orden jerárquico)
        return ponData.sort((a, b) => {
            if (a.frame !== b.frame) return a.frame.localeCompare(b.frame);
            if (a.board !== b.board) return a.board.localeCompare(b.board);
            return a.pon.localeCompare(b.pon);
        });
    }, [estadisticas]);

    if (loading) {
        return (
            <div className="estadisticas-ont-container">
                <div className="text-center text-light py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p>Cargando estadísticas de la OLT...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="estadisticas-ont-container">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Error al cargar las estadísticas: {error}
                </div>
            </div>
        );
    }

    if (!estadisticas || !estadisticas.data || estadisticas.data.length === 0) {
        return (
            <div className="estadisticas-ont-container">
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay datos de estadísticas disponibles.
                </div>
            </div>
        );
    }

    const resumen = estadisticas.resumen;

    return (
        <div className="estadisticas-ont-container">
            <div className="estadisticas-ont-card">
                <div className="estadisticas-ont-header">
                    <div className="d-flex align-items-center">
                        <div className="estadisticas-ont-icon me-3">
                            <i className="bi bi-graph-up-arrow"></i>
                        </div>
                        <div>
                            <h3 className="mb-0">Estadísticas de Uso de la OLT</h3>
                            <small className="text-muted">Visualización de recursos: Frame → Board → PON → ONT</small>
                        </div>
                    </div>
                </div>

                <div className="estadisticas-ont-body">
                    {/* Resumen General */}
                    <div className="estadisticas-resumen-grid mb-4">
                        <div className="estadistica-resumen-item">
                            <div className="estadistica-resumen-icon">
                                <i className="bi bi-server"></i>
                            </div>
                            <div className="estadistica-resumen-content">
                                <span className="estadistica-resumen-label">Frames</span>
                                <span className="estadistica-resumen-value">{resumen.total_framed}</span>
                                <small className="text-muted d-block">Máximo: Ilimitado</small>
                            </div>
                        </div>
                        <div className="estadistica-resumen-item">
                            <div className="estadistica-resumen-icon">
                                <i className="bi bi-motherboard"></i>
                            </div>
                            <div className="estadistica-resumen-content">
                                <span className="estadistica-resumen-label">Boards</span>
                                <span className="estadistica-resumen-value">{resumen.total_boards}</span>
                                <small className="text-muted d-block">Max por Frame: {CAPACIDAD_MAX_FRAME}</small>
                            </div>
                        </div>
                        <div className="estadistica-resumen-item">
                            <div className="estadistica-resumen-icon">
                                <i className="bi bi-router"></i>
                            </div>
                            <div className="estadistica-resumen-content">
                                <span className="estadistica-resumen-label">Puertos PON</span>
                                <span className="estadistica-resumen-value">{resumen.total_pons}</span>
                                <small className="text-muted d-block">Max por Board: {CAPACIDAD_MAX_BOARD}</small>
                            </div>
                        </div>
                        <div className="estadistica-resumen-item">
                            <div className="estadistica-resumen-icon">
                                <i className="bi bi-wifi"></i>
                            </div>
                            <div className="estadistica-resumen-content">
                                <span className="estadistica-resumen-label">Total ONTs</span>
                                <span className="estadistica-resumen-value">{resumen.total_onts.toLocaleString()}</span>
                                <small className="text-muted d-block">Max por PON: {CAPACIDAD_MAX_PON}</small>
                            </div>
                        </div>
                    </div>

                    {/* Gráfica de ONT por Frame */}
                    <div className="estadisticas-chart-section mb-4">
                        <h5 className="mb-3">
                            <i className="bi bi-bar-chart-fill me-2"></i>
                            Distribución de ONTs por Frame
                        </h5>
                        <div style={{ width: '100%', height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={datosPorFrame}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                                    />
                                    <YAxis 
                                        tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                                        label={{ value: 'Cantidad de ONTs', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.8)' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        formatter={(value, name) => {
                                            if (name === 'ont') return [`${value.toLocaleString()} ONTs`, 'Conectadas'];
                                            if (name === 'capacidadMax') return [`${value.toLocaleString()} ONTs`, 'Capacidad Máxima'];
                                            if (name === 'uso') return [`${value}%`, 'Uso'];
                                            return [value, name];
                                        }}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="ont" 
                                        fill="#667eea" 
                                        name="ONTs Conectadas"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <Bar 
                                        dataKey="capacidadMax" 
                                        fill="rgba(255, 255, 255, 0.1)" 
                                        name="Capacidad Máxima"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfica de distribución por Board (Top 10) */}
                    <div className="estadisticas-chart-section mb-4">
                        <h5 className="mb-3">
                            <i className="bi bi-pie-chart-fill me-2"></i>
                            Distribución de ONTs por Board (Top 10)
                        </h5>
                        <div style={{ width: '100%', height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={datosPorBoard.slice(0, 10)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="ont"
                                    >
                                        {datosPorBoard.slice(0, 10).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                                            border: '2px solid rgba(255, 255, 255, 0.4)',
                                            borderRadius: '8px',
                                            color: '#ffffff !important',
                                            padding: '12px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                                        }}
                                        labelStyle={{
                                            color: '#ffffff !important',
                                            fontWeight: '600',
                                            marginBottom: '8px',
                                            fontSize: '15px'
                                        }}
                                        itemStyle={{
                                            color: '#ffffff !important',
                                            padding: '4px 0'
                                        }}
                                        formatter={(value, name, props) => {
                                            if (name === 'ont') {
                                                return [
                                                    `${value.toLocaleString()} ONTs (${props.payload.uso}% usado)`,
                                                    'ONTs Conectadas'
                                                ];
                                            }
                                            return [value, name];
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfica de uso de PONs (Top 20) */}
                    <div className="estadisticas-chart-section mb-4">
                        <h5 className="mb-3">
                            <i className="bi bi-bar-chart-line-fill me-2"></i>
                            Uso de Puertos PON (Top 20)
                        </h5>
                        <div style={{ width: '100%', height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={datosPorPon.slice(0, 20)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis 
                                        dataKey="nombre" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                                        label={{ value: 'Cantidad de ONTs', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.8)' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        formatter={(value, name) => {
                                            if (name === 'ont') return [`${value} ONTs`, 'Conectadas'];
                                            if (name === 'capacidad') return [`${value} ONTs`, 'Capacidad Máxima'];
                                            if (name === 'uso') return [`${value}%`, 'Uso'];
                                            return [value, name];
                                        }}
                                        labelFormatter={(label) => `Puerto: ${label}`}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="ont" 
                                        fill="#764ba2" 
                                        name="ONTs Conectadas"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <Bar 
                                        dataKey="capacidad" 
                                        fill="rgba(255, 255, 255, 0.1)" 
                                        name={`Capacidad Máxima (${CAPACIDAD_MAX_PON})`}
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tabla detallada de PONs - Agrupada jerárquicamente */}
                    <div className="estadisticas-table-section mt-4">
                        <h5 className="mb-3">
                            <i className="bi bi-list-ul me-2"></i>
                            Detalle de Uso por Puerto PON
                        </h5>
                        <div className="table-responsive">
                            {estadisticas.data.map((frame, frameIndex) => (
                                <div key={frameIndex} className="mb-4">
                                    <div className="frame-header mb-3">
                                        <h6 className="text-light mb-0">
                                            <i className="bi bi-server me-2"></i>
                                            Frame {frame.framed} 
                                            <small className="text-muted ms-2">
                                                ({frame.total_onts} ONTs, {frame.total_boards} Boards, {frame.total_pons} PONs)
                                            </small>
                                        </h6>
                                    </div>
                                    {frame.boards.map((board, boardIndex) => (
                                        <div key={boardIndex} className="mb-3 ms-3">
                                            <div className="board-header mb-2">
                                                <h6 className="text-light mb-0" style={{ fontSize: '0.9rem' }}>
                                                    <i className="bi bi-motherboard me-2"></i>
                                                    Board {board.board}
                                                    <small className="text-muted ms-2">
                                                        ({board.total_onts} ONTs, {board.total_pons} PONs)
                                                    </small>
                                                </h6>
                                            </div>
                                            <table className="table table-dark table-hover table-sm mb-3">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '10%' }}>PON</th>
                                                        <th style={{ width: '15%' }}>ONTs</th>
                                                        <th style={{ width: '15%' }}>Disponibles</th>
                                                        <th style={{ width: '30%' }}>Uso %</th>
                                                        <th style={{ width: '15%' }}>Estado</th>
                                                        <th style={{ width: '15%' }}>IDs ONT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {board.pons.map((pon, ponIndex) => {
                                                        const usoPorcentual = ((pon.total_onts / CAPACIDAD_MAX_PON) * 100).toFixed(1);
                                                        const uso = parseFloat(usoPorcentual);
                                                        return (
                                                            <tr key={ponIndex}>
                                                                <td className="font-monospace">
                                                                    <strong>P{pon.pon}</strong>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-primary">{pon.total_onts}</span>
                                                                    <small className="text-muted d-block">/ {CAPACIDAD_MAX_PON}</small>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-secondary">{CAPACIDAD_MAX_PON - pon.total_onts}</span>
                                                                </td>
                                                                <td>
                                                                    <div className="progress" style={{ height: '24px', position: 'relative' }}>
                                                                        <div 
                                                                            className={`progress-bar ${uso > 80 ? 'bg-danger' : uso > 60 ? 'bg-warning' : 'bg-success'}`}
                                                                            role="progressbar"
                                                                            style={{ 
                                                                                width: `${Math.min(uso, 100)}%`,
                                                                                minWidth: uso > 5 ? 'auto' : '50px'
                                                                            }}
                                                                            aria-valuenow={uso}
                                                                            aria-valuemin="0"
                                                                            aria-valuemax="100"
                                                                        >
                                                                            {uso > 5 ? `${uso}%` : ''}
                                                                        </div>
                                                                        {uso <= 5 && (
                                                                            <span style={{ 
                                                                                position: 'absolute', 
                                                                                left: '8px', 
                                                                                top: '50%', 
                                                                                transform: 'translateY(-50%)',
                                                                                color: 'rgba(255, 255, 255, 0.9)',
                                                                                fontSize: '0.8rem',
                                                                                fontWeight: '600',
                                                                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                                                                                zIndex: 10
                                                                            }}>
                                                                                {uso}%
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {uso > 80 ? (
                                                                        <span className="badge bg-danger">Alto</span>
                                                                    ) : uso > 60 ? (
                                                                        <span className="badge bg-warning">Medio</span>
                                                                    ) : (
                                                                        <span className="badge bg-success">Normal</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                                                                        {pon.onts && pon.onts.length > 5 
                                                                            ? `${pon.onts.slice(0, 5).join(', ')}...` 
                                                                            : pon.onts ? pon.onts.join(', ') : '-'}
                                                                    </small>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EstadisticasOnt;

