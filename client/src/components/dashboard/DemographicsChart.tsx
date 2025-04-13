import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DemographicData {
  name: string;
  value: number;
  color: string;
}

interface DemographicsChartProps {
  data: DemographicData[];
}

export function DemographicsChart({ data }: DemographicsChartProps) {
  return (
    <div className="snap-card p-4">
      <h3 className="font-bold text-foreground mb-4">Audience Demographics</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Percentage']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: '8px'
              }}
            />
            <Legend 
              iconType="circle" 
              iconSize={8}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
