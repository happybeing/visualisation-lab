<!-- Simple form based query UI
 -->
<script>
export let sourceInterface;
export let sourceResultStore;
export let statusTextStore;

// import {queryTemplates} from '../data/web-query-templates.js';

const testTemplate = {
  description: 'Person and relatives search of dbPedia.org',
  endpoint: 'https://dbpedia.org/sparql', // TODO allow this to be changed in UI
  introText: 'Search for people:',
  limitUiValue: 20,
  limitUiName: 'Maximimum people to find: ',
  queryTerms: [
    {
      termName: 'givenName',
      uiValue: '',
      uiPlaceholder: 'Given name (optional)',
      sparqlMatch: 
      '  ?subject foaf:givenName ?givenName . FILTER regex(str(?givenName), "{givenName}", "i")',
    },
    {
      termName: 'surname',
      uiValue: '',
      uiPlaceholder: 'Family name (optional)',
      sparqlMatch: 
      '  ?subject foaf:surname ?surname . FILTER regex(str(?surname), "{surname}", "i")',
    },
    {
      termName: 'keywords',
      uiValue: '',
      uiPlaceholder: 'Extra keywords (optional)',
      sparqlMatch: 
      '  ?subject dbo:abstract ?abstract . FILTER regex(str(?abstract), "{keywords}", "i")',
    },
  ],
  query: '',
  queryTemplate: `
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbpedia2: <http://dbpedia.org/property/>
PREFIX dct: <http://purl.org/dc/terms/>
CONSTRUCT {
  ?subject rdf:type foaf:Person .
  ?subject rdf:type ?types .
  ?subject rdfs:label ?label .
  ?subject dct:description ?description .
  ?subject dbo:abstract ?abstract .
  ?subject rdfs:comment ?comment .
  ?subject foaf:givenName ?givenName .
  ?subject foaf:surname ?surname .
  ?subject foaf:gender ?gender .
  ?subject dbo:birthDate ?birthDate .
  ?subject dbo:deathDate ?deathDate .
  ?subject foaf:homepage ?homepage .
  ?subject dbpedia2:occupation ?occupation .
  ?subject foaf:depiction ?depiction .
  ?subject dbo:thumbnail ?thumbnail .
  ?subject dbo:child ?child .
  ?subject dbo:parent ?parent .
  ?subject dbo:spouse ?spouse .
  ?subject dbpedia2:family ?family .
  ?subject foaf:gender ?gender .
  ?personReferringToParent dbo:parent ?subject .
  ?personReferringToChild dbo:child ?subject .
  ?personReferringToSpouse dbo:spouse ?subject .
}
WHERE {
  ?subject rdf:type foaf:Person .
{templatedMatches}

  OPTIONAL { ?subject rdf:type ?types . 
    FILTER( ?types = <http://dbpedia.org/class/yago/Aristocrat109807754> || ?types = <http://dbpedia.org/class/yago/Ruler110541229> )
  }
  OPTIONAL { ?subject rdfs:label ?label . FILTER langMatches( lang(?label), "en" ) }
  OPTIONAL { ?subject dct:description ?description . FILTER langMatches( lang(?description), "en" ) }
  OPTIONAL { ?subject dbo:abstract ?abstract . FILTER langMatches( lang(?abstract), "en" )}
  OPTIONAL { ?subject rdfs:comment ?comment . FILTER langMatches( lang(?comment), "en" )}
  OPTIONAL { ?subject foaf:givenName ?givenName. FILTER langMatches( lang(?givenName), "en" ) }
  OPTIONAL { ?subject foaf:surname ?surname . FILTER langMatches( lang(?surname), "en" ) }
  OPTIONAL { ?subject foaf:gender ?gender . }
  OPTIONAL { ?subject dbo:birthDate ?birthDate . }
  OPTIONAL { ?subject dbo:deathDate ?deathDate . }
  OPTIONAL { ?subject foaf:homepage ?homepage . }
  OPTIONAL { ?subject dbpedia2:occupation ?occupation . }
  OPTIONAL { ?subject foaf:depiction ?depiction . }
  OPTIONAL { ?subject dbo:thumbnail ?thumbnail . }
  OPTIONAL { ?subject dbo:child ?child . }
  OPTIONAL { ?subject dbo:parent ?parent . }
  OPTIONAL { ?subject dbo:spouse ?spouse . }
  OPTIONAL { ?subject dbpedia2:family ?family . }
  OPTIONAL { ?personReferringToParent dbo:parent ?subject . }
  OPTIONAL { ?personReferringToChild dbo:child ?subject . }
  OPTIONAL { ?personReferringToSpouse dbo:spouse ?subject . }
}`,
};

let uri;
let lastError;

let selected = testTemplate;//queryTemplates[0];
let sparql = selected;
let endpoint;
let endpointCheckbox = false;

let sparqlLimit = 20; // Default

// TODO sanitise variables before substitution (strip blanks, escape as https://stackoverflow.com/a/55726984/4802953)
function buildSparqlQuery (template) {
  console.log('buildSparqlQuery()'); console.dir(template);

  // Assemble the SPARQL match group:
  let matchGroup = '';
  template.queryTerms.forEach( term => {
    console.log('buildSparqlQuery()...');
    console.dir(term);
    console.log('term.uiValue:', term.uiValue);
    console.log('termName:', term.termName);
    if (term.uiValue !== '') matchGroup += doSubstitution(term.termName, term.uiValue, term.sparqlMatch) + '\n';
  });
  console.log('matchGroup: \n' + matchGroup);

  let query = doSubstitution('templatedMatches', matchGroup, template.queryTemplate);
  query += ' LIMIT ' + sparqlLimit;
  console.log('====== SPARQL QUERY ========\n\n' + query);
  template.query = query;
  return query;
}

function doSubstitution(name, value, string){
  return string.replace(new RegExp('{' + name + '}', 'g'), value);
}

</script>

<style>
.main { 
  background: rgba(41, 211, 190, 1);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
div.query {max-width:1000px;padding-right: 1cm;}
.ui {
  margin-right: 0.2cm;
}
</style>

<div class="main">
  <datalist id="template-endpoints">
  </datalist>
  <div>
    <h2>&lt;WebQueryUI&gt;</h2>
    <div class="query">
      <div style="float: right;">Example SPARQL Queries:
        <select class="ui" bind:value={selected} on:change="{() => {sparql = selected}}">
        <!-- {#each queryTemplates as template}
          <option value={template}>{template.description}</option>
        {/each} -->
        </select><br/></div>
        {testTemplate.introText}<br/>
        {#each testTemplate.queryTerms as term}
          <input bind:value={term.uiValue} placeholder="{term.uiPlaceholder}"><br/>
        {/each}
        <p>
        {testTemplate.limitUiName}<input bind:value={testTemplate.limitUiValue} placeholder="endpoint"><br/>
        </p>
        <p>
        Endpoint: <input bind:value={sparql.endpoint} placeholder="endpoint"><br/>
        </p>
    </div>
  </div>
  <div>
    <button 
      enabled={sourceInterface !== undefined} 
      on:click={() => sourceInterface.loadSparqlQuery(sourceResultStore, statusTextStore, sparql.endpoint, buildSparqlQuery(sparql))}>
      Run Query
    </button>
    <text enabled={lastError !== undefined}>{lastError}</text>
  </div>

</div>
