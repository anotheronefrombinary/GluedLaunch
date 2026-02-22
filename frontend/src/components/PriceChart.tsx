'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, AreaSeries, CandlestickSeries, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts';
import { formatEther } from 'viem';
import type { Trade } from '@/hooks/useTradeHistory';

const PARSE_ETHER_THRESHOLD = 10n ** 15n;

type ChartMode = 'line' | 'candles';
type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h';

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
};

interface PriceChartProps {
  trades: Trade[];
  isLoading: boolean;
  totalSupply: bigint;
}

// Chart shows bonding curve price from buy trades only.
// Sells (unglue) redeem at floor price and don't move the bonding curve.
function buildBuyPrices(trades: Trade[], isLegacy: boolean): { timestamp: number; price: number }[] {
  const sorted = [...trades].reverse(); // oldest first
  const result: { timestamp: number; price: number }[] = [];

  for (const trade of sorted) {
    if (!trade.timestamp || trade.type !== 'buy') continue;

    const ethSpent = Number(formatEther(trade.ethSpent));
    const tokensReceived = isLegacy
      ? Number(formatEther(trade.tokensReceived))
      : Number(trade.tokensReceived);
    const price = tokensReceived > 0 ? ethSpent / tokensReceived : 0;
    if (price > 0) {
      result.push({ timestamp: trade.timestamp, price });
    }
  }

  return result;
}

interface OHLCCandle {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

function buildCandles(trades: Trade[], isLegacy: boolean, intervalSec: number): OHLCCandle[] {
  const prices = buildBuyPrices(trades, isLegacy);
  const candles: OHLCCandle[] = [];
  if (prices.length === 0) return candles;

  let bucketStart = 0;
  let open = 0, high = 0, low = 0, close = 0;
  let hasData = false;

  for (const { timestamp, price } of prices) {
    const bucket = Math.floor(timestamp / intervalSec) * intervalSec;

    if (!hasData || bucket !== bucketStart) {
      if (hasData) {
        candles.push({ time: bucketStart as Time, open, high, low, close });
      }
      bucketStart = bucket;
      open = price;
      high = price;
      low = price;
      close = price;
      hasData = true;
    } else {
      high = Math.max(high, price);
      low = Math.min(low, price);
      close = price;
    }
  }

  if (hasData) {
    candles.push({ time: bucketStart as Time, open, high, low, close });
  }

  return candles;
}

function buildLineData(trades: Trade[], isLegacy: boolean): { time: Time; value: number }[] {
  const prices = buildBuyPrices(trades, isLegacy);
  const data: { time: Time; value: number }[] = [];
  const seenTimes = new Set<number>();

  for (const { timestamp, price } of prices) {
    let ts = timestamp;
    while (seenTimes.has(ts)) ts++;
    seenTimes.add(ts);
    data.push({ time: ts as Time, value: price });
  }

  return data;
}

export function PriceChart({ trades, isLoading, totalSupply }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | ISeriesApi<'Candlestick'> | null>(null);
  const currentModeRef = useRef<ChartMode>('line');

  const [mode, setMode] = useState<ChartMode>('line');
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');

  const chartOptions = {
    layout: {
      background: { color: '#111215' },
      textColor: '#5c5e69',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: '#1e202840' },
      horzLines: { color: '#1e202840' },
    },
    crosshair: {
      vertLine: { color: '#5c5e6940', labelBackgroundColor: '#1e2028' },
      horzLine: { color: '#5c5e6940', labelBackgroundColor: '#1e2028' },
    },
    rightPriceScale: {
      borderColor: '#1e2028',
      scaleMargins: { top: 0.15, bottom: 0.15 },
    },
    timeScale: {
      borderColor: '#1e2028',
      timeVisible: true,
      secondsVisible: false,
    },
    handleScroll: { vertTouchDrag: false },
  };

  const priceFormat = {
    type: 'price' as const,
    precision: 10,
    minMove: 0.0000000001,
  };

