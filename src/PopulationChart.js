import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registrer Chart.js-komponenter
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Norsk kartlegging av aldersgrupper
const alderMapping = {
  "befolkning0Til04År": "0-4 år",
  "befolkning05Til09År": "5-9 år",
  "befolkning10Til14År": "10-14 år",
  "befolkning15Til19År": "15-19 år",
  "befolkning20Til24År": "20-24 år",
  "befolkning25Til29År": "25-29 år",
  "befolkning30Til34År": "30-34 år",
  "befolkning35Til39År": "35-39 år",
  "befolkning40Til44År": "40-44 år",
  "befolkning45Til49År": "45-49 år",
  "befolkning50Til54År": "50-54 år",
  "befolkning55Til59År": "55-59 år",
  "befolkning60Til64År": "60-64 år",
  "befolkning65Til69År": "65-69 år",
  "befolkning70Til74År": "70-74 år",
  "befolkning75Til79År": "75-79 år",
  "befolkning80Til84År": "80-84 år",
  "befolkning85Til89År": "85-89 år",
  "befolkning90ÅrOgOver": "90+ år"
};

// Korrekt rekkefølge på aldersgruppene
const alderSortering = Object.keys(alderMapping);

const PopulationChart = ({ populationData, grunnkrets }) => {
  if (!populationData) return null; // Ikke render hvis det ikke er data

  // Sikre at alle aldersgrupper er med, selv om noen har nullverdier
  const labels = alderSortering.map(key => alderMapping[key]);
  const values = alderSortering.map(key => populationData[key] ?? 0); // Bruk 0 hvis data mangler

  const data = {
    labels,
    datasets: [
      {
        label: `Aldersfordeling i ${grunnkrets}`,
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
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
        text: `Aldersfordeling i ${grunnkrets}`,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
};

export default PopulationChart;
