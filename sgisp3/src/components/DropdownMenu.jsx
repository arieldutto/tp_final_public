import React from 'react'

function DropdownMenu({ title, items = [], align = "start", icon = null }) {
    return (
        <>
            <li className="nav-item dropdown">
                <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {icon && <i className={`bi ${icon}`}></i>} {title}
                </a>

                <ul className={`dropdown-menu dropdown-menu-${align}`}>
                    {items.map((item, index) => (
                        <li key={index}>
                            <a className="dropdown-item" href={item.href}>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </li>
        </>
    )
}

export default DropdownMenu