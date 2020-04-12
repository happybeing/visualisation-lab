<!-- UI to display and interact with data obtained by interrogating web sources

TODO: extend this from SPARQL endpoints to support other kinds of Web data source
-->
<script>
import {onMount} from 'svelte';

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
  { type: 'simple-number', value: { uiComponent: SparqlStatUI, tabClass: SparqlStat } },
  { type: 'sparql-construct', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'sparql-construct-test', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'sparql-count', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
];

const tabulationTypesMap = new Map();
tabulationTypes.forEach(tabType => tabulationTypesMap.set(tabType.type, tabType.value));

console.log('WebSouceTabulatorUI.Inisitalising Tabulation Data..');
dataSources.forEach(source => {
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
});

let uri;
let lastError;

let selected = dataSources[0];
let sparql = selected;
let endpoint;
let endpointCheckbox = false;

function updateAll (sources) {
  sources.forEach(source => 
{  console.log('DEBUG source:');console.dir(source)
    source.sparqlStats.forEach(stat => stat.updateSparqlStat());
})}

</script>

<style>
.main { 
  background: rgba(0, 196, 255, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
div.query {max-width:1000px;padding-right: 1cm;}
</style>

<div class="main">
  <datalist id="example-endpoints">
  </datalist>
  <div>
    <h2>&lt;WebSourceTabulatorUI&gt;</h2>
    <div class="query">
      {#each dataSources as source}
        <h2>{source.endpoint}</h2>
        {#each source.sparqlStats as stat}
          stat.config.source.endpoint: {stat.config.source.endpoint}
          <svelte:component this={stat.uiComponent} sparqlStat={stat}/>
        {/each}
      {/each}
    </div>
  </div>
  <div>
    <button 
      on:click={() => updateAll(dataSources)}>
      Update All
    </button>
    <text enabled={lastError !== undefined}>{lastError}</text>
  </div>

</div>
