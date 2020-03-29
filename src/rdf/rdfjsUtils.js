const rdfjs = require('@graphy/core.data.factory');

/** Consume an RDF/JS DatasetCore to create a vm-graph-json compatible values object
 * 
 */
export const rdfToGraph = {
  simple: 'simple',
  standard: 'standard'
};

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
   * When RDF is mapped to a graph, the VMGraph ViewModel comprises map of 
   * node objects and a map of link objects, each with properties based on some rules 
   * for different rdfToGraph mapping types (see options.mapping).
   * 
   * options.mapping: rdfToGraph.simple
   * ----------------------------------
   * - each Subject and Object value is mapped to a node with property 'id' set to the value.
   * - each Subject-Object combination is mapped to a link.
   * 
   * options.mapping: rdfToGraph.standard (default)
   * ------------------------------------
   * - each unique Subject value becomes a node
   * - each Object whose Object Type is in options.objectsAsNode becomes a node
   * - any Object value that is also a Subject becomes a link with Subject as 'source' 
   *   and Object as 'target'
   * - each link has 'predicates' property corresponding to the triple
   * - every Object value which does not qualify as a node will become a property on the
   *   Subject node, based on the predicate. Since each predicate can occur zero or more
   *   times, such properties are implemented as an array objects (one per occurance of
   *   the predicate). Each property object has 'type' (the Object Type) and value.
   * - TODO: MAYBE, in order to handle duplicate predicates per Subject some or all
   *   properties will have array values, either of the values or of an object per  
   *   value if additional metadata needs to be retained. Perhaps handle both.
   * 
   * TODO: could implement better mapping to links (e.g. based on predicates rather than subject-object)
   * 
   * @param {Objects} [options]   [optional] { mapping: simple|standard,
   *                                           objectsAsNode: [],
   *                                         }
   * 
   * @returns {Object} a vm-graph-json object
   */
  Graph (options) {
    if (this.graph) return this.graph;

    console.log('RdfToGraph.Graph()', this.rdf);
    if (this.rdf === undefined) {
      console.warn('RdfToGraph.Graph() - RDF dataset undefined');
      window.notify.warn('No RDF loaded');
      return;
    }
    this.touch(); // Clear any metadata
    const graph = {nodes: new Map(), links: new Map() };
    if (options && options.mapping === rdfToGraph.simple) return this._graphSimple(options);

    // rdfToGraph.standard (default):
    try {
      // console.log('First pass makes one node per Subject...');
      for (const quad of this.rdf) {
        // console.log('quad: ', quad);
        if (!graph.nodes.get(quad.subject.value)) {
          graph.nodes.set(quad.subject.value, {id: quad.subject.value, group: 1});
        }
      }

      // console.log('Second pass - creating links and properties...');
      for (const quad of this.rdf) {
        // console.log('quad: ', quad);
        if (options && options.objectsAsNode.includes(quad.object.termType) ||
            graph.nodes.has(quad.object.value)) {

          if (!graph.nodes.has(quad.object.value)) {
            graph.nodes.set(quad.object.value, {id: quad.object.value, group: 2});
          }
          // Make a link or increment its 'strength' if already present (TODO: support multiple links between same node pair?)
          const linkId = quad.subject.value + '--LINK--' + quad.object.value;
          let link = graph.links.get(linkId);
          if (link) {
            link.strength = strength.value + 1;
          } else {
            link = {
              source: quad.subject.value, 
              target: quad.object.value,
              predicate: quad.predicate.value,
              strength: 1
            };
            graph.links.set(linkId, link);
          }
        } else {
          // Object is not a node, so becomes a property.
          // Note that a property is an array of {type:, value:} since the same predicate can apply zero or more times
          const node = graph.nodes.get(quad.subject.value);
          const predicate = quad.predicate.value;
          if (!node[predicate]) node[predicate] = [];
          node[predicate].push({type: quad.object.termType, value: quad.object.value});
        }
      }
      this.graph = graph; // Cache the result
      return this.graph;
    } catch (err) {
      console.log(err);
    }
  }

  _graphSimple (options) {
    console.log('RdfToGraph._graphSimple()', this.rdf);
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
   * @param {Objects} [options]   optional control of the tabulation:
   *          rowAsObject: true - row is {"heading1:" v1, "heading2:" v2}
   *                       false - row is array [v1, v2]
   * 
   * @returns {Object} a vm-tabular-json object
   */
  Table (options) {
    if (options === undefined) options = {};
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
      if (options.rowAsObject)
        table.rows.push({"Subject": quad.subject.value, "Predicate": quad.predicate.value, "Object": quad.object.value, "ObjectType": quad.object.termType});
      else
        table.rows.push([quad.subject.value, quad.predicate.value, quad.object.value, quad.object.termType]);
      
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

    this.metadataOptions = options;

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
