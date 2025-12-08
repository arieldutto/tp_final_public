function RenderObject({ obj, level = 1 }) {

    return (
        <div style={{ marginLeft: level * 15 }}>
            {Object.entries(obj).map(([key, value]) => (
                <div key={key}>
                    <strong>{key}:</strong>

                    {typeof value === "object" && value !== null ? (
                        // SI es objeto → volver a llamar recursivamente
                        <RenderObject obj={value} level={level + 1} />
                    ) : (
                        // SI es valor final → mostrarlo
                        <span> {String(value)}</span>
                    )}
                </div>
            ))}
        </div>
    );
}