"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const palette = ["#2f6fff", "#1f56d8", "#4f84ff", "#86abff", "#0b1a2b"];

export function RevenueExpensesChart({
  data,
}: {
  data: Array<{ month: string; revenue: number; expenses: number }>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d3e2fb" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#2f6fff" strokeWidth={2.2} />
          <Line type="monotone" dataKey="expenses" stroke="#1f56d8" strokeWidth={2.2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopExpensesChart({
  data,
}: {
  data: Array<{ category: string; amount: number }>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d3e2fb" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#1f56d8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueSourceChart({
  data,
}: {
  data: Array<{ source: string; value: number }>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="source" outerRadius={120} label>
            {data.map((entry, index) => (
              <Cell key={entry.source} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CashProjectionChart({
  data,
}: {
  data: Array<{ day: string; balance: number }>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d3e2fb" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="balance" stroke="#2f6fff" fill="#2f6fff33" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
