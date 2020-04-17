<!-- UI to display and interact with data obtained by interrogating web sources

TODO: extend this from SPARQL endpoints to support other kinds of Web data source
-->
<script>
import {onDestroy} from 'svelte';

// TODO: add ability for gathered data to be saved (in dataSources.js?)
import {dataSources} from '../data/dataSources.js';
import {tabulationGroups} from '../data/sparqlTabulations.js';

import {SparqlStat, SparqlEndpointStat, SparqlEndpointReportSuccess, StatWebsite} from '../interfaces/SourceInterface.js';
import SparqlStatUI from '../interfaces/SparqlStatUI.svelte';
// import {SparqlStatTableUI} from '../interfaces/SparqlStatTableUI.svelte';

const tabulationTypes = [
  { type: 'stat-website', value: { uiComponent: SparqlStatUI, tabClass: StatWebsite } },
  { type: 'sparql-stat', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointStat } },
  { type: 'sparql-api', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'sparql-construct', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'sparql-count', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },

  { type: 'sparql-custom', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'sparql-wqp-1.0', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'sparql-wqp-1.1', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'test-success', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
];

let validEndpointsInput = `https://dbpedia.org/sparql
https://query.wikidata.org/sparql
https://data.europa.eu/euodp/sparqlep
https://data.open.ac.uk/query
http://data.europeana.eu/
https://sparql.uniprot.org/
https://data.carnegiehall.org/sparql
http://os.rkbexplorer.com/sparql/`;

// These are not valid, so should not show any valid results
let invalidEndpointTests = `
https://data.open.ac.uk/queryx
`;

// Failing to be investigated
let toTest = 'https://data.open.ac.uk/query';
let testDbpedia = 'https://data.open.ac.uk/query';

let lastError;
let extraEndpointsInputChecked = false;
let extraEndpointsInput = '';//invalidEndpointTests;

let customQueryInput;

let optionalTabulations = [
  'Testing',
  'SPARQL 1.0', 
  'SPARQL 1.1',
  'Custom Query'
  ];

let allTabulationGroups = ['Basic Queries', ...optionalTabulations];
let chosenTabulations = ['Testing'];

$: tabulationGroupsToCollect = ['Basic Queries', ...chosenTabulations];

$: extraDataSources = makeSourcesFromTextList(extraEndpointsInput);
$: haveExtraSources = extraDataSources && extraDataSources[0];
$: activeDataSources = makeSourceTabulations(dataSources);

let typeChecked = []; // Column header checkbox state

let allTabulations = makeAllTabulations();

function makeAllTabulations() {
  console.log('makeAllTabulations()');

let allTabulations = [];
  allTabulationGroups.forEach(group => {
    console.log('group: ' + group); console.dir(group);
    tabulationGroups[group].forEach(tabulation => {
      tabulation.group = group;
      allTabulations.push(tabulation)
    });
  })
  console.log('allTabulations updated:');console.log(allTabulations);

  allTabulations.forEach(tab => {if (typeChecked[tab.heading] === undefined) typeChecked[tab.heading] = true;} );
  console.log('typeChecked initialised:');console.dir(typeChecked);
  return allTabulations;
}

function makeSourcesFromTextList(text){
  console.log('makeSourcesFromTextList()');console.dir(text);

  const sources = [];
  if (text) {
    const lines = text.split('\n');
    console.dir(lines);

    lines.forEach(line => {
      const url = line.trim();
      if (line.length) sources.push({ endpoint: url });
    });
    console.log('SOURCES:');console.dir(sources);
  }
  return sources;
}

function makeSourceTabulations (sources) {
  destroySources(sources);

  const tabulationTypesMap = new Map();
  tabulationTypes.forEach(tabType => tabulationTypesMap.set(tabType.type, tabType.value));

  console.log('WebSouceTabulatorUI.Initialising Tabulation Data..');
  sources.forEach(source => {
    source.sparqlStats = [];
    // console.log('allTabulations');console.dir(allTabulations);
    allTabulations.forEach(tableEntry => {
      const newTableEntry = {...tableEntry};
      newTableEntry.source = source;
      const tabTypes = tabulationTypesMap.get(newTableEntry.type);
      if (!tabTypes) {
        console.error('tabTypes not present in tabulationsTypesMap for \'' + newTableEntry.type + '\'');
        console.dir(newTableEntry);console.dir(tableEntry);
      }
      if (newTableEntry.group === 'Custom Query') {
        if (customQueryInput && customQueryInput.trim().length) newTableEntry.query = customQueryInput;
      }
      const stat = new tabTypes.tabClass(newTableEntry, undefined);
      stat.uiComponent = tabTypes.uiComponent;
      source.sparqlStats.push(stat);
    });
  });

  return sources;
}

// To avoid memory leak destroy each source.sparqlStats because the above creates circular refs:
//   tableEntry->source, source.sparqlStats->stat, stat->tableEntry
function destroySources(sources) {
  sources.forEach(source => source.sparqlStats = undefined);
}

onDestroy( () => {
  destroySources(activeDataSources);
  destroySources(extraDataSources);
});

function updateAll () {
  if (extraEndpointsInputChecked) {
    
    makeSourceTabulations(extraDataSources);
    if (haveExtraSources) updateSources(extraDataSources);
  } else {
    updateSources(dataSources);
  }
}

