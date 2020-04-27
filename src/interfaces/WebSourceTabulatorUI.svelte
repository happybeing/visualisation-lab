<!-- UI to display and interact with data obtained by interrogating web sources

TODO: extend this from SPARQL endpoints to support other kinds of Web data source
-->
<script>
import {onDestroy} from 'svelte';
import {writable} from 'svelte/store';

import Clipboard from '../utils/Clipboard.svelte';
let clipboardText;
let copySuccessMessage;

import {tabulationGroups} from '../data/sparqlTabulations.js';
// TODO: add ability for gathered data to be saved (in dataSources.js?)
import {workingSources, errorTestingSources} from '../data/dataSources.js';
let fixedDataSources = workingSources;
// fixedDataSources = errorTestingSources;
// fixedDataSources = [{name: '', endpoint: 'http://biordf.net/sparql', options: {}},];
// fixedDataSources = [{name: '', endpoint: 'http://data.archiveshub.ac.uk/sparql', options: {}},];
// fixedDataSources = [{name: '', endpoint: 'https://dbpedia.org/sparql', options: {}},];

import {SparqlStat, SparqlEndpointStat, SparqlEndpointReportSuccess, StatWebsite, FetchMonitor} from '../interfaces/SourceInterface.js';
import SparqlStatUI from '../interfaces/SparqlStatUI.svelte';
// import {SparqlStatTableUI} from '../interfaces/SparqlStatTableUI.svelte';

const tabulationTypes = [
  { type: 'stat-website', value: { uiComponent: SparqlStatUI, tabClass: StatWebsite } },
  { type: 'sparql-stat', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointStat } },
  { type: 'sparql-api', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'sparql-construct', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },

  { type: 'content-turtle', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'content-xml', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'content-csv', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },
  { type: 'content-json', value: { uiComponent: SparqlStatUI, tabClass: SparqlEndpointReportSuccess } },

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

const webSourceTabulatorStatusStore = writable(0);
const fetchMonitor = new FetchMonitor(webSourceTabulatorStatusStore);
window.fetchMonitor = fetchMonitor; // For access to fetchMonitor.dump() etc in browser console

$: statusText = $webSourceTabulatorStatusStore ? $webSourceTabulatorStatusStore : 'idle';
let statusText = 'idle';

let extraEndpointsInputChecked = false;
let extraEndpointsInput = '';//invalidEndpointTests;

let customQueryInput;

let optionalTabulations = [
  'Content Types',
  'SPARQL 1.0', 
  'SPARQL 1.1',
  'Custom Query'
  ];

let allTabulationGroups = ['Basic Queries', ...optionalTabulations];
let chosenTabulations = ['SPARQL 1.1'];
chosenTabulations = ['Content Types'];

$: tabulationGroupsToCollect = ['Basic Queries', ...chosenTabulations];

$: extraDataSources = makeSourcesFromTextList(extraEndpointsInput);
$: haveExtraSources = extraDataSources && extraDataSources[0];
$: activeDataSources = makeSourceTabulations(fixedDataSources);

let typeChecked = []; // Column header checkbox state

let allTabulations = makeAllTabulations();

function makeAllTabulations() {
  console.log('makeAllTabulations()');

let allTabulations = [];
  allTabulationGroups.forEach(group => {
    // console.log('group: ' + group); console.dir(group);
    tabulationGroups[group].forEach(tabulation => {
      tabulation.group = group;
      allTabulations.push(tabulation)
    });
  })
  console.log('allTabulations updated:');console.log(allTabulations);

  allTabulations.forEach(tab => {if (typeChecked[tab.heading] === undefined) typeChecked[tab.heading] = true;} );
  // console.log('typeChecked initialised:');console.dir(typeChecked);
  return allTabulations;
}

// Take a URL, trim it to [subdomains].domain.tld and return an array of 
// these starting with the tld and endind with the first subdomain
function urlTerms ( url ) {
  url = url.indexOf('//') ? url.substring(url.indexOf('//') + 2) : url;
  url = url.indexOf('/') !== -1 ? url.substring(0, url.indexOf('/')) : url;
  return url.split('.').reverse();
}

function makeSourcesFromTextList(text){
  console.log('makeSourcesFromTextList()');

  const sources = [];
  if (text) {
    const lines = text.split('\n');

    let urls = [];
    lines.forEach(line => {
      let url = line.toLowerCase().trim();
      if (url.endsWith('/')) url = url.substring(0, url.length-1);

      if (line.length && !urls.includes(url)) {
        urls.push(url);
        sources.push({ endpoint: url });
      }
    });
    // console.log('SOURCES:');console.dir(sources);
  }

  // sort by TLD, domain, subdomains, protocol
  // Sort ignoring protocol
  sources.sort((s1, s2) => {
    console.log('sort(' + s1.endpoint + ',' + s2.endpoint + ')');
    const terms1 = urlTerms(s1.endpoint);
    const terms2 = urlTerms(s2.endpoint);
    console.log(JSON.stringify(terms1));
    console.log(JSON.stringify(terms2));
    let result;
    terms1.forEach((term, index) => {
      if (!result && term !== terms2[index]) {
        console.log('term, index: ', term + ', ' + index);
        console.log('terms2[index]:', terms2[index]);
        result = terms2[index] === undefined ? 1 : (term < terms2[index] ? -1 : 1);
      }
    });
    if (result === undefined && terms1.length !== terms2.length) result = terms1.length < terms2.length ? -1 : 1;
    if (result === undefined) result = 0;

    console.log('result: ' + result);
    return result;
  });

  console.dir(sources);
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
      const stat = new tabTypes.tabClass(newTableEntry, fetchMonitor);
      stat.uiComponent = tabTypes.uiComponent;
      source.sparqlStats.push(stat);
    });
  });

  return sources;
}

