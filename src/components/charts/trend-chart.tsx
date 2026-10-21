"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/analytics";
import { monthLabel } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#e2e8f0",
};

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div className="h-56 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={
            isMobile
              ? { top: 4, right: 0, left: -26, bottom: 0 }
              : { top: 8, right: 4, left: -18, bottom: 0 }
          }
        >
          <defs>
            <linearGradient id="flangeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => monthLabel(String(value))}
            tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={isMobile ? 18 : 8}
          />
          <YAxis
            yAxisId="left"
            domain={[20, 34]}
            width={isMobile ? 32 : undefined}
            tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[980, 1080]}
            hide={isMobile}
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
            wrapperStyle={{
              fontSize: isMobile ? 10 : 11,
              color: "#94a3b8",
              paddingTop: isMobile ? 2 : 8,
            }}
            iconType="circle"
            iconSize={7}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="flangeThickness"
            name={isMobile ? "Flange" : "Tebal flange (mm)"}
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#flangeFill)"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="diameter"
            name={isMobile ? "Diameter" : "Diameter roda (mm)"}
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
