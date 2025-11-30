import React, { useState, useMemo } from "react";

export default function DataList({
    data = [],
    itemsPerPage = 10,
    titulo = "",
}) {

    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);

    // 🔍 FILTRO
    const filtered = useMemo(() => {
        return data.filter(item =>
            Object.values(item)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [search, data]);

    // ↕️ ORDENAMIENTO
    const sorted = useMemo(() => {
        if (!sortField) return filtered;

        return [...filtered].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            if (typeof valA === "number" && typeof valB === "number") {
                return sortOrder === "asc" ? valA - valB : valB - valA;
            }

            return sortOrder === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });
    }, [filtered, sortField, sortOrder]);

    // 📄 PAGINACIÓN
    const start = (page - 1) * itemsPerPage;
    const paginated = sorted.slice(start, start + itemsPerPage);
    const totalPages = Math.ceil(sorted.length / itemsPerPage);

    const handleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    return (
        <div className="p-3 bg-transparent">
            <h4 className="text-light">{titulo}</h4>
            {/* 🔍 BUSCADOR */}
            <input
                type="text"
                className="form-control mb-3 rounded-4 opacity-75 z-3"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
            />

            {/* 📋 TABLA */}
            <div className="table-responsive rounded-4 overflow-hidden opacity-75 z-3">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr className="rounded-4">
                            {data.length > 0 &&
                                Object.keys(data[0]).map((key) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {key.toUpperCase()}
                                        {sortField === key && (sortOrder === "asc" ? " ▲" : " ▼")}
                                    </th>
                                ))}
                        </tr>
                    </thead>

                    <tbody className="rounded-4">
                        {paginated.map((row, index) => (
                            <tr key={index}>
                                {Object.values(row).map((val, i) => (
                                    <td key={i}>{val}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 📄 PAGINACIÓN */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                    className="btn btn-secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Anterior
                </button>

                <span className="text-light">Página {page} de {totalPages}</span>

                <button
                    className="btn btn-secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}