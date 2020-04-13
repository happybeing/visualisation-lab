export const dataSources =
[
  // { endpoint: '', options: {}},

  { endpoint: 'https://dbpedia.org/sparql', options: {}},  // works
  { endpoint: 'https://data.europa.eu/euodp/sparqlep', options: {}}, // works

  { endpoint: 'https://data.carnegiehall.org/sparql', options: {}},  // Only returns HTML
  { endpoint: 'http://os.rkbexplorer.com/sparql/', options: {}}, // CORS error for 'sparql-count'

  { endpoint: 'https://query.wikidata.org/sparql', options: {}},  // works but Turtle only available for CONSTRUCT queries


  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
];
