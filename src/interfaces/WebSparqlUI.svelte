<script>
export let sourceInterface;
export let sourceResultStore;
  // { description: '', endpoint: '', options: {}, sparqlText: ``},

import {sparqlExamples} from '../data/examples-sparql.js';
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
        <textarea class="sparqlText" value={sparql.sparqlText} placeholder="SPARQL query" rows="15"/><br/>
    </div>
  </div>
  <div>
    <button 
      enabled={sourceInterface !== undefined} 
      on:click={() => sourceInterface.loadSparqlQuery(sourceResultStore, sparql.endpoint, sparql.sparqlText)}>
      Run Query
    </button>
    <text enabled={lastError !== undefined}>{lastError}</text>
  </div>

</div>
