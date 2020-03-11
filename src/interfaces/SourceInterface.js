// Classes interfacing with external data sources
//
// TODO: refactor: move parsing from SourceInterface classes to SourceResult
// TODO: update set of SourceResult types in line with ViewModel refactor (e.g. RDF graph, RDF table, JSON graph, JSON table)
// DONE: separate the SourceResult types from SourceResult (naming) into modelFormats.js for use by SourceInterface and ViewModel
// TODO: move subclasses to separate files and export from this file
// TODO: remove all console.dir

import {modelFormats} from '../modelFormats.js';

/** Base class for interfaces to different kinds of data source (file, database, web) 
 */
 class SourceInterface {
  constructor (shortName, description, uiComponent) {
    this.shortName = shortName;
    this.description = description;
    this.uiComponent = uiComponent;

    this.sourceResult = undefined;  // A subclass of SourceResult
  }
  
  // Base interface:
  setSourceResult (sourceResult) {this.sourceResult = sourceResult;}
  getSourceResult () {return this.sourceResult;}

  consumeRdfStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeRdfStream(sourceResultStore, statusTextStore, stream, {mimeType, size});
  }
  consumeRdfTextTtl (sourceResultStore, statusTextStore, textTtl) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeRdfTextTtl(sourceResultStore, statusTextStore, textTtl);
  }
  consumeJson (sourceResultStore) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeJson(sourceResultStore);
  }
  loadFiles(sourceResultStore, statusTextStore, fileList) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadFiles(sourceResultStore, statusTextStore, fileList);
  }
  loadUri(sourceResultStore, statusTextStore, uri) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadUri(sourceResultStore, statusTextStore, uri);
  }
  loadSparqlQuery(sourceResultStore, statusTextStore, endpoint, sparqlText) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadSparqlQuery(sourceResultStore, statusTextStore, endpoint, sparqlText);
  }

  // TODO: review the following...
  // TODO: maintain named, id'd list of all SourceInterface objects for SourceUI
  // TODO: start with four fixed interfaces: 
  // DONE:  - RDF (fixed LDP access)
  // DONE:  - SPARQL (specify endpoint and create query with some presets)
  // DONE:  - File (a fixed file)
  // TODO:  - Manual (fixed user)
  // TODO:  - Generated (ngraph)
  // TODO: add serialisation (file save/load and incorporate in app-wide project/template serialisation)
  // TODO: add UI for create, copy and edit SourceInterface (and in each subclass UI component)

}

export class SourceInterfaceManager {
  constructor (interfaceDefinitions) {    
    this.initialiseInterfaces(interfaceDefinitions !== undefined ? interfaceDefinitions : testInterfaces);
  }

  // TODO: add ability to add/remove/edit/enumerate SourceInterfaces

  ////////////////////////////////
  
  initialiseInterfaces (interfaceDefinitions) {
    console.log('SourceInterfaceManager.initialiseInterfaces()...');
    this.sourceInterfaces = new Map;
    
    interfaceDefinitions.forEach(def => {
      try {
        let newInterface
        if (def.uiClass)
          newInterface = new SourceInterface(def.shortName, def.description, def.uiClass);
        else // TODO: deprecate...
          newInterface = new def.iClass(def.shortName, def.description);

        this.sourceInterfaces.set(def.shortName, newInterface);
        console.dir(newInterface);
      } catch(e) {
        console.warn(e);
        window.notifications.notifyWarning(e);
      }
    });    
  }

}

// Application UIs:
import FileUI from './FileUI.svelte';
import WebUI from './WebUI.svelte';
import WebSparqlUI from './WebSparqlUI.svelte';

// Test UIs:
// import ManualUI from "./ManualUI";
// import GeneratorUI from "./GeneratorUI";
import JsonUI from "./JsonUI.svelte";
import TestRdfUI from "./TestRdfUI.svelte";
import lesMisData from '../data/data-les-miserables.js';

const ttlReader = require('@graphy/content.ttl.read');
const RdfDataset = require('@graphy/memory.dataset.fast');


/** Base class for loading different external data formats into an internal representation
 * 
 * The set of internal data representations is defined in modelFormats.js
 */
class SourceResult {
  constructor (sourceInterface) {
    this.sourceInterface = sourceInterface;
  }

  getSourceInterface () {return this.sourceInterface;}
  getRdfDataset () {return this.modelFormat === modelFormats.RAW_RDFDATASET ? this.internalModel : undefined;}
  getJsonArray () {
    return this.modelFormat === modelFormats.RAW_JSON_ARRAY ||
      this.modelFormat === modelFormats.VM_GRAPH_JSON 
      ? this.internalModel : undefined;}
  
