import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import './App.css';
import { sortData, prettyPrintStat } from './util';
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  // STATE = How to write a variable in react
  // USEEFFECT = Runs a piece of code based on a a given condition

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    });
  }, []);

  useEffect(() => {
    // The code inside here will run once when the componenet loads and not again
    // async -> send a request, wait for it, do something with it

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {  
        const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
        }));

        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);

    });
  };

  console.log(countryInfo);

  return (
    <div className="app">
      <div className="app_left">
      <div className="app_header">
      {/* { Header } */}
      {/* { Title + Select input dropdown field } */}
      <h1>COVID-19 TRACKER</h1>
        <FormControl className="app_dropdown">
          <Select variant = "outlined" onChange={onCountryChange} value ={country}>
            {/* Loop through all the countries and show a dropdwon */}
                <MenuItem value="worldwide">Worldwide</MenuItem>
            {
              countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))
            }
         </Select>
        </FormControl>
      </div>

      <div className="app_stats">   
        <InfoBox isRed active={casesType === "cases"} onClick={(e) => setCasesType("cases")} title="Coronavirus Cases" cases={prettyPrintStat( countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
        <InfoBox active={casesType === "recovered"} onClick={(e) => setCasesType("recovered")} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
        <InfoBox isRed active={casesType === "deaths"} onClick={(e) => setCasesType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
      </div>

      {/* { Map } */}
      <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>

      <Card className="app_right">
      <CardContent>
        <h3>Live Cases by Country</h3>
        <Table countries={tableData} />

          <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
        <LineGraph className="app_graph" casesType={casesType} />
        {/* { Graph } */}
      </CardContent>
      </Card>

    </div>
  );
}

export default App;
