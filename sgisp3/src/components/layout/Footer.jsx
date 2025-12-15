import React, { useState } from 'react'
import "./footer.css"
import ChangelogModal from '../ChangelogModal';
import { getCurrentVersion } from '../../data/changelog';

function Footer() {
    const [showChangelog, setShowChangelog] = useState(false);
    const currentVersion = getCurrentVersion();

    return (
        <>
            <footer className='bg-primary glass-footer'>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="footer-copyright"> Marco Ariel Dutto <i className="bi bi-c-circle"></i> 2025</div>
                        </div>
                        <div className="col-md-4">
                            <span 
                                className="badge text-bg-success footer-version-badge" 
                                onClick={() => setShowChangelog(true)}
                                title="Ver changelog"
                            >
                                <i className="bi bi-info-circle me-1"></i>
                                V.{currentVersion}
                            </span>
                        </div>
                        <div className="col-md-4">
                            <div className="footer-copyright">Creado por <a href='http://aadingenieria.com.ar'> <span>AAD Ingeniería SRL</span> </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            <ChangelogModal 
                isOpen={showChangelog} 
                onClose={() => setShowChangelog(false)} 
            />
        </>
    )
}

export default Footer