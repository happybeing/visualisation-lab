/** ViewModel implementation classes 

A ViewModel consumes one or more SourceResults or ViewModel formats (see modelTypes.js)
and transforms these inputs into a new model which is exposed as a 'values' property,
and other optional properties in accordance with the JSON ViewModel spec.

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

import {modelFormats} from '../modelFormats.js';

class ViewModel {
  constructor () {
    this.jsonModel = undefined;
  }

  // TODO: generate/update view model based on Filters, SourceResult and chosen view model

  getFormatsConsumed () {return [];}  // Array of types supported by consumeSourceResult()
  getJsonModelFormat() {this.jsonModel ? this.jsonModel.modelFormat : undefined}

  setJsonModel (jsonModel) {
    this.jsonModel = jsonModel;
  }
  getJsonModel () {return this.jsonModel;}
  getJsonModelValues () {return this.jsonModel ? this.jsonModel.values : undefined;}

  //// Methods to generate the view model from different inputs

  // TODO: review this when adding logic for input types/output types:
  consumeSourceResult (sourceResult) {
    switch(sourceResult.getJsonModelFormat()) {
      case modelFormats.RAW_RDFDATASET: {
        return this.consumeRdfSourceResult(sourceResult);
      }
      case modelFormats.VM_GRAPH_JSON: {
        return this.consumeGraphJsonSourceResult(sourceResult);
      }
      case modelFormats.VM_TABULAR_JSON: {
        return this.consumeTabularJsonSourceResult(sourceResult);
      }
      default: {
        console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', sourceResult.getJsonModelFormat())
        return undefined;
      }
    }
  }

  /* consume RAW_RDFDATASET
  input:
    @param {RdfSourceResult} rdfResult as RDF/JS Dataset
  */
  consumeRdfSourceResult (rdfResult) {
    Error('ViewModel.consumeRdfSourceResult() not implemented');
  }

  /** consume VM_GRAPH_JSON 
  input:
    @param {JsonSourceResult} jsonResult as vm-graph-json
  */
 consumeGraphJsonSourceResult (jsonResult) {
    Error('ViewModel.consumeJsonSourceResult() not implemented');
  }

  /** consume VM_TABULAR_JSON 
  input:
    @param {JsonSourceResult} jsonResult as vm-tabular-json
  */
 consumeTabularJsonSourceResult (jsonResult) {
  Error('ViewModel.consumeTabularJsonSourceResult() not implemented');
}
}

import {RdfToGraph} from '../rdf/rdfjsUtils.js';

export class VMGraph extends ViewModel {
  constructor () {
    super();
  }

  //// Methods to generate the view model from different inputs

  getFormatsConsumed () { return [
    modelFormats.RAW_RDFDATASET,
    modelFormats.VM_GRAPH_JSON
  ];}
  getJsonModelFormat () {    return modelFormats.VM_GRAPH_JSON; }

  /** consume RDF
  input:
    @param RdfSourceResult rdfResult as RDF/JS Dataset

  output:
    @param {Object}    graph in ViewModel vm-graph-json format 

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
    console.log('VMGraph.consumeSourceResult()', rdfResult);
    try {
      let rdfToGraph = new RdfToGraph(rdfResult.getRdfDataset());
      let graph = rdfToGraph.Graph();
      this.setJsonModel({
        values: graph, 
        modelFormat: modelFormats.VM_GRAPH_JSON,
        sourceResult: rdfResult,
      });
      console.log('VMGraph.jsonModel:')
      console.dir(this.jsonModel);
      return this.jsonModel;
    } catch (err) {
      console.log(err);
    }
  }

  /** consume GraphJsonSourceResult, create/overwrite viewModel 
  input:
    @param {Object}    graph in ViewModel vm-graph-json format 

  output:
    @param {Object}    graph in ViewModel vm-graph-json format 

  - TODO: apply filters
  - TODO: provides default representations for different visualisation types/components
  - TODO: support addition of custom representations per the application or the data source
  - TODO: allow the application to modify or select the visual representation programmatically
  */

 consumeGraphJsonSourceResult (jsonResult) {
    if (jsonResult.getJsonModelFormat() !== modelFormats.VM_GRAPH_JSON) {
      console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', jsonResult.getJsonModelFormat())
      self.setJsonModel(undefined);
      return self.jsonModel;
    }
    console.dir(jsonResult)
    let jsonArray = jsonResult.getJsonModelValues();
    console.log('VMGraph.consumeSourceResult()', jsonArray)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
      // Create nodes and links from triples
      self.setJsonModel({
        values: {nodes: [...jsonArray.nodes], links: [...jsonArray.links]}, 
        modelFormat: modelFormats.VM_GRAPH_JSON,
        sourceResult: jsonResult,
      });
      return self.jsonModel;
    } catch (err) {
      console.log(err);
    }
  }
}

import {RdfTabulator} from '../rdf/rdfjsUtils.js';

export class VMTable extends ViewModel {
  constructor () {
    super();
  }

  //// Methods to generate the view model from different inputs

