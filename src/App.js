import React from "react";
import BambleMap from "./BambleMap";
import "./App.css"; 

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Befolkningsoversikt i Bamble kommune (data fra 2024)</h1>
      <BambleMap />
    </div>
  );
}

export default App;