  getFormatsConsumed () {return [
    modelFormats.RAW_STREAM_RDF, 
    modelFormats.RAW_TEXT_TURTLE,
    modelFormats.RAW_JSON_ARRAY,
  ];}

  setModel (internalModel, modelFormat) {
    this.internalModel = internalModel;
    this.modelFormat = modelFormat;
  }
  getModel () { return this.internalModel; }
  getModelFormat () { return this.modelFormat ? this.modelFormat : modelFormats.UNDEFINED; }

  // import fetch from '@rdfjs/fetch';
  
  // const label = 'https://www.w3.org/2000/01/rdf-schema#label'
  
  // fetch('https://www.w3.org/2000/01/rdf-schema')
  //   .then(res => res.dataset())
  //   .then(dataset => {
  //     for (const quad of dataset) {
  //       if (quad.predicate.value === label) {
  //         console.log(`${quad.subject.value}: ${quad.object.value}`)
  //       }
  //     }
  //   }).catch(err => console.error(err));
  
  // TODO: Unify data consumption and move to ViewModel:
  // TODO: - extend MIME type support using graphy reader based on mimeType
  consumeRdfStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    console.log('SourceResult.consumeRdfFile()');
    console.dir(stream);
    console.log('Size: ', size);
    this.sourceResultStore = sourceResultStore;
    
    try {
      const rdfDataset = RdfDataset();
      const self = this;
      const graphyReader = ttlReader({
        data (y_quad) {
          rdfDataset.add(y_quad);
          statusTextStore.set(rdfDataset.size + ' triples loaded');
        },
        eof () {
          console.log('done!');
          console.log('rdfDataset size: ', rdfDataset.size);
          self.setModel(rdfDataset, modelFormats.RAW_RDFDATASET);
          self.sourceResultStore.update(v => self);
          }
        });
        readableStreamToGraphyReader(stream, graphyReader);
      // The above code allows me to use whatwg (browser) streams with graphy.
      // When graphy adds whatwg streams the following can be used instead (issue #20).
      // const rdfDataset = RdfDataset(); 
      // const self = this;
      // file.stream().pipeTo(ttlReader())
      // .on('data', (y_quad) => {
      //     console.log(JSON.stringify(y_quad));
      //     rdfDataset.add(y_quad);
      //     console.log('rdfDataset size: ', rdfDataset.size);
      //   })
      //   .on('eof', () => {
      //     console.log('done!');
      //     console.log('rdfDataset size: ', rdfDataset.size);
      //     let sourceResult = new RdfSourceResult(this, rdfDataset);
      //     self.setSourceResult(sourceResult);
      //     self.sourceResultStore.update(v => sourceResult);

      //     console.log('loadTestRdf() results: ');
      //     console.dir(self.$sourceResultStore);
      // });
    } catch(e) {
      console.error(e);
      window.notifications.notifyWarning('Failed to parse RDF result.')
    }
  }

  consumeRdfTextTtl (sourceResultStore, statusTextStore, textTtl) {
    console.log('SourceResult.consumeRdfTextTtl()');
    this.sourceResultStore = sourceResultStore;

    try {
      const rdfDataset = RdfDataset();
      const self = this;
      ttlReader(textTtl, {
        data(y_quad) {
          console.log(JSON.stringify(y_quad));
          rdfDataset.add(y_quad);
          statusTextStore.set(rdfDataset.size + ' triples loaded');
        },
  
        eof(h_prefixes) {
          console.log('done!');
          console.log('rdfDataset size: ', rdfDataset.size);
          self.setModel(rdfDataset, modelFormats.RAW_RDFDATASET);
          self.sourceResultStore.update(v => self);
        },
      })
    } catch (e) { 
      console.error(e); 
      window.notifications.notifyWarning(e);
    } 

  }

  // JSON - initially just {nodes: [], links []}
  consumeJson (sourceResultStore) {
    console.log('SourceResult.consumeJson()');
    this.sourceResultStore = sourceResultStore;

    this.setModel(lesMisData, modelFormats.VM_GRAPH_JSON);
    this.sourceResultStore.update(v => this);
  }

  /** Load and parse files into a SourceResult store 
   * 
   * Currently assumes RDF input
   * TODO: LATER: provide file selection with optional default file extensions (use 'options' in the interfaces list)
   *
   * File system interface (for loading local files)
   * Uses FileAPI: https://w3c.github.io/FileAPI
   * Examples: https://www.javascripture.com/FileReader
   * 
   * @param {Writeable<SourceResult>} sourceResultStore 
   * @param {FileList} fileList 
   */
  loadFiles(sourceResultStore, statusTextStore, fileList) {
    console.log('SourceResult.loadFiles()');

    // TODO: load multiple files into same store
    // TODO: consider loading multiple files into separate stores/views
    const file = fileList[0]
    if (file !== undefined) {
      statusTextStore.set('loading file(s)');
      try {
        console.log('Loading ', file.size, ' bytes from ', file);
        this.consumeRdfStream(sourceResultStore, statusTextStore, file.stream(), {mimeType: file.type, size: file.size});
      } catch(e) {
        console.warn(e);
        window.notifications.notifyWarning('File load error');
      }
    } else {
      console.warn('No file selected.');
    }
    statusTextStore.set('');
  }

  /** Fetch RDF from a web URI and parse the result 
   * 
   * @param {Writeable<SourceResult>} sourceResultStore 
   * @param {String} URI 
   */
  loadUri(sourceResultStore, statusTextStore, uri) {
    console.log('SourceResult.loadUri()');

    // TODO: load multiple URIs into same store
    // TODO: consider loading multiple URIs into separate stores/views
      
    // Note: firefox with Privacy Badger gives CORS errors when fetching different origin (URI)
    statusTextStore.set('loading data');
    fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'text/turtle',
        // 'Accept': 'application/sparql-results+json',
      }})
    .then(response => {
      if (response.ok ) {
        const contentLength = (response.headers.get('Content-Length'));
        this.consumeRdfStream(sourceResultStore, statusTextStore, response.body, {size: contentLength});
      } else {
        const warning = 'Failed to load URI.\n' + response.statusText;
        console.warn(warning);
        window.notifications.notifyWarning(warning);
      }
      statusTextStore.set('');
    })
    .catch(e => {
      console.error(e);
      window.notifications.notifyWarning('Query failed.');
      window.notifications.notifyError(e.message);
      statusTextStore.set('');
    });
  }

  loadSparqlQuery(sourceResultStore, statusTextStore, endpoint, sparqlText) {
    console.log('SourceResult.loadSparqlQuery()');
    if (endpoint === '') {
      console.warn('No endpoint provided');
      window.notifications.notifyWarning('Please provide an endpoint');
      return;
    }
    var url = endpoint + "?query=" + encodeURIComponent(sparqlText) + "&type='text/turtle'";
    console.log('loadSparqlQuery()');
    console.log(url);
    return this.loadUri(sourceResultStore, statusTextStore, url);
  }
}

