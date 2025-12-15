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
                    setEstadisticas(json);
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

