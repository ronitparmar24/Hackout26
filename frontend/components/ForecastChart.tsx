"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getForecast } from "@/lib/api";

export default function ForecastChart({ runId }: { runId: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getForecast(runId).then(res => {
      const formatted = res.quarters.map((q: string, i: number) => ({
        name: q,
        bau: res.bau[i],
        optimized: res.optimized[i]
      }));
      setData(formatted);
    }).catch(console.error);
  }, [runId]);

  if (!data.length) return <div className="h-64 flex items-center justify-center text-white/50 animate-pulse">Forecasting Trajectory...</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBAU" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#ffffff80' }}/>
          <Area type="monotone" dataKey="bau" name="Business As Usual" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBAU)" />
          <Area type="monotone" dataKey="optimized" name="Optimized Trajectory" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOpt)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
