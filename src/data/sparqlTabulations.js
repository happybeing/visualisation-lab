// Default interrogation settings for statistics and characterisations of SPARQL endpoints
//
// This file may be overridden by a copy saved elsewhere and modified to customise what information
// is gathered, when, how it is presented etc.
//
// Each settings object is passed as 'config' to the constructor of a SparqlStat
//

// TODO problem:
// - COUNT works in CH web GUI and CONSTRUCT does not
// - I thought my test for COUNT was ok but in fact CH is always giving results in HTML, and does not return 400 for invalid SPARQL
// - so I can't tell the difference
// SOLUTION:
// - try and get CH to return non-html response
// - -> work out how to request CSV, Turtle, JSON and fail anything that responds with HTML 
// Request / test response types for:
// application/sparql-results+json
// text/turtle
// text/csv

export const sparqlTabulations = [
  { heading: 'Website', type: 'stat-website', query: `` },
  { heading: 'SPARQL', type: 'sparql-stat', query: `` },

  { heading: 'API', type: 'sparql-api', 
  query: `SELECT * WHERE { <non-existent-subject-yndh5> rdf:type ?o }` },

  { heading: 'COUNT', type: 'sparql-count', 
  query: `
    SELECT (COUNT(?o) AS ?no) WHERE { <non-existent-subject-yndh5> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o }`
  },

  { heading: 'CONSTRUCT', type: 'sparql-construct', 
  query: `CONSTRUCT { <non-existent-subject-yndh5> rdf:type ?o } { <non-existent-subject-yndh5> rdf:type ?o }` },

  /////////////////////// Tests
  //
  // { heading: 'Testing Tab', type: 'test-success',
  //   query: `
  //   CONSTRUCT
  //   {
  //     ?subject rdf:type foaf:Person .
  //   }
  //   WHERE {
  //     ?subject rdf:type foaf:Person .
  //     FILTER ( ?subject = <http://dbpedia.org/resource/Alice_Walker>  )
  //   }
  // `  },

  // { heading: 'Testing Wikidata Turtle', type: 'test-success',
  //   query: `
  //   CONSTRUCT { <http://www.wikidata.org/entity/Q208558> ?p ?o } WHERE
  //   {
  //     <http://www.wikidata.org/entity/Q208558> ?p ?o                                           
  //   }
  //   `,
  //   options: {headers: {'Accept': 'text/turtle'}},
  // },

  // { heading: 'Testing Wikidata JSON', type: 'test-success',
  //   query: `
  //   CONSTRUCT { <http://www.wikidata.org/entity/Q208558> ?p ?o } WHERE
  //   {
  //     <http://www.wikidata.org/entity/Q208558> ?p ?o                                           
  //   }
  //   `,
  //   options: {headers: {'Accept': 'application/sparql-results+json'}},
  // },

  // { heading: 'Testing Wikidata XML', type: 'test-success',
  //   query: `
  //   CONSTRUCT { <http://www.wikidata.org/entity/Q208558> ?p ?o } WHERE
  //   {
  //     <http://www.wikidata.org/entity/Q208558> ?p ?o                                           
  //   }
  //   `,
  //   options: {headers: {'Accept': 'application/rdf+xml'}},
  // },

  // { heading: 'Testing Wikidata CSV', type: 'test-success',  // Returns application/rdf+xml instead
  //   query: `
  //   CONSTRUCT { <http://www.wikidata.org/entity/Q208558> ?p ?o } WHERE
  //   {
  //     <http://www.wikidata.org/entity/Q208558> ?p ?o                                           
  //   }
  //   `,
  //   options: {headers: {'Accept': 'text/csv'}},
  // },

  // { heading: 'Total Triples', type: 'simple-number',
  //   query: `SELECT (COUNT(*) AS ?no) { ?s ?p ?o }`
  // },
  // { heading: 'RDF Types', type: 'simple-number',
  //   query: `SELECT COUNT(distinct ?o) AS ?no { ?s rdf:type ?o }`
  // },

  // { heading: 'Time Span', uiComponent: SparqlStatTableUI, type: 'vm-table-json',
  //   query: `` 
  // },
];
