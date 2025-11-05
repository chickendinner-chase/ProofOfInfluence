import { useEffect, useRef } from "react";
import { Card } from "./ui/card";

interface TradingChartProps {
  pair: string;
  network: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function TradingChart({ pair, network }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (scriptRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        new window.TradingView.widget({
          container_id: "tradingview_chart",
          autosize: true,
          symbol: "COINBASE:ETHUSD", // Base 链 ETH/USD 行情参考
          interval: "15",
          timezone: "Asia/Shanghai",
          theme: "dark",
          style: "1",
          locale: "zh_CN",
          toolbar_bg: "#1e293b",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: false,
          studies: [
            "STD;SMA",
          ],
          disabled_features: [],
          enabled_features: [],
          backgroundColor: "#0f172a",
          gridColor: "#334155",
        });
      }
    };
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{pair}</h2>
          <p className="text-sm text-slate-400">网络: {network}</p>
        </div>
      </div>
      <div 
        id="tradingview_chart" 
        ref={containerRef}
        style={{ height: '500px', width: '100%' }}
      />
    </Card>
  );
}

