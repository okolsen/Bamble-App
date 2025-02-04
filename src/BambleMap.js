import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import grunnkretserData from "./grunnkretser";
import PopulationChart from "./PopulationChart";
import EldreBarnChart from "./EldreBarnChart";
import skoler from "./skoler";
import barnehager from "./barnehager";
import AgeGroupChangeChart from "./AgeGroupChangeChart";
import data2017 from "./data2017";


// Funksjon for å beregne andelen eldre (60+)
const beregnAndelEldre = (properties) => {
  const eldre = (properties.befolkning60Til64År || 0) + (properties.befolkning65Til69År || 0) +
                (properties.befolkning70Til74År || 0) + (properties.befolkning75Til79År || 0) +
                (properties.befolkning80Til84År || 0) + (properties.befolkning85Til89År || 0) +
                (properties.befolkning90ÅrOgOver || 0);
  return properties.totalBefolkning > 0 ? eldre / properties.totalBefolkning : 0; // Unngå NaN
};

const beregnAndelYngre = (properties) => {
  const yngre = (properties.befolkning0Til04År || 0) + 
                (properties.befolkning05Til09År || 0) +
                (properties.befolkning10Til14År || 0) +
                (properties.befolkning15Til19År || 0);
  return properties.totalBefolkning > 0 ? yngre / properties.totalBefolkning : 0;
};

// Fargekoding for **total befolkning**
const getBefolkningFarge = (befolkning) => {
  return befolkning > 1000 ? "#d73027" :
         befolkning > 500  ? "#fc8d59" :
         befolkning > 250  ? "#fee08b" :
         befolkning > 100  ? "#d9ef8b" :
                             "#1a9850";
};

// Fargekoding for **andel eldre (60+)**
const getEldreFarge = (andel) => {
  return andel > 0.40 ? "#d73027" :
         andel > 0.25 ? "#fc8d59" :
         andel > 0.10 ? "#91cf60" :
                        "#4575b4";
};



// Fargekoding for befolkningsendring
const getEndringFarge = (endring) => {
  if (endring === null) return "#cccccc"; // Grå for manglende data
  return endring > 0 ? "#1a9850" : "#d73027"; // Grønn for økning, rød for nedgang
};

const getAldersgruppeFarge = (antall) => {
  return antall > 100 ? "#d73027" :
         antall > 50  ? "#fc8d59" :
         antall > 20  ? "#fee08b" :
         antall > 10  ? "#d9ef8b" :
                        "#1a9850";
};

const getYngreFarge = (andel) => {
  return andel > 0.40 ? "#d73027" :  // Mer enn 40% unge (rødt)
         andel > 0.30 ? "#fc8d59" :  // 30-40% (oransje)
         andel > 0.20 ? "#91cf60" :  // 20-30% (grønn)
                        "#4575b4";   // Under 20% (blått)
};


