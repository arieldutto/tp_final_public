import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";

export function useServicio(numclient) {
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("numero de cliente recibido:", numclient.numclient);

    useEffect(() => {
        if (!numclient.numclient) return;

        setLoading(true);
        setError(null);

        fetch(`${API_SGISP}/servicios?descripcion=${numclient.numclient}`)
            .then(r => r.json())
            .then(data => {
                setServicio(data);
            })
            .catch(err => console.error("Error cargando cliente:", err))
            .finally(() => setLoading(false));
    }, [numclient.numclient]);
    console.log("Hook loading:", loading, "Datos:", servicio);
    return { servicio, loading, error };
}