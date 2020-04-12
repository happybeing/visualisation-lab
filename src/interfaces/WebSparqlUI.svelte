<script>
export let sourceInterface;
export let sourceResultStore;
export let statusTextStore;
  // { description: '', endpoint: '', options: {}, sparqlText: ``},

import {sparqlExamples} from '../data/examples-sparql.js';

// Note:
// Source http://togostanza.org/
// - queries work to http: from http: (but togostanza.org refuses connection from https)
// -> I can access from localhost with CORS checks bypassed in Firefox 
//    using CORS Everywhere add-on. sparql.js requests results in JSON format 
//    but text/turtle also available.
//
// import {brokenExamples} from '../data/examples-sparql.js';
// let sparqlExamples = brokenExamples;

let uri;
let lastError;

let selected = sparqlExamples[0];
let sparql = selected;
let endpoint;
let endpointCheckbox = false;
</script>

<style>
.main { 
  background: rgba(0, 47, 255, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
div.query {max-width:1000px;padding-right: 1cm;}
.ui {
  margin-right: 0.2cm;
}
.sparqlText {
  width:100%; 
}
</style>

<div class="main">
  <datalist id="example-endpoints">
  </datalist>
  <div>
    <h2>&lt;WebSparqlUI&gt;</h2>
    <div class="query">
      <div style="float: right;">Example SPARQL Queries:
        <select class="ui" bind:value={selected} on:change="{() => {sparql = selected}}">
        {#each sparqlExamples as example}
          <option value={example}>{example.description}</option>
        {/each}
        </select><br/></div>
        Endpoint: <input bind:value={sparql.endpoint} placeholder="endpoint"><br/>
        <textarea class="sparqlText" bind:value={sparql.sparqlText} placeholder="SPARQL query" rows="15"/><br/>
    </div>
  </div>
  <div>
    <button 
      enabled={sourceInterface !== undefined} 
      on:click={() => sourceInterface.loadSparqlQuery(sourceResultStore, statusTextStore, sparql.endpoint, sparql.sparqlText)}>
      Run Query
    </button>
    <text enabled={lastError !== undefined}>{lastError}</text>
  </div>

</div>