  // TODO: implement consume CSV
  // TODO: implement consume VMGraph model (JSON)
  
  getFormatsConsumed () { return [
    modelFormats.RAW_RDFDATASET,
    this.getJsonModelFormat()
  ];}
  getJsonModelFormat () {    return modelFormats.VM_TABULAR_JSON; }

  /** consume RDF
  input:
    @param {RdfSourceResult} rdfResult as RDF/JS Dataset

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
    try {
      const rdfTable = new RdfTabulator(rdfResult.getRdfDataset());
      const table = rdfTable.Table({});
      const values = table.rows;
      this.setJsonModel({
        header: table.header,
        values: values,
        modelFormat: modelFormats.VM_TABULAR_JSON,
        sourceResult: rdfResult,
      });
      console.log('VMTable.jsonModel:')
      console.dir(this.jsonModel);
      return this.jsonModel;
    } catch (err) {
      console.log(err);
    }
  }

  /** consume JSON
  input:
   @param {Object}  jsonResult vm-tabular-json
   */
  consumeTabularJsonSourceResult(jsonResult) {
    try {
      let jsonValues = jsonResult.getJsonModelValues();
      this.setJsonModel({
        values: jsonValues,
        modelFormat: modelFormats.VM_TABULAR_JSON,
        sourceResult: jsonResult,
      });
      console.log('VMTable.jsonModel:')
      console.dir(this.getJsonModel());
      return this.getJsonModel();
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

  //// Methods to generate the view model from different inputs

  getFormatsConsumed () { return [
    modelFormats.RAW_RDFDATASET,
    modelFormats.VM_GRAPH_JSON
  ];}
  
  getJsonModelFormat () {    return modelFormats.VM_TREE_JSON; }

  /** consume RDF
  input:
    @param RdfSourceResult rdfResult as RDF/JS Dataset

  output:
    @param {Object}    graph in ViewModel vm-graph-json format 

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
    console.log('VMTree.consumeSourceResult()', rdfResult);
    try {
      // Start with the graph
      let rdfToGraph = new RdfToGraph(rdfResult.getRdfDataset());
      let graph = rdfToGraph.Graph();
      
      // Create a tree from the graph
      // TODO make sure we start from the root (could this be chosent?)
      // TODO improve on this crude conversion from graph to tree
      let tree = [...graph.nodes.values()];
      let idToIndex = new Map();
      tree.forEach((node, i) => {node.index = i; idToIndex.set(node.id, i)});
      [...graph.links.values()].forEach(link => {
        tree[idToIndex.get(link.target)].parent = idToIndex.get(link.source);
      });

      this.setJsonModel({
        values: tree,
        modelFormat: modelFormats.VM_TREE_JSON,
        sourceResult: rdfResult,
      });
      console.log('VMTree.jsonModel:')
      console.dir(this.jsonModel);
      return this.jsonModel;
    } catch (err) {
      console.log(err);
    }
  }

  /** consume GraphJsonSourceResult, create/overwrite viewModel 
    input:
    @param {Object}  jsonData in ViewModel vm-graph-json format

    output:
    @param {Object}  jsonData in ViewModel vm-graph-json format

    - TODO: apply filters
    - TODO: provides default representations for different visualisation types/components
    - TODO: support addition of custom representations per the application or the data source
    - TODO: allow the application to modify or select the visual representation programmatically
    */

  consumeGraphJsonSourceResult (jsonResult) {
    if (jsonResult.getJsonModelFormat() !== modelFormats.VM_GRAPH_JSON) {
      console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', jsonResult.getJsonModelFormat())
      self.setJsonModel(undefined);
      return self.jsonModel;
    }
    let jsonArray = jsonResult.getJsonModelValues();
    console.log('JsonViewModel.consumeSourceResult()', jsonArray)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
      // Create nodes and links from triples
      self.setJsonModel({
        values: {nodes: [...jsonArray.nodes], links: [...jsonArray.links]},
        modelFormat: modelFormats.VM_GRAPH_JSON,
        sourceResult: jsonResult,
      });
      return self.getJsonModel();
    } catch (err) {
      console.log(err);
    }
  }
}

// TODO: add support for jsonViewModel
// - enumerate a set of modelFormats for SourceResult.resultData
// - note TODO: create ViewModel handler for each SourceResultType
// - implement ViewModel.getViewModelForSourceResult(sourceResult)
// - implement ViewModel.getView
// - ??? add SourceResult.getJsonModelFormat()
// - how are these selected? 
// - should this just follow the SourceInterface?

// ViewModel subclasses compatible with SourceResults modelFormat
// TODO: maybe construct this dynamically using SourceInterface.js and ViewModel.js helpers
// TODO: offer choice of view model type where more than one is available for the current SourceResult
export const compatibleViewModels = new Map([
  [modelFormats.RAW_RDFDATASET, [VMGraph, VMTable, VMTree]],
  [modelFormats.VM_GRAPH_JSON, [VMGraph]],
  [modelFormats.VM_TABULAR_JSON, [VMTable]],
]);