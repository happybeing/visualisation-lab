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

const defaultOptions = {
  headers: {'Accept': 'text/turtle,application/sparql-results+xml,application/xml,application/rdf+xml,application/sparql-results+xml,text/csv,application/sparql-results+json'}
};

const ttlOptions = {
  headers: {'Accept': 'text/turtle'}
};

const xmlOptions = {
  headers: {'Accept': 'application/sparql-results+xml,application/rdf+xml'}
};

const csvOptions = {
  headers: {'Accept': 'text/csv'}
};

const jsonOptions = {
  headers: {'Accept': 'application/sparql-results+json'}
};

export const customTabulation = [
  { heading: 'Custom Query', type: 'sparql-custom', query: ``, options: defaultOptions }
];

/////////////////////// SPORTAL Tests
// Ref: https://users.dcc.uchile.cl/~ahogan/docs/sportal-ijswis.pdf

const sportalPrefixes = `
PREFIX bp:     <http://www.biopax.org/release/biopax-level3.owl#>
PREFIX dct:    <http://purl.org/dc/terms/>
PREFIX dbo:    <http://dbpedia.org/ontology/>
PREFIX e:      <http://ldf.fi/void-ext#>
PREFIX f:      <http://xmlns.com/foaf/0.1/>
PREFIX mo:     <http://purl.org/ontology/mo/>
PREFIX p:      <http://www.w3.org/ns/prov#>
PREFIX s:      <http://vocab.deri.ie/sad#>
PREFIX sp:     <http://spinrdf.org/spin#>
PREFIX rs:     <http://www.w3.org/2000/01/rdf-schema#>
PREFIX v:      <http://rdfs.org/ns/void#>
PREFIX x:      <http://www.w3.org/2001/XMLSchema#>
`;

export const sportalQA = [
  { heading: 'SPARQL v1.0', type: 'sportal-query', query: sportalPrefixes +
`
SELECT * WHERE { ?s ?p ?o } LIMIT 1
`, options: defaultOptions },
{ heading: 'SPARQL v1.1', type: 'sportal-query', query: sportalPrefixes +
`
SELECT (COUNT(*) as ?c) 
		WHERE { SELECT * WHERE { ?s ?p ?o } LIMIT 1 }
`, options: defaultOptions },
];

export const sportalQB = [

{ heading: '# triples', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT {  <D> v:triples ?x }
		WHERE { SELECT (COUNT(*) AS ?x) 
		WHERE { ?s ?p ?o } }
`, options: defaultOptions },

{ heading: '# classes', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classes ?x }
		WHERE { SELECT (COUNT(DISTINCT ?o) AS ?x) 
		WHERE { ?s a ?o } }
`, options: defaultOptions },

{ heading: '# properties', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:properties ?x }
		WHERE { SELECT (COUNT(DISTINCT ?p) AS ?x) 
		WHERE { ?s ?p ?o } }
`, options: defaultOptions },

{ heading: '# subjects', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:distinctSubjects ?x }
		WHERE { SELECT (COUNT(DISTINCT ?s) AS ?x) 
		WHERE { ?s ?p ?o } }
`, options: defaultOptions },

{ heading: '# objects', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:distinctObjects ?x }
		WHERE { SELECT (COUNT(DISTINCT ?o) AS ?x) 
		WHERE { ?s ?p ?o } }
`, options: defaultOptions },


// { heading: '', type: 'sportal-query', query: sportalPrefixes +
// `
// `, options: defaultOptions },
];

export const sportalQC = [
{ heading: 'Class Partitions', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ] } WHERE { ?s a ?c }
`, options: defaultOptions },

{ heading: 'C Partition # triples', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ; v:triples ?x ] }
			WHERE { SELECT (COUNT(?p) AS ?x) ?c WHERE { ?s a ?c ; ?p ?o } GROUP BY ?c }
`, options: defaultOptions },

