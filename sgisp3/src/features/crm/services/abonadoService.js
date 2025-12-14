// Servicio para crear abonados
import { API_SGISP } from "../../../config";

export async function crearAbonado(datosAbonado) {
    try {
        // Preparar los datos según la API
        const payload = {
            Razonsocial: datosAbonado.Razonsocial,
            NumeroCliente: parseInt(datosAbonado.NumeroCliente), // Convertir a integer
            Domicilio: datosAbonado.Domicilio
        };

        // Agregar campos opcionales solo si tienen valor
        if (datosAbonado.Localidad && datosAbonado.Localidad.trim()) {
            payload.Localidad = datosAbonado.Localidad;
        }

        if (datosAbonado.Telefono && datosAbonado.Telefono.trim()) {
            payload.Telefono = datosAbonado.Telefono;
        }

        if (datosAbonado.DNI && datosAbonado.DNI.trim()) {
            payload.DNI = datosAbonado.DNI;
        }

        if (datosAbonado.FechaAlta && datosAbonado.FechaAlta.trim()) {
            payload.FechaAlta = datosAbonado.FechaAlta;
        }

        const response = await fetch(`${API_SGISP}/crear_abonado`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Manejar diferentes códigos de estado
        if (response.status === 201) {
            // Éxito
            return {
                ok: true,
                data: data.abonado,
                message: data.message
            };
        } else if (response.status === 400) {
            // Error de validación
            const errorMsg = data.campos 
                ? `Campos requeridos faltantes: ${data.campos.join(", ")}`
                : data.error || "Error en los datos enviados";
            return {
                ok: false,
                error: errorMsg
            };
        } else if (response.status === 409) {
            // Conflicto - Número de cliente duplicado
            return {
                ok: false,
                error: `El número de cliente ${data.numero_cliente || datosAbonado.NumeroCliente} ya existe`
            };
        } else if (response.status === 405) {
            return {
                ok: false,
                error: "Método no permitido"
            };
        } else {
            // Otros errores (500, etc.)
            return {
                ok: false,
                error: data.error || `Error ${response.status}: ${response.statusText}`
            };
        }
    } catch (error) {
        console.error("Error al crear abonado:", error);
        return {
            ok: false,
            error: error.message || "Error de conexión al crear el abonado"
        };
    }
}

