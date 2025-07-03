import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const MoodChart = ({ tracks }) => {
  const labels = tracks.map((t) =>
    new Date(t.played_at).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Valence (Mood)",
        data: tracks.map((t) => t.valence),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
        pointBackgroundColor: "white",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "white" },
      },
      title: {
        display: true,
        text: "Mood Over Time (Valence)",
        color: "white",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: { color: "white" },
      },
      x: {
        ticks: { color: "white" },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default MoodChart;