{ heading: 'C Partition # classes', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ; v:classes ?x ] }
			WHERE { SELECT (COUNT(DISTINCT ?d) AS ?x) ?c WHERE { ?s a ?c , ?d } GROUP BY ?c }
`, options: defaultOptions },

{ heading: 'C Partition # predicates', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ; v:properties ?x ] }
			WHERE { SELECT (COUNT(DISTINCT ?p) AS ?x) ?c WHERE { ?s a ?c ; ?p ?o } GROUP BY ?c }
`, options: defaultOptions },

{ heading: 'C Partition # subjects', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ; v:distinctSubjects ?x ] }
			WHERE { SELECT (COUNT(DISTINCT ?s) AS ?x) ?c WHERE { ?s a ?c } GROUP BY ?c }
`, options: defaultOptions },

{ heading: 'C Partition # objects', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ; v:distinctObjects ?x ] }
			WHERE { SELECT (COUNT(DISTINCT ?o) AS ?x) ?c WHERE { ?s a ?c ; ?p ?o } GROUP BY ?c  }
`, options: defaultOptions },

// { heading: '', type: 'sportal-query', query: sportalPrefixes +
// `
// `, options: defaultOptions },

];

export const sportalQD = [
{ heading: 'Property Partitions', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:propertyPartition [ v:property ?p ] } WHERE { ?s ?p ?o }
`, options: defaultOptions },

{ heading: 'P Partition # tripes', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:propertyPartition [ v:property ?p ; v:triples ?x ] }
			WHERE { SELECT (COUNT(?o) AS ?x) ?p  WHERE { ?s ?p ?o } GROUP BY ?p }
`, options: defaultOptions },

{ heading: 'P Partition # subjects', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:propertyPartition [ v:property ?p ; v:distinctSubjects ?x ] }
			WHERE { SELECT (COUNT(DISTINCT ?s) AS ?x) ?p WHERE { ?s ?p ?o } GROUP BY ?p }
`, options: defaultOptions },

{ heading: 'P Partition # objects', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:propertyPartition [ v:property ?p ; v:distinctObjects ?x ] }
			WHERE { SELECT (COUNT(DISTINCT ?o) AS ?x) ?p WHERE { ?s ?p ?o } GROUP BY ?p }
`, options: defaultOptions },

// { heading: '', type: 'sportal-query', query: sportalPrefixes +
// `
// `, options: defaultOptions },                         
];

export const sportalQE = [
  { heading: 'PP\'s by Class', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ; v:propertyPartition [ v:property ?p ] ] }
		WHERE { ?s a ?c ; ?p ?o }
`, options: defaultOptions },                         

  
{ heading: '# triples w C as Pred.', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ;
            v:propertyPartition [ v:property ?p ; v:triples ?x ] ] }
						WHERE { SELECT (COUNT(?o) AS ?x) ?p  WHERE { ?s a ?c ; ?p ?o }  GROUP BY ?c ?p  }
`, options: defaultOptions },                         
  
{ heading: '# subjects in C/P/T', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:classPartition [ v:class ?c ;
  v:propertyPartition [ v:distinctSubjects ?x ] ] }
  WHERE { SELECT (COUNT(DISTINCT ?s) AS ?x) ?c ?p WHERE { ?s a ?c ; ?p ?o } GROUP BY ?c ?p }
`, options: defaultOptions },                         
  
{ heading: '# objects in C/P/T', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT {  <D> v:classPartition [ v:class ?c ;
  v:propertyPartition [ v:distinctObjects ?x ; v:property ?p ] ] }
  WHERE { SELECT (COUNT(DISTINCT ?o) AS ?x) ?c ?p WHERE { ?s a ?c ; ?p ?o } GROUP BY ?c ?p }
`, options: defaultOptions },                         
  
// { heading: '', type: 'sportal-query', query: sportalPrefixes +
// `
//
// `, options: defaultOptions },                         
];

