/* DataViewUI implementation classes 

TODO: class Filters - filters which can be applied to a SourceResult 
TODO: RdfDataView / JsonDataView / etc where:
TODO:  RdfDataView implements mapping(s) of RdfSourceResult to a view model

*/

class DataView {
  constructor () {
    console.warn('DataView - to be implemented');

  }

  // TODO: Base interface: 
  // - list subclasses of SourceResult I consume
  // - list the available models for a given SourceResult subclasses
  // - generate/update view model based on Filters, SourceResult and chosen view model
}

export class RdfDataView extends DataView {
  constructor () {
    super();
  }

  // 
  /* Test implementation - no filters, consume RdfSourceResult, create graph 
  input:
    @param {RDF/JS: Dataset}  rdfDataset (./stores.js) 

  output:
    @param {Object}           graph {nodes: [], links: []} (./stores.js) 

  This separates the raw RDF from data which is made available to a 
  visualisation component, such that:
  - TODO: maps between triples (Rdfjs dataset) and visualisation (JSON)
  - TODO: it isolates RDF and and application specific modelling from the visualisation and app
  - TODO: provides default representations for different visualisation types/components
  - TODO: support addition of custom representations per the application or the data source
  - TODO: allow the application to modify or select the visual representation programmatically
  */

  rdfToVis (dataset) {
    let graphMap = {nodes: new Map(), links: new Map() };

    console.log('rdfToVis', dataset)
  try {
      for (const quad of dataset) {
        console.log('Mapping quad: ', quad)
        // TODO: implement better mapping to nodes and links
        graphMap.nodes.set(quad.subject.value, {id: quad.subject.value, group: 1});
        graphMap.links.set(quad.subject.value + '--LINK--' + quad.object.value, {source: quad.subject.value, target:quad.object.value, value: 1});

        // TODO: Don't treat all values as nodes as here:
        graphMap.nodes.set(quad.object.value, {id: quad.object.value, group: 1});
      }
      // Create nodes and links from triples
      return {nodes: [...graphMap.nodes.values()], links: [...graphMap.links.values()]};
    } catch (err) {
      console.log(err);
    }
  }
}
