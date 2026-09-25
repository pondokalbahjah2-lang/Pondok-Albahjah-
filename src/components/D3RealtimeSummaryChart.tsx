import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface D3ChartDataPoint {
  id: 'attendance' | 'leave' | 'permit';
  label: string;
  count: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

interface D3RealtimeSummaryChartProps {
  activeAttendanceToday: number;
  pendingLeaveRequests: number;
  pendingExitPermits: number;
  onSelectCategory?: (category: 'attendance' | 'leave' | 'permit') => void;
}

export const D3RealtimeSummaryChart: React.FC<D3RealtimeSummaryChartProps> = ({
  activeAttendanceToday,
  pendingLeaveRequests,
  pendingExitPermits,
  onSelectCategory,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<D3ChartDataPoint | null>(null);

  const data: D3ChartDataPoint[] = [
    {
      id: 'attendance',
      label: 'Presensi Aktif Hari Ini',
      count: activeAttendanceToday,
      color: '#10b981',
      gradientFrom: '#10b981',
      gradientTo: '#059669',
    },
    {
      id: 'leave',
      label: 'Pengajuan Cuti Menunggu',
      count: pendingLeaveRequests,
      color: '#8b5cf6',
      gradientFrom: '#a855f7',
      gradientTo: '#7c3aed',
    },
    {
      id: 'permit',
      label: 'Izin Keluar Menunggu',
      count: pendingExitPermits,
      color: '#0284c7',
      gradientFrom: '#38bdf8',
      gradientTo: '#0284c7',
    },
  ];

  const totalCount = activeAttendanceToday + pendingLeaveRequests + pendingExitPermits;

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 240;
    const height = 240;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.62;
    const outerRadius = radius * 0.88;
    const hoverOuterRadius = radius * 0.94;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Defs for gradients & shadow filters
    const defs = svg.append('defs');

    // Drop shadow filter
    const filter = defs
      .append('filter')
      .attr('id', 'd3-donut-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '4')
      .attr('flood-opacity', '0.15');

    // Gradients for each data point
    data.forEach((d) => {
      const grad = defs
        .append('linearGradient')
        .attr('id', `grad-${d.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', d.gradientFrom);
      grad.append('stop').attr('offset', '100%').attr('stop-color', d.gradientTo);
    });

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Handle empty state
    if (totalCount === 0) {
      g.append('circle')
        .attr('r', (innerRadius + outerRadius) / 2)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', outerRadius - innerRadius)
        .attr('stroke-dasharray', '4 4')
        .attr('opacity', 0.25);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .attr('class', 'fill-slate-400 font-bold text-xs')
        .text('Tidak Ada Data');

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('class', 'fill-slate-400 text-[10px]')
        .text('Aktivitas 0');

      return;
    }

    // Pie generator
    const pie = d3
      .pie<D3ChartDataPoint>()
      .value((d) => (d.count === 0 ? 0.001 : d.count)) // small minimum so non-zero ratio renders nicely if all 0
      .sort(null)
      .padAngle(0.04);

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<D3ChartDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(6);

    const hoverArc = d3
      .arc<d3.PieArcDatum<D3ChartDataPoint>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(hoverOuterRadius)
      .cornerRadius(8);

    // Render path groups
    const arcs = g
      .selectAll('.arc')
      .data(pie(data.filter((d) => d.count > 0)))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer');

    // Animated arcs
    arcs
      .append('path')
      .attr('fill', (d) => `url(#grad-${d.data.id})`)
      .attr('filter', 'url(#d3-donut-glow)')
      .each(function (this: any) {
        this._current = { startAngle: 0, endAngle: 0 };
      })
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc as any)
          .attr('opacity', 1);
        setHoveredSegment(d.data);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc as any)
          .attr('opacity', 0.95);
        setHoveredSegment(null);
      })
      .on('click', (event, d) => {
        if (onSelectCategory) {
          onSelectCategory(d.data.id);
        }
      })
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (this: any, d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || '';
        };
      });

    // Center background circle
    g.append('circle')
      .attr('r', innerRadius - 6)
      .attr('class', 'fill-white/80 dark:fill-slate-900/80 backdrop-blur-md')
      .attr('stroke', 'rgba(150, 150, 150, 0.1)')
      .attr('stroke-width', 1);

  }, [activeAttendanceToday, pendingLeaveRequests, pendingExitPermits, totalCount]);

  const activeDisplay = hoveredSegment || {
    label: 'Total Operasional',
    count: totalCount,
    color: '#059669',
    percentage: 100,
  };

  const activePercentage =
    totalCount > 0
      ? Math.round((activeDisplay.count / totalCount) * 100)
      : 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
      {/* Chart Canvas */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          ref={svgRef}
          width={240}
          height={240}
          viewBox="0 0 240 240"
          className="overflow-visible"
        />

        {/* Center overlay label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 max-w-[110px] truncate">
            {hoveredSegment ? hoveredSegment.label : 'Total Aktivitas'}
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
            {hoveredSegment ? hoveredSegment.count : totalCount}
          </span>
          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
            {hoveredSegment ? `${activePercentage}%` : '100% Rasio'}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown stats */}
      <div className="flex-1 w-full space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Visualisasi Rasio D3.js Live
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            {totalCount} Total Item
          </span>
        </div>

        {data.map((item) => {
          const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
          const isHovered = hoveredSegment?.id === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory && onSelectCategory(item.id)}
              onMouseEnter={() => setHoveredSegment(item)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`w-full text-left p-2.5 rounded-2xl transition-all border flex items-center justify-between ${
                isHovered
                  ? 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600 scale-[1.02] shadow-sm'
                  : 'bg-white/40 dark:bg-slate-800/40 border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-lg flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-white">
                  {item.count}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 min-w-[32px] text-right">
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
