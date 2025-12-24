import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";

export function useEstadisticasOnt() {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${API_SGISP}/estadisticas_ont`)
            .then(res => res.json())
            .then(json => {
                if (json.error) {
                    setError(json.error);
                } else {
                    // Validar y limpiar datos duplicados
                    if (json.data && Array.isArray(json.data)) {
                        console.log("📊 Datos recibidos de estadísticas:", json.data);

                        // Crear un Map para eliminar frames duplicados (usando framed como clave única)
                        const framesUnicos = new Map();

                        json.data.forEach(frame => {
                            const frameKey = String(frame.framed);

                            // Si ya existe un frame con el mismo ID, verificar cuál tiene más datos
                            if (framesUnicos.has(frameKey)) {
                                const frameExistente = framesUnicos.get(frameKey);
                                console.warn(`⚠️ Frame duplicado detectado: Frame ${frameKey}`);
                                console.log("Frame existente:", frameExistente);
                                console.log("Frame nuevo:", frame);

                                // Mantener el frame con más ONTs (más actualizado)
                                if (frame.total_onts > frameExistente.total_onts) {
                                    console.log(`✅ Reemplazando Frame ${frameKey} con datos más recientes`);
                                    framesUnicos.set(frameKey, frame);
                                } else {
                                    console.log(`ℹ️ Manteniendo Frame ${frameKey} existente (más datos)`);
                                }
                            } else {
                                framesUnicos.set(frameKey, frame);
                            }
                        });

                        // Convertir Map a Array
                        const dataLimpia = Array.from(framesUnicos.values());

                        console.log(`✅ Datos limpiados: ${json.data.length} frames → ${dataLimpia.length} frames únicos`);

                        // Actualizar el objeto json con los datos limpios
                        const jsonLimpio = {
                            ...json,
                            data: dataLimpia,
                            resumen: {
                                ...json.resumen,
                                total_framed: dataLimpia.length
                            }
                        };

                        setEstadisticas(jsonLimpio);
                    } else {
                        setEstadisticas(json);
                    }
                }
            })
            .catch(err => {
                console.error("Error cargando estadísticas ONT:", err);
                setError("Error de conexión al obtener estadísticas");
            })
            .finally(() => setLoading(false));
    }, []);

    return { estadisticas, loading, error };
}