// To avoid memory leak destroy each source.sparqlStats because the above creates circular refs:
//   tableEntry->source, source.sparqlStats->stat, stat->tableEntry
// The fetchMonitor has an array of the SparqlStats so must be re-initialised to release its refs
function destroySources(sources) {
  sources.forEach(source => {
    source.testSummary = undefined;
    if (source.sparqlStats)
      source.sparqlStats.forEach(stat => {
        if (stat.unsubscribge) stat.unsubscribe();
        stat.unsubscribe = undefined;
        stat.fetchMonitor = undefined;
      });
    source.sparqlStats = undefined
  });
  fetchMonitor.reset();
}

onDestroy( () => {
  destroySources(activeDataSources);
  destroySources(extraDataSources);
});

function updateAll () {
  // Remake source SparqlStats to ignore any pending fetch responses
  makeSourceTabulations(fixedDataSources);
  if (haveExtraSources) makeSourceTabulations(extraDataSources);

  fetchMonitor.reset();
  if (extraEndpointsInputChecked) {
    if (haveExtraSources) updateSources(extraDataSources);
  } else {
    updateSources(fixedDataSources);
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

function copyTabulationToClipboardAsCsv () { copyTabulationToClipboardComponent('CSV'); }
function copyTabulationToClipboardAsJson () { copyTabulationToClipboardComponent('JSON'); }

function copyTabulationToClipboardComponent (type) {
  console.log('copyTabulationToClipboardComponent()');

  copySuccessMessage = 'Tabulation written to clipboard as ' + type;
  clipboardText = (type === 'JSON' ? getTabulationAsTextJson() : getTabulationAsTextCsv());
}

function getTabulationAsTextCsv () {
  const separator = ',';
  
  // First line is header and we pre-pend columns for the Endpoint URL and test summary
  let csv = 'Endpoint URL' + separator + 'Summary';
  activeDataSources[0].sparqlStats.forEach(stat => {
    if (stat.config.type !== 'stat-website' || typeChecked[stat.config.heading]) {
      csv += separator + stat.config.heading;
    }
  });
  csv += '\n';

  // One row per source
  activeDataSources.forEach(source => {
    csv += source.endpoint;
    csv += separator + (source.testSummary ? source.testSummary : '');
    source.sparqlStats.forEach(stat => {
      let resultText = stat.getResultText();
      resultText = resultText ? resultText.trim().replace(',', '') : '';
      if (stat.config.type === 'stat-website')
        csv += separator + ( resultText ? resultText : source.name );
      else if (typeChecked[stat.config.heading])
        csv += separator + resultText;
      if(stat.isError && stat.responseTypeAbbrev) csv += ' ' + stat.responseTypeAbbrev;
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
    json += "  { name: '" + (source.name ? source.name : '') + 
            "', endpoint: '" + source.endpoint + 
            "', options: " + JSON.stringify(source.options ? source.options : {}) + '},\n';
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
.vspace {
  margin-top: 8px;
}
.rightjustify {
  text-align: right;
}
</style>

<div class="main">
  <datalist id="example-endpoints"></datalist>
  <div>
    <b>&lt;WebSourceTabulatorUI&gt;</b><br/>
    <br/>
    <div style='width: 100%;'>
      <div style='margin-right: 20px; display: inline-block;'>
        <label>Select Queries:</label>
        <select style='' multiple bind:value={chosenTabulations}>
          {#each optionalTabulations as tabulationOption}
            <option value={tabulationOption}>
              {tabulationOption}
            </option>
          {/each}
        </select>
      </div>
        <textarea 
          style='vertical-align: bottom; display: inline-block;'
          rows='4'
          cols='40' 
          type=textarea 
          bind:value={customQueryInput}
          placeholder="Optional 'Custom' SPARQL query"
          />
    </div>
    <div class='vspace'>
      <label style='position: relative; '><input type=checkbox bind:checked={extraEndpointsInputChecked}/>Specify endpoints{#if extraEndpointsInputChecked}:{/if}</label>
      <textarea 
        rows='4' 
        cols='40'
        hidden={!extraEndpointsInputChecked} 
        type=textarea 
        bind:value={extraEndpointsInput} 
        placeholder='Enter endpoint URLs, one per line'
        />
    </div>
    <div style='width: 100%; display: block; padding-top: 8px;'>
      <table style=''>
      <tr><td colspan='100'>
        <button disabled={!haveExtraSources && extraEndpointsInputChecked} style='vertical-align: top' on:click={() => updateAll()}>Update Table</button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        Copy table to clipboard: 
        as results (<a on:click={copyTabulationToClipboardAsCsv}>CSV</a>)
        or VisLab dataSources.js 
        (<a on:click={copyTabulationToClipboardAsJson}>JSON</a>)
      </td></tr>
      <tr><td style='padding-top: 8px;' colspan='100'>
        <b>Status: </b>{statusText}
      </td></tr>
      <tr>
        {#each activeDataSources[0].sparqlStats as stat}
          {#if tabulationGroupsToCollect.includes(stat.config.group)}
            <th><label title={stat.config.query}>{#if stat.config.type !== 'stat-website'}<input type=checkbox bind:checked={typeChecked[stat.config.heading]} on:change={() => updateStatEnable(stat.config.type)}/><br/>{/if}{stat.config.heading}</label></th>
          {/if}
        {/each}
      </tr>
        {#each activeDataSources as source}
        <tr>
          {#each source.sparqlStats as stat, index}
            {#if tabulationGroupsToCollect.includes(stat.config.group)}
              <td class={index === 0 && stat.resultText.indexOf('.') !== -1 ? 'rightjustify' : ''}>
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
  <Clipboard value={clipboardText} successMessage={copySuccessMessage} />
</div>
