// Servicio para crear, modificar y eliminar abonados
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

        if (datosAbonado.Email && datosAbonado.Email.trim()) {
            payload.Email = datosAbonado.Email;
        }

        if (datosAbonado.DNI && datosAbonado.DNI.trim()) {
            payload.DNI = datosAbonado.DNI;
        }

        if (datosAbonado.FechaAlta && datosAbonado.FechaAlta.trim()) {
            payload.FechaAlta = datosAbonado.FechaAlta;
        }

        const response = await fetch(`${API_SGISP}/abonados`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Manejar diferentes códigos de estado según documentación
        if (response.status === 201) {
            // Éxito - Recurso creado
            return {
                ok: true,
                data: data.abonado,
                message: data.message || "Abonado creado exitosamente"
            };
        } else if (response.status === 400) {
            // Error de validación
            let errorMsg = data.error || "Error en los datos enviados";
            if (data.campos && Array.isArray(data.campos)) {
                errorMsg = `Campos requeridos faltantes: ${data.campos.join(", ")}`;
            }
            return {
                ok: false,
                error: errorMsg,
                campos: data.campos || null
            };
        } else if (response.status === 409) {
            // Conflicto - Número de cliente duplicado
            return {
                ok: false,
                error: data.error || `El número de cliente ${data.numero_cliente || datosAbonado.NumeroCliente} ya existe`,
                numero_cliente: data.numero_cliente || datosAbonado.NumeroCliente
            };
        } else if (response.status === 405) {
            return {
                ok: false,
                error: data.error || "Método no permitido. Use POST"
            };
        } else {
            // Otros errores (500, etc.)
            return {
                ok: false,
                error: data.error || `Error ${response.status}: ${response.statusText}`,
                detalle: data.detalle || null
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

/**
 * Modifica un abonado existente
 * @param {number} abonadoId - ID del abonado a modificar
 * @param {Object} datosActualizacion - Datos a actualizar (todos opcionales)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function modificarAbonado(abonadoId, datosActualizacion) {
    try {
        // Validar que se envíe al menos un campo
        const camposEnviados = Object.keys(datosActualizacion).filter(
            key => datosActualizacion[key] !== null && datosActualizacion[key] !== undefined && datosActualizacion[key] !== ''
        );

        if (camposEnviados.length === 0) {
            return {
                ok: false,
                error: "No se enviaron campos para actualizar"
            };
        }

        // Preparar payload solo con campos que tienen valor
        const payload = {};

        if (datosActualizacion.Razonsocial !== undefined && datosActualizacion.Razonsocial !== null && datosActualizacion.Razonsocial !== '') {
            payload.Razonsocial = datosActualizacion.Razonsocial;
        }

        if (datosActualizacion.NumeroCliente !== undefined && datosActualizacion.NumeroCliente !== null && datosActualizacion.NumeroCliente !== '') {
            payload.NumeroCliente = parseInt(datosActualizacion.NumeroCliente);
        }

        if (datosActualizacion.Domicilio !== undefined && datosActualizacion.Domicilio !== null && datosActualizacion.Domicilio !== '') {
            payload.Domicilio = datosActualizacion.Domicilio;
        }

        if (datosActualizacion.Localidad !== undefined && datosActualizacion.Localidad !== null && datosActualizacion.Localidad !== '') {
            payload.Localidad = datosActualizacion.Localidad;
        }

        if (datosActualizacion.Telefono !== undefined && datosActualizacion.Telefono !== null && datosActualizacion.Telefono !== '') {
            payload.Telefono = datosActualizacion.Telefono;
        }

        if (datosActualizacion.Email !== undefined && datosActualizacion.Email !== null && datosActualizacion.Email !== '') {
            payload.Email = datosActualizacion.Email;
        }

        if (datosActualizacion.DNI !== undefined && datosActualizacion.DNI !== null && datosActualizacion.DNI !== '') {
            payload.DNI = datosActualizacion.DNI;
        }

        if (datosActualizacion.FechaAlta !== undefined && datosActualizacion.FechaAlta !== null && datosActualizacion.FechaAlta !== '') {
            payload.FechaAlta = datosActualizacion.FechaAlta;
        }

        const response = await fetch(`${API_SGISP}/modificar_abonado/${abonadoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 200) {
            return {
                ok: true,
                data: data.abonado,
                message: data.message || "Abonado actualizado exitosamente"
            };
        } else if (response.status === 400) {
            return {
                ok: false,
                error: data.error || "Error en los datos enviados",
                campos_disponibles: data.campos_disponibles || null
            };
        } else if (response.status === 404) {
            return {
                ok: false,
                error: `Abonado no encontrado (ID: ${abonadoId})`
            };
        } else if (response.status === 409) {
            return {
                ok: false,
                error: `El número de cliente ${data.numero_cliente || datosActualizacion.NumeroCliente} ya existe en otro registro`
            };
        } else {
            return {
                ok: false,
                error: data.error || `Error ${response.status}: ${response.statusText}`,
                detalle: data.detalle || null
            };
        }
    } catch (error) {
        console.error("Error al modificar abonado:", error);
        return {
            ok: false,
            error: error.message || "Error de conexión al modificar el abonado"
        };
    }
}

/**
 * Elimina un abonado
 * @param {number} abonadoId - ID del abonado a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function eliminarAbonado(abonadoId) {
    try {
        const response = await fetch(`${API_SGISP}/eliminar_abonado/${abonadoId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.status === 200) {
            return {
                ok: true,
                data: data.abonado_eliminado,
                message: data.message || "Abonado eliminado exitosamente"
            };
        } else if (response.status === 400) {
            return {
                ok: false,
                error: data.error || "ID inválido"
            };
        } else if (response.status === 404) {
            return {
                ok: false,
                error: `Abonado no encontrado (ID: ${abonadoId})`
            };
        } else if (response.status === 409) {
            return {
                ok: false,
                error: "No se puede eliminar el abonado porque tiene servicios asociados",
                servicios_asociados: data.servicios_asociados || null,
                mensaje: data.mensaje || "Elimine primero los servicios asociados antes de eliminar el abonado"
            };
        } else {
            return {
                ok: false,
                error: data.error || `Error ${response.status}: ${response.statusText}`,
                detalle: data.detalle || null
            };
        }
    } catch (error) {
        console.error("Error al eliminar abonado:", error);
        return {
            ok: false,
            error: error.message || "Error de conexión al eliminar el abonado"
        };
    }
}

