export const workingSources =
[
  { name: 'dbPedia', endpoint: 'https://dbpedia.org/sparql', options: {}},           // works
  { name: 'Wikidata', endpoint: 'https://query.wikidata.org/sparql', options: {}},    // works
  { name: 'Europa', endpoint: 'https://data.europa.eu/euodp/sparqlep', options: {}},// works
  { name: 'Open University (UK)', endpoint: 'https://data.open.ac.uk/query', options: {}},
  { name: 'Europeana', endpoint: 'http://data.europeana.eu/', options: {}},
  { name: 'UniProt', endpoint: 'https://sparql.uniprot.org/', options: {}},

  { name: 'Carnegie Hall', endpoint: 'https://data.carnegiehall.org/sparql', options: {}},  // Only returns HTML
  { name: '', endpoint: 'http://os.rkbexplorer.com/sparql/', options: {}}, // CORS errors to be investigated

  { name: '', endpoint: 'http://lod.ac/bdls/sparql', options: {}},
  { name: '', endpoint: 'http://lod.openlinksw.com/sparql', options: {}},
  { name: '', endpoint: 'http://linkeddata.uriburner.com/sparql', options: {}},
  { name: '', endpoint: 'http://id.sgcb.mcu.es/sparql', options: {}},
  { name: '', endpoint: 'http://eventmedia.eurecom.fr/sparql', options: {}},
  { name: '', endpoint: 'http://lod.sztaki.hu/sparql', options: {}},
  { name: '', endpoint: 'http://data.allie.dbcls.jp/sparql', options: {}},
  { name: '', endpoint: 'http://aksw.org/sparql', options: {}},
  { name: '', endpoint: 'http://de.dbpedia.org/sparql', options: {}},
  { name: '', endpoint: 'http://fr.dbpedia.org/sparql', options: {}},
  { name: '', endpoint: 'http://ja.dbpedia.org/sparql', options: {}},
  { name: '', endpoint: 'http://live.dbpedia.org/sparql', options: {}},
  { name: '', endpoint: 'http://linkedgeodata.org/sparql', options: {}},
  { name: '', endpoint: 'http://opendatacommunities.org/sparql', options: {}},
  { name: '', endpoint: 'http://data.archiveshub.ac.uk/sparql', options: {}},
  { name: '', endpoint: 'http://sparql.data.southampton.ac.uk', options: {}},
  { name: '', endpoint: 'http://environment.data.gov.uk/sparql/bwq/query', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
  // { endpoint: '', options: {}},
];

export const errorTestingSources = [
  { name: '', endpoint: 'http://lod.ac/bdls/sparql', options: {}},
  { name: '', endpoint: 'http://www.rdfabout.com/sparql', options: {}},
  { name: '', endpoint: 'http://revyu.com/sparql', options: {}},
  { name: '', endpoint: 'http://aemet.linkeddata.es/sparql', options: {}},
  { name: '', endpoint: 'http://greek-lod.auth.gr/fire-brigade/sparql', options: {}},
  { name: '', endpoint: 'http://setaria.oszk.hu/sparql', options: {}},
  { name: '', endpoint: 'http://dewey.info/sparql.php', options: {}},
  { name: '', endpoint: 'http://biordf.net/sparql', options: {}},
  { name: '', endpoint: 'http://dimitros.net/query.sparql', options: {}},
  { name: '', endpoint: 'http://data.lenka.no/sparql', options: {}},
  { name: '', endpoint: 'https://data.carnegiehall.org/sparql', options: {}},
  { name: '', endpoint: 'http://kaiko.getalp.org/sparql', options: {}},
  { name: '', endpoint: 'http://data.linkedmdb.org/sparql', options: {}},
  { name: '', endpoint: 'http://data.archiveshub.ac.uk/sparql', options: {}},
];
