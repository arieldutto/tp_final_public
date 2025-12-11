import React, { useMemo } from 'react'
import { useOntSerial } from '../hooks/useOntSerial';
import './clientontdata.css';

/**
 * Extrae el valor de un objeto tr069 (puede tener _value o ser directo)
 */
function getTr069Value(obj) {
    if (!obj) return null;
    if (typeof obj === 'object' && obj !== null && '_value' in obj) {
        return obj._value;
    }
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    return null;
}

/**
 * Navega por la estructura de objetos anidados
 */
function getNestedValue(obj, ...path) {
    let current = obj;
    for (const key of path) {
        if (!current || typeof current !== 'object' || !(key in current)) {
            return null;
        }
        current = current[key];
    }
    return getTr069Value(current);
}

/**
 * Convierte la potencia óptica a dBm usando la misma fórmula del backend
 * 
 * Fórmula del backend:
 * - Si el valor está entre 0 y -50 (ya está en dBm), se usa directamente
 * - Si está fuera de ese rango:
 *   1. Se divide por 10000.0
 *   2. Se calcula: 10 * log10(potencia)
 *   3. Se redondea a 2 decimales
 * 
 * @param {number|string} rawValue - Valor raw de la potencia óptica
 * @returns {number|null} - Potencia en dBm o null si no es válido
 */
function convertOpticalPower(rawValue) {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
        return null;
    }
    
    let powerValue = parseFloat(rawValue);
    
    // Si no es un número válido, retornar null
    if (isNaN(powerValue)) {
        return null;
    }
    
    // Si el valor está entre 0 y -50, ya está en dBm, usarlo directamente
    if (powerValue <= 0 && powerValue > -50) {
        return parseFloat(powerValue.toFixed(2));
    }
    
    // Si está fuera de ese rango, aplicar la fórmula: potencia = valor / 10000, luego 10 * log10(potencia)
    const potencia = powerValue / 10000.0;
    
    // Validar que la potencia sea positiva para poder calcular el logaritmo
    if (potencia <= 0) {
        console.warn(`[convertOpticalPower] Potencia inválida después de dividir por 10000: ${potencia}`);
        return null;
    }
    
    // Calcular: 10 * log10(potencia)
    const powerInDb = 10 * Math.log10(potencia);
    
    // Redondear a 2 decimales
    return parseFloat(powerInDb.toFixed(2));
}

