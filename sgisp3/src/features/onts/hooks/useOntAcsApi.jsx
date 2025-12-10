import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";

export function useOntAcsApi() {
    const [statusBar, setStatusBar] = useState(null);
    const [ontsList, setOntsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`${API_SGISP}/ont_acs_api`)
            .then(res => res.json())
            .then(json => {
                if (json.error) {
                    setError(json.error);
                } else {
                    // Extraer ont_status_bar y data de la respuesta
                    setStatusBar(json.ont_status_bar || null);
                    setOntsList(json.data || []);
                }
            })
            .catch(err => {
                console.error("Error cargando datos de ONT ACS:", err);
                setError("Error de red o servidor");
            })
            .finally(() => setLoading(false));
    }, []);

    return { statusBar, ontsList, loading, error };
}

