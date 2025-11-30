import React from 'react'

function OntsCard({
    titulo = "Sin Titulo",
    textLine1 = "",
    textLine2 = "",
    tipo = "",
    icono = null
    // para declarar en las class : {`card ${tipo}`}
}) {
    return (
        <div className={`card bg-transparent border-${tipo} rounded-4 position-relative overflow-hidden`}>

            <div className={`card-header bg-${tipo} rounded-top-4 position-relative z-3`}>
                <h5 className="card-title text-light">{titulo}</h5>
            </div>
            <div className="card-body position-relative z-3">
                {/* Fondo del icono */}
                {icono && (
                    <div
                        className={`position-absolute top-50 start-50 translate-middle text-${tipo}`}
                        style={{
                            opacity: 0.25,
                            fontSize: "4rem",
                            zIndex: 0,
                            pointerEvents: "none"
                        }}
                    >
                        {icono}
                    </div>
                )}
                <h5 className='card-text text-light'>{textLine1}</h5>
                <p className='card-text text-light'>{textLine2}</p>
            </div>
        </div>
    )
}

export default OntsCard