import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import CSVReader from 'react-csv-reader'

function App() {

  const [colNumDiff, setColNumDiff] = useState<number>(0);
  const [pkKeyColNum, setPkKeyColNum] = useState<number>(0);
  const [databaseName, setDatabaseName] = useState<string>('');
  const [columnName, setColumnName] = useState<string>('');
  const [pkColumnName, setPkColumnName] = useState<string>('');
  const [dataFrom, setDataFrom] = useState<any[]>([]);
  const [dataTo, setDataTo] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  function handleCSVFrom(data:any[]){
    setDataFrom([...data]);
  }

  function handleCSVTo(data:any[]){
    setDataTo([...data]);
  }

  function extractData(dataExtract:any[]){
    return dataExtract.map((data) => [data[pkKeyColNum], data[colNumDiff]]);
  }

  function colNumChange(e:any){
    setColNumDiff(Number(e.target.value));
  }

  function pkKeyColChange(e:any){
    setPkKeyColNum(Number(e.target.value));
  }

  function databaseNameChange(e:any){
    setDatabaseName(e.target.value);
  }

  function columnNameChange(e:any){
    setColumnName(e.target.value);
  }

  function pkColumnNameChange(e:any){
    setPkColumnName(e.target.value);
  }

  function startDiff(){
    const oldData = extractData(dataFrom);
    const newData = extractData(dataTo);
    const ids = oldData.map(data => data[pkKeyColNum]);
    const newDataFiltered = newData.filter((data)=> ids.includes(data[pkKeyColNum])).sort();
    oldData.sort();
    setFilteredData(oldData.map((data:any, index:number)=>{
      return [
        data[0],
        data[1],
        newDataFiltered[index][1],
        data[1] !== newDataFiltered[index][1]
      ]
    } ).filter((data:any) => data[3]));
  }

  function downloadAsSqlCommand() {
    const value = filteredData.map((data)=>{
      return `UPDATE ${databaseName} SET ${columnName} = "${data[1]}" WHERE ${pkColumnName} = ${data[0]};\n`;
    })
    downloadFile(value, "diffUpdate.sql");
  }

  function downloadAsTxtCompare() {
    const value = filteredData.map((data)=>{
      return `${data[0]},${data[1]},${data[2]}\n`;
    })
    downloadFile(value, "diffTxtCompare.txt");
  }

  function downloadFile(value:any,fileName:string){
    const element = document.createElement("a");
    const file = new Blob(value, {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <label htmlFor="databaseName">Type the database name</label>
          <input id="databaseName" type="text" onChange={databaseNameChange} value={databaseName} />
        </div>
        <div>
          <label htmlFor="columnName">Type the column name</label>
          <input id="columnName" type="text" onChange={columnNameChange} value={columnName} />
        </div>
        <div>
          <label htmlFor="columnName">Type the PK ID column name</label>
          <input id="columnName" type="text" onChange={pkColumnNameChange} value={pkColumnName} />
        </div>
        <div>
          <label htmlFor="colNum">Select the column wich will be compared (note: 0 is the first column)</label>
          <input id="colNum" type="number" onChange={colNumChange} value={colNumDiff} />
        </div>
        <div>
          <label htmlFor="pkKey">Select the column that has the PK column (if there is no column add the same column above)</label>
          <input id="pkKey" type="number" onChange={pkKeyColChange} value={pkKeyColNum} />
        </div>
      
        <CSVReader    
          label="Select CSV From"
          onFileLoaded={handleCSVFrom} />

        <CSVReader    
          label="Select CSV To"
          onFileLoaded={handleCSVTo} />

        <button id="startDiff" onClick={startDiff}> Start diff </button>

        {filteredData.map((data,index) => (
          <p key={index}> id: {data[0]} value: {data[1]} </p>
        ))}

        {filteredData.length > 0 &&
          <>
          <button id="downloadDiff" onClick={downloadAsSqlCommand}> Download diff as SQL command </button>
          <button id="downloadTxtComp" onClick={downloadAsTxtCompare}> Download diff with differences as CSV file txt </button>
          </>
          
        }
      </header>
    </div>
  );
}

export default App;