// Ikoner for skoler og barnehager
const schoolIcon = new L.Icon({
  iconUrl: "/icons/school-bag.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const kindergartenIcon = new L.Icon({
  iconUrl: "/icons/playground.png",
  iconSize: [40, 40],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const BambleMap = () => {
  const [valgtGrunnkrets, setValgtGrunnkrets] = useState(null);
  const [visModus, setVisModus] = useState("befolkning"); // "befolkning", "eldre", "barn"
  const [geoJsonKey, setGeoJsonKey] = useState(0);
  const [visSkoler, setVisSkoler] = useState(false);
  const [visBarnehager, setVisBarnehager] = useState(false);
  const [visGrunnkretsNavn, setVisGrunnkretsNavn] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const håndterGrunnkrets = (feature, layer) => {
    if (feature.properties) {
        const { grunnkretsnavn, totalBefolkning } = feature.properties;
        const andelEldre = beregnAndelEldre(feature.properties);
        const andelYngre = beregnAndelYngre(feature.properties);
       
        
        // Finn 2017-data for denne grunnkretsen
        const valgtGrunnkrets2017 = data2017.find(
            (item) => item.grunnkretsnavn === grunnkretsnavn
        );

        const befolkning2017 = valgtGrunnkrets2017 ? valgtGrunnkrets2017.totalBefolkning : null;
        const endring = befolkning2017 !== null ? totalBefolkning - befolkning2017 : null;

        const alderMapping = {
          "0-4": "befolkning0Til04År",
          "5-9": "befolkning05Til09År",
          "10-14": "befolkning10Til14År",
          "15-19": "befolkning15Til19År",
          "20-24": "befolkning20Til24År",
          "25-29": "befolkning25Til29År",
          "30-34": "befolkning30Til34År",
          "35-39": "befolkning35Til39År",
          "40-44": "befolkning40Til44År",
          "45-49": "befolkning45Til49År",
          "50-54": "befolkning50Til54År",
          "55-59": "befolkning55Til59År",
          "60-64": "befolkning60Til64År",
          "65-69": "befolkning65Til69År",
          "70-74": "befolkning70Til74År",
          "75-79": "befolkning75Til79År",
          "80-84": "befolkning80Til84År",
          "85-89": "befolkning85Til89År",
          "90+": "befolkning90ÅrOgOver"
        };
        
        const aldersgruppeNøkkel = alderMapping[visModus] || null;
        const antallIAldersgruppen = aldersgruppeNøkkel ? feature.properties[aldersgruppeNøkkel] || 0 : 0;

        

        // Velg riktig fargekode basert på valgt visningsmodus
        const farge = visModus === "befolkning"
        ? getBefolkningFarge(totalBefolkning)
        : visModus === "eldre"
        ? getEldreFarge(andelEldre)
        : visModus === "yngre"
        ? getYngreFarge(andelYngre)
        : visModus === "endring"
        ? getEndringFarge(endring)
        : getAldersgruppeFarge(antallIAldersgruppen);

        layer.setStyle({
            fillColor: farge,
            weight: 1,
            opacity: 1,
            color: "white",
            fillOpacity: 0.7
        });
        
        // 🛑 **Fjern tidligere tooltip for å unngå duplikater**
        layer.unbindTooltip();

        // 🔥 **Legg til tooltip for befolkningsendring når aktivert**
        if (visModus === "endring" && endring !== null) {
            layer.bindTooltip(
                `${endring > 0 ? "+" : ""}${endring}`, // Viser endringstall
                {
                    permanent: true,
                    direction: "center",
                    className: "endring-tooltip"
                }
            );
        } 
        else if (visModus === "yngre") {
          layer.bindTooltip(
            `${(andelYngre * 100).toFixed(1)}%`, // Viser andel i prosent
            {
              permanent: true,
              direction: "center",
              className: "andel-tooltip"
            }
          );
        }
        else if (visModus === "eldre") {
          layer.bindTooltip(
            `${(andelEldre * 100).toFixed(1)}%`, // Viser andel i prosent
            {
              permanent: true,
              direction: "center",
              className: "andel-tooltip"
            }
          );
        }
        // 🔹 **Legg kun til grunnkretsnavn hvis IKKE i endringsmodus**
        else if (visGrunnkretsNavn) {
            layer.bindTooltip(grunnkretsnavn, {
                permanent: true,
                direction: "center",
                className: "grunnkrets-label"
            });
        }

        // 📌 **Legg til popup med mer info**
        layer.bindPopup(`
          <strong>${grunnkretsnavn}</strong><br/>
          Totalt antall innbyggere (2024): ${totalBefolkning}<br/>
          ${befolkning2017 !== null ? `Befolkning i 2017: ${befolkning2017}<br/>` : ""}
      
          ${befolkning2017 !== null ? `
              <strong style="color: ${endring > 0 ? 'green' : endring < 0 ? 'red' : 'gray'};">
              Endring: ${endring > 0 ? "+" : ""}${endring} personer
              </strong><br/>
          ` : ""}
      
          Andel 60+: ${(andelEldre * 100).toFixed(1)}%<br/>
           Andel yngre (0-19): ${(andelYngre * 100).toFixed(1)}%<br/>
          <button id="visGraf-${grunnkretsnavn.replace(/\s/g, '')}" 
              style="padding:5px; margin-top:5px; cursor:pointer;">
              Vis aldersfordeling
          </button>
      `);

        // 🛠 **Legg til eventlistener for knappen i popupen**
        layer.on("popupopen", () => {
            const knapp = document.getElementById(`visGraf-${grunnkretsnavn.replace(/\s/g, '')}`);
            if (knapp) {
                knapp.addEventListener("click", () => {
                    setValgtGrunnkrets({
                        grunnkretsnavn,
                        populationData: feature.properties
                    });
                });
            }
        });
    }
};


  useEffect(() => {
    window.addEventListener("visGraf", (e) => setValgtGrunnkrets(e.detail));
    return () => window.removeEventListener("visGraf", () => {});
  }, []);

  return (
    <div style={{ display: "flex", position: "relative" }}>
      <div style={{ width: "70%", height: "100vh" }}>
        <MapContainer key={geoJsonKey} center={[58.95, 9.56]} zoom={11} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> bidragsytere'
          />
          <GeoJSON key={mapKey} data={grunnkretserData} onEachFeature={håndterGrunnkrets} />
          {/* Grunnkretsnavn (vises kun hvis filteret er aktivt) */}
{visGrunnkretsNavn &&
  grunnkretserData.features.map((feature, index) => (
    <Tooltip
      key={`navn-${index}`}
      permanent
      direction="center"
      offset={[0, 0]}
      interactive={false}
    >
      <span>{feature.properties.grunnkretsnavn}</span>
    </Tooltip>
  ))}
          {/* Skoler (vises kun hvis filteret er aktivt) */}
          {visSkoler && skoler.features.map((skole, index) => (
            <Marker 
              key={`skole-${index}`} 
              position={[skole.geometry.coordinates[1], skole.geometry.coordinates[0]]} 
              icon={schoolIcon}
            >
              <Popup>
                <strong>{skole.properties.skolenavn}</strong><br />
                Antall elever: {skole.properties.antallElever || "Ukjent"}<br />
                Adresse: {skole.properties.besøksadresse_Besøksadresse_adressenavn}, {skole.properties.besøksadresse_Besøksadresse_postnummer} {skole.properties.besøksadresse_Besøksadresse_poststed}
              </Popup>
            </Marker>
          ))}

          {/* Barnehager (vises kun hvis filteret er aktivt) */}
          {visBarnehager && barnehager.features.map((barnehage, index) => (
            <Marker 
              key={`barnehage-${index}`} 
              position={[barnehage.geometry.coordinates[1], barnehage.geometry.coordinates[0]]} 
              icon={kindergartenIcon}
            >
              <Popup>
                <strong>{barnehage.properties.barnehagenavn}</strong><br />
                Antall barn: {barnehage.properties.antallBarn}<br />
                Åpningstid: {barnehage.properties.åpningstidFra} - {barnehage.properties.åpningstidTil}<br />
                Adresse: {barnehage.properties.adressenavn}, {barnehage.properties.postnummer} {barnehage.properties.poststed}
              </Popup>
            </Marker>
        ))}
        </MapContainer>
      </div>

      {/* Dropdown-meny for valg av fargekoding */}
      <div style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        background: "white",
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        zIndex: "1000"
      }}>
        <label htmlFor="mapMode"><strong>Velg visning:</strong></label>
        <select
          id="mapMode"
          value={visModus}
          onChange={(e) => {
            setVisModus(e.target.value);
            setGeoJsonKey(prevKey => prevKey + 1);

            if (e.target.value === "endring") {
              setVisGrunnkretsNavn(false);
            }
          }}
          style={{
            marginLeft: "10px",
            padding: "5px",
            borderRadius: "5px"
          }}
        >
          <option value="befolkning">Total befolkning</option>
          <option value="eldre">Eldreandel (60+)</option>
          <option value="yngre">Andel yngre (0-19 år)</option>
          <option value="endring">Befolkningsendring (2017-2024)</option> {/* Nytt valg */}
          <option disabled>──────────</option>  {/* Separator for aldersgrupper */}
          <option value="0-4">Aldersgruppe: 0-4 år</option>
          <option value="5-9">Aldersgruppe: 5-9 år</option>
          <option value="10-14">Aldersgruppe: 10-14 år</option>
          <option value="15-19">Aldersgruppe: 15-19 år</option>
          <option value="20-24">Aldersgruppe: 20-24 år</option>
          <option value="25-29">Aldersgruppe: 25-29 år</option>
          <option value="30-34">Aldersgruppe: 30-34 år</option>
          <option value="35-39">Aldersgruppe: 35-39 år</option>
          <option value="40-44">Aldersgruppe: 40-44 år</option>
          <option value="45-49">Aldersgruppe: 45-49 år</option>
          <option value="50-54">Aldersgruppe: 50-54 år</option>
          <option value="55-59">Aldersgruppe: 55-59 år</option>
          <option value="60-64">Aldersgruppe: 60-64 år</option>
          <option value="65-69">Aldersgruppe: 65-69 år</option>
          <option value="70-74">Aldersgruppe: 70-74 år</option>
          <option value="75-79">Aldersgruppe: 75-79 år</option>
          <option value="80-84">Aldersgruppe: 80-84 år</option>
          <option value="85-89">Aldersgruppe: 85-89 år</option>
          <option value="90+">Aldersgruppe: 90+ år</option>
        </select>
      </div>

      {/* Kontrollpanel for filter */}
<div style={{
  position: "fixed",
  top: "70px",
  left: "20px",
  background: "white",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  zIndex: "1000",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
}}>
  <label>
    <input
      type="checkbox"
      checked={visSkoler}
      onChange={() => setVisSkoler(!visSkoler)}
    /> Vis skoler
  </label>
  <label>
    <input
      type="checkbox"
      checked={visBarnehager}
      onChange={() => setVisBarnehager(!visBarnehager)}
    /> Vis barnehager
  </label>
  <label>
  <input
    type="checkbox"
    checked={visGrunnkretsNavn}
    disabled={visModus=== "endring" || visModus=== "yngre" || visModus=== "eldre"}
    onChange={() => {
      setVisGrunnkretsNavn(!visGrunnkretsNavn);
      setMapKey(prevKey => prevKey + 1); // 🔄 Tvinger en oppdatering av kartet
      
    }}
  /> Vis grunnkretsnavn
</label>
</div>
      
      {/* Diagram-seksjon */}
<div style={{ width: "30%", padding: "20px" }}>
  {valgtGrunnkrets && (
    <>
      <PopulationChart 
        populationData={valgtGrunnkrets.populationData} 
        grunnkrets={valgtGrunnkrets.grunnkretsnavn} 
      />
      <div style={{ marginTop: "20px" }}></div>
      <EldreBarnChart 
        populationData={valgtGrunnkrets.populationData} 
        grunnkrets={valgtGrunnkrets.grunnkretsnavn} 
      />
      {/* Hent data for 2017 og 2024 */}
      {(() => {
        const valgtGrunnkretsData2017 = data2017.find(
          (item) => item.grunnkretsnavn === valgtGrunnkrets.grunnkretsnavn
        );

        const valgtGrunnkretsData2024 = grunnkretserData.features.find(
          (feature) => feature.properties.grunnkretsnavn === valgtGrunnkrets.grunnkretsnavn
        )?.properties;

        return (
          <>
            {/* Sjekk at begge datasettene finnes før vi viser grafen */}
            {valgtGrunnkretsData2017 && valgtGrunnkretsData2024 ? (
              <AgeGroupChangeChart
                grunnkrets={valgtGrunnkrets.grunnkretsnavn}
                data2017={valgtGrunnkretsData2017}
                data2024={valgtGrunnkretsData2024}
              />
            ) : (
              <p>Ingen sammenligningsdata tilgjengelig</p>
            )}
          </>
        );
      })()}
    </>
  )}
</div>

      <div style={{
  position: "fixed",
  bottom: "20px",
  left: "20px",
  background: "rgba(255, 255, 255, 0.9)",
  padding: "10px",
  borderRadius: "5px",
  fontSize: "14px",
  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
  zIndex: "1000"
}}>
  <strong>
  {visModus === "befolkning" ? "Total befolkning" 
    : visModus === "eldre" ? "Andel eldre (60+ år)" 
    : visModus === "yngre" ? "Andel yngre (0-19 år)"
    : visModus === "endring" ? "Befolkningsendring (2017-2024)"
    : `Aldersgruppe: ${visModus} år`}
</strong><br/>

  {visModus === "befolkning" ? (
    <>
      <div style={{ background: "#1a9850", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 0-100 personer<br/>
      <div style={{ background: "#d9ef8b", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 100-250 personer<br/>
      <div style={{ background: "#fee08b", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 250-500 personer<br/>
      <div style={{ background: "#fc8d59", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 500-1000 personer<br/>
      <div style={{ background: "#d73027", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 1000+ personer<br/>
    </>
  ) : visModus === "eldre" ? (
    <>
      <div style={{ background: "#4575b4", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 0-10%<br/>
      <div style={{ background: "#91cf60", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 10-25%<br/>
      <div style={{ background: "#fc8d59", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 25-40%<br/>
      <div style={{ background: "#d73027", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 40%+<br/>
    </>
  ) : visModus === "yngre" ? (
    <>
      <div style={{ background: "#4575b4", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> Under 20%<br/>
      <div style={{ background: "#91cf60", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 20-30%<br/>
      <div style={{ background: "#fc8d59", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 30-40%<br/>
      <div style={{ background: "#d73027", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> Over 40%<br/>
    </>
  )  : visModus === "endring" ? (
    <>
      <div style={{ background: "#1a9850", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> Befolkningsøkning<br/>
      <div style={{ background: "#d73027", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> Befolkningsnedgang<br/>
      <div style={{ background: "#cccccc", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> Ingen endring / Manglende data<br/>
    </>
  ) : (
    <>
      <div style={{ background: "#1a9850", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 0-10 personer<br/>
      <div style={{ background: "#d9ef8b", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 10-20 personer<br/>
      <div style={{ background: "#fee08b", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 20-50 personer<br/>
      <div style={{ background: "#fc8d59", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 50-100 personer<br/>
      <div style={{ background: "#d73027", width: "20px", height: "20px", display: "inline-block", marginRight: "5px" }}></div> 100+ personer<br/>
    </>

  )}
</div>
    </div>
  );
};

export default BambleMap;