function ClientOntData({ ont_serial }) {
    // Validar que tengamos un serial antes de hacer la petición
    if (!ont_serial) {
        return (
            <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                No se proporcionó el serial de la ONT para este cliente.
            </div>
        );
    }

    const { ont_data: DatosArray, loading, error } = useOntSerial({ ont_serial });
    
    // Debug: Log para ver qué estamos recibiendo
    console.log("ClientOntData - ont_serial recibido:", ont_serial);
    console.log("ClientOntData - DatosArray:", DatosArray);
    console.log("ClientOntData - loading:", loading);
    console.log("ClientOntData - error:", error);

    // Extraer datos relevantes del objeto tr069
    const ontData = useMemo(() => {
        if (!DatosArray || !Array.isArray(DatosArray) || DatosArray.length === 0) {
            console.log("ClientOntData - No hay datos para procesar");
            return null;
        }
        
        const data = DatosArray[0];
        if (!data || typeof data !== 'object') return null;

        // Extraer información del dispositivo
        const deviceInfo = data.InternetGatewayDevice?.DeviceInfo;
        const gponInterface = data.InternetGatewayDevice?.WANDevice?.['1']?.['X_CT-COM_GponInterfaceConfig'];
        const wanConnection = data.InternetGatewayDevice?.WANDevice?.['1']?.WANConnectionDevice?.['1']?.WANPPPConnection?.['1'];
        const wanIPConnection = data.InternetGatewayDevice?.WANDevice?.['2']?.WANConnectionDevice?.['1']?.WANIPConnection?.['1'];
        const wlanConfig = data.InternetGatewayDevice?.LANDevice?.['1']?.WLANConfiguration?.['1'];
        const virtualParams = data.VirtualParameters;
        const deviceId = data._deviceId;
        const hosts = data.InternetGatewayDevice?.LANDevice?.['1']?.Hosts?.Host;
        const lanHostConfig = data.InternetGatewayDevice?.LANDevice?.['1']?.LANHostConfigManagement;
        const dmzConfig = data.InternetGatewayDevice?.['X_CT-COM_DMZ'];
        const aclConfig = data.InternetGatewayDevice?.ACL;

        // Convertir RXPower y TXPower a dBm negativos
        const rxPowerRaw = getNestedValue(gponInterface, 'RXPower');
        const txPowerRaw = getNestedValue(gponInterface, 'TXPower');
        const rxPower = convertOpticalPower(rxPowerRaw);
        const txPower = convertOpticalPower(txPowerRaw);
        
        // También convertir ponRxPower si está disponible
        const ponRxPowerRaw = getNestedValue(virtualParams, 'ponRxPower');
        const ponRxPower = convertOpticalPower(ponRxPowerRaw);
        
        // Convertir temperatura de centésimas de grado a grados
        const tempRaw = getNestedValue(gponInterface, 'TransceiverTemperature');
        const temperature = tempRaw !== null ? (parseFloat(tempRaw) / 100).toFixed(1) : null;
        
        // Convertir voltaje de mV a V
        const voltRaw = getNestedValue(gponInterface, 'SupplyVottage');
        const voltage = voltRaw !== null ? (parseFloat(voltRaw) / 1000).toFixed(2) : null;

        // Obtener hosts conectados con sus datos
        const hostsList = hosts ? Object.values(hosts)
            .filter(h => h && typeof h === 'object')
            .map(host => ({
                macAddress: getNestedValue(host, 'MACAddress'),
                hostName: getNestedValue(host, 'HostName'),
                ipAddress: getNestedValue(host, 'IPAddress'),
                active: getNestedValue(host, 'Active'),
                interfaceType: getNestedValue(host, 'InterfaceType'),
                addressSource: getNestedValue(host, 'AddressSource'),
                leaseTimeRemaining: getNestedValue(host, 'LeaseTimeRemaining')
            }))
            .filter(h => h.macAddress || h.hostName || h.ipAddress) : [];

        return {
            // Información del dispositivo
            serialNumber: getNestedValue(deviceInfo, 'SerialNumber') || getNestedValue(deviceId, '_SerialNumber'),
            productClass: getNestedValue(deviceInfo, 'ProductClass') || getNestedValue(deviceId, '_ProductClass'),
            manufacturer: getNestedValue(deviceInfo, 'Manufacturer') || getNestedValue(deviceId, '_Manufacturer'),
            firmwareVersion: getNestedValue(deviceInfo, 'SoftwareVersion'),
            hardwareVersion: getNestedValue(deviceInfo, 'HardwareVersion'),
            modelName: getNestedValue(deviceInfo, 'ModelName'),
            
            // Estado de conexión
            connectionStatus: getNestedValue(wanConnection, 'ConnectionStatus') || getNestedValue(wanIPConnection, 'ConnectionStatus'),
            gponStatus: getNestedValue(gponInterface, 'Status'),
            deviceUptime: getNestedValue(deviceInfo, 'UpTime'),
            connectionUptime: getNestedValue(wanConnection, 'Uptime') || getNestedValue(wanIPConnection, 'Uptime'),
            lastInform: data._lastInform || data.VirtualParameters?._lastInform,
            lastBoot: data._lastBoot,
            
            // Potencia de señal óptica
            rxPower: rxPower,
            txPower: txPower,
            temperature: temperature,
            voltage: voltage,
            biasCurrent: getNestedValue(gponInterface, 'BiasCurrent'),
            ponRxPower: ponRxPower,
            
            // Información de red WAN
            externalIP: getNestedValue(wanConnection, 'ExternalIPAddress') || getNestedValue(wanIPConnection, 'ExternalIPAddress'),
            wan1IP: getNestedValue(virtualParams, 'wan1_ip'),
            wan2IP: getNestedValue(virtualParams, 'wan2_ip'),
            wan1Name: getNestedValue(virtualParams, 'wan1_name'),
            wan2Name: getNestedValue(virtualParams, 'wan2_name'),
            macAddress: getNestedValue(wanConnection, 'MACAddress') || getNestedValue(wanIPConnection, 'MACAddress'),
            defaultGateway: getNestedValue(wanConnection, 'DefaultGateway') || getNestedValue(wanIPConnection, 'DefaultGateway'),
            dnsServers: getNestedValue(wanConnection, 'DNSServers') || getNestedValue(wanIPConnection, 'DNSServers'),
            vlanId: getNestedValue(wanConnection, 'X_HW_VLANIDMark') || getNestedValue(wanIPConnection, 'X_HW_VLANIDMark'),
            connectionType: getNestedValue(wanConnection, 'ConnectionType') || getNestedValue(wanIPConnection, 'ConnectionType'),
            natEnabled: getNestedValue(wanConnection, 'NATEnabled') || getNestedValue(wanIPConnection, 'NATEnabled'),
            
            // WiFi
            wlanSSID: getNestedValue(wlanConfig, 'SSID') || getNestedValue(virtualParams, 'WLAN1_wlan_ssid'),
            wlanStatus: getNestedValue(wlanConfig, 'Status'),
            wlanEnabled: getNestedValue(wlanConfig, 'Enable'),
            wlanChannel: getNestedValue(wlanConfig, 'Channel'),
            wlanStandard: getNestedValue(wlanConfig, 'Standard'),
            wlanBytesSent: getNestedValue(wlanConfig, 'TotalBytesSent'),
            wlanBytesReceived: getNestedValue(wlanConfig, 'TotalBytesReceived'),
            wlanPacketsSent: getNestedValue(wlanConfig, 'TotalPacketsSent'),
            wlanPacketsReceived: getNestedValue(wlanConfig, 'TotalPacketsReceived'),
            wlanAssociations: getNestedValue(wlanConfig, 'TotalAssociations'),
            
            // Dispositivos conectados
            connectedDevices: hostsList.length,
            hostsList: hostsList,
            
            // Información de red LAN
            dhcpEnabled: getNestedValue(lanHostConfig, 'DHCPServerEnable'),
            dhcpMinAddress: getNestedValue(lanHostConfig, 'MinAddress'),
            dhcpMaxAddress: getNestedValue(lanHostConfig, 'MaxAddress'),
            dhcpSubnetMask: getNestedValue(lanHostConfig, 'SubnetMask'),
            dhcpLeaseTime: getNestedValue(lanHostConfig, 'DHCPLeaseTime'),
            dhcpDnsServers: getNestedValue(lanHostConfig, 'DNSServers'),
            dhcpRouters: getNestedValue(lanHostConfig, 'IPRouters'),
            dhcpDomainName: getNestedValue(lanHostConfig, 'DomainName'),
            dhcpReservedAddresses: getNestedValue(lanHostConfig, 'ReservedAddresses'),
            dhcpAllowedMacAddresses: getNestedValue(lanHostConfig, 'AllowedMACAddress'),
            lanSubnetMask: getNestedValue(lanHostConfig, 'SubnetMask'),
            
            // DMZ
            dmzEnabled: getNestedValue(dmzConfig, 'Enable'),
            dmzHost: getNestedValue(dmzConfig, 'Host') || getNestedValue(dmzConfig, 'HostIPAddress'),
            
            // ACL
            aclEnabled: getNestedValue(aclConfig, 'Enable'),
            
            // Datos completos para referencia
            rawData: data
        };
    }, [DatosArray]);

    if (loading) {
    return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando datos ONT...</span>
                    </div>
                    <p className="mt-2">Cargando información de la ONT...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Error al cargar la información de la ONT: {error}
            </div>
        );
    }

    if (!ontData || !DatosArray || DatosArray.length === 0) {
        return (
            <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                No se encontró información de la ONT.
        </div>
    );
}

    // Formatear valores
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatUptime = (seconds) => {
        if (!seconds && seconds !== 0) return 'N/A';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const formatPower = (power) => {
        if (power === null || power === undefined || power === '') return 'N/A';
        const powerNum = parseFloat(power);
        if (isNaN(powerNum)) return 'N/A';
        // Asegurar que siempre se muestre con signo negativo si es potencia óptica
        // (aunque la función convertOpticalPower ya debería haberlo convertido)
        const displayValue = powerNum < 0 ? powerNum : -Math.abs(powerNum);
        return `${displayValue.toFixed(2)} dBm`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'secondary';
        const statusLower = String(status).toLowerCase();
        if (statusLower.includes('up') || statusLower.includes('online') || statusLower.includes('connected')) return 'success';
        if (statusLower.includes('down') || statusLower.includes('offline') || statusLower.includes('disconnected')) return 'danger';
        return 'warning';
    };

    return (
        <div className="client-ont-container">
            <div className="row">
                {/* Tarjeta Principal - Información del Dispositivo */}
                <div className="col-12">
                    <div className="card client-ont-card shadow-sm">
                        <div className="card-header client-ont-header">
                            <div className="d-flex align-items-center">
                                <div className="ont-avatar me-3">
                                    <i className="bi bi-router-fill"></i>
                                </div>
                                <div>
                                    <h4 className="mb-0">Información del Equipo ONT</h4>
                                    <small className="text-muted">Datos técnicos del dispositivo</small>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="client-ont-grid">
                                {/* Serial Number */}
                                {ontData.serialNumber && (
                                    <div className="ont-item ont-item-full">
                                        <div className="ont-icon">
                                            <i className="bi bi-upc-scan"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Número de Serie</span>
                                            <span className="ont-value font-monospace">{ontData.serialNumber}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Product Class / Model */}
                                {ontData.productClass && (
                                    <div className="ont-item">
                                        <div className="ont-icon">
                                            <i className="bi bi-box-seam"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Modelo</span>
                                            <span className="ont-value">{ontData.productClass}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Firmware Version */}
                                {ontData.firmwareVersion && (
                                    <div className="ont-item">
                                        <div className="ont-icon">
                                            <i className="bi bi-code-slash"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Versión Firmware</span>
                                            <span className="ont-value">{ontData.firmwareVersion}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Hardware Version */}
                                {ontData.hardwareVersion && (
                                    <div className="ont-item">
                                        <div className="ont-icon">
                                            <i className="bi bi-cpu"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Versión Hardware</span>
                                            <span className="ont-value">{ontData.hardwareVersion}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Connection Status */}
                                {ontData.connectionStatus && (
                                    <div className="ont-item">
                                        <div className={`ont-icon ont-icon-${getStatusColor(ontData.connectionStatus)}`}>
                                            <i className="bi bi-wifi"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Estado de Conexión</span>
                                            <span className={`ont-value badge bg-${getStatusColor(ontData.connectionStatus)}`}>
                                                {String(ontData.connectionStatus)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* GPON Status */}
                                {ontData.gponStatus && (
                                    <div className="ont-item">
                                        <div className={`ont-icon ont-icon-${getStatusColor(ontData.gponStatus)}`}>
                                            <i className="bi bi-router"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Estado GPON</span>
                                            <span className={`ont-value badge bg-${getStatusColor(ontData.gponStatus)}`}>
                                                {String(ontData.gponStatus)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Device Uptime */}
                                {ontData.deviceUptime !== null && ontData.deviceUptime !== undefined && (
                                    <div className="ont-item">
                                        <div className="ont-icon">
                                            <i className="bi bi-clock-history"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Tiempo Activo del Equipo</span>
                                            <span className="ont-value">{formatUptime(ontData.deviceUptime)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Last Inform */}
                                {ontData.lastInform && (
                                    <div className="ont-item">
                                        <div className="ont-icon">
                                            <i className="bi bi-clock"></i>
                                        </div>
                                        <div className="ont-content">
                                            <span className="ont-label">Último Informe</span>
                                            <span className="ont-value">{formatDate(ontData.lastInform)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Señal Óptica */}
                {(ontData.rxPower !== null || ontData.txPower !== null || ontData.temperature !== null) && (
                    <div className="col-lg-6">
                        <div className="card client-ont-card shadow-sm">
                            <div className="card-header client-ont-header-signal">
                                <h5 className="mb-0">
                                    <i className="bi bi-broadcast-pin me-2"></i>
                                    Señal Óptica
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="client-ont-grid">
                                    {/* RX Power */}
                                    {ontData.rxPower !== null && ontData.rxPower !== undefined && (
                                        <div className={`ont-item ${parseFloat(ontData.rxPower) <= -25 ? 'ont-item-warning' : ''}`}>
                                            <div className="ont-icon ont-icon-signal">
                                                <i className="bi bi-arrow-down-circle-fill"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Potencia RX (Recepción)</span>
                                                <span className="ont-value ont-value-signal">{formatPower(ontData.rxPower)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* TX Power */}
                                    {ontData.txPower !== null && ontData.txPower !== undefined && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-signal">
                                                <i className="bi bi-arrow-up-circle-fill"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Potencia TX (Transmisión)</span>
                                                <span className="ont-value ont-value-signal">{formatPower(ontData.txPower)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Temperature */}
                                    {ontData.temperature !== null && ontData.temperature !== undefined && (
                                        <div className="ont-item">
                                            <div className="ont-icon">
                                                <i className="bi bi-thermometer-half"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Temperatura</span>
                                                <span className="ont-value">{ontData.temperature}°C</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Voltage */}
                                    {ontData.voltage !== null && ontData.voltage !== undefined && (
                                        <div className="ont-item">
                                            <div className="ont-icon">
                                                <i className="bi bi-lightning-charge-fill"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Voltaje</span>
                                                <span className="ont-value">{ontData.voltage}V</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bias Current */}
                                    {ontData.biasCurrent !== null && ontData.biasCurrent !== undefined && (
                                        <div className="ont-item">
                                            <div className="ont-icon">
                                                <i className="bi bi-lightning"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Corriente de Polarización</span>
                                                <span className="ont-value">{ontData.biasCurrent} mA</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tarjeta de Estadísticas WiFi */}
                {(ontData.wlanBytesSent || ontData.wlanBytesReceived || ontData.wlanPacketsSent || ontData.wlanPacketsReceived) && (
                    <div className="col-lg-6">
                        <div className="card client-ont-card shadow-sm">
                            <div className="card-header client-ont-header-stats">
                                <h5 className="mb-0">
                                    <i className="bi bi-wifi me-2"></i>
                                    Estadísticas WiFi
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="client-ont-grid">
                                    {/* WiFi SSID */}
                                    {ontData.wlanSSID && (
                                        <div className="ont-item ont-item-full">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-broadcast"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">SSID WiFi</span>
                                                <span className="ont-value font-monospace">{ontData.wlanSSID}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* WiFi Status */}
                                    {ontData.wlanStatus && (
                                        <div className="ont-item">
                                            <div className={`ont-icon ont-icon-${getStatusColor(ontData.wlanStatus)}`}>
                                                <i className="bi bi-wifi"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Estado WiFi</span>
                                                <span className={`ont-value badge bg-${getStatusColor(ontData.wlanStatus)}`}>
                                                    {String(ontData.wlanStatus)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* WiFi Channel */}
                                    {ontData.wlanChannel && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-signal"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Canal WiFi</span>
                                                <span className="ont-value">{ontData.wlanChannel}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* WiFi Standard */}
                                    {ontData.wlanStandard && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-router"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Estándar WiFi</span>
                                                <span className="ont-value">{ontData.wlanStandard}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* WiFi Associations */}
                                    {ontData.wlanAssociations !== null && ontData.wlanAssociations !== undefined && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-people"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Dispositivos Conectados</span>
                                                <span className="ont-value">{ontData.wlanAssociations}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bytes Sent WiFi */}
                                    {ontData.wlanBytesSent && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-upload"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Bytes Enviados WiFi</span>
                                                <span className="ont-value">{formatBytes(ontData.wlanBytesSent)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bytes Received WiFi */}
                                    {ontData.wlanBytesReceived && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-download"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Bytes Recibidos WiFi</span>
                                                <span className="ont-value">{formatBytes(ontData.wlanBytesReceived)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Packets Sent WiFi */}
                                    {ontData.wlanPacketsSent && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-send"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Paquetes Enviados WiFi</span>
                                                <span className="ont-value">{ontData.wlanPacketsSent.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Packets Received WiFi */}
                                    {ontData.wlanPacketsReceived && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-stats">
                                                <i className="bi bi-inbox"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Paquetes Recibidos WiFi</span>
                                                <span className="ont-value">{ontData.wlanPacketsReceived.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tarjeta de Información de Red WAN */}
                {(ontData.externalIP || ontData.wan1IP || ontData.wan2IP || ontData.macAddress || ontData.vlanId || ontData.defaultGateway) && (
                    <div className="col-12">
                        <div className="card client-ont-card shadow-sm">
                            <div className="card-header client-ont-header-network">
                                <h5 className="mb-0">
                                    <i className="bi bi-diagram-3 me-2"></i>
                                    Información de Red WAN
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="client-ont-grid">
                                    {/* External IP */}
                                    {ontData.externalIP && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-globe"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">IP Externa</span>
                                                <span className="ont-value font-monospace">{ontData.externalIP}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* WAN1 IP */}
                                    {ontData.wan1IP && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-router"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">WAN1 IP</span>
                                                <span className="ont-value font-monospace">{ontData.wan1IP}</span>
                                                {ontData.wan1Name && (
                                                    <small className="text-muted">({ontData.wan1Name})</small>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* WAN2 IP */}
                                    {ontData.wan2IP && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-router-fill"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">WAN2 IP</span>
                                                <span className="ont-value font-monospace">{ontData.wan2IP}</span>
                                                {ontData.wan2Name && (
                                                    <small className="text-muted">({ontData.wan2Name})</small>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* MAC Address */}
                                    {ontData.macAddress && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-ethernet"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">MAC Address</span>
                                                <span className="ont-value font-monospace">{ontData.macAddress}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Default Gateway */}
                                    {ontData.defaultGateway && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-share"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Gateway por Defecto</span>
                                                <span className="ont-value font-monospace">{ontData.defaultGateway}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DNS Servers */}
                                    {ontData.dnsServers && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-server"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Servidores DNS</span>
                                                <span className="ont-value font-monospace">{ontData.dnsServers}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* VLAN ID */}
                                    {ontData.vlanId && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-tag"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">VLAN ID</span>
                                                <span className="ont-value">{ontData.vlanId}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Connection Type */}
                                    {ontData.connectionType && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-diagram-2"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Tipo de Conexión</span>
                                                <span className="ont-value">{ontData.connectionType}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* NAT Enabled */}
                                    {ontData.natEnabled !== null && ontData.natEnabled !== undefined && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-shield-check"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">NAT Habilitado</span>
                                                <span className={`ont-value badge bg-${ontData.natEnabled ? 'success' : 'secondary'}`}>
                                                    {ontData.natEnabled ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tarjeta de Hosts Conectados LAN */}
                {ontData.hostsList && ontData.hostsList.length > 0 && (
                    <div className="col-12">
                        <div className="card client-ont-card card-with-table shadow-sm">
                            <div className="card-header client-ont-header-network">
                                <h5 className="mb-0">
                                    <i className="bi bi-devices me-2"></i>
                                    Dispositivos Conectados a la Red LAN ({ontData.hostsList.length})
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th><i className="bi bi-pc-display me-2"></i>Nombre del Host</th>
                                                <th><i className="bi bi-ethernet me-2"></i>Dirección MAC</th>
                                                <th><i className="bi bi-globe me-2"></i>Dirección IP</th>
                                                <th><i className="bi bi-info-circle me-2"></i>Estado</th>
                                                <th><i className="bi bi-router me-2"></i>Tipo de Interfaz</th>
                                                <th><i className="bi bi-clock me-2"></i>Origen de IP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ontData.hostsList.map((host, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <strong>{host.hostName || 'Sin nombre'}</strong>
                                                    </td>
                                                    <td>
                                                        <code className="font-monospace">{host.macAddress || 'N/A'}</code>
                                                    </td>
                                                    <td>
                                                        <code className="font-monospace">{host.ipAddress || 'N/A'}</code>
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${host.active ? 'success' : 'secondary'}`}>
                                                            {host.active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td>{host.interfaceType || 'N/A'}</td>
                                                    <td>{host.addressSource || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tarjeta de Configuración DHCP y LAN */}
                {(ontData.dhcpEnabled !== null || ontData.dhcpMinAddress || ontData.dhcpMaxAddress || ontData.lanSubnetMask) && (
                    <div className="col-lg-6">
                        <div className="card client-ont-card shadow-sm">
                            <div className="card-header client-ont-header-network">
                                <h5 className="mb-0">
                                    <i className="bi bi-router me-2"></i>
                                    Configuración DHCP y LAN
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="client-ont-grid">
                                    {/* DHCP Enabled */}
                                    {ontData.dhcpEnabled !== null && ontData.dhcpEnabled !== undefined && (
                                        <div className="ont-item ont-item-full">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-toggle-on"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Servidor DHCP</span>
                                                <span className={`ont-value badge bg-${ontData.dhcpEnabled ? 'success' : 'secondary'}`}>
                                                    {ontData.dhcpEnabled ? 'Habilitado' : 'Deshabilitado'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DHCP Min Address */}
                                    {ontData.dhcpMinAddress && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-arrow-down-circle"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">IP Inicial (Min)</span>
                                                <span className="ont-value font-monospace">{ontData.dhcpMinAddress}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DHCP Max Address */}
                                    {ontData.dhcpMaxAddress && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-arrow-up-circle"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">IP Final (Max)</span>
                                                <span className="ont-value font-monospace">{ontData.dhcpMaxAddress}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Subnet Mask */}
                                    {ontData.lanSubnetMask && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-diagram-2"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Máscara de Subred</span>
                                                <span className="ont-value font-monospace">{ontData.lanSubnetMask}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DHCP Lease Time */}
                                    {ontData.dhcpLeaseTime !== null && ontData.dhcpLeaseTime !== undefined && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-clock-history"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Tiempo de Arrendamiento</span>
                                                <span className="ont-value">{formatUptime(ontData.dhcpLeaseTime)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DHCP DNS Servers */}
                                    {ontData.dhcpDnsServers && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-server"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">DNS del DHCP</span>
                                                <span className="ont-value font-monospace small">{ontData.dhcpDnsServers}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DHCP Routers */}
                                    {ontData.dhcpRouters && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-share"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Routers del DHCP</span>
                                                <span className="ont-value font-monospace">{ontData.dhcpRouters}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DHCP Domain Name */}
                                    {ontData.dhcpDomainName && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-globe"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Dominio</span>
                                                <span className="ont-value">{ontData.dhcpDomainName}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reserved Addresses */}
                                    {ontData.dhcpReservedAddresses && ontData.dhcpReservedAddresses !== '0.0.0.0' && (
                                        <div className="ont-item">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-bookmark"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">IPs Reservadas</span>
                                                <span className="ont-value font-monospace small">{ontData.dhcpReservedAddresses}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Allowed MAC Addresses */}
                                    {ontData.dhcpAllowedMacAddresses && (
                                        <div className="ont-item ont-item-full">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-shield-check"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">MACs Permitidas</span>
                                                <span className="ont-value font-monospace small">{ontData.dhcpAllowedMacAddresses || 'Todas'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tarjeta de DMZ y ACL */}
                {(ontData.dmzEnabled !== null || ontData.dmzHost || ontData.aclEnabled !== null) && (
                    <div className="col-lg-6">
                        <div className="card client-ont-card shadow-sm">
                            <div className="card-header client-ont-header-network">
                                <h5 className="mb-0">
                                    <i className="bi bi-shield-lock me-2"></i>
                                    DMZ y Control de Acceso (ACL)
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="client-ont-grid">
                                    {/* DMZ Enabled */}
                                    {ontData.dmzEnabled !== null && ontData.dmzEnabled !== undefined && (
                                        <div className="ont-item ont-item-full">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-shield"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">DMZ</span>
                                                <span className={`ont-value badge bg-${ontData.dmzEnabled ? 'warning' : 'secondary'}`}>
                                                    {ontData.dmzEnabled ? 'Habilitado' : 'Deshabilitado'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* DMZ Host */}
                                    {ontData.dmzHost && (
                                        <div className="ont-item ont-item-full">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-router"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Host DMZ</span>
                                                <span className="ont-value font-monospace">{ontData.dmzHost}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* ACL Enabled */}
                                    {ontData.aclEnabled !== null && ontData.aclEnabled !== undefined && (
                                        <div className="ont-item ont-item-full">
                                            <div className="ont-icon ont-icon-network">
                                                <i className="bi bi-list-check"></i>
                                            </div>
                                            <div className="ont-content">
                                                <span className="ont-label">Control de Acceso (ACL)</span>
                                                <span className={`ont-value badge bg-${ontData.aclEnabled ? 'info' : 'secondary'}`}>
                                                    {ontData.aclEnabled ? 'Habilitado' : 'Deshabilitado'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientOntData;
