import React from 'react'
import "./footer.css"
function Footer() {
    return (
        <>
            <footer className='bg-primary glass-footer'>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="footer-copyright"> Marco Ariel Dutto <i className="bi bi-c-circle"></i> 2025</div>
                        </div>
                        <div className="col-md-4">
                            <span className="badge text-bg-success">V.3.0.0</span>
                        </div>
                        <div className="col-md-4">
                            <div className="footer-copyright">Creado por <a href='http://aadingenieria.com.ar'> <span>AAD Ingeniería SRL</span> </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer