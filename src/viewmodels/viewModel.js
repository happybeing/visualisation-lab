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
    this.values = undefined;
  }

  // TODO: Base interface: 
  // - list subclasses of SourceResult I consume
  // - list the available models for a given SourceResult subclasses
  // - generate/update view model based on Filters, SourceResult and chosen view model

  getFormatsConsumed () {return [];}  // Array of types supported by consumeSourceResult()
  getValuesFormat () {throw Error('ViewModel - no viewModelType');}

  setValues (values) {this.values = values;}
  getValues () {return this.values;}

  //// Methods to generate the view model from different inputs

  // TODO: review this when adding logic for input types/output types:
  consumeSourceResult (sourceResult) {
    switch(sourceResult.getModelFormat()) {
      case modelFormats.RAW_RDFDATASET: {
        return this.consumeRdfSourceResult(sourceResult);
      }
      case modelFormats.VM_GRAPH_JSON: {
        return this.consumeGraphJsonSourceResult(sourceResult);
      }
      default: {
        console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', sourceResult.getModelFormat())
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

/** Consume an RDF stream
 * 
 * TODO: - maybe add other input formats?
 */
class VMRdfStream {
  constructor () {
    this.values = undefined;
  }

  // TODO: Base interface: 
  // - list subclasses of SourceResult I consume
  // - list the available models for a given SourceResult subclasses
  // - generate/update view model based on Filters, SourceResult and chosen view model

  getFormatsConsumed () {return [modelFormats.RAW_STREAM_RDF];}  // Array of types supported by consumeSourceResult()
  getValuesFormat () {return modelFormats.RAW_RDFDATASET;}

  setValues (values) {this.values = values;}
  getValues () {return this.values;}

  //// Methods to generate the view model from different inputs

  // TODO: review this when adding logic for input types/output types:
  consumeSourceResult (sourceResult) {
    switch(sourceResult.getModelFormat()) {
      case modelFormats.RAW_RDFDATASET: {
        return this.consumeRdfSourceResult(sourceResult);
      }
      case modelFormats.VM_GRAPH_JSON: {
        return this.consumeGraphJsonSourceResult(sourceResult);
      }
      default: {
        console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', sourceResult.getModelFormat())
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
  getValuesFormat () {    return modelFormats.VM_GRAPH_JSON; }

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
      graph.sourceResult = rdfResult;
      this.setValues(graph);
      console.log('VMGraph.values:')
      console.dir(this.values);
      return this.values;
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
    if (jsonResult.getModelFormat() !== modelFormats.VM_GRAPH_JSON) {
      console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', jsonResult.getModelFormat())
      self.setValues(undefined);
      return self.values;
    }
    console.dir(jsonResult)
    let jsonArray = jsonResult.getJsonArray();
    console.log('VMGraph.consumeSourceResult()', jsonArray)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
      // Create nodes and links from triples
      self.setValues({nodes: [...jsonArray.nodes], links: [...jsonArray.links]});
      self.values.sourceResult = jsonResult;
      return self.values;
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
    modelFormats.RAW_RDFDATASET
  ];}
  getValuesFormat () {    return modelFormats.VM_TABULAR_JSON; }

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
    try {
      const rdfTable = new RdfTabulator(rdfResult.getRdfDataset());
      const table = rdfTable.Table();
      table.sourceResult = rdfResult;
      this.setValues(table);
      console.log('VMTable.values:')
      console.dir(this.values);
      return this.values;
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
  
  getValuesFormat () {    return modelFormats.VM_TREE_JSON; }

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

      tree.sourceResult = rdfResult;
      this.setValues(tree);
      console.log('VMTree.values:')
      console.dir(this.values);
      return this.values;
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
    if (jsonResult.getModelFormat() !== modelFormats.VM_GRAPH_JSON) {
      console.error(this.constructor.name + '.consumeSourceResult() - does not accept ViewModel type: ', jsonResult.getModelFormat())
      self.setValues(undefined);
      return self.values;
    }
    let jsonArray = jsonResult.getJsonArray();
    console.log('JsonViewModel.consumeSourceResult()', jsonArray)
    let graphMap = {nodes: new Map(), links: new Map() };
    self = this;
    try {
      // Create nodes and links from triples
      self.setValues({nodes: [...jsonArray.nodes], links: [...jsonArray.links]});
      self.values.sourceResult = jsonResult;
      return self.values;
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
// - ??? add SourceResult.getModelFormat()
// - how are these selected? 
// - should this just follow the SourceInterface?

// ViewModel subclasses compatible with SourceResults modelFormat
// TODO: maybe construct this dynamically using SourceInterface.js and ViewModel.js helpers
// TODO: offer choice of view model type where more than one is available for the current SourceResult
export const compatibleViewModels = new Map([
  [modelFormats.RAW_RDFDATASET, [VMGraph, VMTable, VMTree]],
  [modelFormats.VM_GRAPH_JSON, [VMGraph]],
]);