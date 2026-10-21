import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Layers,
  Award,
  Check,
  AlertTriangle,
  LineChart as LineChartIcon
} from 'lucide-react';
import { INDICATORS, MONTH_NAMES } from '../data/inmConfig';
import { HospitalConfig, MonthlyRecord } from '../types/inm';
import {
  computeComprehensiveSummaries,
  computeMonthlySummaries,
  formatNumber,
  isTargetMet,
} from '../utils/calculations';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MonthlyRecord;
  hospital: HospitalConfig;
  yearRecords?: Record<number, MonthlyRecord>;
  initialChartModel?: 'bar' | 'line';
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  record,
  hospital,
  yearRecords,
  initialChartModel = 'bar',
}) => {
  // Chart selection state: 'bar' (Batang), 'line' (Garis Tren), or 'both' (Kedua Model)
  const [chartModel, setChartModel] = useState<'bar' | 'line' | 'both'>(initialChartModel);

  // Sync with initialChartModel whenever the modal opens or the prop changes
  useEffect(() => {
    if (isOpen && initialChartModel) {
      setChartModel(initialChartModel);
    }
  }, [isOpen, initialChartModel]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTwChart, setIncludeTwChart] = useState(true);
  const [includePeriodsTable, setIncludePeriodsTable] = useState(true);
  const [includeMonthlyMatrix, setIncludeMonthlyMatrix] = useState(true);

  if (!isOpen) return null;

  const summaries = computeMonthlySummaries(record);
  const comprehensive = computeComprehensiveSummaries(
    record.year,
    yearRecords || { [record.month]: record }
  );
  const monthName = MONTH_NAMES[record.month - 1];

  const handlePrint = () => {
    window.print();
  };

  // Dimensions for high-resolution print charts
  const svgWidth = 860;
  const svgHeight = 270;
  const paddingLeft = 52;
  const paddingRight = 25;
  const paddingTop = 28;
  const paddingBottom = 42;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const yMax = 100;

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(yMax, val));
    return paddingTop + chartHeight - (clamped / yMax) * chartHeight;
  };

  const getIndicatorX = (idx: number, total: number = 13) => {
    const slot = chartWidth / (total - 1 || 1);
    return paddingLeft + idx * slot;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Bar with Interactive Print Controls (Hidden in Print) */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-3.5 z-10 print:hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Pratinjau &amp; Pengaturan Cetak Laporan Mutu Nasional
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih model grafik (batang / garis tren) dan data yang ingin disertakan pada hasil cetak atau PDF.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all animate-pulse"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sekarang (Ctrl + P)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Model Grafik & Content Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Pilihan Model Grafik: Batang vs Tren */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 px-2 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Model Grafik:</span>
              </span>
              <button
                type="button"
                onClick={() => setChartModel('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartModel === 'bar'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Grafik Batang</span>
              </button>
              <button
                type="button"
                onClick={() => setChartModel('line')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartModel === 'line'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Grafik Garis Tren</span>
              </button>
              <button
                type="button"
                onClick={() => setChartModel('both')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  chartModel === 'both'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Kedua Model</span>
              </button>
            </div>

            {/* Print Selection Checkboxes */}
            <div className="flex flex-wrap items-center gap-3 text-slate-700 font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Grafik Capaian INM</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTwChart}
                  onChange={(e) => setIncludeTwChart(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Grafik Triwulan</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePeriodsTable}
                  onChange={(e) => setIncludePeriodsTable(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Tabel Rekapitulasi TW/Semester</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMonthlyMatrix}
                  onChange={(e) => setIncludeMonthlyMatrix(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Matriks 12 Bulan</span>
              </label>
            </div>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-8 sm:p-12 print:p-6 text-slate-900 bg-white" id="printable-area">
          {/* Hospital Official Kop */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center relative">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
              {hospital.name}
            </h1>
            <h2 className="text-sm sm:text-base font-bold text-slate-700 uppercase tracking-wide mt-0.5">
              {hospital.subTitle}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {hospital.address} &bull; Kota {hospital.city}
            </p>
            <div className="border-t border-slate-400 mt-2 pt-1 text-[11px] text-slate-500 flex justify-between font-sans">
              <span>Formulir: INM-KEMENKES-REKAP</span>
              <span>Standar Akreditasi Kemenkes RI (Permenkes No. 30 Tahun 2022)</span>
            </div>
          </div>

          {/* Title & Period */}
          <div className="text-center my-5">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
              LAPORAN REKAPITULASI INDIKATOR NASIONAL MUTU (INM)
            </h3>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              PERIODE: BULAN {monthName.toUpperCase()} &bull; TAHUN EVALUASI {record.year}
            </p>
          </div>

          {/* Executive Summary Metric Badges */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 my-4 text-center text-[11px] page-break-inside-avoid">
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">Bulan {monthName.substring(0, 3)}</span>
              <span className="font-bold text-xs text-emerald-800">
                {summaries.filter((s) => s.isMetAverage).length} / {summaries.filter((s) => s.avgPercent !== null).length} Met
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">TW 1</span>
              <span className="font-bold text-xs text-teal-800">
                {comprehensive.overallTwComplianceRates.tw1.toFixed(1)}%
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">TW 2</span>
              <span className="font-bold text-xs text-teal-800">
                {comprehensive.overallTwComplianceRates.tw2.toFixed(1)}%
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">TW 3</span>
              <span className="font-bold text-xs text-teal-800">
                {comprehensive.overallTwComplianceRates.tw3.toFixed(1)}%
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">TW 4</span>
              <span className="font-bold text-xs text-teal-800">
                {comprehensive.overallTwComplianceRates.tw4.toFixed(1)}%
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">Semester 1</span>
              <span className="font-bold text-xs text-cyan-900">
                {comprehensive.overallSemesterComplianceRates.s1.toFixed(1)}%
              </span>
            </div>
            <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-500 block font-semibold uppercase">Tahunan</span>
              <span className="font-bold text-xs text-indigo-950">
                {comprehensive.overallAnnualComplianceRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* GRAFIK 1: CAPAIAN MUTU (SESUAI PILIHAN: BATANG ATAU TREN ATAU KEDUANYA)    */}
          {/* ========================================================================= */}
          {includeCharts && (
            <>
              {/* MODEL 1A: GRAFIK BATANG (Jika dipilih 'bar' atau 'both') */}
              {(chartModel === 'bar' || chartModel === 'both') && (
                <div className="my-6 border border-slate-300 rounded-xl p-4 bg-white page-break-inside-avoid">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-emerald-700" />
                        <span>GRAFIK BATANG: CAPAIAN INDIKATOR NASIONAL MUTU (BULAN {monthName.toUpperCase()} VS TAHUNAN)</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Grafik model batang perbandingan capaian rata-rata bulan berjalan dan akumulasi tahunan terhadap target Kemenkes.
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-600 flex items-center gap-3 font-sans">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-emerald-700 rounded-xs inline-block"></span>
                        Bulan {monthName.substring(0, 3)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-indigo-700 rounded-xs inline-block"></span>
                        Tahunan {record.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-900 inline-block"></span>
                        Target Standar
                      </span>
                    </div>
                  </div>

                  <div className="w-full overflow-hidden">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto font-sans">
                      {/* Grid Lines */}
                      {[0, 20, 40, 60, 80, 100].map((lvl) => {
                        const y = getY(lvl);
                        return (
                          <g key={lvl}>
                            <line
                              x1={paddingLeft}
                              y1={y}
                              x2={svgWidth - paddingRight}
                              y2={y}
                              stroke="#cbd5e1"
                              strokeDasharray={lvl === 0 || lvl === 100 ? undefined : '2 2'}
                            />
                            <text x={paddingLeft - 6} y={y + 4} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                              {lvl}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Bars */}
                      {INDICATORS.map((ind, idx) => {
                        const mSum = summaries.find((s) => s.id === ind.id);
                        const comp = comprehensive.indicators.find((s) => s.id === ind.id);
                        const mVal = mSum?.avgPercent ?? null;
                        const annVal = comp?.annual.percent ?? null;
                        const targetY = getY(ind.targetValue);

                        const total = INDICATORS.length;
                        const slotWidth = chartWidth / total;
                        const xSlot = paddingLeft + idx * slotWidth;
                        const bWidth = Math.min(14, (slotWidth - 6) / 2);

                        return (
                          <g key={ind.id}>
                            {/* Bar 1: Monthly */}
                            {mVal !== null && (
                              <rect
                                x={xSlot + 4}
                                y={getY(mVal)}
                                width={bWidth}
                                height={Math.max(2, chartHeight - (getY(mVal) - paddingTop))}
                                fill="#047857"
                                rx={2}
                              />
                            )}
                            {/* Bar 2: Annual */}
                            {annVal !== null && (
                              <rect
                                x={xSlot + 4 + bWidth + 2}
                                y={getY(annVal)}
                                width={bWidth}
                                height={Math.max(2, chartHeight - (getY(annVal) - paddingTop))}
                                fill="#4338ca"
                                rx={2}
                              />
                            )}
                            {/* Target Line Tick */}
                            <line
                              x1={xSlot + 2}
                              y1={targetY}
                              x2={xSlot + slotWidth - 2}
                              y2={targetY}
                              stroke="#0f172a"
                              strokeWidth={2}
                              strokeDasharray="2 2"
                            />
                            {/* Labels */}
                            <text
                              x={xSlot + slotWidth / 2}
                              y={svgHeight - paddingBottom + 14}
                              textAnchor="middle"
                              className="text-[9px] font-mono fill-slate-800 font-bold"
                            >
                              INM-{ind.id < 10 ? `0${ind.id}` : ind.id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* MODEL 1B: GRAFIK GARIS TREN (Jika dipilih 'line' atau 'both') */}
              {(chartModel === 'line' || chartModel === 'both') && (
                <div className="my-6 border border-slate-300 rounded-xl p-4 bg-white page-break-inside-avoid">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-teal-700" />
                        <span>GRAFIK GARIS TREN: CAPAIAN INDIKATOR NASIONAL MUTU (BULAN {monthName.toUpperCase()} &amp; TAHUNAN)</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Grafik model garis tren fluktuasi capaian 13 Indikator Nasional Mutu terhadap garis target nasional Kemenkes.
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-600 flex items-center gap-3 font-sans">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-emerald-600 inline-block"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                        Bulan {monthName.substring(0, 3)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-indigo-600 inline-block"></span>
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                        Tahunan {record.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-900 inline-block"></span>
                        Target Standar
                      </span>
                    </div>
                  </div>

                  <div className="w-full overflow-hidden">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto font-sans">
                      {/* Grid Lines */}
                      {[0, 20, 40, 60, 80, 100].map((lvl) => {
                        const y = getY(lvl);
                        return (
                          <g key={lvl}>
                            <line
                              x1={paddingLeft}
                              y1={y}
                              x2={svgWidth - paddingRight}
                              y2={y}
                              stroke="#cbd5e1"
                              strokeDasharray={lvl === 0 || lvl === 100 ? undefined : '2 2'}
                            />
                            <text x={paddingLeft - 6} y={y + 4} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                              {lvl}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Target dashed line */}
                      {(() => {
                        const targetPoints = INDICATORS.map((ind, idx) => ({
                          x: getIndicatorX(idx, INDICATORS.length),
                          y: getY(ind.targetValue),
                        }));
                        const targetPath = targetPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        return (
                          <path
                            d={targetPath}
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                          />
                        );
                      })()}

                      {/* Month Trend Line */}
                      {(() => {
                        const mPoints = INDICATORS.map((ind, idx) => {
                          const mSum = summaries.find((s) => s.id === ind.id);
                          const val = mSum?.avgPercent ?? null;
                          return {
                            x: getIndicatorX(idx, INDICATORS.length),
                            y: val !== null ? getY(val) : null,
                            val,
                            ind,
                          };
                        });
                        const validPoints = mPoints.filter((p) => p.y !== null) as { x: number; y: number; val: number; ind: any }[];
                        const pathD = validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                        return (
                          <>
                            {validPoints.length > 1 && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke="#059669"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            {validPoints.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r={4.5} fill="#059669" stroke="#ffffff" strokeWidth={1.5} />
                                <text
                                  x={p.x}
                                  y={p.y - 7}
                                  textAnchor="middle"
                                  className="text-[8.5px] font-mono fill-emerald-800 font-bold"
                                >
                                  {p.val.toFixed(0)}%
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}

                      {/* Annual Trend Line */}
                      {(() => {
                        const aPoints = INDICATORS.map((ind, idx) => {
                          const comp = comprehensive.indicators.find((s) => s.id === ind.id);
                          const val = comp?.annual.percent ?? null;
                          return {
                            x: getIndicatorX(idx, INDICATORS.length),
                            y: val !== null ? getY(val) : null,
                            val,
                            ind,
                          };
                        });
                        const validPoints = aPoints.filter((p) => p.y !== null) as { x: number; y: number; val: number; ind: any }[];
                        const pathD = validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                        return (
                          <>
                            {validPoints.length > 1 && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke="#4338ca"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            {validPoints.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r={4} fill="#4338ca" stroke="#ffffff" strokeWidth={1.5} />
                              </g>
                            ))}
                          </>
                        );
                      })()}

                      {/* X Axis labels */}
                      {INDICATORS.map((ind, idx) => (
                        <text
                          key={ind.id}
                          x={getIndicatorX(idx, INDICATORS.length)}
                          y={svgHeight - paddingBottom + 16}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-800 font-bold"
                        >
                          INM-{ind.id < 10 ? `0${ind.id}` : ind.id}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* GRAFIK 2: CAPAIAN TRIWULAN (SESUAI PILIHAN: BATANG ATAU TREN)              */}
          {/* ========================================================================= */}
          {includeTwChart && (
            <>
              {/* MODEL 2A: GRAFIK BATANG TRIWULAN */}
              {(chartModel === 'bar' || chartModel === 'both') && (
                <div className="my-6 border border-slate-300 rounded-xl p-4 bg-white page-break-inside-avoid">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-teal-700" />
                        <span>GRAFIK BATANG: CAPAIAN PER TRIWULAN (TW 1, TW 2, TW 3, TW 4)</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Grafik model multi-batang perbandingan capaian 13 Indikator Nasional Mutu di setiap periode triwulan.
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-600 flex items-center gap-3 font-sans">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-sky-600 rounded-xs inline-block"></span>
                        TW 1
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-teal-600 rounded-xs inline-block"></span>
                        TW 2
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-amber-600 rounded-xs inline-block"></span>
                        TW 3
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-purple-600 rounded-xs inline-block"></span>
                        TW 4
                      </span>
                    </div>
                  </div>

                  <div className="w-full overflow-hidden">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto font-sans">
                      {[0, 20, 40, 60, 80, 100].map((lvl) => {
                        const y = getY(lvl);
                        return (
                          <g key={lvl}>
                            <line
                              x1={paddingLeft}
                              y1={y}
                              x2={svgWidth - paddingRight}
                              y2={y}
                              stroke="#cbd5e1"
                              strokeDasharray={lvl === 0 || lvl === 100 ? undefined : '2 2'}
                            />
                            <text x={paddingLeft - 6} y={y + 4} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                              {lvl}%
                            </text>
                          </g>
                        );
                      })}

                      {comprehensive.indicators.map((ind, idx) => {
                        const total = comprehensive.indicators.length;
                        const slotWidth = chartWidth / total;
                        const xSlot = paddingLeft + idx * slotWidth;
                        const miniW = Math.min(8, (slotWidth - 8) / 4);
                        const targetY = getY(ind.targetValue);

                        const qs = [
                          { val: ind.tw1.percent, color: '#0284c7' },
                          { val: ind.tw2.percent, color: '#0d9488' },
                          { val: ind.tw3.percent, color: '#d97706' },
                          { val: ind.tw4.percent, color: '#7c3aed' },
                        ];

                        return (
                          <g key={ind.id}>
                            {qs.map((q, qIdx) => {
                              if (q.val === null) return null;
                              const bx = xSlot + 3 + qIdx * (miniW + 1.5);
                              const by = getY(q.val);
                              return (
                                <rect
                                  key={qIdx}
                                  x={bx}
                                  y={by}
                                  width={miniW}
                                  height={Math.max(2, chartHeight - (by - paddingTop))}
                                  fill={q.color}
                                  rx={1.5}
                                />
                              );
                            })}
                            <line
                              x1={xSlot + 2}
                              y1={targetY}
                              x2={xSlot + slotWidth - 2}
                              y2={targetY}
                              stroke="#0f172a"
                              strokeWidth={2}
                              strokeDasharray="2 2"
                            />
                            <text
                              x={xSlot + slotWidth / 2}
                              y={svgHeight - paddingBottom + 14}
                              textAnchor="middle"
                              className="text-[9px] font-mono fill-slate-800 font-bold"
                            >
                              INM-{ind.id < 10 ? `0${ind.id}` : ind.id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* MODEL 2B: GRAFIK GARIS TREN TRIWULAN (TREN PROGRESSION LINE) */}
              {(chartModel === 'line' || chartModel === 'both') && (
                <div className="my-6 border border-slate-300 rounded-xl p-4 bg-white page-break-inside-avoid">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-teal-700" />
                        <span>GRAFIK GARIS TREN: PERKEMBANGAN CAPAIAN TRIWULAN (TW 1 ➔ TW 2 ➔ TW 3 ➔ TW 4)</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Grafik model garis tren pergerakan kepatuhan mutu rumah sakit dan per indikator antar triwulan.
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-600 flex items-center gap-3 font-sans">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-sky-600 inline-block"></span>
                        TW 1
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-teal-600 inline-block"></span>
                        TW 2
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-amber-600 inline-block"></span>
                        TW 3
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-purple-600 inline-block"></span>
                        TW 4
                      </span>
                    </div>
                  </div>

                  <div className="w-full overflow-hidden">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto font-sans">
                      {[0, 20, 40, 60, 80, 100].map((lvl) => {
                        const y = getY(lvl);
                        return (
                          <g key={lvl}>
                            <line
                              x1={paddingLeft}
                              y1={y}
                              x2={svgWidth - paddingRight}
                              y2={y}
                              stroke="#cbd5e1"
                              strokeDasharray={lvl === 0 || lvl === 100 ? undefined : '2 2'}
                            />
                            <text x={paddingLeft - 6} y={y + 4} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">
                              {lvl}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Render 4 Quarter Trend Lines across all 13 Indicators */}
                      {[
                        { key: 'tw1', color: '#0284c7', label: 'TW1' },
                        { key: 'tw2', color: '#0d9488', label: 'TW2' },
                        { key: 'tw3', color: '#d97706', label: 'TW3' },
                        { key: 'tw4', color: '#7c3aed', label: 'TW4' },
                      ].map((qGroup) => {
                        const qPoints = comprehensive.indicators.map((ind, idx) => {
                          const val = (ind as any)[qGroup.key]?.percent ?? null;
                          return {
                            x: getIndicatorX(idx, comprehensive.indicators.length),
                            y: val !== null ? getY(val) : null,
                            val,
                          };
                        });
                        const validPoints = qPoints.filter((p) => p.y !== null) as { x: number; y: number; val: number }[];
                        const pathD = validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                        return (
                          <g key={qGroup.key}>
                            {validPoints.length > 1 && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke={qGroup.color}
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={0.85}
                              />
                            )}
                            {validPoints.map((p, i) => (
                              <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={qGroup.color} stroke="#ffffff" strokeWidth={1} />
                            ))}
                          </g>
                        );
                      })}

                      {/* X Axis labels */}
                      {comprehensive.indicators.map((ind, idx) => (
                        <text
                          key={ind.id}
                          x={getIndicatorX(idx, comprehensive.indicators.length)}
                          y={svgHeight - paddingBottom + 16}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-800 font-bold"
                        >
                          INM-{ind.id < 10 ? `0${ind.id}` : ind.id}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>
              )}
            </>
          )}

          {/* PRINTABLE TABEL 1: REKAPITULASI RESMI (BULAN, TW1, TW2, TW3, TW4, S1, S2, TAHUNAN) */}
          {includePeriodsTable && (
            <div className="my-6 page-break-inside-avoid">
              <h4 className="font-black text-xs uppercase tracking-wide text-slate-900 mb-2">
                TABEL 1: REKAPITULASI NILAI RATA-RATA INM (BULANAN, TRIWULAN, SEMESTER, TAHUNAN)
              </h4>
              <table className="w-full text-xs border-collapse border border-slate-600 font-mono">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold font-sans text-[11px]">
                    <th className="border border-slate-600 py-2 px-1 text-center w-8">NO.</th>
                    <th className="border border-slate-600 py-2 px-2 text-left min-w-[200px]">INDIKATOR NASIONAL MUTU</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-16">STANDAR</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-20 bg-slate-300">BULAN {monthName.substring(0, 3).toUpperCase()}</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-16">TW 1</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-16">TW 2</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-16">TW 3</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-16">TW 4</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-18">SM 1</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-18">SM 2</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-22 bg-slate-300">TAHUN {record.year}</th>
                    <th className="border border-slate-600 py-2 px-1 text-center w-24">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {comprehensive.indicators.map((ind) => {
                    const mSum = summaries.find((s) => s.id === ind.id);
                    const isMetAnnual = ind.annual.isMet;

                    return (
                      <tr key={ind.id} className="border border-slate-600">
                        <td className="border border-slate-600 py-1.5 px-1 text-center font-bold font-sans">
                          {ind.id}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-2 font-sans font-medium text-slate-900">
                          {ind.title}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center font-bold">
                          {ind.targetLabel}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center font-bold bg-slate-100">
                          {mSum?.avgPercent !== null && mSum?.avgPercent !== undefined ? `${mSum.avgPercent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center">
                          {ind.tw1.percent !== null ? `${ind.tw1.percent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center">
                          {ind.tw2.percent !== null ? `${ind.tw2.percent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center">
                          {ind.tw3.percent !== null ? `${ind.tw3.percent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center">
                          {ind.tw4.percent !== null ? `${ind.tw4.percent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center">
                          {ind.s1.percent !== null ? `${ind.s1.percent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center">
                          {ind.s2.percent !== null ? `${ind.s2.percent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center font-bold bg-slate-100">
                          {ind.annual.percent !== null ? `${ind.annual.percent.toFixed(1)}%` : '-'}
                        </td>
                        <td className="border border-slate-600 py-1.5 px-1 text-center font-sans font-bold text-[10px]">
                          {isMetAnnual === true ? (
                            <span className="text-emerald-800">TERCAPAI</span>
                          ) : isMetAnnual === false ? (
                            <span className="text-rose-800">BELUM</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PRINTABLE TABEL 2: MATRIKS 12 BULAN (JAN - DES) */}
          {includeMonthlyMatrix && (
            <div className="my-6 page-break-inside-avoid">
              <h4 className="font-black text-xs uppercase tracking-wide text-slate-900 mb-2">
                TABEL 2: MATRIKS CAPAIAN BULANAN LENGKAP (JANUARI S/D DESEMBER {record.year})
              </h4>
              <table className="w-full text-[10px] border-collapse border border-slate-600 font-mono">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold font-sans">
                    <th className="border border-slate-600 py-1.5 px-1 text-center w-7">NO</th>
                    <th className="border border-slate-600 py-1.5 px-2 text-left min-w-[180px]">INDIKATOR</th>
                    <th className="border border-slate-600 py-1.5 px-1 text-center w-14">TARGET</th>
                    {MONTH_NAMES.map((m) => (
                      <th key={m} className="border border-slate-600 py-1.5 px-0.5 text-center w-10">
                        {m.substring(0, 3).toUpperCase()}
                      </th>
                    ))}
                    <th className="border border-slate-600 py-1.5 px-1 text-center w-16 bg-slate-300">RATA THN</th>
                  </tr>
                </thead>
                <tbody>
                  {comprehensive.indicators.map((ind) => (
                    <tr key={ind.id} className="border border-slate-600">
                      <td className="border border-slate-600 py-1 px-1 text-center font-bold font-sans">
                        {ind.id}
                      </td>
                      <td className="border border-slate-600 py-1 px-2 font-sans font-medium text-slate-900">
                        {ind.title}
                      </td>
                      <td className="border border-slate-600 py-1 px-1 text-center font-bold">
                        {ind.targetLabel}
                      </td>
                      {ind.monthlyPercents.map((p, idx) => (
                        <td key={idx} className="border border-slate-600 py-1 px-0.5 text-center">
                          {p !== null ? `${p.toFixed(0)}%` : '-'}
                        </td>
                      ))}
                      <td className="border border-slate-600 py-1 px-1 text-center font-bold bg-slate-100">
                        {ind.annual.percent !== null ? `${ind.annual.percent.toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Endorsement Signatures */}
          <div className="mt-8 pt-4 page-break-inside-avoid">
            <div className="text-right text-xs mb-6 font-sans">
              {hospital.city},{' '}
              {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans">
              <div>
                <p className="text-slate-600 mb-20">
                  Mengetahui,<br />
                  <strong>Ketua Komite Mutu &amp; Keselamatan Pasien</strong>
                </p>
                <p className="font-bold underline text-slate-900">{hospital.leadQualityName}</p>
                <p className="text-[11px] text-slate-500">NIP. {hospital.leadQualityNip}</p>
              </div>

              <div>
                <p className="text-slate-600 mb-20">
                  Menyetujui,<br />
                  <strong>Direktur Rumah Sakit</strong>
                </p>
                <p className="font-bold underline text-slate-900">{hospital.directorName}</p>
                <p className="text-[11px] text-slate-500">NIP. {hospital.directorNip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
