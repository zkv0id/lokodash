"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DetailTrendPoint } from "@/lib/analytics";
import { monthLabel } from "@/lib/utils";

const COLORS = [
  "#f59e0b",
  "#38bdf8",
  "#34d399",
  "#f472b6",
  "#a78bfa",
  "#fb7185",
];

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
};

export function WheelsetTrend({ data }: { data: DetailTrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => monthLabel(String(value))}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
            labelFormatter={(value) => monthLabel(String(value))}
            cursor={{ stroke: "#334155", strokeDasharray: "4 4" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          {[1, 2, 3, 4, 5, 6].map((axle, index) => (
            <Line
              key={axle}
              type="monotone"
              dataKey={`a${axle}`}
              name={`Axle ${axle}`}
              stroke={COLORS[index]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
