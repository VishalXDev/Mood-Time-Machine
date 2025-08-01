import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

const MoodChart = ({ tracks }) => {
  const labels = tracks.map((t) =>
    new Date(t.played_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Valence",
        data: tracks.map((t) => t.valence),
        fill: true,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderColor: "#8b5cf6",
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#8b5cf6",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Energy",
        data: tracks.map((t) => t.energy),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "#3b82f6",
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#3b82f6",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Danceability",
        data: tracks.map((t) => t.danceability),
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "#10b981",
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#10b981",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#e5e7eb",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: "500",
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#e5e7eb",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: "600",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        callbacks: {
          title: function(tooltipItems) {
            const date = new Date(tracks[tooltipItems[0].dataIndex].played_at);
            return `${date.toLocaleDateString()} • ${tooltipItems[0].label}`;
          },
          label: function(context) {
            const track = tracks[context.dataIndex];
            return [
              `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
              `Track: ${track.name}`,
              `Artist: ${track.artist}`
            ];
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          font: {
            family: "'Inter', sans-serif",
          },
          callback: function(value) {
            return value.toFixed(1);
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          font: {
            family: "'Inter', sans-serif",
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <div className="w-full h-full fade-in">
      <Line data={data} options={options} />
    </div>
  );
};

export default MoodChart;