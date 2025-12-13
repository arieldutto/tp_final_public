function DropdownMenu({ title, items = [], align = "start", icon = null }) {
    return (
        <li className="nav-item dropdown">
            <a
                className="nav-link dropdown-toggle glass-dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {icon && <i className={`bi ${icon} me-1`}></i>}
                <span>{title}</span>
            </a>

            <ul className={`dropdown-menu dropdown-menu-${align} glass-dropdown-menu`}>
                {items.map((item, index) => (
                    <li key={index}>
                        {item.action ? (
                            /** ITEM CON ACCIÓN */
                            <button
                                className="dropdown-item glass-dropdown-item"
                                onClick={(e) => {
                                    e.preventDefault();
                                    item.action();
                                }}
                            >
                                {item.icon && <i className={`bi ${item.icon} me-2`}></i>}
                                <span>{item.label}</span>
                            </button>
                        ) : (
                            /** ITEM NORMAL CON HREF */
                            <a className="dropdown-item glass-dropdown-item" href={item.href}>
                                {item.icon && <i className={`bi ${item.icon} me-2`}></i>}
                                <span>{item.label}</span>
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </li>
    );
}

export default DropdownMenu;