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

export const basicTabulations = [
  { heading: 'SPARQL Endpoint', type: 'stat-website', query: `` },
  { heading: 'Version', type: 'sparql-stat', query: `` },
];

export const customTabulation = [
  { heading: 'Custom Query', type: 'sparql-custom', query: `` }
];

/////////////////////// My Tests

export const testTabulations = [
  
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

/////////////////////// SPARQL Web-Querying Paper

export const queryPaper1_0 = [
  //
  // SPARQL 1.0
  //

  { heading: '1.0 ASK[.]', type: 'sparql-wqp-1.0', query: `
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  ASK {
  ?s ?o owl:Thing
  }` },

  { heading: '1.0 CON[.]', type: 'sparql-wqp-1.0', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  CONSTRUCT { ?x rdf:type ?o }
  WHERE
  {
    ?x rdf:type ?o .
  } LIMIT 100` },

  { heading: '1.0 CON[JOIN]', type: 'sparql-wqp-1.0', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  CONSTRUCT { ?x rdf:type ?v }
  WHERE
  {
    ?x rdf:type ?o .
    ?o rdf:type ?x
  } LIMIT 100
  ` },

  { heading: '1.0 CON[OPT]', type: 'sparql-wqp-1.0', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  CONSTRUCT { ?x rdf:type ?v }
  WHERE
  {
    ?x rdf:type ?o .
    OPTIONAL {?o rdf:type ?v }
  } LIMIT 100
  ` },

  // { heading: '1.0 ???', type: 'sparql-wqp-1.0', query: `` },
];

export const queryPaper1_1 = [
  //
  // SPARQL 1.1
  //

  { heading: '1.1 ASK[FIL(!IN)]', type: 'sparql-wqp-1.1', query: `
  ASK {
    FILTER(2 NOT IN ())
  }
  ` },
  
  { heading: '1.1 CON-[.]', type: 'sparql-wqp-1.1', query: `
  PREFIX : <http://example.org/>
  CONSTRUCT WHERE { ?s ?p ?o} LIMIT 100
  ` },
  
  { heading: '1.1 SEL[AVG]', type: 'sparql-wqp-1.1', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  SELECT (AVG(?o) AS ?avg)
  WHERE {
    ?s rdf:type ?o
  } LIMIT 100
  ` },

  { heading: '1.1 SEL[BIND]', type: 'sparql-wqp-1.1', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  SELECT ?z
  {
    ?s rdf:type ?o .
    BIND(?o+10 AS ?z)
  } LIMIT 100
  ` },

  { heading: '1.1 SEL[FIL(!EXISTS)]', type: 'sparql-wqp-1.1', query: `
  PREFIX  rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  # SPARQL 1.1
  SELECT *
  WHERE
  {	?p rdf:type ?type .
    FILTER NOT EXISTS {
      ?p owl:sameAs ?same
    }
  } LIMIT 100
  ` },

  // { heading: '1.1 ???', type: 'sparql-wqp-1.1', query: `` },
  // { heading: '1.1 ???', type: 'sparql-wqp-1.1', query: `` },
  // { heading: '1.1 ???', type: 'sparql-wqp-1.1', query: `` },
];

export const tabulationGroups = {
  'Basic Queries': basicTabulations,
  'Test Queries': testTabulations,
  'v1.0 Queries': queryPaper1_0, 
  'v1.1 Queries': queryPaper1_1,
  'Custom Query': customTabulation,
};

