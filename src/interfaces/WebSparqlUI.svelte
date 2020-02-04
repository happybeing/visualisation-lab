<script>
import {onMount} from 'svelte';

export let sourceInterface;
export let sourceResultStore;

let uri;
let lastError;
let endpoint = 'https://dbpedia.org/sparql';
let sparqlText = `# https://en.wikipedia.org/wiki/History_of_programming_languages
# https://en.wikipedia.org/wiki/Perl
# http://dbpedia.org/page/Perl
# http://dbpedia.org/sparql

PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX dbpprop: <http://dbpedia.org/property/>
PREFIX dbpedia: <http://dbpedia.org/resource/>

SELECT DISTINCT ?lang1 ?lang2 ?lang1label ?lang2label ?lang1value ?lang2value ?lang1year ?lang2year
WHERE {
  ?lang1 rdf:type dbpedia-owl:ProgrammingLanguage ;
         rdfs:label ?lang1name ;
         dbpprop:year ?lang1year .
  ?lang2 rdf:type dbpedia-owl:ProgrammingLanguage ;
         rdfs:label ?lang2name ;
         dbpprop:year ?lang2year .
  ?lang1 dbpedia-owl:influenced ?lang2 .
  FILTER (?lang1 != ?lang2)
  FILTER (LANG(?lang1name) = 'en')
  FILTER (LANG(?lang2name) = 'en')
  BIND (replace(?lang1name, " .programming language.", "") AS ?lang1label)
  BIND (replace(?lang2name, " .programming language.", "") AS ?lang2label)
  FILTER (?lang1year > 1950 AND ?lang1year < 2020)
  FILTER (?lang2year > 1950 AND ?lang2year < 2020)
  # To render older language larger than newer
  BIND ((2020 - ?lang1year) AS ?lang1value)
  BIND ((2020 - ?lang2year) AS ?lang2value)
}`;
let endpointCheckbox = false;

// onMount(() => {endpointCheckbox = true;});

</script>

<style>
.main { 
  background: rgba(0, 47, 255, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
.ui {
  margin-right: 0.2cm;
}
.sparqlText {
  width:80%; max-width:1000px;
}
</style>

<div class="main">
  <datalist id="example-endpoints">
    <option value="https://theWebalyst.solid.community/public/">
    <option value="https://solidpay.solid.community/public/">
    <option value="https://spoggy.solid.community/public/">
    <option value="https://agora.solid.community/public/">
  </datalist>
  <div>
      <h2>&lt;WebSparqlUI&gt;</h2>
    <p>
      <input class="ui" list="example-endpoints" inputmode="url" width="100%" type="url" bind:value={endpoint} placeholder="SPARQL endpoint"/>
      <input class="ui" bind:checked={endpointCheckbox} type="checkbox"/>Use example SPARQL query for endpoint:<br/>
      <textarea class="sparqlText" value={sparqlText} placeholder="SPARQL query" rows="15"/><br/>
    </p>
  </div>
  <div>
    <button 
      enabled={sourceInterface !== undefined} 
      on:click={() => sourceInterface.loadSparqlQuery(sourceResultStore, endpoint, sparqlText)}>
      Run Query
    </button>
    <text enabled={lastError !== undefined}></text>
  </div>

</div>
