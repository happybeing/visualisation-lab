<!-- UI to display and interact with data obtained by interrogating web sources

TODO: extend this from SPARQL endpoints to support other kinds of Web data source
-->
<script>
import {onDestroy} from 'svelte';

// TODO: add ability to add/remove sources using UI
// TODO: add ability for gathered data to be saved (in dataSources.js?)
import {dataSources} from '../data/dataSources.js';
import {sparqlTabulations} from '../data/sparqlTabulations.js';

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
const customTabulation = { heading: 'Custom Query', type: 'sparql-custom', query: `
ASK {
  FILTER(2 NOT IN ())
}`
};

$: extraDataSources = makeSourcesFromTextList(extraEndpointsInput);
$: haveExtraSources = extraDataSources && extraDataSources[0];

let activeDataSources = makeSourceTabulations(dataSources);

let typeChecked = []; // For column header checkboxes
sparqlTabulations.forEach(tab => typeChecked[tab.type] = true);
console.log('typeChecked initialised:');console.dir(typeChecked);

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

  console.log('WebSouceTabulatorUI.Inisitalising Tabulation Data..');
  sources.forEach(source => {
    source.sparqlStats = [];
    // console.log('sparqlTabulations');console.dir(sparqlTabulations);
    sparqlTabulations.forEach(tableEntry => {
      const newTableEnty = {...tableEntry};
      newTableEnty.source = source;
      const tabTypes = tabulationTypesMap.get(newTableEnty.type);

      const stat = new tabTypes.tabClass(newTableEnty, undefined);
      stat.uiComponent = tabTypes.uiComponent;
      source.sparqlStats.push(stat);
    });

    
    if (extraEndpointsInputChecked){
      let query;
      if (customQueryInput && customQueryInput.trim().length) query = customQueryInput;
      if (!query && customTabulation.query && customTabulation.query.trim().length) query = customTabulation.query;
      if (query) {
        if (!customQueryInput || customQueryInput.length !== query.length) customQueryInput = query;
        customTabulation.source = source;
        customTabulation.query = query;
        const tabTypes = tabulationTypesMap.get(customTabulation.type);

        const stat = new tabTypes.tabClass(customTabulation, undefined);
        stat.uiComponent = tabTypes.uiComponent;
        source.sparqlStats.push(stat);
      }
    }
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
      if (typeChecked[stat.config.type]) stat.updateSparqlStat();
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
    if (stat.config.type !== 'stat-website' || typeChecked[stat.config.type]) {
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
      else if (typeChecked[stat.config.type])
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
</style>

<div class="main">
  <datalist id="example-endpoints"></datalist>
  <div>
    <div>
      <b>&lt;WebSourceTabulatorUI&gt;</b><br/>
      <br/>
      <div style='width: 90%'>
      <label><input type=checkbox bind:checked={extraEndpointsInputChecked}/>Provide endpoints manually{#if extraEndpointsInputChecked}:{/if}<label>
      <textarea 
        style='width: 40%'
        rows='5' 
        hidden={!extraEndpointsInputChecked} 
        type=textarea 
        bind:value={extraEndpointsInput} 
        placeholder='Enter endpoint URLs, one per line'
        />
      <textarea 
        style='width: 30%'
        rows='5' 
        hidden={!extraEndpointsInputChecked} 
        type=textarea 
        bind:value={customQueryInput}
        placeholder="Optional 'Custom' SPARQL query to include below."
        />
      </div>
      <div>
      </div>
      <text enabled={lastError !== undefined}>{lastError}</text>
    </div>
    <div>
      <br/>
      <table><tr><td colspan='100'>
      <button disabled={!haveExtraSources && extraEndpointsInputChecked} style='vertical-align: top' on:click={() => updateAll()}>Update Table</button>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Copy table to clipboard as: 
      <a on:click={copyTabulationToClipboardAsCsv}>CSV</a> or 
      <a on:click={copyTabulationToClipboardAsJson}>JSON</a>
      </td></tr>
      <tr>
        {#each activeDataSources[0].sparqlStats as stat}
          <th><label>{#if stat.config.type !== 'stat-website'}<input type=checkbox bind:checked={typeChecked[stat.config.type]} on:change={() => updateStatEnable(stat.config.type)}/><br/>{/if}{stat.config.heading}</label></th>
        {/each}
      </tr>
        {#each activeDataSources as source}
        <tr>
          {#each source.sparqlStats as stat}
            <td>
            <!-- stat.config.source.endpoint: {stat.config.source.endpoint} -->
            <div hidden={!typeChecked[stat.config.type]}><svelte:component this={stat.uiComponent} sparqlStat={stat}/></div>
            </td>
          {/each}
        </tr>
        {/each}
      </table>
    </div>
  </div>
</div>