function updateSources (sources) {
  activeDataSources = sources;
  activeDataSources.forEach(source => {  
    console.log('DEBUG source:');console.dir(source)
    source.sparqlStats.forEach(stat => {
      if (tabulationGroupsToCollect.includes(stat.config.group)) stat.updateSparqlStat();
    });
  });
}

function updateStatEnable(statType) {
  console.log('updateStatEnable(' + statType + ')');
  console.dir(typeChecked);
}

function copyTabulationToClipboardAsCsv () { copyTabulationToClipboard('CSV'); }
function copyTabulationToClipboardAsJson () { copyTabulationToClipboard('JSON'); }

function copyTabulationToClipboard (type) {
  console.log('copyTabulationToClipboard()');console.dir(type);
  navigator.permissions.query({name: "clipboard-write"}).then(result => {
    const tabulationText = (type === 'JSON' ? getTabulationAsTextJson() : getTabulationAsTextCsv());

    if (result.state == "granted" || result.state == "prompt") {
      navigator.clipboard.writeText(tabulationText).then(function() {
        window.notifications.notify('Tabulation written to clipboard as ' + type, {removeAfter: 1000});
      }, function() {
        window.notifications.notifyWarning('Write to clipboard failed.');
      });
    }
    else
        window.notifications.notifyWarning('Permission to write to clipboard was denied.');
  });
}

function getTabulationAsTextCsv () {
  const separator = ',';
  
  // First line is header and we pre-pend a column for the Endpoint URL
  let csv = 'Endpoint URL';
  activeDataSources[0].sparqlStats.forEach(stat => {
    if (stat.config.type !== 'stat-website' || typeChecked[stat.config.heading]) {
      csv += separator + stat.config.heading;
    }
  });
  csv += '\n';

// One row per source
  activeDataSources.forEach(source => {
    csv += source.endpoint;
    source.sparqlStats.forEach(stat => {
      if (stat.config.type === 'stat-website')
        csv += separator + ( stat.getResultText() ? stat.getResultText().trim() : source.name );
      else if (typeChecked[stat.config.heading])
        csv += separator + stat.resultText;
    });
    csv += '\n';
  });

  return csv;
}

function getTabulationAsTextJson () {
  
  let json = `export const dataSources =
[
`;

  activeDataSources.forEach(source => {
    json += "  { name: '" + source.name + "', endpoint: '" + source.endpoint + "', options: " + JSON.stringify(source.options) + '},\n';
  });

  json += '];'
  return json;
}
</script>

<style>
.main { 
  background: rgba(0, 196, 255, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
.tabconfig {
  background: rgba(0, 196, 25, 0.582);
  height: 100px
}
</style>

<div class="main">
  <datalist id="example-endpoints"></datalist>
  <div>
    <b>&lt;WebSourceTabulatorUI&gt;</b><br/>
    <br/>
    <div style='width: 100%;'>
      <div style='width: 15%; margin-right: 5%; display: inline-block;'>
        <label>Select Queries:</label>
        <select style='' multiple bind:value={chosenTabulations}>
          {#each optionalTabulations as tabulationOption}
            <option value={tabulationOption}>
              {tabulationOption}
            </option>
          {/each}
        </select>
      </div>
      <div style='width: 70%; padding-left: 5%; display: inline-block;'>
        <label style='position: relative; '><input type=checkbox bind:checked={extraEndpointsInputChecked}/>Specify endpoints{#if extraEndpointsInputChecked}:{/if}</label>

        <textarea 
          style='width: 40%;'
          rows='4' 
          hidden={!extraEndpointsInputChecked} 
          type=textarea 
          bind:value={extraEndpointsInput} 
          placeholder='Enter endpoint URLs, one per line'
          />
        <textarea 
          style='width: 45%;'
          rows='4' 
          hidden={!extraEndpointsInputChecked} 
          type=textarea 
          bind:value={customQueryInput}
          placeholder="Optional 'Custom' SPARQL query"
          />
      </div>
    </div>
    <text enabled={lastError !== undefined}>{lastError}</text>
    <div style='width: 800px; height: 10px;display: block;'></div>
    <div style='width: 100%; display: block;'>
      <table style='xwidth: 100%'><tr><td colspan='100'>
      <button disabled={!haveExtraSources && extraEndpointsInputChecked} style='vertical-align: top' on:click={() => updateAll()}>Update Table</button>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Copy table to clipboard as: 
      <a on:click={copyTabulationToClipboardAsCsv}>CSV</a> or 
      <a on:click={copyTabulationToClipboardAsJson}>JSON</a>
      </td></tr>
      <tr>
        {#each activeDataSources[0].sparqlStats as stat}
          {#if tabulationGroupsToCollect.includes(stat.config.group)}
            <th><label>{#if stat.config.type !== 'stat-website'}<input type=checkbox bind:checked={typeChecked[stat.config.heading]} on:change={() => updateStatEnable(stat.config.type)}/><br/>{/if}{stat.config.heading}</label></th>
          {/if}
        {/each}
      </tr>
        {#each activeDataSources as source}
        <tr>
          {#each source.sparqlStats as stat}
            {#if tabulationGroupsToCollect.includes(stat.config.group)}
              <td>
              <!-- stat.config.source.endpoint: {stat.config.source.endpoint} -->
              <div hidden={!typeChecked[stat.config.heading]}><svelte:component this={stat.uiComponent} sparqlStat={stat}/></div>
              </td>
            {/if}
          {/each}
        </tr>
        {/each}
      </table>
    </div>
  </div>
</div>
