// Classes interfacing with external data sources
//
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
  loadFiles(sourceResultStore, statusTextStore, fileList, options) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadFiles(sourceResultStore, statusTextStore, fileList, options);
  }
  loadUri(sourceResultStore, statusTextStore, uri) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadUri(sourceResultStore, statusTextStore, uri);
  }
  loadSparqlQuery(sourceResultStore, statusTextStore, endpoint, sparqlText) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadSparqlQuery(sourceResultStore, statusTextStore, endpoint, sparqlText);
  }
  consumeCsvStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeCsvStream(sourceResultStore, statusTextStore, stream, {mimeType, size});
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

// RDF Support
const ttlReader = require('@graphy/content.ttl.read');
const RdfDataset = require('@graphy/memory.dataset.fast');

// CSV Support
// import {parser as csvParse} from 'csv-parse';
const csvParse = require('csv-parse');

/** Load multiple external data formats into a JSON ViewModel representation
 * 
 * The set of ViewModel representations is defined in modelFormats.js
 */
class SourceResult {
  constructor (sourceInterface) {
    this.sourceInterface = sourceInterface;
  }

  getSourceInterface () {return this.sourceInterface;}
  getRdfDataset () {return this.getJsonModelFormat() === modelFormats.RAW_RDFDATASET ? this.getJsonModelValues() : undefined;}
  getFormatsConsumed () {return [
    modelFormats.RAW_STREAM_RDF, 
    modelFormats.RAW_TEXT_TURTLE,
    modelFormats.RAW_JSON_ARRAY,
  ];}
    
  setJsonModel (jsonModel) {this.jsonModel = jsonModel;}
 
  getJsonModel () {return this.jsonModel;}
  getJsonModelFormat () {return this.jsonModel ? this.jsonModel.modelFormat : modelFormats.UNDEFINED; }
  getJsonModelValues () {return this.jsonModel ? this.jsonModel.values : undefined;}

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
  consumeRdfStream (sourceResultStore, statusTextStore, stream,  {mimeType, size}) {
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
          self.setJsonModel({values: rdfDataset, modelFormat: modelFormats.RAW_RDFDATASET});
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
          self.setJsonModel({
            values: rdfDataset, 
            modelFormat: modelFormats.RAW_RDFDATASET,  
            sourceInterface: this,
          });
          self.sourceResultStore.update(v => self);
        },
      })
    } catch (e) { 
      console.error(e); 
      window.notifications.notifyWarning(e);
    } 

  }

  // JSON - initially just {nodes: [], links []}
  // TODO add a ViewModel type param so any ViewModel can be loaded as JSON (e.g. from file)
  consumeJson (sourceResultStore) {
    console.log('SourceResult.consumeJson()');
    this.sourceResultStore = sourceResultStore;

    this.setJsonModel({values: lesMisData, modelFormat: modelFormats.VM_GRAPH_JSON});
    this.sourceResultStore.update(v => this);
  }

  // TODO: a consumeStream() which uses the options.mimeType param to choose the consume function
  consumeCsvStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    console.log('CsvInterface.consumeCsvFile()');
    console.dir(stream);
    console.log('Size: ', size);
    this.sourceResultStore = sourceResultStore;

    try {
      const self = this;
      const csvJson = [];
      let records = 1;
      statusTextStore.set('loading CSV...');
      const parser = csvParse();
      parser.on('readable', function(){
        let record
        while (record = parser.read()) {
          csvJson.push(record)
          statusTextStore.set(records++ + ' records loaded');
        }
      })
      parser.on('error', function(err){
        throw(err);
      })
      parser.on('end', function(){
        statusTextStore.set(records + ' records loaded');
        self.setJsonModel({values: csvJson, modelFormat: modelFormats.VM_TABULAR_JSON});
        self.sourceResultStore.update(v => self);
      })
      readableStreamToConsumer(stream, parser);
    } catch(e) {
      console.error(e);
      window.notifications.notifyWarning('Failed to parse CSV result.')
      return;
    }
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
   * @param {Object}  current options: {mimeType: String}
   */
  loadFiles(sourceResultStore, statusTextStore, fileList, options) {
    console.log('SourceResult.loadFiles()');

    // TODO: load multiple files into same store
    // TODO: consider loading multiple files into separate stores/views
    const file = fileList[0]
    if (file !== undefined) {
      statusTextStore.set('loading file(s)');
      try {
        console.log('Loading ', file.size, ' bytes from ', file);
        let mimeType = file.type;
        if (mimeType === undefined) mimeType = options.mimeType ? options.mimeType : undefined;

        if (mimeType === 'text/csv')
          this.consumeCsvStream(sourceResultStore, statusTextStore, file.stream(), {mimeType: file.type, size: file.size});
        else  // Default to RDF
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

function readableStreamToConsumer(readableStream, consumer) {
  const bodyReader = readableStream.getReader();

  function next () {
    bodyReader.read().then(readChunk);
  }

  function readChunk ({value, done}) {
    if (done) {
      consumer.end();
      return;
    }

    consumer.write(value);
    next();
  }

  next();
}

// TODO deprecate in favour of readableStreamToConsumer()
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

// TODO: replace fixed interfaces with an initial set
// TODO: change iClass to String and use a 'factory' so I can serialise (research ways to serialise first)
const testInterfaces = [
  // Application interface UIs
  {uiClass: WebSparqlUI, shortName: "rdf-sparql", description: "Web SPARQL endpoint (RDF/Turtle)", options: {}},
  {uiClass: WebUI, shortName: "rdf-ldp", description: "Web LDP resource (RDF/Turtle)", options: {}},
  {uiClass: FileUI, shortName: "rdf-file", description: "Load from file (RDF/Turtle)", options: {}},
  {uiClass: FileUI, shortName: "csv-file", description: "Load from file (CSV)", options: {mimeType: "text/csv"}},
 
  // Test UIs
  {uiClass: JsonUI, shortName: "json-test", description: "File (JSON)", options: {}},
  {uiClass: TestRdfUI, shortName: "rdf-test", description: "Load a test RDF/Turtle example", options: {}},
  // {uiClass: ManualUI, shortName:  "manual-test", description: "Manual (mrh)", options: {}},
  // {uiClass: GeneratorUI, shortName:  "generator-test", description: "Generator (mrh)", options: {}},
 ];

