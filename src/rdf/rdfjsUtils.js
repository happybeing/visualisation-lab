const rdfjs = require('@graphy/core.data.factory');

/** Consume an RDFJS DatasetCore to create a vm-graph-json compatible values object
 * 
 */

export class RdfToGraph {
  constructor (rdfDataset) {
    this.rdf = rdfDataset;
    this.graphOptions = {};
    this.metadataOptions = {};  // TODO needed?
    this.touch();
  }
  
  /** Get number of triples in rdfDataset
   */
  size() { return rdf ? rdf.size : undefined; }
    
  /** Clear the graph
   * 
   * By default data that has been calculated is cached for re-use, so if the
   * dataset changes this should be cleared by calling touch()
   */
  touch () {
    this.metadata = {};
    this.graph = undefined;
  }

  /** Get graph for current RDF Dataset. Will calculate or return cached object
   * 
   * @param {Objects} [options]   optional control of mapping to graph
   * 
   * @returns {Object} a vm-graph-json object
   */
  Graph (options) {
    if (this.graph) return this.graph;
    this.touch(); // Clear any metadata
    console.log('RdfToGraph.Graph()', this.rdf);
    const graph = {nodes: new Map(), links: new Map() };
    if (this.rdf === undefined) {
      console.warn('RdfToGraph.Graph() - RDF dataset undefined');
      window.notify.warn('No RDF loaded');
      return;
    }
    try {
        for (const quad of this.rdf) {
          // console.log('Mapping quad: ', quad);
          // TODO: implement better mapping to links (e.g. based on predicates rather than subject-object)
          // TODO: probably need utility classes to provide different mappings for use by several ViewModels
          graph.nodes.set(quad.subject.value, {id: quad.subject.value, group: 1});
          graph.links.set(quad.subject.value + '--LINK--' + quad.object.value, {source: quad.subject.value, target:quad.object.value, value: 1});
  
          // TODO: Don't treat all values as nodes as here:
          graph.nodes.set(quad.object.value, {id: quad.object.value, group: 1});
        }
        this.graph = graph; // Cache the result
        return this.graph;
      } catch (err) {
        console.log(err);
      }
    }
}

 /**
 * Consumes an RDFJS DatasetCore to create vm-tabular-json (see JSON ViewModel)
 * 
 */

export class RdfTabulator {
  constructor (rdfDataset) {
    this.rdf = rdfDataset;
    this.tabulationOptions = {};
    this.metadataOptions = {};  // TODO needed?
    this.touch();
  }
  
  /** Get number of triples in rdfDataset
   */
  size() { return rdf ? rdf.size : undefined; }
    
  /** Clear tabulation
   * 
   * By default data that has been calculated is cached for re-use, so if the
   * dataset changes this should be cleared by calling touch()
   */
  touch () {
    this.metadata = {};
    this.table = undefined;
  }

  /** Returns an array of the ontologies referenced in the dataset
   */
  ontologies () {
    let ontologies = this.metadata.ontologies;
    if ( !ontologies ) {
      this.Table();
      ontologies = this.metadata.ontologies;
    }
    return ontologies ? [ ...ontologies.keys() ].sort() : [];
  }

  /** Get table for current RDF Dataset. Will calculate or return cached object
   * 
   * @param {Objects} [options]   optional control of the tabulation
   * 
   * @returns {Object} a vm-tabular-json object
   */
  Table (options) {
    if (this.table) return this.table;
    this.touch(); // Clear any metadata
    const table = { header: ["Subject", "Predicate", "Object", "Object Type"], rows: [] };

    if (this.rdf === undefined) {
      console.warn('RdfTabulation.Table() - RDF dataset undefined');
      window.notify.warn('No RDF loaded');
      return;
    }
    // this.rdf.canonicalize(); // Causes stack space error with moderate sized Dataset 

    // Default metadata
    this.metadata.ontologies = new Map;  // TODO accumulate ontologies used

    // Calculate metadata
    // TODO implement options param to specify which RDF metadata to calculate
    let res = this.rdf.match(null, rdfjs.namedNode('http://www.w3.org/2003/01/geo/wgs84_pos#lat'))
    console.dir(res);
    for (let quad of this.rdf) {
      table.rows.push({"Subject": quad.subject.value, "Predicate": quad.predicate.value, "Object": quad.object.value, "ObjectType": quad.object.termType})
      
      const subjectOntology = extractOntology(quad.subject.value);
      const predicateOntology = extractOntology(quad.predicate.value);
      const objectOntology = extractOntology(quad.object.value);

      if ((subjectOntology || predicateOntology || objectOntology) && this.metadata.ontologies === undefined) {
        this.metadata.ontologies = new Map;
      }
      if (subjectOntology && !this.metadata.ontologies.has(subjectOntology)) this.metadata.ontologies.set(subjectOntology);
      if (predicateOntology && !this.metadata.ontologies.has(predicateOntology)) this.metadata.ontologies.set(predicateOntology);
      if (objectOntology && !this.metadata.ontologies.has(objectOntology)) this.metadata.ontologies.set(objectOntology);
    }
    console.log('ontologies:')
    console.dir(this.metadata.ontologies);

    this.metadataOptions = options ? options : {};

    this.table = table; // Cache the table
    return table;
  }

  // console.log('RdfMetadata.xxx() - not yet implemented');
};

function extractOntology (uri) {
  // Ontology is the part of a URI before a fragment
  let ontology;
  if(isOntologyUri(uri)) ontology = uri.substring(0, uri.indexOf('#'));
  return ontology;
}

function isOntologyUri (uri) {
  // const uriRegEx = new RegExp('^([a-z]+:\\/\\/)?'+ // protocol
  // '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  // '(\\#[-a-z\\d_]*)?$','i');
  const uriRegEx = new RegExp('^([a-z]+:\\/\\/)'+      // protocol
  '([a-z\\d]([a-z\\d-]*[a-z\\d])*)');                  // domain name

  return uri.indexOf('#') !== -1 && uriRegEx.test(uri);
}
