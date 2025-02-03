import React from "react";

const AgeGroupChangeTable = ({ grunnkrets, data2017, data2024 }) => {
  if (!data2017 || !data2024) return <p>Ingen data tilgjengelig</p>;

  // Norsk kartlegging av aldersgrupper
  const alderMapping = {
    "befolkning0Til04År": "0-4",
    "befolkning05Til09År": "5-9",
    "befolkning10Til14År": "10-14",
    "befolkning15Til19År": "15-19",
    "befolkning20Til24År": "20-24",
    "befolkning25Til29År": "25-29",
    "befolkning30Til34År": "30-34",
    "befolkning35Til39År": "35-39",
    "befolkning40Til44År": "40-44",
    "befolkning45Til49År": "45-49",
    "befolkning50Til54År": "50-54",
    "befolkning55Til59År": "55-59",
    "befolkning60Til64År": "60-64",
    "befolkning65Til69År": "65-69",
    "befolkning70Til74År": "70-74",
    "befolkning75Til79År": "75-79",
    "befolkning80Til84År": "80-84",
    "befolkning85Til89År": "85-89",
    "befolkning90ÅrOgOver": "90+"
  };

  // Korrekt rekkefølge
  const alderSortering = Object.keys(alderMapping);

  return (
    <div>
      <h3>Aldersgruppeendring: {grunnkrets}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0", borderBottom: "2px solid black" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Aldersgruppe</th>
            <th style={{ padding: "10px", textAlign: "center" }}>2017</th>
            <th style={{ padding: "10px", textAlign: "center" }}>2024</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Endring</th>
          </tr>
        </thead>
        <tbody>
          {alderSortering.map((key, index) => {
            const alder = alderMapping[key];
            const antall2017 = data2017.befolkningAldersgrupper?.[alder] ?? 0;
            const antall2024 = data2024[key] ?? 0;
            const endring = antall2024 - antall2017;

            return (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{alder}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{antall2017}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{antall2024}</td>
                <td style={{
                  padding: "8px",
                  textAlign: "center",
                  color: endring > 0 ? "green" : endring < 0 ? "red" : "black"
                }}>
                  {endring > 0 ? `+${endring}` : endring}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AgeGroupChangeTable;
