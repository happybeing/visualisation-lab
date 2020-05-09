export const sparqlExamples =
[{ description: '<nothing selected>', endpoint: '', options: {}, sparqlText: ''},

{ description: 'Test Yago/XML-RDF - Albert Einstein', endpoint: 'http://yago.r2.enst.fr/sparql/query', options: {}, sparqlText: `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX so: <http://schema.org/>

CONSTRUCT { <http://yago-knowledge.org/resource/Albert_Einstein> ?predicate ?object }
WHERE {
  <http://yago-knowledge.org/resource/Albert_Einstein> ?predicate ?object .
} 
LIMIT 100
`},

{ description: 'Cnut the Great and relatives', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbpedia2: <http://dbpedia.org/property/>
CONSTRUCT {
  ?subject rdf:type foaf:Person .
  ?subject rdf:type ?types .
  ?subject rdfs:label ?label .
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
  ?subject foaf:gender ?gender .
  ?personReferringToParent dbo:parent ?subject .
  ?personReferringToChild dbo:child ?subject .
  ?personReferringToSpouse dbo:spouse ?subject .
  ?subject rdfs:comment ?comment .
}
WHERE {
  {
	?subject rdf:type foaf:Person .
	FILTER ( 
	  ?subject = <http://dbpedia.org/resource/Cnut_the_Great> ||
	  ?subject = <http://dbpedia.org/resource/Sigrid_the_Haughty> ||
	  ?subject = <http://dbpedia.org/resource/Emma_of_Normandy> ||
	  ?subject = <http://dbpedia.org/resource/Harthacnut> ||
	  ?subject = <http://dbpedia.org/resource/Gunhilda_of_Denmark> ||
	  ?subject = <http://dbpedia.org/resource/%C3%86lfgifu_of_Northampton> ||
	  ?subject = <http://dbpedia.org/resource/Harold_Harefoot> ||
	  ?subject = <http://dbpedia.org/resource/Gunhild_of_Wenden> ||
	  ?subject = <http://dbpedia.org/resource/Emma_of_Normandy> ||
	  ?subject = <http://dbpedia.org/resource/%C3%86lfgifu_of_Northampton> ||
	  ?subject = <http://dbpedia.org/resource/Svein_Knutsson> ||
	  ?subject = <http://dbpedia.org/resource/Thurbrand_the_Hold> ||
	  ?subject = <http://dbpedia.org/resource/%C5%9Awi%C4%99tos%C5%82awa> ||
	  ?subject = <http://dbpedia.org/resource/Sweyn_Forkbeard>
	)

	OPTIONAL { ?subject rdf:type ?types . 
	  FILTER( ?types = <http://dbpedia.org/class/yago/Aristocrat109807754> || ?types = <http://dbpedia.org/class/yago/Ruler110541229> )
	}
	OPTIONAL { ?subject rdfs:label ?label . FILTER langMatches( lang(?label), "en" ) }
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
	OPTIONAL { ?personReferringToParent dbo:parent ?subject . }
	OPTIONAL { ?personReferringToChild dbo:child ?subject . }
	OPTIONAL { ?personReferringToSpouse dbo:spouse ?subject . }
	OPTIONAL { ?subject rdfs:comment ?comment . 
	  FILTER langMatches( lang(?comment), "en" )
	}
  }
}`},

{ description: 'Chart Pie (Japanese Prefecture Area)', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX yago: <http://dbpedia.org/class/yago/>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>

SELECT ?pref ?area
WHERE {
  ?s a yago:WikicatPrefecturesOfJapan ;
     rdfs:label ?pref ;
     dbpedia-owl:areaTotal ?area_total .
  FILTER (lang(?pref) = 'en')
  BIND ((?area_total / 1000 / 1000) AS ?area)
}
ORDER BY DESC(?area)
`},

{ description: 'Chart Bar (Japanese Prefecture Area)', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX yago: <http://dbpedia.org/class/yago/>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>

SELECT ?pref ?area
WHERE {
  ?s a yago:WikicatPrefecturesOfJapan ;
     rdfs:label ?pref ;
     dbpedia-owl:areaTotal ?area_total .
  FILTER (lang(?pref) = 'en')
  BIND ((?area_total / 1000 / 1000) AS ?area)
}
ORDER BY DESC(?area)`},

{ description: 'Chart Pie (Japanese Prefecture Area)', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX yago: <http://dbpedia.org/class/yago/>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>

SELECT ?pref ?area
WHERE {
  ?s a yago:WikicatPrefecturesOfJapan ;
     rdfs:label ?pref ;
     dbpedia-owl:areaTotal ?area_total .
  FILTER (lang(?pref) = 'en')
  BIND ((?area_total / 1000 / 1000) AS ?area)
}
ORDER BY DESC(?area)
`},

{ description: 'Graph Force (History of programming languages)', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: 'https://dbpedia.org/sparql', options: {}, sparqlText: `# https://en.wikipedia.org/wiki/History_of_programming_languages
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
}`},

{ description: 'Graph Sankey ()', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX dbpprop: <http://dbpedia.org/property/>
PREFIX dbpedia: <http://dbpedia.org/resource/>

SELECT DISTINCT ?parent ?parent_name ?child ?child_name
WHERE {
  VALUES ?root { dbpedia:Fortran }
  ?root   rdf:type dbpedia-owl:ProgrammingLanguage ;
          rdfs:label ?root_label .
  ?parent rdf:type dbpedia-owl:ProgrammingLanguage ;
          rdfs:label ?parent_label ;
          dbpprop:year ?parent_year .
  ?child  rdf:type dbpedia-owl:ProgrammingLanguage ;
          rdfs:label ?child_label ;
          dbpprop:year ?child_year .
  ?root   dbpedia-owl:influenced* ?child .
  ?parent dbpedia-owl:influenced ?child .
  FILTER (?parent_year > 1950 and ?parent_year < 2020)
  FILTER (?child_year > 1950 and ?child_year < 2020)
  FILTER (?parent_year < ?child_year)
  FILTER (?root != ?child)
  FILTER (?parent != ?child)
  FILTER (LANG(?root_label) = 'en')
  FILTER (LANG(?parent_label) = 'en')
  FILTER (LANG(?child_label) = 'en')
  BIND (replace(?parent_label, " .programming language.", "") AS ?parent_name)
  BIND (replace(?child_label, " .programming language.", "") AS ?child_name)
}
`},

{ description: 'Map Named (Japanese Prefecture Area)', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: `PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX yago: <http://dbpedia.org/class/yago/>

SELECT DISTINCT ?s ?label ?population ?area (?density AS ?size)
WHERE {
  ?s a yago:WikicatPrefecturesOfJapan ;
     rdfs:label ?label ;
     dbpedia-owl:populationTotal ?population ;
     dbpedia-owl:areaTotal ?area .
  BIND (xsd:float(?population)/xsd:float(?area/1000000) AS ?density)
  FILTER (lang(?label) = 'ja' )
}
ORDER BY DESC(?density)
`},

{ description: 'Table Hash (Lookup SPARQL info)', endpoint: 'https://dbpedia.org/sparql', options: {}, sparqlText: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX dbr: <http://dbpedia.org/resource/>

SELECT ?language ?description ?developer ?paradigm ?version
WHERE {
  VALUES ?language { "SPARQL"@en }
  ?s rdf:type dbo:ProgrammingLanguage ;
     rdfs:label ?language ;
     rdfs:comment ?description ;
     dbo:developer/rdfs:label ?developer ;
     dbp:paradigm/rdfs:label ?paradigm ;
     dbo:latestReleaseVersion ?version .
  FILTER (lang(?description) = 'en')
  FILTER (lang(?developer) = 'en')
  FILTER (lang(?paradigm) = 'en')
}
LIMIT 1`},

{ description: 'Chart Scatterplot', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX id_tax:<http://identifiers.org/taxonomy/>
PREFIX tax: <http://ddbj.nig.ac.jp/ontologies/taxonomy/>
PREFIX stats:  <http://togogenome.org/stats/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX ipr: <http://purl.uniprot.org/interpro/>

SELECT DISTINCT ?organism ?label ?length ?genes (COUNT(DISTINCT ?protein) AS ?hks)
{
  {
    SELECT DISTINCT ?organism ?up_tax ?label ?length ?genes
    WHERE
    {
      # Cyanobacteria (1117)
      ?organism a tax:Taxon ;
        rdfs:subClassOf+ id_tax:1117 ;
        stats:sequence_length ?length ;
        stats:gene ?genes ;
        tax:scientificName ?label .
        BIND (IRI(REPLACE(STR(?organism), "http://identifiers.org/taxonomy/", "http://purl.uniprot.org/taxonomy/")) AS ?up_tax)
    }
  }
  ?up_tax a up:Taxon .
  ?protein up:organism ?up_tax ;
    a up:Protein .
  # Signal transduction histidine kinase (IPR005467)
  ?protein rdfs:seeAlso ipr:IPR005467 .
} GROUP BY ?organism ?label ?length ?genes ORDER BY ?length
`},

{ description: 'Tree Map', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX tax: <http://ddbj.nig.ac.jp/ontologies/taxonomy/>

SELECT DISTINCT ?root_name ?parent_name ?child_name
FROM <http://togogenome.org/graph/taxonomy>
WHERE
{
  VALUES ?root_name { "Tardigrada" }
  ?root tax:scientificName ?root_name .
  ?child rdfs:subClassOf+ ?root .
  ?child rdfs:subClassOf ?parent .
  ?child tax:scientificName ?child_name .
  ?parent tax:scientificName ?parent_name .
}
`},

{ description: 'Tree Map zoom', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX up: <http://purl.uniprot.org/core/>
PREFIX ec: <http://purl.uniprot.org/enzyme/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX taxon:<http://purl.uniprot.org/taxonomy/>

SELECT (REPLACE(STR(?root), ".*/", "") AS ?root_label)
        (REPLACE(STR(?parent), ".*/", "") AS ?parent_label)
        (REPLACE(STR(?enzyme), ".*/", "") AS ?enzyme_label)
        (COUNT(?protein) AS ?value)
FROM <http://togogenome.org/graph/uniprot>
WHERE
{
        VALUES ?root { ec:1.-.-.- }
        ?root a up:Enzyme .
        ?root skos:narrowerTransitive* ?enzyme .
        ?parent skos:narrowerTransitive ?enzyme .
        ?protein up:enzyme ?enzyme .
        # Homo sapiens (9606)
        ?protein up:organism taxon:9606
}
GROUP BY ?root ?parent ?enzyme ORDER BY ?enzyme
`},

{ description: 'Tree Sunburst', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX tax: <http://ddbj.nig.ac.jp/ontologies/taxonomy/>

SELECT DISTINCT ?root_name ?parent_name ?child_name
FROM <http://togogenome.org/graph/taxonomy>
WHERE
{
  VALUES ?root_name { "Tardigrada" }
  ?root tax:scientificName ?root_name .
  ?child rdfs:subClassOf+ ?root .
  ?child rdfs:subClassOf ?parent .
  ?child tax:scientificName ?child_name .
  ?parent tax:scientificName ?parent_name .
}
`},

{ description: 'Tree Round', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX tax: <http://ddbj.nig.ac.jp/ontologies/taxonomy/>

SELECT DISTINCT ?root_name ?parent_name ?child_name
FROM <http://togogenome.org/graph/taxonomy>
WHERE
{
  VALUES ?root_name { "Hypsibiidae" }
  ?root tax:scientificName ?root_name .
  ?child rdfs:subClassOf+ ?root .
  ?child rdfs:subClassOf ?parent .
  ?child tax:scientificName ?child_name .
  ?parent tax:scientificName ?parent_name .
}
`},
  
{ description: 'Tree Dendogram', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX tax: <http://ddbj.nig.ac.jp/ontologies/taxonomy/>

SELECT DISTINCT ?root_name ?parent_name ?child_name
FROM <http://togogenome.org/graph/taxonomy>
WHERE
{
  VALUES ?root_name { "Tardigrada" }
  ?root tax:scientificName ?root_name .
  ?child rdfs:subClassOf+ ?root .
  ?child rdfs:subClassOf ?parent .
  ?child tax:scientificName ?child_name .
  ?parent tax:scientificName ?parent_name .
}`},

{ description: 'Tree Circlepack (biohackathon/Tardigrada)', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX tax: <http://ddbj.nig.ac.jp/ontologies/taxonomy/>

SELECT DISTINCT ?root_name ?parent_name ?child_name
FROM <http://togogenome.org/graph/taxonomy>
WHERE
{
  VALUES ?root_name { "Tardigrada" }
  ?root tax:scientificName ?root_name .
  ?child rdfs:subClassOf+ ?root .
  ?child rdfs:subClassOf ?parent .
  ?child tax:scientificName ?child_name .
  ?parent tax:scientificName ?parent_name .
}`},

{ description: 'Table HTML', endpoint: 'http://togostanza.org/sparql', options: {}, sparqlText: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX id_tax:<http://identifiers.org/taxonomy/>
PREFIX tax: <http://ddbj.nig.ac.jp/ontologies/taxonomy/>
PREFIX stats:  <http://togogenome.org/stats/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX ipr: <http://purl.uniprot.org/interpro/>

SELECT DISTINCT ?organism ?label ?length ?genes (COUNT(DISTINCT ?protein) AS ?hks)
{
  {
    SELECT DISTINCT ?organism ?up_tax ?label ?length ?genes
    WHERE
    {
      # Cyanobacteria (1117)
      ?organism a tax:Taxon ;
        rdfs:subClassOf+ id_tax:1117 ;
        stats:sequence_length ?length ;
        stats:gene ?genes ;
        tax:scientificName ?label .
        BIND (IRI(REPLACE(STR(?organism), "http://identifiers.org/taxonomy/", "http://purl.uniprot.org/taxonomy/")) AS ?up_tax)
    }
  }
  ?up_tax a up:Taxon .
  ?protein up:organism ?up_tax ;
    a up:Protein .
  # Signal transduction histidine kinase (IPR005467)
  ?protein rdfs:seeAlso ipr:IPR005467 .
} GROUP BY ?organism ?label ?length ?genes ORDER BY ?length`},
];

export const brokenExamples = [
// This d3coordmap doesn't work at http://biohackathon.org/d3sparql/ either.
{ description: 'No Turtle? Map Coord ()', endpoint: 'http://www.ebi.ac.uk/rdf/services/sparql', options: {}, sparqlText: `PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX biosd-terms: <http://rdf.ebi.ac.uk/terms/biosd/>
PREFIX sio: <http://semanticscience.org/resource/>

# Samples reporting latitude and longitude
SELECT DISTINCT ?item ?lat ?lng
WHERE {
  ?item biosd-terms:has-sample-attribute ?lat_value, ?lng_value .

  ?lat_value
    dc:type ?lat_label;
    sio:SIO_000300 ?lat . # sio:has value

  FILTER ( LCASE ( STR ( ?lat_label ) ) = "latitude" ) .

  ?lng_value
    dc:type ?lng_label;
    sio:SIO_000300 ?lng . # sio:has value

  FILTER ( LCASE ( STR ( ?lng_label ) ) = "longitude" ) .
} LIMIT 1000`},

];
