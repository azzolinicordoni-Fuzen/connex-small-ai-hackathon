import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  ArrowUpRight,
  RefreshCw,
  Leaf,
  TreePine,
  Wind,
  Sun
} from "lucide-react";

interface MarketData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  icon: React.ElementType;
  color: string;
}

const initialMarketData: MarketData[] = [
  { name: "Crédito Verra VCS", symbol: "VCS", price: 12.45, change: 0.35, changePercent: 2.89, volume: "2.3M", icon: Leaf, color: "text-emerald-500" },
  { name: "Gold Standard", symbol: "GS", price: 18.72, change: -0.28, changePercent: -1.47, volume: "1.1M", icon: Sun, color: "text-yellow-500" },
  { name: "REDD+ Brasil", symbol: "REDD", price: 8.90, change: 0.52, changePercent: 6.21, volume: "890K", icon: TreePine, color: "text-green-500" },
  { name: "Energia Renovável", symbol: "REN", price: 15.30, change: 0.15, changePercent: 0.99, volume: "1.5M", icon: Wind, color: "text-blue-500" },
];

export function DashboardCarbonMarket() {
  const [marketData, setMarketData] = useState(initialMarketData);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => {
        const changeAmount = (Math.random() - 0.5) * 0.1;
        const newPrice = Math.max(1, item.price + changeAmount);
        const newChange = changeAmount;
        const newChangePercent = (changeAmount / item.price) * 100;
        return {
          ...item,
          price: newPrice,
          change: item.change + newChange,
          changePercent: item.changePercent + newChangePercent
        };
      }));
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMarketData(prev => prev.map(item => {
        const changeAmount = (Math.random() - 0.5) * 0.3;
        const newPrice = Math.max(1, item.price + changeAmount);
        return {
          ...item,
          price: newPrice,
          change: changeAmount,
          changePercent: (changeAmount / item.price) * 100
        };
      }));
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  const totalMarketCap = "247.8B";
  const dailyVolume = "12.4M";
  const globalChange = 2.34;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">Bolsa de Carbono</CardTitle>
              <p className="text-sm text-muted-foreground">Mercado global em tempo real</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-secondary/30 border border-border/30">
            <Globe className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="font-semibold text-sm">${totalMarketCap}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/30 border border-border/30">
            <Activity className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Volume 24h</p>
            <p className="font-semibold text-sm">${dailyVolume}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-secondary/30 border border-border/30">
            {globalChange >= 0 ? (
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 mx-auto mb-1 text-red-500" />
            )}
            <p className="text-xs text-muted-foreground">Variação 24h</p>
            <p className={`font-semibold text-sm ${globalChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {globalChange >= 0 ? '+' : ''}{globalChange.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Price Chart Placeholder - Simplified visual */}
        <div className="relative h-20 rounded-lg bg-gradient-to-r from-primary/5 via-emerald-500/10 to-blue-500/5 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 60 Q 50 40, 100 45 T 200 35 T 300 50 T 400 30 T 500 40 L 500 80 L 0 80 Z"
              fill="url(#chartGradient)"
            />
            <path
              d="M 0 60 Q 50 40, 100 45 T 200 35 T 300 50 T 400 30 T 500 40"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
          </svg>
          <div className="absolute bottom-2 left-3 text-xs text-muted-foreground">
            Últimas 24h
          </div>
        </div>

        {/* Market Items */}
        <div className="space-y-2">
          {marketData.map((item) => (
            <div 
              key={item.symbol}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer border border-border/20"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-secondary/50 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{item.symbol}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/50">
                      {item.name}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Vol: {item.volume}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${item.price.toFixed(2)}</p>
                <div className={`flex items-center gap-1 text-xs ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Atualizado: {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 h-7 text-xs">
            Ver mercado completo
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
