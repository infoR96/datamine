// CsvUploader.tsx
'use client'
import dynamic from 'next/dynamic';
import React, { useState } from "react";
import Papa from "papaparse";

// Cargar Plot dinámicamente
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Trace {
  x: number[];
  y: number[];
  name: string;
  type: string;
  marker?: { color: string };
  yaxis?: string;
}

const CsvUploader: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [plotData, setPlotData] = useState<Trace[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const parsedData = result.data as string[][];
          setData(parsedData.slice(0, 20)); // Mostrar solo los primeros 20 elementos
          preparePlotData(parsedData);
        },
        header: false,
        skipEmptyLines: true,
      });
    }
  };

  const preparePlotData = (csvData: string[][]) => {
    const xValues = csvData.map((row) => parseFloat(row[0])); // Tn
    const yToneladas = csvData.map((row) => parseFloat(row[1])); // Toneladas
    const yAu = csvData.map((row) => parseFloat(row[2])); // Au (g/tn)

    const trace1: Trace = {
      x: xValues,
      y: yToneladas,
      name: "Toneladas",
      type: "scatter",
      marker: { color: "orange" },
    };

    const trace2: Trace = {
      x: xValues,
      y: yAu,
      name: "Au (g/tn)",
      type: "scatter",
      marker: { color: "gray" },
      yaxis: "y2",
    };

    setPlotData([trace1, trace2]);
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {plotData.length > 0 && (
        <Plot
          data={plotData}
          layout={{
            title: "Curva Tn Ley (CyR)",
            xaxis: { title: "Tn" },
            yaxis: { title: "Tonelaje", showgrid: true },
            yaxis2: {
              title: "Au (g/tn)",
              overlaying: "y",
              side: "right",
              showgrid: false,
            },
            legend: { orientation: "h" },
          }}
        />
      )}

      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Tn</th>
              <th>Toneladas</th>
              <th>Au (g/tn)</th>
              <th>LOM (meses)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CsvUploader;