  // Create chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      ...chartOptions,
    });

    chartRef.current = chart;
    currentModeRef.current = mode;

    if (mode === 'candles') {
      seriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: '#00e87b',
        downColor: '#ef4444',
        borderUpColor: '#00e87b',
        borderDownColor: '#ef4444',
        wickUpColor: '#00e87b80',
        wickDownColor: '#ef444480',
        priceFormat,
      });
    } else {
      seriesRef.current = chart.addSeries(AreaSeries, {
        lineColor: '#00e87b',
        topColor: 'rgba(0, 232, 123, 0.2)',
        bottomColor: 'rgba(0, 232, 123, 0.02)',
        lineWidth: 2,
        priceFormat,
      });
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 300,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch series type when mode changes
  const switchSeries = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    if (mode === 'candles') {
      seriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: '#00e87b',
        downColor: '#ef4444',
        borderUpColor: '#00e87b',
        borderDownColor: '#ef4444',
        wickUpColor: '#00e87b80',
        wickDownColor: '#ef444480',
        priceFormat,
      });
    } else {
      seriesRef.current = chart.addSeries(AreaSeries, {
        lineColor: '#00e87b',
        topColor: 'rgba(0, 232, 123, 0.2)',
        bottomColor: 'rgba(0, 232, 123, 0.02)',
        lineWidth: 2,
        priceFormat,
      });
    }

    currentModeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (currentModeRef.current !== mode) {
      switchSeries();
    }
  }, [mode, switchSeries]);

  // Update data when trades, mode, or timeframe change
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    if (trades.length === 0) {
      seriesRef.current.setData([]);
      return;
    }

    const isLegacy = totalSupply > PARSE_ETHER_THRESHOLD;

    if (mode === 'candles') {
      const candles = buildCandles(trades, isLegacy, TIMEFRAME_SECONDS[timeframe]);
      if (candles.length > 0) {
        (seriesRef.current as ISeriesApi<'Candlestick'>).setData(candles);
        chartRef.current.timeScale().fitContent();
      }
    } else {
      const lineData = buildLineData(trades, isLegacy);
      if (lineData.length > 0) {
        (seriesRef.current as ISeriesApi<'Area'>).setData(lineData);
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [trades, totalSupply, mode, timeframe]);

  const buyCount = trades.filter(t => t.type === 'buy').length;
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h'];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#111215', border: '1px solid #1e2028' }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #1e2028' }}>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold" style={{ color: '#f0f0f2' }}>Price Chart</h3>
          <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #1e2028' }}>
            <button
              onClick={() => setMode('line')}
              className="px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: mode === 'line' ? '#00e87b15' : '#16171c',
                color: mode === 'line' ? '#00e87b' : '#5c5e69',
              }}
            >
              Line
            </button>
            <button
              onClick={() => setMode('candles')}
              className="px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: mode === 'candles' ? '#00e87b15' : '#16171c',
                color: mode === 'candles' ? '#00e87b' : '#5c5e69',
                borderLeft: '1px solid #1e2028',
              }}
            >
              Candles
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'candles' && (
            <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #1e2028' }}>
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className="px-2 py-1 text-xs font-mono font-medium transition-colors"
                  style={{
                    background: timeframe === tf ? '#00e87b15' : '#16171c',
                    color: timeframe === tf ? '#00e87b' : '#5c5e69',
                    borderLeft: tf !== '1m' ? '1px solid #1e2028' : undefined,
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
          <span className="text-xs" style={{ color: '#5c5e69' }}>
            {buyCount > 0 ? `${buyCount} buys` : 'No data'}
          </span>
        </div>
      </div>
      <div className="relative" style={{ height: 300 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: '#111215' }}>
            <div className="text-sm" style={{ color: '#5c5e69' }}>Loading chart data...</div>
          </div>
        )}
        {!isLoading && trades.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-sm" style={{ color: '#5c5e69' }}>No trade data available</p>
              <p className="text-xs mt-1" style={{ color: '#5c5e6980' }}>Chart will appear after the first purchase</p>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} style={{ height: 300 }} />
      </div>
    </div>
  );
}
