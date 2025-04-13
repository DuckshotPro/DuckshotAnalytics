import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface DataPoint {
  date: string;
  followers: number;
}

interface AudienceGrowthChartProps {
  data: DataPoint[];
}

export function AudienceGrowthChart({ data }: AudienceGrowthChartProps) {
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  return (
    <div className="snap-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-foreground">Audience Growth</h3>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={range === 'daily' ? 'default' : 'outline'} 
            className={range === 'daily' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => setRange('daily')}
          >
            Daily
          </Button>
          <Button 
            size="sm" 
            variant={range === 'weekly' ? 'default' : 'outline'} 
            className={range === 'weekly' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => setRange('weekly')}
          >
            Weekly
          </Button>
          <Button 
            size="sm" 
            variant={range === 'monthly' ? 'default' : 'outline'} 
            className={range === 'monthly' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => setRange('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              axisLine={{ stroke: '#E0E0E0' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatNumber}
              axisLine={{ stroke: '#E0E0E0' }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), 'Followers']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="followers"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, fill: 'white' }}
              activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'white' }}
              fill="url(#colorFollowers)"
            />
            <defs>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
