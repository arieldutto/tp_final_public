import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";

export function useOntSerial({ ont_serial }) {
    const [ont_data, setOnt_data] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Si no hay serial, no hacer nada
        if (!ont_serial || ont_serial === null || ont_serial === undefined) {
            setLoading(false);
            setError(null);
            setOnt_data(null);
            return;
        }

        setLoading(true);
        setError(null);

        // Extraer el serial: puede ser un string directo, un objeto con ont_serial, o el objeto mismo
        let serial = null;
        if (typeof ont_serial === 'string') {
            serial = ont_serial.trim();
        } else if (typeof ont_serial === 'object' && ont_serial !== null) {
            serial = ont_serial.ont_serial || ont_serial.serial || ont_serial;
        }
        
        // Si después de extraer no tenemos un serial válido, no hacer la petición
        if (!serial || serial === '') {
            setLoading(false);
            setError("Serial de ONT no válido");
            setOnt_data(null);
            return;
        }
        
        console.log("Buscando ONT con serial:", serial);

        fetch(`${API_SGISP}/get_ont_by_serial?serial=${serial}`)
            .then(r => {
                if (!r.ok) {
                    throw new Error(`Error HTTP: ${r.status} ${r.statusText}`);
                }
                return r.json();
            })
            .then(data => {
                console.log("Datos recibidos de la API:", data);
                
                // La API puede devolver un array o un objeto directo
                // Si es un array, usarlo directamente
                // Si es un objeto, convertirlo a array
                let processedData = null;
                if (Array.isArray(data)) {
                    processedData = data;
                } else if (data && typeof data === 'object') {
                    // Si es un objeto, convertirlo a array
                    processedData = [data];
                } else {
                    processedData = [];
                }
                
                console.log("Datos procesados:", processedData);
                setOnt_data(processedData);
            })
            .catch(err => {
                console.error("Error cargando datos ONT:", err);
                setError(err.message || "Error al cargar los datos de la ONT");
                setOnt_data(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [ont_serial]);
    
    return { ont_data, loading, error };
}