// Default interrogation settings for statistics and characterisations of SPARQL endpoints
//
// This file may be overridden by a copy saved elsewhere and modified to customise what information
// is gathered, when, how it is presented etc.
//
// Each settings object is passed as 'config' to the constructor of a SparqlStat
//

export const sparqlTabulations = [
  // { heading: 'Website', type: 'stat-website', query: `` },
  // { heading: 'SPARQL Version', type: 'sparql-stat', query: `` },

  { heading: 'COUNT', type: 'sparql-count', 
    query: `SELECT COUNT(?o) AS ?no { <non-existent-subject-yndh5> rdf:type ?o }` },

  //   { heading: 'CONSTRUCT', type: 'sparql-construct', 
  //   query: `CONSTRUCT { <non-existent-subject-yndh5> rdf:type ?o } { <non-existent-subject-yndh5> rdf:type ?o }` },

    // { heading: 'TEST', type: 'sparql-construct-test', 
    // query: `  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    // SELECT * WHERE {
    //   <http://data.carnegiehall.org/names/26911> ?p ?o
    // }` },

  // { heading: 'Testing Tab', type: 'simple-number',
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
