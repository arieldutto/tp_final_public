import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend
} from "recharts";
//import { useServerCpu } from "../hooks/useServerCpu"
export default function GraficoConsumo({ data, title }) {
    //const data = useServerCpu();  // ← usamos tu hook
    return (
        <>
            <h4 className="text-light mb-2">{title}</h4>

            <div style={{ width: "100%", height: 300 }}>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        responsive
                        data={data}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 5,
                            left: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="time"
                            tick={{ fill: "#fff" }}
                            stroke="#fff"
                        />

                        <YAxis
                            width={"auto"}
                            tick={{ fill: "#fff" }}
                            stroke="#fff"
                            label={{ value: '%', position: 'insideLeft', angle: -90 }}
                        />

                        <Tooltip
                        />
                        <Legend />

                        <Area
                            type="monotone"
                            dataKey="mean"
                            stroke="#1dc80dd0"
                            fill="#beee46af"
                            name="Consumo"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}