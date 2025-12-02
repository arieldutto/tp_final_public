import { useState, useEffect } from "react";
import { API_SGISP } from "../../../config";

export function useServerCpu() {
    const [data, setData] = useState([]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const r = await fetch(`${API_SGISP}/servercpu.json`);
                let json = await r.json();

                console.log("RESPUESTA API:", json);

                // Si json viene como string → parsearlo
                if (typeof json === "string") {
                    json = JSON.parse(json);
                }

                // Asegurar que json sea un array
                let arr = Array.isArray(json)
                    ? json
                    : json.data || json.items || json.result || [];

                const formatted = arr
                    .filter(item => item.mean !== null)
                    .map(item => ({
                        time: new Date(item.time).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        mean: Number((item.mean * 10).toFixed(3)), // ⬅ multiplicas por 10
                    }));

                setData(formatted);

            } catch (err) {
                console.error("ERROR FETCH CPU:", err);
            }
        };

        // Primera ejecución
        fetchData();

        // Ejecutar cada 1 minuto
        const interval = setInterval(fetchData, 60000);
        console.log("⏱ Reiniciando el reloj");

        return () => clearInterval(interval);

    }, []);

    return data;
}