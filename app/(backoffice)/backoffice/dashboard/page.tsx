"use client";

import { useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

// Pie Chart Data
const pieData = {
  labels: ["Red", "Blue", "Yellow", "Green"],
  datasets: [
    {
      label: "Color Distribution",
      data: [300, 50, 100, 200],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      hoverOffset: 4,
    },
  ],
};

// Line Chart Data
const lineData = {
  labels: ["January", "February", "March", "April", "May"],
  datasets: [
    {
      label: "Sales 2025",
      data: [65, 59, 80, 81, 56],
      borderColor: "#36A2EB",
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      fill: false,
      tension: 0.4,
    },
  ],
};

// Area Chart Data
const areaData = {
  labels: ["Q1", "Q2", "Q3", "Q4"],
  datasets: [
    {
      label: "Revenue",
      data: [120, 190, 300, 500],
      borderColor: "#4BC0C0",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      fill: true,
      tension: 0.3,
    },
  ],
};

// Bar Chart Data
const barData = {
  labels: ["Product A", "Product B", "Product C", "Product D"],
  datasets: [
    {
      label: "Units Sold",
      data: [400, 300, 200, 500],
      backgroundColor: "#FF6384",
      borderColor: "#FF6384",
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

export default function Home() {
  useEffect(() => {
    // Ensure Chart.js is only registered on client-side
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Chart Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Pie Chart - Color Distribution
          </h2>
          <div className="h-64">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Line Chart - Sales 2025
          </h2>
          <div className="h-64">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Area Chart - Revenue</h2>
          <div className="h-64">
            <Line data={areaData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Bar Chart - Units Sold</h2>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
