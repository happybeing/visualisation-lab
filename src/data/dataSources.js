export const dataSources =
[
  { name: 'dbPedia', endpoint: 'https://dbpedia.org/sparql', options: {}},           // works
  { name: 'Wikidata', endpoint: 'https://query.wikidata.org/sparql', options: {}},    // works
  { name: 'Europa', endpoint: 'https://data.europa.eu/euodp/sparqlep', options: {}},// works
  { name: 'Open University (UK)', endpoint: 'https://data.open.ac.uk/query', options: {}},
  { name: 'Europeana', endpoint: 'http://data.europeana.eu/', options: {}},
  { name: 'UniProt', endpoint: 'https://sparql.uniprot.org/', options: {}},

  { name: 'Carnegie Hall', endpoint: 'https://data.carnegiehall.org/sparql', options: {}},  // Only returns HTML
  { name: '', endpoint: 'http://os.rkbexplorer.com/sparql/', options: {}}, // CORS errors to be investigated


  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
];
