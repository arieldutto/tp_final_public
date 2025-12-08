import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";

export function useOntSerial(ont_serial) {
    const [ont_data, setOnt_data] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("numero de ONT recibido:", ont_serial.ont_serial);

    useEffect(() => {
        if (!ont_serial) return;

        setLoading(true);
        setError(null);

        fetch(`${API_SGISP}/get_ont_by_serial?serial=${ont_serial.ont_serial}`)
            .then(r => r.json())
            .then(data => {
                setOnt_data(data);
            })
            .catch(err => console.error("Error cargando cliente:", err))
            .finally(() => setLoading(false));
    }, [ont_serial]);
    console.log("Hook loading:", loading, "Datos:", ont_data);
    return { ont_data, loading, error };
}