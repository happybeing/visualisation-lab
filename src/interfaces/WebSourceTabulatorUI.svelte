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

let extraDataSources = [];
let activeDataSources = makeSourceTabulations(dataSources);

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
    extraDataSources = makeSourcesFromTextList(extraEndpointsInput);
    makeSourceTabulations(extraDataSources);
    activeDataSources = extraDataSources ? extraDataSources : [];
  } else {
    activeDataSources = dataSources;
  }

  activeDataSources.forEach(source => {  
    console.log('DEBUG source:');console.dir(source)
    source.sparqlStats.forEach(stat => stat.updateSparqlStat());
  });
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
      <label><input type=checkbox bind:checked={extraEndpointsInputChecked}/>Provide endpoints manually:<label>
      <textarea 
        style='width: 60%'
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
        placeholder="Optional 'Custom' SPARQL to include below."
        />
      </div>
      <div>
      <br/>
      <button style='vertical-align: top' on:click={() => updateAll()}>Update Table:</button>
      </div>
      <text enabled={lastError !== undefined}>{lastError}</text>
    </div>
    <table>
    <tr>
      {#each activeDataSources[0].sparqlStats as stat}
        <th>{stat.config.heading}</th>
      {/each}
    </tr>
      {#each activeDataSources as source}
      <tr>
        {#each source.sparqlStats as stat}
          <td>
          <!-- stat.config.source.endpoint: {stat.config.source.endpoint} -->
          <svelte:component this={stat.uiComponent} sparqlStat={stat}/>
          </td>
        {/each}
      </tr>
      {/each}
    </table>
  </div>
</div>
