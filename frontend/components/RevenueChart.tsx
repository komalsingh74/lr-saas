"use client";
import React from "react";

type Point = { label: string; value: number };

export default function RevenueChart({ data, height = 120 }: { data: Point[]; height?: number }) {
    const width = Math.max(300, data.length * 24);

    const max = Math.max(...data.map((d) => d.value), 1);

    const points = data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * width;
        const y = height - (d.value / max) * height;
        return { x, y };
    });

    const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
    const areaD = `${lineD} L ${width},${height} L 0,${height} Z`;

    return (
        <div className="w-full overflow-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04" />
                    </linearGradient>
                </defs>

                <path d={areaD} fill="url(#revGrad)" />
                <path d={lineD} fill="none" stroke="#0ea5e9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

                {/* subtle grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line
                        key={t}
                        x1={0}
                        x2={width}
                        y1={height - t * height}
                        y2={height - t * height}
                        stroke="#e6eef9"
                        strokeWidth={1}
                    />
                ))}
            </svg>
        </div>
    );
}
