const rdfjs = require('@graphy/core.data.factory');

/**
 * Generate a tabulated structure (rows and columns) from an RDFJS DatasetCore
 */
export class RdfTabulator {
  constructor (rdfDataset) {
    this.rdf = rdfDataset;
    this.tabulationOptions = {};
    this.metadataOptions = {};  // TODO needed?
    this.touch();
  }
  
  /**
   * Get number of triples in rdfDataset
   */
  size() { return rdf ? rdf.size : undefined; }
    
  /**
   * Clear tabulation
   * 
   * By default data that has been calculated is cached for re-use, so if the
   * dataset changes this should be cleared by calling touch()
   */
  touch () {
    this.metadata = {};
    this.table = undefined;
  }

  /**
   * Returns an array of the ontologies referenced in the dataset
   */
  ontologies () {
    let ontologies = this.metadata.ontologies;
    if ( !ontologies ) {
      this.Table();
      ontologies = this.metadata.ontologies;
    }
    return ontologies ? [ ...ontologies.keys() ].sort() : [];
  }

  /**
   * Get table for current RDF Dataset. Will calculate or return cached object
   * 
   * @param {Objects} [options]   optional control of the tabulation
   */
  Table (options) {
    if (this.table) return this.table;
    this.touch(); // Clear any metadata
    const table = { columns: ["Subject", "Predicate", "Object", "Object Type"], rows: [] };

    if (this.rdf === undefined) {
      console.warn('RdfTabulation.calculateTabulation() - RDF dataset undefined');
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
