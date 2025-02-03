import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registrer Chart.js-komponenter
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EldreBarnChart = ({ populationData, grunnkrets }) => {
  if (!populationData) return null; // Ikke render hvis det ikke er data

  // Beregn totalt antall eldre (60+) og barn/unge (0-20 år)
  const totalEldre = (populationData.befolkning60Til64År || 0) + 
                     (populationData.befolkning65Til69År || 0) + 
                     (populationData.befolkning70Til74År || 0) + 
                     (populationData.befolkning75Til79År || 0) + 
                     (populationData.befolkning80Til84År || 0) + 
                     (populationData.befolkning85Til89År || 0) + 
                     (populationData.befolkning90ÅrOgOver || 0);

  const totalBarnUnge = (populationData.befolkning0Til04År || 0) + 
                        (populationData.befolkning05Til09År || 0) + 
                        (populationData.befolkning10Til14År || 0) + 
                        (populationData.befolkning15Til19År || 0);

  const data = {
    labels: ["Eldre (60+ år)", "Barn og unge (0-20 år)"],
    datasets: [
      {
        label: "Antall personer",
        data: [totalEldre, totalBarnUnge],
        backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Eldre og barn/unge i ${grunnkrets}`,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
};

export default EldreBarnChart;
