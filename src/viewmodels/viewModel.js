/** ViewModel implementation classes 

TODO: ViewModel - a base class which defines the ViewModel API, as used by SourceInterface and View classes
TODO: A template subclass for each type of ViewModel, named VM<Type> (e.g. VMTable, VMGraph etc)
TODO: - VMTable rework to consumeRdf and consumeJSON and make/define VMTable model based on ViewRdfAsTable
TODO: - VMGraph rework to consumeRdf and consumeJSON and make/define VMGraph based on { nodes: [], links: [] }
TODO: Include VM<Type> templates for other view models, with ability to consume RDF and/or JSON and
TODO:  use these to define ModelTypes, a set of SourceResult and ViewModel types that will be declared/offered by 
TODO:  each ViewModel and each SourceInterface (and in sourceResultTypeMap)
TODO: Export viewModelTypeMap, an object which enumerates the available VM<Type> classes

Maybe... (these need review)
TODO: class Filters - filters which can be applied to a viewModel 
TODO: RdfViewModel / JsonViewModel / etc where:
TODO:  RdfViewModel implements mapping(s) of RdfSourceResult to a view model

*/

import {modelFormats} from '../modelTypes.js';

class ViewModel {
  constructor () {
    console.warn('ViewModel - to be implemented');
    this.viewModel = undefined;
  }

  consumeSourceResult (sourceResult) {throw Error('ViewModel.consumeSourceResult() not implemented');}
  getViewModelType () {throw Error('ViewModel - no viewModelType');}

  // TODO: Base interface: 
  // - list subclasses of SourceResult I consume
  // - list the available models for a given SourceResult subclasses
  // - generate/update view model based on Filters, SourceResult and chosen view model

  setViewModel (viewModel) {this.viewModel = viewModel;}
  getViewModel () {return this.viewModel;}

  //// Methods to generate the view model from different inputs

  consumeSourceResult (sourceResult) {
    switch(sourceResult.getModelFormat()) {
      case modelFormats.RDFJS_DATASET: {
        return this.consumeRdfSourceResult(sourceResult);
      }
      case modelFormats.JSON_ARRAY: {
        return this.consumeJsonSourceResult(sourceResult);
      }
      default: {
        console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', sourceResult.getViewModelType())
        return undefined;
      }
    }
  }

  /* consume RDF
  input:
    @param RdfSourceResult rdfResult as RDF/JS Dataset
  */
  consumeRdfSourceResult (rdfResult) {
    Error('ViewModel.consumeRdfSourceResult() not implemented');
  }

  /** consume JSON 
  input:
    @param JsonSourceResult jsonResult as {nodes: [], links: []}  jsonData
  */
  consumeJsonSourceResult (jsonResult) {
    Error('ViewModel.consumeJsonSourceResult() not implemented');
  }
}

export class VMGraph extends ViewModel {
  constructor () {
    super();
  }

  //// Methods to generate the view model from different inputs

  /** consume RDF
  input:
    @param RdfSourceResult rdfResult as RDF/JS Dataset

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
  consumeRdfSourceResult (rdfResult) {
  let rdfDataset = rdfResult.getRdfDataset();
  console.log('RdfViewModel.consumeSourceResult()', rdfDataset)
  let graphMap = {nodes: new Map(), links: new Map() };
  const self = this;
  try {
      for (const quad of rdfDataset) {
        // console.log('Mapping quad: ', quad);
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

  /** consume JsonSourceResult, create/overwrite viewModel 
  input:
  @param JsonSourceResult jsonResult as {nodes: [], links: []}  jsonData

  output:
  @param {Object}           graph {nodes: [], links: []}

  - TODO: apply filters
  - TODO: provides default representations for different visualisation types/components
  - TODO: support addition of custom representations per the application or the data source
  - TODO: allow the application to modify or select the visual representation programmatically
  */

  consumeJsonSourceResult (jsonResult) {
    let jsonArray = jsonResult.getJsonResult();
    console.log('JsonViewModel.consumeSourceResult()', jsonArray)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
      // Create nodes and links from triples
      self.setViewModel({nodes: [...jsonArray.nodes], links: [...jsonArray.links]});
      self.viewModel.sourceResult = jsonResult;
      return self.viewModel;
    } catch (err) {
      console.log(err);
    }
  }
}

class VMTable extends ViewModel {
  constructor () {
    super();
  }

  // TODO: implement consume CSV
  // TODO: implement consume VMGraph model (JSON)
  
  //// Methods to generate the view model from different inputs

  /** consume RDF
  input:
    @param RdfSourceResult rdfResult as RDF/JS Dataset

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
 consumeRdfSourceResult (rdfResult) {
  let rdfDataset = rdfResult.getRdfDataset();
  console.log('RdfViewModel.consumeSourceResult()', rdfDataset)
  let graphMap = {nodes: new Map(), links: new Map() };
  const self = this;
  try {
      for (const quad of rdfDataset) {
        // console.log('Mapping quad: ', quad);
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

  /** consume JsonSourceResult, create/overwrite viewModel 
  input:
  @param JsonSourceResult jsonResult as {nodes: [], links: []}  jsonData

  output:
  @param {Object}           graph {nodes: [], links: []}

  - TODO: apply filters
  - TODO: provides default representations for different visualisation types/components
  - TODO: support addition of custom representations per the application or the data source
  - TODO: allow the application to modify or select the visual representation programmatically
  */

  consumeJsonSourceResult (jsonResult) {
    let jsonArray = jsonResult.getJsonResult();
    console.log('JsonViewModel.consumeSourceResult()', jsonArray)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
      // Create nodes and links from triples
      self.setViewModel({nodes: [...jsonArray.nodes], links: [...jsonArray.links]});
      self.viewModel.sourceResult = jsonResult;
      return self.viewModel;
    } catch (err) {
      console.log(err);
    }
  }
}

class VMTree extends ViewModel {
  constructor () {
    super();
  }

  // TODO: implement consume RDF
  // TODO: implement consume JSON
  // TODO: implement a ViewTree
}

// View model types
// export const modelFormats = {
//   FROM_RDF: 'FROM_RDF',
//   FROM_JSON: 'FROM_JSON',
// }

// export const viewModelTypeMap = new Map([
//   [modelFormats.FROM_RDF, {friendlyName: 'RDF', modelClass: RdfViewModel, category: 'RDF'}],
//   [modelFormats.FROM_JSON, {friendlyName: 'JSON', modelClass: JsonViewModel, category: 'JSON ???'}],
// ])
