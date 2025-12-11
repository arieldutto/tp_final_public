import React, { useEffect } from 'react';
import { useTelegramAlert } from '../hooks/useTelegramAlert';
import { useTelegramAlertContext } from '../../../context/TelegramAlertContext';

/**
 * Componente botón para enviar alertas de ONTs con señal baja a Telegram
 * @param {Array} ontsList - Lista de ONTs
 */
function TelegramAlertButton({ ontsList }) {
    const {
        sendAlerts,
        loading,
        error,
        result,
        ontsWithLowSignal
    } = useTelegramAlert(ontsList);

    // Usar el contexto global para el envío automático
    const {
        isAutoSendEnabled,
        toggleAutoSend,
        lastAutoSend,
        updateOntsList
    } = useTelegramAlertContext();

    // Actualizar la lista de ONTs en el contexto cuando cambie
    useEffect(() => {
        if (ontsList && ontsList.length > 0) {
            updateOntsList(ontsList);
        }
    }, [ontsList, updateOntsList]);

    const handleSendAlerts = () => {
        if (ontsWithLowSignal.length === 0) {
            alert('No hay ONTs con señal baja para enviar alertas');
            return;
        }

        const confirmMessage = `¿Enviar alertas a Telegram para ${ontsWithLowSignal.length} ONT(s) con señal baja?`;
        if (window.confirm(confirmMessage)) {
            sendAlerts(false);
        }
    };

    const formatLastAutoSend = () => {
        if (!lastAutoSend) return 'Nunca';
        const date = new Date(lastAutoSend);
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mb-4">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                <button
                    onClick={handleSendAlerts}
                    disabled={loading || ontsWithLowSignal.length === 0}
                    className="btn btn-warning d-flex align-items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-telegram"></i>
                            Enviar Alertas Manual ({ontsWithLowSignal.length})
                        </>
                    )}
                </button>

                <button
                    onClick={toggleAutoSend}
                    className={`btn d-flex align-items-center gap-2 ${isAutoSendEnabled ? 'btn-success' : 'btn-outline-success'
                        }`}
                >
                    <i className={`bi ${isAutoSendEnabled ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                    {isAutoSendEnabled ? 'Envío Automático: ON' : 'Envío Automático: OFF'}
                </button>

                {isAutoSendEnabled && (
                    <span className="badge bg-info text-dark">
                        <i className="bi bi-clock me-1"></i>
                        Cada 1 hora
                    </span>
                )}
            </div>

            {isAutoSendEnabled && lastAutoSend && (
                <div className="alert alert-info mb-2" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <strong>Último envío automático:</strong> {formatLastAutoSend()}
                </div>
            )}

            {error && (
                <div className="alert alert-danger mt-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            {result && result.ok && result.sent > 0 && (
                <div className="alert alert-success mt-2" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {result.sent} alerta(s) enviada(s) exitosamente a Telegram
                </div>
            )}

            {result && !result.ok && result.errors && result.errors.length > 0 && (
                <div className="alert alert-warning mt-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Se enviaron {result.sent} de {ontsWithLowSignal.length} alertas.
                    {result.errors.length > 0 && ` ${result.errors.length} error(es) ocurrieron.`}
                </div>
            )}

            {ontsWithLowSignal.length === 0 && (
                <div className="alert alert-info mt-2" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    No hay ONTs con señal baja en este momento
                </div>
            )}

            {isAutoSendEnabled && (
                <div className="alert alert-success mt-2" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <strong>Envió automático activo:</strong> El sistema enviará alertas cada 1 hora automáticamente,
                    incluso si sales de esta página. Los datos se actualizan cada 5 minutos.
                    {lastAutoSend && ` Último envío: ${formatLastAutoSend()}`}
                </div>
            )}
        </div>
    );
}

export default TelegramAlertButton;