export const sportalQF = [
{ heading: 'QF1', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctIRIReferenceSubjects ?x }
		WHERE { SELECT (COUNT(DISTINCT ?s ) AS ?x) 
		WHERE { ?s ?p ?o  FILTER(isIri(?s))} }
`, options: defaultOptions },                         

{ heading: 'QF2', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctBlankNodeSubjects ?x }
		WHERE { SELECT (COUNT(DISTINCT ?s) AS ?x) 
		WHERE { ?s ?p ?o  FILTER(isBlank(?s))} }
`, options: defaultOptions },                         

{ heading: 'QF3', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctIRIReferenceObjects ?x }
		WHERE { SELECT (COUNT(DISTINCT ?o ) AS ?x) 
		WHERE {  ?s ?p ?o  FILTER(isIri(?o))} }
`, options: defaultOptions },                         

{ heading: 'QF4', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctLiterals ?x }
		WHERE { SELECT (COUNT(DISTINCT ?o ) AS ?x) 
		WHERE { ?s ?p ?o  FILTER(isLiteral(?o))} }
`, options: defaultOptions },                         

{ heading: 'QF5', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctBlankNodeObjects ?x }
		WHERE { SELECT (COUNT(DISTINCT ?o ) AS ?x) 
		WHERE { ?s ?p ?o  FILTER(isBlank(?o))} }
`, options: defaultOptions },                         

{ heading: 'QF6', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctBlankNodes ?x }
		WHERE { SELECT (COUNT(DISTINCT ?b ) AS ?x) 
		WHERE { { ?s ?p ?b } UNION { ?b ?p ?o } FILTER(isBlank(?b)) } }
`, options: defaultOptions },                         

{ heading: 'QF7', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctIRIReferences ?x }
		WHERE { SELECT (COUNT(DISTINCT ?u ) AS ?x) 
		WHERE { { ?u ?p ?o } UNION { ?s ?u ?o } UNION { ?s ?p ?u } FILTER(isIri(?u)) } }
`, options: defaultOptions },                         

{ heading: 'QF8', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> e:distinctRDFNodes ?x }
		WHERE { SELECT (COUNT(DISTINCT ?n ) AS ?x) 
		WHERE { { ?n ?p ?o } UNION { ?s ?n ?o } UNION { ?s ?p ?n } } }
`, options: defaultOptions },                         

{ heading: 'QF9', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:propertyPartition [ v:property ?p ;
  s:subjectTypes [ s:subjectClass ?sType ; s:distinctMembers ?x ] ] }
  WHERE { SELECT (COUNT(?s) AS ?x) ?p ?sType
  WHERE { ?s ?p ?o ; a ?sType . } GROUP BY ?p ?sType }
  `, options: defaultOptions },                         

{ heading: 'QF10', type: 'sportal-query', query: sportalPrefixes +
`
CONSTRUCT { <D> v:propertyPartition [ v:property ?p ;
  s:objectTypes [ s:objectClass ?oType ; s:distinctMembers ?x ] ] }
  WHERE { SELECT (COUNT(?o) AS ?x) ?p ?oType
  WHERE { ?s ?p ?o . ?o a ?oType . } GROUP BY ?p ?oType }
`, options: defaultOptions },                         
    
// { heading: '', type: 'sportal-query', query: sportalPrefixes +
// `
// `, options: defaultOptions },                         
];

/////////////////////// My Tests

  // All content types checks use query: '1.0 ASK[.]' 
export const testContentTypes = [
  { heading: 'Turtle', type: 'content-turtle', query: `
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  ASK {
  ?s ?o owl:Thing
  }`, options: ttlOptions, matchContent: 'Ttl' },

  { heading: 'XML', type: 'content-xml', query: `
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  ASK {
  ?s ?o owl:Thing
  }`, options: xmlOptions, matchContent: 'XML' },

  { heading: 'CSV', type: 'content-csv', query: `
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  ASK {
  ?s ?o owl:Thing
  }`, options: csvOptions, matchContent: 'CSV' },

  { heading: 'JSON', type: 'content-json', query: `
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  ASK {
  ?s ?o owl:Thing
  }`, options: jsonOptions, matchContent: 'Json' },
];

