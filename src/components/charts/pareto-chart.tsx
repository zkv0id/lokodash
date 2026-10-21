"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParetoPoint } from "@/lib/analytics";
import { useMediaQuery } from "@/lib/use-media-query";

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
};

export function ParetoChart({ data }: { data: ParetoPoint[] }) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-slate-500">
        Tidak ada temuan pada filter ini.
      </div>
    );
  }

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: isMobile ? 4 : 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={isMobile ? 74 : 92}
            tick={{ fill: "#94a3b8", fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1e293b55" }} />
          <Legend
            wrapperStyle={{ fontSize: isMobile ? 10 : 11, color: "#94a3b8", paddingTop: 4 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="critical"
            name="Urgent"
            stackId="a"
            fill="#f43f5e"
            barSize={16}
          />
          <Bar
            dataKey="invalid"
            name="Invalid"
            stackId="a"
            fill="#94a3b8"
            barSize={16}
          />
          <Bar
            dataKey="warning"
            name="Warning"
            stackId="a"
            fill="#f59e0b"
            radius={[0, 4, 4, 0]}
            barSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
