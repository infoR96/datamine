// CsvUploader.tsx
'use client'
import dynamic from 'next/dynamic';
import React, { useState } from "react";
import Papa from "papaparse";


// Cargar Plot dinámicamente
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Trace {
  x: Date[];
  y: number[];
  mode: string;
  name: string;
  line: { shape: string; color: string };
}

const CsvUploader: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [plotData, setPlotData] = useState<Trace[]>([]);
  const [velocityData, setVelocityData] = useState<Trace[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const parsedData = result.data as string[][];
          setData(parsedData.slice(0, 20)); // Mostrar solo los primeros 20 elementos
          preparePlotData(parsedData);
          prepareVelocityData(parsedData);
        },
        header: false,
        skipEmptyLines: true,
      });
    }
  };

  const convertExcelDateToJSDate = (excelDate: number) => {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  };

  const preparePlotData = (csvData: string[][]) => {
    const xValues = csvData.map((row) => convertExcelDateToJSDate(parseFloat(row[2])));
    const yValues = csvData.map((row) => parseFloat(row[3]));

    console.log('GIAN',xValues,yValues)

    const trace1: Trace = {
      x: xValues,
      y: yValues,
      mode: "lines+markers",
      name: "Densidad",
      line: { shape: "spline", color: "blue" },
    };

    setPlotData([trace1]);
  };

  const prepareVelocityData = (csvData: string[][]) => {
    const yValues = csvData.map((row) => parseFloat(row[3]));

    const xValues = csvData.map((row) => parseFloat(row[1]));

    const trace2: Trace = {
      x: xValues.map(value => convertExcelDateToJSDate(value)),
      y: yValues,
      mode: "lines+markers",
      name: "Velocidad vs Densidad",
      line: { shape: "spline", color: "red" },
    };

    setVelocityData([trace2]);
  };

  return (
    <div>

      <input type="file" accept=".csv" onChange={handleFileUpload} />
      
      {plotData.length > 0 && (
        <Plot
          data={plotData}
          layout={{
            title: "Densidad vs Hora",
            xaxis: { title: "Hora", tickformat: "%Y-%m-%d %H:%M" },
            yaxis: { title: "Densidad" }
          }}
        />
      )}

      {velocityData.length > 0 && (
        <Plot
          data={velocityData}
          layout={{
            title: "Densidad vs Velocidad",
            xaxis: { title: "Velocidad" },
            yaxis: { title: "Densidad" }
          }}
        />
      )}

      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Densidad</th>
              <th>Velocidad</th>
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
