import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import CSVReader from 'react-csv-reader'

function App() {

  const [colNumDiff, setColNumDiff] = useState<number>(10);
  const [pkKeyColNum, setPkKeyColNum] = useState<number>(0);
  const [databaseName, setDatabaseName] = useState<string>('BLUADMIN.IBV_FUNDING');
  const [columnName, setColumnName] = useState<string>('REQUEST_DESCRIPTION');
  const [pkColumnName, setPkColumnName] = useState<string>('ID_FUNDING');
  const [slctDiffType, setSlctDiffType] = useState<string>('diffPartial');
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
    return dataExtract.map((data) =>{
      const columnVal = (data[colNumDiff]) ? data[colNumDiff].trim() : data[colNumDiff];
      return [data[pkKeyColNum], columnVal ]
    } 
    );
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

  function slctDiffTypeChange(e:any){
    setSlctDiffType(e.target.value);
  }

  function startDiff(){
    if(slctDiffType === "diffPartial"){
      applyPartialDiff();
    }else if(slctDiffType === "diffMoreThan"){
      applyMoreThanDiff();
    }else if(slctDiffType === "diffTotal"){
      applyTotalDiff();
    }
  }

  function applyPartialDiff(){
    console.log("applyPartialDiff");
    const oldData = extractData(dataFrom);
    const newData = extractData(dataTo);
    const ids = oldData.map(data => data[pkKeyColNum]);
    const newDataFiltered = newData.filter((data)=> ids.includes(data[pkKeyColNum])).sort();
    oldData.sort();
    setFilteredData(oldData.map((data:any, index:number)=>{
      let hasDiff = false;
      const oldDataStr = data[1];
      const newDataStr:string = newDataFiltered[index][1];
      if(oldDataStr && newDataStr){
        const oldDataLength = oldDataStr.length;
        const newDataLength = newDataStr.length;
       
        console.log(oldDataLength);
        console.log(newDataLength);
        if(oldDataLength > newDataLength){
          console.log("entrou");
          const subStr = oldDataStr.substring(0, newDataLength);
          console.log(subStr);
          console.log(newDataStr);
          hasDiff = newDataStr === subStr;
        }
      }
      return [
        data[0],
        data[1],
        newDataFiltered[index][1],
        hasDiff
      ]
      
    } ).filter((data:any) => data[3]));
  }

  function applyMoreThanDiff(){
    console.log("applyMoreThanDiff");
    const oldData = extractData(dataFrom);
    const newData = extractData(dataTo);
    const ids = oldData.map(data => data[pkKeyColNum]);
    const newDataFiltered = newData.filter((data)=> ids.includes(data[pkKeyColNum])).sort();
    oldData.sort();
    setFilteredData(oldData.map((data:any, index:number)=>{
      let hasDiff = false;
      const oldDataStr = data[1];
      const newDataStr:string = newDataFiltered[index][1];
      if(oldDataStr && newDataStr){
        const oldDataLength = oldDataStr.length;
        const newDataLength = newDataStr.length;
       
        console.log(oldDataLength);
        console.log(newDataLength);
        hasDiff = oldDataLength > newDataLength;
      }
      return [
        data[0],
        data[1],
        newDataFiltered[index][1],
        hasDiff
      ]
      
    } ).filter((data:any) => data[3]));
  }

  function applyTotalDiff(){
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
      return `UPDATE ${databaseName} SET ${columnName} = \'${data[1]}\' WHERE ${pkColumnName} = ${data[0]};\n`;
    })
    downloadFile(value, "diffUpdate.sql");
  }

  function downloadAsTxtCompare() {
    const value = filteredData.map((data)=>{
      return `${data[0]}|${data[1]}|${data[2]}\n`;
    })
    downloadFile(value, "diffTxtCompare.csv");
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
        <div>
          <label  htmlFor="slcDiffOpp">Select the type of diff </label>
          <select id="slcDiffOpp" value={slctDiffType} onChange={slctDiffTypeChange}>
            <option value="diffPartial">Show diffs with partial different text</option>
            <option value="diffMoreThan">Show diffs with more than text</option>
            <option value="diffTotal">Show diffs with totally different text</option>
          </select>
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
          <p>total of {filteredData.length}</p>
          <button id="downloadDiff" onClick={downloadAsSqlCommand}> Download diff as SQL command </button>
          <button id="downloadTxtComp" onClick={downloadAsTxtCompare}> Download diff with differences as CSV file txt </button>
          </>
          
        }
      </header>
    </div>
  );
}

export default App;