function readableStreamToGraphyReader(readableStream, graphyReader) {
  const bodyReader = readableStream.getReader();

  function next () {
    bodyReader.read().then(readChunk);
  }

  function readChunk ({value, done}) {
    if (done) {
      graphyReader.end();
      return;
    }

    graphyReader.write(value);
    next();
  }

  next();
}

import {parser as parseCsv} from 'csv-parse';
// const parseCsv = require('csv-parse');

class CsvInterface extends SourceInterface {
  constructor (shortName, description, uiComponent) {
    super(shortName, description, uiComponent ? uiComponent : TestCsvUI);
  }

  consumeCsvStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    console.log('CsvInterface.consumeCsvFile()');
    console.dir(stream);
    console.log('Size: ', size);
    this.setSourceResult(undefined);
    this.sourceResultStore = sourceResultStore;
    const csv = [ 
      ["a", "b", "c"],
      ["1", "3", "3"],
      ["2", "2", "2"],
      ["5", "1", "4"],
    ];

    try {
      this.setSourceResult(csv);
    } catch(e) {
      console.error(e);
      window.notifications.notifyWarning('Failed to parse CSV result.')
    }
  }

}

// TODO: replace fixed interfaces with an initial set
// TODO: change iClass to String and use a 'factory' so I can serialise (research ways to serialise first)
const testInterfaces = [
  // Application interface UIs
  {uiClass: WebSparqlUI, shortName: "rdf-sparql", description: "Web SPARQL endpoint (RDF/Turtle)", options: {}},
  {uiClass: WebUI, shortName: "rdf-ldp", description: "Web LDP resource (RDF/Turtle)", options: {}},
  {uiClass: FileUI, shortName: "rdf-file", description: "Load from file (RDF/Turtle)", options: {}},
  // {uiClass: ???FileUI, shortName: "csv-file", description: "Load from file (CSV)", options: {}},
 
  // Test UIs
  {uiClass: JsonUI, shortName: "json-test", description: "File (JSON)", options: {}},
  {uiClass: TestRdfUI, shortName: "rdf-test", description: "Load a test RDF/Turtle example", options: {}},
  // {uiClass: ManualUI, shortName:  "manual-test", description: "Manual (mrh)", options: {}},
  // {uiClass: GeneratorUI, shortName:  "generator-test", description: "Generator (mrh)", options: {}},
 ];

