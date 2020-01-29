/* ViewModelUI implementation classes 

TODO: class Filters - filters which can be applied to a viewModel 
TODO: RdfViewModel / JsonViewModel / etc where:
TODO:  RdfViewModel implements mapping(s) of RdfSourceResult to a view model

*/

class ViewModel {
  constructor () {
    console.warn('ViewModel - to be implemented');
    this.viewModel = undefined;
  }

  // TODO: Base interface: 
  // - list subclasses of SourceResult I consume
  // - list the available models for a given SourceResult subclasses
  // - generate/update view model based on Filters, SourceResult and chosen view model

  setViewModel (viewModel) {this.viewModel = viewModel;}
  getViewModel () {return this.viewModel;}
}

export class RdfViewModel extends ViewModel {
  constructor () {
    super();
  }

  // Methods to consume RDF in different forms:
  // Currently just RDF/JS Dataset
  
  /* consume RdfSourceResultconsume, create/overwrite viewModel 
  input:
    @param RdfSourceResult rdfResult
    @param {RDF/JS: Dataset}  rdfDataset (./stores.js) 

  output:
    @param {Object}           graph {nodes: [], links: []} (./stores.js) 

  This separates the raw RDF from data which is made available to a 
  visualisation component, such that:
  - TODO: apply filters
  - TODO: maps between triples (Rdfjs dataset) and visualisation (JSON)
  - TODO: it isolates RDF and and application specific modelling from the visualisation and app
  - TODO: provides default representations for different visualisation types/components
  - TODO: support addition of custom representations per the application or the data source
  - TODO: allow the application to modify or select the visual representation programmatically
  */

  consumeRdfDataset (rdfResult, rdfDataset) {
    console.log('RdfViewModel.consumeRdfDataset()', rdfDataset)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
        for (const quad of rdfDataset) {
          console.log('Mapping quad: ', quad)
          // TODO: implement better mapping to nodes and links
          graphMap.nodes.set(quad.subject.value, {id: quad.subject.value, group: 1});
          graphMap.links.set(quad.subject.value + '--LINK--' + quad.object.value, {source: quad.subject.value, target:quad.object.value, value: 1});

          // TODO: Don't treat all values as nodes as here:
          graphMap.nodes.set(quad.object.value, {id: quad.object.value, group: 1});
        }
        // Create nodes and links from triples
        self.setViewModel({nodes: [...graphMap.nodes.values()], links: [...graphMap.links.values()]});
        self.viewModel.sourceResult = rdfResult;
        return self.viewModel;
      } catch (err) {
        console.log(err);
      }
  }
}


export class JsonViewModel extends ViewModel {
  constructor () {
    super();
  }

  // 
  /** consume JsonSourceResult, create/overwrite viewModel 
  input:
    @param JsonSourceResult jsonResult
    @param {nodes: [], links: []}  jsonData

  output:
    @param {Object}           graph {nodes: [], links: []}

  - TODO: apply filters
  - TODO: provides default representations for different visualisation types/components
  - TODO: support addition of custom representations per the application or the data source
  - TODO: allow the application to modify or select the visual representation programmatically
  */

  consumeJsonSourceResult (jsonResult, jsonData) {
    console.log('RdfViewModel.consumeRdfDataset()', rdfDataset)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
        // Create nodes and links from triples
        self.setViewModel({nodes: [...jsonData.nodes], links: [...jsonData.links]});
        self.viewModel.sourceResult = jsonResult;
        return self.viewModel;
      } catch (err) {
        console.log(err);
      }
  }
}
