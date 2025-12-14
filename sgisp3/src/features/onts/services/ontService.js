// Servicios para detectar y agregar ONT
import { API_SGISP } from "../../../config";

/**
 * Detecta ONT nuevas en la OLT
 * @returns {Promise<Object>} Resultado de la detección
 */
export async function detectarONT() {
    try {
        const response = await fetch(`${API_SGISP}/detectar_ont`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            return {
                ok: true,
                detectada: data.detectada || false,
                ont: data.ont || null,
                ya_registrada: data.ya_registrada || false,
                registro_existente: data.registro_existente || null,
                message: data.message || "Detección completada"
            };
        } else {
            return {
                ok: false,
                error: data.error || `Error ${response.status}: ${response.statusText}`,
                detalle: data.detalle || null
            };
        }
    } catch (error) {
        console.error("Error al detectar ONT:", error);
        return {
            ok: false,
            error: error.message || "Error de conexión al detectar ONT"
        };
    }
}

/**
 * Agrega una ONT detectada a la OLT y base de datos
 * @param {Object} datosONT - Datos de la ONT a agregar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function agregarONT(datosONT) {
    try {
        // Validar campos requeridos
        const camposRequeridos = ['ontsn', 'frame', 'slot', 'port', 'Desc', 'ont_lineprofile_id', 'ont_srvprofile_id', 'ont_downprofile_id', 'ont_modo'];
        const camposFaltantes = camposRequeridos.filter(campo => !datosONT[campo] && datosONT[campo] !== 0);

        if (camposFaltantes.length > 0) {
            return {
                ok: false,
                error: `Campos requeridos faltantes: ${camposFaltantes.join(", ")}`
            };
        }

        // Validar modo
        if (datosONT.ont_modo !== 'Router' && datosONT.ont_modo !== 'Bridge') {
            return {
                ok: false,
                error: "Modo de ONT inválido. Debe ser 'Router' o 'Bridge'"
            };
        }

        // Validar VLANs si se proporcionan
        const vlanValidas = [100, 200, 300, 400];
        if (datosONT.ont_vlan && !vlanValidas.includes(parseInt(datosONT.ont_vlan))) {
            return {
                ok: false,
                error: "VLAN de datos inválida. Debe ser 100, 200, 300 o 400"
            };
        }
        if (datosONT.mng_vlan && !vlanValidas.includes(parseInt(datosONT.mng_vlan))) {
            return {
                ok: false,
                error: "VLAN de management inválida. Debe ser 100, 200, 300 o 400"
            };
        }

        // Preparar payload
        const payload = {
            ontsn: datosONT.ontsn,
            frame: String(datosONT.frame),
            slot: String(datosONT.slot),
            port: String(datosONT.port),
            Desc: parseInt(datosONT.Desc),
            ont_lineprofile_id: parseInt(datosONT.ont_lineprofile_id),
            ont_srvprofile_id: parseInt(datosONT.ont_srvprofile_id),
            ont_downprofile_id: parseInt(datosONT.ont_downprofile_id),
            ont_modo: datosONT.ont_modo
        };

        // Agregar VLANs opcionales
        if (datosONT.ont_vlan) {
            payload.ont_vlan = parseInt(datosONT.ont_vlan);
        }
        if (datosONT.mng_vlan) {
            payload.mng_vlan = parseInt(datosONT.mng_vlan);
        }

        const response = await fetch(`${API_SGISP}/agregar_ont`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Manejar diferentes códigos de estado
        if (response.status === 201) {
            return {
                ok: true,
                data: data.ont,
                message: data.message || "ONT agregada exitosamente"
            };
        } else if (response.status === 400) {
            const errorMsg = data.campos
                ? `Campos requeridos faltantes: ${data.campos.join(", ")}`
                : data.error || "Error en los datos enviados";
            return {
                ok: false,
                error: errorMsg,
                detalle: data.detalle || null
            };
        } else if (response.status === 409) {
            return {
                ok: false,
                error: "La ONT ya está registrada en la base de datos",
                ont_existente: data.ont_existente || null
            };
        } else {
            return {
                ok: false,
                error: data.error || `Error ${response.status}: ${response.statusText}`,
                detalle: data.detalle || null
            };
        }
    } catch (error) {
        console.error("Error al agregar ONT:", error);
        return {
            ok: false,
            error: error.message || "Error de conexión al agregar ONT"
        };
    }
}