export const testTabulations = [
  
  { heading: 'API', type: 'sparql-api', 
  query: `SELECT * WHERE { <non-existent-subject-yndh5> rdf:type ?o }`, options: defaultOptions },

  { heading: 'COUNT', type: 'sparql-count', 
    query: `
    SELECT (COUNT(?o) AS ?no) WHERE { <non-existent-subject-yndh5> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o }`,
    options: defaultOptions
  },

  { heading: 'CONSTRUCT', type: 'sparql-construct', 
    query: `CONSTRUCT { <non-existent-subject-yndh5> rdf:type ?o } { <non-existent-subject-yndh5> rdf:type ?o }`, 
    options: defaultOptions },

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
  // `, options: defaultOptions  },

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
  }`, options: defaultOptions },

  { heading: '1.0 CON[.]', type: 'sparql-wqp-1.0', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  CONSTRUCT { ?x rdf:type ?o }
  WHERE
  {
    ?x rdf:type ?o .
  } LIMIT 100`, options: defaultOptions },

  { heading: '1.0 CON[JOIN]', type: 'sparql-wqp-1.0', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  CONSTRUCT { ?x rdf:type ?v }
  WHERE
  {
    ?x rdf:type ?o .
    ?o rdf:type ?x
  } LIMIT 100
  `, options: defaultOptions },

  { heading: '1.0 CON[OPT]', type: 'sparql-wqp-1.0', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  CONSTRUCT { ?x rdf:type ?v }
  WHERE
  {
    ?x rdf:type ?o .
    OPTIONAL {?o rdf:type ?v }
  } LIMIT 100
  `, options: defaultOptions },

  // { heading: '1.0 ???', type: 'sparql-wqp-1.0', query: ``, options: defaultOptions },
];

export const queryPaper1_1 = [
  //
  // SPARQL 1.1
  //

  { heading: '1.1 ASK[FIL(!IN)]', type: 'sparql-wqp-1.1', query: `
  ASK {
    FILTER(2 NOT IN ())
  }
  `, options: defaultOptions },
  
  { heading: '1.1 CON-[.]', type: 'sparql-wqp-1.1', query: `
  PREFIX : <http://example.org/>
  CONSTRUCT WHERE { ?s ?p ?o} LIMIT 100
  `, options: defaultOptions },
  
  { heading: '1.1 SEL[AVG]', type: 'sparql-wqp-1.1', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  SELECT (AVG(?o) AS ?avg)
  WHERE {
    ?s rdf:type ?o
  } LIMIT 100
  `, options: defaultOptions },

  { heading: '1.1 SEL[BIND]', type: 'sparql-wqp-1.1', query: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  SELECT ?z
  {
    ?s rdf:type ?o .
    BIND(?o+10 AS ?z)
  } LIMIT 100
  `, options: defaultOptions },

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
  `, options: defaultOptions },

  // { heading: '1.1 ???', type: 'sparql-wqp-1.1', query: `` },
  // { heading: '1.1 ???', type: 'sparql-wqp-1.1', query: `` },
  // { heading: '1.1 ???', type: 'sparql-wqp-1.1', query: `` },
];

export const tabulationGroups = {
  'Basic Queries': basicTabulations,
  'Testing': testTabulations,
  'Content Types': testContentTypes,
  'SPARQL 1.0': queryPaper1_0, 
  'SPARQL 1.1': queryPaper1_1,
  'SPORTAL QA': sportalQA,
  'SPORTAL QB': sportalQB,
  'SPORTAL QC': sportalQC,
  'SPORTAL QD': sportalQD,
  'SPORTAL QE': sportalQE,
  'SPORTAL QF': sportalQF,
  'Custom Query': customTabulation,
};

