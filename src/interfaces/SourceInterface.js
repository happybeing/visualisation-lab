// Classes interfacing with external data sources
//
// TODO: remove all console.dir

import {modelFormats} from '../modelFormats.js';

/** Base class for interfaces to different kinds of data source (file, database, web) 
 */
 class SourceInterface {
  constructor (shortName, description, uiComponent, options) {
    this.shortName = shortName;
    this.description = description;
    this.uiComponent = uiComponent;
    this.options = options;

    this.sourceResult = undefined;  // A subclass of SourceResult
  }
  
  // Base interface:
  setSourceResult (sourceResult) {this.sourceResult = sourceResult;}
  getSourceResult () {return this.sourceResult;}

  consumeRdfStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeRdfStream(sourceResultStore, statusTextStore, stream, {mimeType, size});
  }
  consumeRdfTtlText (sourceResultStore, statusTextStore, textTtl, {mimeType, size}) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeRdfTtlText(sourceResultStore, statusTextStore, textTtl, {mimeType, size});
  }
  consumeCsvText (sourceResultStore, statusTextStore, csvText, {mimeType, size}, options) {
    if (options === undefined) options = {};
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeCsvText(sourceResultStore, statusTextStore, csvText, {mimeType, size}, options);
  }
  consumeJson (sourceResultStore) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeJson(sourceResultStore);
  }
  consumeCsvStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeCsvStream(sourceResultStore, statusTextStore, stream, {mimeType, size});
  }
  consumeTextStream (sourceResultStore, statusTextStore, stream, {mimeType, size}) {
    const sourceResult = new SourceResult(this);
    return sourceResult.consumeTextStream(sourceResultStore, statusTextStore, stream, {mimeType, size});
  }

  loadFiles(sourceResultStore, statusTextStore, fileList, options) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadFiles(sourceResultStore, statusTextStore, fileList, options);
  }
  loadUri (sourceResultStore, statusTextStore, uri, options) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadUri(sourceResultStore, statusTextStore, uri, options);
  }
  loadSparqlQuery (sourceResultStore, statusTextStore, endpoint, sparqlText, options) {
    const sourceResult = new SourceResult(this);
    return sourceResult.loadSparqlQuery(sourceResultStore, statusTextStore, endpoint, sparqlText, options);
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
          newInterface = new SourceInterface(def.shortName, def.description, def.uiClass, def.options);

        this.sourceInterfaces.set(def.shortName, newInterface);
        // console.dir(newInterface);
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
import WebQueryUI from './WebQueryUI.svelte';
import WebSourceTabulatorUI from './WebSourceTabulatorUI.svelte';

// Test UIs:
// import ManualUI from "./ManualUI";
// import GeneratorUI from "./GeneratorUI";
import JsonUI from "./JsonUI.svelte";
import TestRdfUI from "./TestRdfUI.svelte";
import TestCsvUI from "./TestCsvUI.svelte";
import lesMisData from '../data/data-les-miserables.js';

// RDF Support
const ttlReader = require('@graphy/content.ttl.read');
const RdfDataset = require('@graphy/memory.dataset.fast');

// CSV Support
// import {parser as csvParse} from 'csv-parse';
const csvParse = require('csv-parse');
const xmlParser = require('fast-xml-parser');

/** Load multiple external data formats into a JSON ViewModel representation
 * 
 * The set of ViewModel representations is defined in modelFormats.js
 */
export const fetchStatus = {
  IDLE: 'source-result-idle',
  FETCHING: 'source-result-fetching',
  RESPONSE: 'source-result-response', // SourceResult.response processed waiting to be consumed
  BAD_RESPONSE: 'source-result-badresponse', // SourceResult.response failed to be processed
  COMPLETE: 'source-result-complete', // Response has been consumed
  FAILED: 'source-result-failed',     // Failed without response (e.g. blocked by CORS)
};
export class SourceResult {
  constructor (sourceInterface) {
    this.sourceInterface = sourceInterface;
    this.fetchStatus = fetchStatus.IDLE;
    this.responseStore = writable(undefined); // { response: response, error: error }
    this.resultTextStore = writable('');      // Reactive status per SourceResult (e.g. -, unkown, fetching and some result value)
    this.useStreams = true;  // Disabling streams allows tabulator UI to display response body
                            // as a tooltip but increases memory use and slows performance
  }

  setResultText (resultText, isError) { 
    this.isError = isError ? true : false;
    this.resultText = resultText; 
    this.resultTextStore.set(resultText);
  }

  getResultText () { return this.resultText; }

  // Status allows handling of errors by subscribers to the sourceResultStore
  fetchStarting () { 
    this.fetchStatus = fetchStatus.FETCHING; 
    this.lastFetchResponse = undefined; 
    this.lastFetchResponseError = undefined; 
    if (this.fetchMonitor) this.fetchMonitor.fetchStarted(this);
    this.setResultText('...');
  }

  fetchResponseReceived (response) {
    this.fetchStatus = fetchStatus.RESPONSE; 
    this.lastFetchResponse = response;
  }

  getFetchStatus () { return this.fetchStatus; }
  getLastFetchResponse () { return this.lastFetchResponse; }
  getLastFetchError () { return this.lastFetchError; }
  getLastFetchErrorCaller () { return this.lastFetchErrorCaller; }
  
  responseProcessingComplete (error) {
    this.lastFetchError = error;
    if (this.fetchStatus === fetchStatus.COMPLETE || 
        this.fetchStatus === fetchStatus.BAD_RESPONSE ||
        this.fetchStatus === fetchStatus.FAILED) {
      const responseOrErrorObject = {error: error, response: this.lastFetchResponse};

      if (this.fetchMonitor) this.fetchMonitor.fetchCompleted(this);
      this.responseStore.set(responseOrErrorObject);
    }
  }

  // Two ways to complete a fetch: 
  // 
  // consumeFetchResponse() = process response which can be an error (200, 400 etc) or 
  // fetchAbandond encounter a hard error (e.g. parsing or bug)
  consumeFetchResponse (responseAccepted) {
    this.fetchStatus = responseAccepted ? fetchStatus.COMPLETE : fetchStatus.BAD_RESPONSE;
  }
  abandonFetchResponse (caller, e) { 
    this.lastFetchErrorCaller = caller; 
    this.lastFetchError = e; 
    this.fetchStatus = fetchStatus.FAILED;
    if (this.fetchMonitor) this.fetchMonitor.fetchAbandoned(this);
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

  _notifyWarning(w) { if (!this.disableNotify) window.notifications.notifyWarning(w);}
  _notifyError(e) { if (!this.disableNotify) window.notifications.notifyError(e);}
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
    // console.dir(stream);
    console.log('Size: ', size);
    this.sourceResultStore = sourceResultStore;
    
    try {
      const rdfDataset = RdfDataset();
      const self = this;
      const graphyReader = ttlReader({
        data (y_quad) {
          rdfDataset.add(y_quad);
          if (statusTextStore) statusTextStore.set(rdfDataset.size + ' triples loaded');
        },
        eof () {
          console.log('done!');
          console.log('rdfDataset size: ', rdfDataset.size);
          self.setJsonModel({values: rdfDataset, modelFormat: modelFormats.RAW_RDFDATASET});
          self.sourceResultStore.update(v => self);
          self.responseProcessingComplete();
          },
        error (e) {
          // this._notifyWarning('Failed to parse RDF result.')
          console.log('error: ', e);
          console.log('rdfDataset size: ', rdfDataset.size);
          self.setJsonModel(undefined);
          self.sourceResultStore.update(v => self);
          self.responseProcessingComplete(e);
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
      this._notifyWarning('Failed to parse RDF result.')
      throw e;
    }
  }

  consumeRdfTtlText (sourceResultStore, statusTextStore, textTtl) {
    console.log('SourceResult.consumeRdfTtlText()');
    this.sourceResultStore = sourceResultStore;

    try {
      const rdfDataset = RdfDataset();
      const self = this;
      ttlReader(textTtl, {
        data(y_quad) {
          console.log(JSON.stringify(y_quad));
          rdfDataset.add(y_quad);
          if (statusTextStore) statusTextStore.set(rdfDataset.size + ' triples loaded');
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
          self.responseProcessingComplete();
        },
        error (e) {
          // this._notifyWarning('Failed to parse RDF text.')
          console.log('error: ', e);
          console.log('rdfDataset size: ', rdfDataset.size);
          self.setJsonModel(undefined);
          self.sourceResultStore.update(v => self);
          self.responseProcessingComplete(e);
          }
      })
    } catch (e) { 
      console.error(e); 
      this._notifyWarning(e);
      throw e;
    } 

  }

  // JSON - currently only used to check for JSON response body
  // TODO consider supporting queries that return JSON (e.g. wikidata won't provides JSON and XML, but not CSV)
  consumeJsonText (sourceResultStore, statusTextStore, jsonText,  {mimeType, size}) {
    console.log('SourceResult.consumeJsonText()');
    // console.dir({jsonText});
    console.log('Size: ', jsonText.length);
    const json = JSON.parse(jsonText);
    this.sourceResultStore = sourceResultStore;
    this.setJsonModel({values: json, modelFormat: modelFormats.RAW_JSON});
    this.sourceResultStore.update(v => {instance: this});    
    this.responseProcessingComplete();
  }

  // XML - currently only used to check for valid XML response body
  // TODO consider supporting queries that return XML (e.g. wikidata won't provides JSON and XML, but not CSV)
  consumeXmlText (sourceResultStore, statusTextStore, xmlText,  {mimeType, size}) {
    console.log('SourceResult.consumeXmlText()');
    // console.dir({xmlText});
    console.log('Size: ', xmlText.length);
    const xmlJson = xmlParser.convertToJson(xmlText);
    this.sourceResultStore = sourceResultStore;
    this.setJsonModel({values: xmlJson, modelFormat: modelFormats.RAW_JSON});
    this.sourceResultStore.update(v => {instance: this});    
    this.responseProcessingComplete();
  }

  // JSON - initially just used to load a JSON graph test file into the resultStore as VM_GRAPH_JSON
  // TODO add a ViewModel type param so any ViewModel can be loaded as JSON (e.g. from file)
  consumeJson (sourceResultStore) {
    console.log('SourceResult.consumeJson()');
    this.sourceResultStore = sourceResultStore;
    this.setJsonModel({values: lesMisData, modelFormat: modelFormats.VM_GRAPH_JSON});
    this.sourceResultStore.update(v => {instance: this});
    this.responseProcessingComplete();
  }

  consumeCsvText (sourceResultStore, statusTextStore, csvText, {mimeType, size, stringToNumber}) {
    console.log('SourceResult.consumeCsvText()');
    this.sourceResultStore = sourceResultStore;
    try {
      const self = this;
      const csvJson = [];
      let records = 1;
      if (statusTextStore) statusTextStore.set('loading CSV...');
      const parser = csvParse();
      parser.on('readable', function(){
        let record
        while (record = parser.read()) {
          // console.log('READ: ' + record);
          if (stringToNumber) {
            record.forEach((v,i,a) => {if (!isNaN(Number(v))) a[i] = Number(v);});
          }
          csvJson.push(record)
          if (statusTextStore) statusTextStore.set(records++ + ' records loaded');
        }
      })
      parser.on('error', function(err){
        throw(err);
      })
      parser.on('end', function(){
        if (statusTextStore) statusTextStore.set(records + ' records loaded');
        self.setJsonModel({values: csvJson, modelFormat: modelFormats.VM_TABULAR_JSON});
        self.sourceResultStore.update(v => self);
        self.responseProcessingComplete();
      })
      // Pass the text to the parser
      csvText.split('\n').forEach(line => {
        if (line.length > 0) parser.write(line + '\n')
      });
      // console.log('END');
      parser.end();
    } catch(e) {
      // console.dir(e);
      console.error(e);
      this._notifyWarning('Failed to parse CSV result.')
      throw e;
    }
  }

  // TODO: a consumeStream() which uses the options.mimeType param to choose the consume function
  consumeCsvStream (sourceResultStore, statusTextStore, stream, {mimeType, size, stringToNumber}) {
    console.log('SourceResult.consumeCsvStream)');
    // console.dir(stream);
    console.log('Size: ', size);
    this.sourceResultStore = sourceResultStore;
    try {
      const self = this;
      const csvJson = [];
      let records = 1;
      if (statusTextStore) statusTextStore.set('loading CSV...');
      const parser = csvParse();
      parser.on('readable', function(){
        let record
        while (record = parser.read()) {
          if (stringToNumber) {
            record.forEach((v,i,a) => {if (!isNaN(Number(v))) a[i] = Number(v);});
          }
          csvJson.push(record)
          if (statusTextStore) statusTextStore.set(records++ + ' records loaded');
        }
      })
      parser.on('error', function(err){
        throw(err);
      })
      parser.on('end', function(){
        if (statusTextStore) statusTextStore.set(records + ' records loaded');
        self.setJsonModel({values: csvJson, modelFormat: modelFormats.VM_TABULAR_JSON});
        self.sourceResultStore.update(v => self);
        self.responseProcessingComplete();
      })
      readableStreamToConsumer(stream, parser);
    } catch(e) {
      // console.dir(e);
      console.error(e);
      this._notifyWarning('Failed to parse CSV result.')
      throw e;
    }
  }

  // TODO: a consumeStream() which uses the options.mimeType param to choose the consume function
  consumeTextStream (sourceResultStore, statusTextStore, stream, {mimeType, size, stringToNumber}) {
    console.log('SourceResult.consumeTextStream)');
    // console.dir(stream);
    console.log('Size: ', size);
    this.sourceResultStore = sourceResultStore;
    try {
      this.sourceResultStore.set(stream)
      const self = this;
      const csvJson = [];
      let records = 1;
      if (statusTextStore) statusTextStore.set('loading CSV...');
      const parser = csvParse();
      parser.on('readable', function(){
        let record
        while (record = parser.read()) {
          if (stringToNumber) {
            record.forEach((v,i,a) => {if (!isNaN(Number(v))) a[i] = Number(v);});
          }
          csvJson.push(record)
          if (statusTextStore) statusTextStore.set(records++ + ' records loaded');
        }
      })
      parser.on('error', function(err){
        throw(err);
      })
      parser.on('end', function(){
        if (statusTextStore) statusTextStore.set(records + ' records loaded');
        self.setJsonModel({values: csvJson, modelFormat: modelFormats.VM_TABULAR_JSON});
        self.sourceResultStore.update(v => self);
        self.responseProcessingComplete(e);
      })
      readableStreamToConsumer(stream, parser);
    } catch(e) {
      // console.dir(e);
      console.error(e);
      this._notifyWarning('Failed to parse CSV result.')
      throw e;
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
      if (statusTextStore) statusTextStore.set('loading file(s)');
      try {
        console.log('Loading ', file.size, ' bytes from ', file);
        let mimeType = file.type;
        if (mimeType === undefined) mimeType = options.mimeType ? options.mimeType : undefined;

        const options = {stringToNumber: true, mimeType: file.type, size: file.size};
        if (mimeType === 'text/csv')
          this.consumeCsvStream(sourceResultStore, statusTextStore, file.stream(), options);
        else  // Default to RDF
          this.consumeRdfStream(sourceResultStore, statusTextStore, file.stream(), options);
      } catch(e) {
        console.warn(e);
        this._notifyWarning('File load error');
      }
    } else {
      console.warn('No file selected.');
    }
    if (statusTextStore) statusTextStore.set('');
  }

  /** Fetch RDF from a web URI and parse the result 
   * 
   * On success saves the content in sourceResultStore.
   * On failure  
   * 
   * @param {writable<SourceResult>} sourceResultStore 
   * @param {writable<SourceResult>} statusTextStore 
   * @param {String} URI 
   * @param {Object} options such as request headers
   */
  loadUri (sourceResultStore, statusTextStore, uri, options) {
    console.log('SourceResult.loadUri(' + uri + ')');

    // TODO: load multiple URIs into same store
    // TODO: consider loading multiple URIs into separate stores/views
      
    let headers = {
      // Need to avoid CORS Pre-flight checks, so avoid
      // adding headers that will trigger them:
      // See 'Simple Requests' at https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

      // 'Accept': 'text/turtle', //NOT??? Needed for SPARQL endpoints that return HTML, XML or JSON by default
    }
    if (options && options.headers) headers = {...options.headers}; // Allow override of defaults (e.g. of 'Accept')
    console.log('Request headers: ' + JSON.stringify(headers));

    // Note: firefox with Privacy Badger gives CORS errors when fetching different origin (URI)
    this.fetchStarting();
    this.responseText = undefined;
    this.responseType = '';
    if (statusTextStore) statusTextStore.set('loading data');
    
    fetch(uri, {
      method: 'GET',
      cache: "reload",
      pragma: "no-cache",

      // mode: 'no-cors', // Won't help because response content blocked by browser in opaque response
                          // See: https://stackoverflow.com/a/54906434/4802953
      headers: headers,
    }).then(response => {
      this.fetchResponseReceived(response);
      console.log('DEBUG: ' + response.status + ' ' + response.statusText);
      if (response.status < 400 ) {
        this._processResponse(response, sourceResultStore, statusTextStore) 
      } else {
        this.errorDescription = 'DBG ' + response.status;
        response.text().then(text => {
          console.log('RESPONSE ' + response.status + ' \n' + text);
          response.errorText = text;

          const warning = 'Failed to load URI.\n' + response.statusText;
          console.log('DEBUG: ' + response.status + ' ' + response.statusText + ' XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
          // console.dir(response);
          console.warn(warning);
          this._notifyWarning(warning);
          this.consumeFetchResponse(false);  // Response failed to be processed
          sourceResultStore.set(0);
          this.responseProcessingComplete();  
        });
      }
    }).catch(e => {
      console.log('BEGINBEGINBEGINBEGINBEGINBEGINBEGINBEGINBEGINBEGIN');
      console.error(e);
      // console.dir(e);
      if (e.name === 'TypeError') {
        this.errorDescription = "network, DNS or CORS";
        console.error(this.errorDescription);
      }
      this._notifyWarning('Query failed.');
      this._notifyError(e.message);
      this.abandonFetchResponse('SourceResult.loadUri()', e);
      sourceResultStore.set(0);
      this.responseProcessingComplete(e);
      console.log('ENDENDENDENDENDENDENDENDENDENDENDENDENDENDENDEND');
    });
  }

  _processResponse(response, sourceResultStore, statusTextStore) {
    try {
      console.log('Processing Content-Type: ' + response.headers.get('Content-Type'));
      // console.dir(response);
      console.log('length: ' + response.headers.get('Content-Length'));

      const contentLength = (response.headers.get('Content-Length'));
      const responseType = this.responseType = response.headers.get('Content-Type');
      if (responseType.startsWith('text/csv')) {
        this.consumeFetchResponse(true);
        if (this.useStreams) {
          this.consumeCsvStream(sourceResultStore, statusTextStore, response.body, {size: contentLength});
          if (statusTextStore ) statusTextStore.set('');
        } else {
          this.responseTypeAbbrev = 'CSV';
          this._processTextResponseUsing(sourceResultStore, statusTextStore, response, {size: contentLength}, this.consumeCsvText);
        }
      } else if (responseType.startsWith('text/turtle')) {
        this.consumeFetchResponse(true);
        if (this.useStreams) {
          this.consumeRdfStream(sourceResultStore, statusTextStore, response.body, {size: contentLength});
          if (statusTextStore ) statusTextStore.set('');
        } else {
          this.responseTypeAbbrev = 'Ttl';
          this._processTextResponseUsing(sourceResultStore, statusTextStore, response, {size: contentLength}, this.consumeRdfTtlText);
        }
      } else if (responseType.startsWith('application/sparql-results+json')) {
        this.consumeFetchResponse(true);
        this.responseTypeAbbrev = 'Json';
        this._processTextResponseUsing(sourceResultStore, statusTextStore, response, {size: contentLength}, this.consumeJsonText);
      } else if (responseType.startsWith('application/sparql-results+xml') ||
            responseType.startsWith('application/rdf+xml')) {
        this.consumeFetchResponse(true);
        this.responseTypeAbbrev = 'XML';
        this._processTextResponseUsing(sourceResultStore, statusTextStore, response, {size: contentLength}, this.consumeXmlText);
      }
      else {
        // Unexpected response type
        const warning = 'Unexpected content type: ' + responseType;
        this.consumeFetchResponse(false);  // Response failed to be processed
        // console.dir(response);
        response.text().then(text => {
          // console.log(warning + ' DUMP: ');
          // console.dir({responseText: text});
          if (text) text = this._truncateText(text, 40);
          this.responseText = text;
          if (statusTextStore) statusTextStore.set('Returned: ' + responseType);
          if (responseType.startsWith('text/html')) {
            this.responseTypeAbbrev = 'Html';
            this.errorDescription = 'Unexpected response type HTML:\n' + text;
          } else {
            this.errorDescription = 'Unexpected response type ' + responseType + ':\n' + text;
          }
          this._notifyWarning(warning);
          sourceResultStore.set(0);
          this.responseProcessingComplete();
        });
      }
    }
    catch(e) {
      console.error(e);
      this._notifyWarning('Query failed.');
      this._notifyError(e.message);
      this.consumeFetchResponse(false);  // Response failed to be processed
      sourceResultStore.set(0);
      this.responseProcessingComplete(e);
    }
  }

  _processTextResponseUsing(sourceResultStore, statusTextStore, response, {size: contentLength}, textProcessor) {
    response.text()
    .then(text => {
      this.responseText = this._truncateText(text, 40); // For tabulation UI tooltip
      this[textProcessor.name](sourceResultStore, statusTextStore, text, {size: contentLength})
      if (statusTextStore ) statusTextStore.set('');
    })
    .catch(e => {
      console.error(e);
      this._notifyWarning('Query failed.');
      this._notifyError(e.message);
      this.consumeFetchResponse(false);  // Response failed to be processed
      sourceResultStore.set(0);
      this.responseProcessingComplete(e);
    });
  }

  loadSparqlQuery (sourceResultStore, statusTextStore, endpoint, sparqlText, options) {
    console.log('SourceResult.loadSparqlQuery()');
    if (endpoint === '') {
      console.warn('No endpoint provided');
      this._notifyWarning('Please provide an endpoint');
      return;
    }
    var url = endpoint + "?query=" + encodeURIComponent(sparqlText);// + "&type='text/turtle'";
    console.log('loadSparqlQuery()');
    console.log(url);
    return this.loadUri(sourceResultStore, statusTextStore, url, options);
  }

  _truncateText(text, maxlines) {
    let index = text.indexOf('\n');
    for (let line = 1 ; line < maxlines && index != -1 ; ++line) index = text.indexOf('\n', index + 1);
    if (index != -1) {
      text = text.substring(0, index);
      text += '\n[truncated after ' + maxlines + ' lines]';
    }
    return text;
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

/** Classes to collect data about a SPARQL endpoint for use in understanding its extent and contents

There's a SparqlStat class to handle simple result types such as number and text, and
subclasses to handle more complex results such as a tree of ViewModels (for drill down type UI).

A SparqlStat typically runs a query to gather data which it stores as a SourceResult, and
publishes this by updating the store which refers back to itself.

Options may be provided to customise behaviour, and are available to any associated UI components 
to customise their behaviour.

*/

import {writable} from 'svelte/store';

/** Class to hold aggregate summary data for SparqlStat activity (such as outstanding fetch operations)

Used to help generate aggregate status for a UI such as:

  'Status: fetch operations completed 123, outstanding 34, errors 2'
*/
export class FetchMonitor {
  constructor (statusTextStore) {
    this.reset();
    this.statusTextStore = statusTextStore; // Text updated by each fetchStarted(), fetchConsumed() etc call (or every N calls?)
  }

  reset () {
    this.fetchesStarted = 0;
    this.fetchesCompleted = 0;
    this.fetchesAbandoned = 0;
    this.fetchBadResponses = 0;

    this.responseCodes = [];
    this.abandonCallers = [];
    this.abandonErrors = [];
    this.sparqlStats = [];
  }

  fetchesStarted () {return this.fetchesStarted;}
  fetchesCompleted () {return this.fetchesCompleted;}
  fetchesAbandoned () {return this.fetchesAbandoned;}
  fetchBadResponses () {return this.fetchBadResponses;}

  fetchesOutstanding () {return this.fetchesStarted - this.fetchesCompleted;}

  simpleTextStatus () {
    return ' fetch operations: ' + String(this.fetchesCompleted).padStart(4, ' ') + ' completed, ' +
    String(this.fetchesOutstanding()).padStart(4, ' ') + ' outstanding, ' +
    String(this.fetchBadResponses + this.fetchesAbandoned) + ' errors.';
  }

  fetchStarted (sparqlStat) {
    if (!this.sparqlStats.includes(sparqlStat))  this.sparqlStats.push(sparqlStat);
    this.fetchesStarted++;
    if (this.statusTextStore) return this.statusTextStore.set(this.simpleTextStatus());
  }

  fetchAbandoned (sparqlStat) {
    this.fetchesAbandoned++;
    this._endFetch(sparqlStat);
    if (this.statusTextStore) return this.statusTextStore.set(this.simpleTextStatus());
  }

  fetchCompleted (sparqlStat) {
    this.fetchesCompleted++;
    this._endFetch(sparqlStat);
    if (this.statusTextStore) return this.statusTextStore.set(this.simpleTextStatus());
  }

  _endFetch(sparqlStat) {
    const response = sparqlStat.getLastFetchResponse();
    if (response) {
      if (!this.responseCodes[response.status]) 
        this.responseCodes[response.status] = 1;
      else 
        this.responseCodes[response.status]++;

      if (sparqlStat.getFetchStatus === fetchStatus.BAD_RESPONSE) this.fetchBadResponses++;
    }

    const error = sparqlStat.getLastFetchError();
    if (error) {
      const caller = sparqlStat.getLastFetchErrorCaller();
      if (!this.abandonCallers[caller]) 
        this.abandonCallers[caller] = 1;
      else
        this.abandonCallers[caller]++;

      this.abandonErrors.push({caller: caller, error: error, response: response});
    }
  }

    dump () {
    let stats ='DMP ==== fetchMonitor Stats Dump ====';
    stats += '\nDMP Fetches:';
    stats += '\nDMP  started:    ' + this.fetchesStarted;
    stats += '\nDMP  consumed:   ' + this.fetchesCompleted;
    stats += '\nDMP  abandoned:  ' + this.fetchesAbandoned;
    stats += '\nDMP  incomplete: ' + this.fetchesOutstanding();
    stats += '\nDMP ';
    stats += '\nDMP Response codes:';
    this.responseCodes.forEach((count, code) => {
      stats += '\nDMP ' + code + ': ' + count;
    });
    console.log(stats);

    this.abandonErrors.forEach((error) => {
      console.log('\nDMP caller: ' + error.caller);
      console.log(' response/error:');
      // console.dir(error.response);
      // console.dir(error.error);
    });
    // console.log('DMP SparqlStats:');
    // console.dir(this.sparqlStats);
  }
}

export class SparqlStat extends SourceResult {
  constructor (config, fetchMonitor) {
    super(null); // SparqlStat has source URI in config, does not use a SourceInterface
    this.fetchMonitor = fetchMonitor; // Generates status text and helps testing and development

    this.config = config;
    this.statusText = '-statusText';  // A string that should never be seen.
    this.sourceResultStore = writable(undefined);
    this.statusTextStore = writable(this.statusText);
    this.disableNotify = true;
    this.useStreams = false;  // Disabling streams allows tabulator UI to display response body
                              // as a tooltip but increases memory use and slows performance
  }

  prepareForUpdate () {
    this.errorDescription = undefined;
  }

  getResultTextForError () {
    let resultTextForError;
    let errorDesc = this.getErrorDescription();
    if (errorDesc) {
      if (errorDesc.indexOf('\n') > 0) errorDesc = errorDesc.substring(0, errorDesc.indexOf('\n'));
      if (errorDesc.indexOf(':') > 0) errorDesc = errorDesc.substring(errorDesc.indexOf(':') + 1);
      resultTextForError = 'error: ' + errorDesc.substring(0, 20);
    } else if (this.isError) {
      console.warning('fetch() error flagged without SparqlStat.errorDescription');
      resultTextForError = 'error';
    }
    return resultTextForError;
  }

  // Short summary of last error for UI
  getErrorDescription () {
    const response = this.getLastFetchResponse();

    let description = this.errorDescription;
    if ((description === undefined || description.startsWith('DBG')) && 
        response && response.status >= 400) {

        description = response.errorText ? response.errorText : '';
        const responseStatusDescription = response.status + ' ' + response.statusText;
        if (!description.startsWith(responseStatusDescription))
          description = responseStatusDescription + '\n' + description;
        
        this.errorDescription = description;
      }
    else
      description = this.errorDescription;

    return description;
  }

  updateSparqlStat () {
    console.log('SparqlStat.updateSparqlStat() - ERROR - not implemented in subclass ' + this.constructor.name);
    this.prepareForUpdate();
  }
}

/** Specialist class to report if the query succeeds
 * 
 */

export class SparqlEndpointReportSuccess extends SparqlStat {
  constructor (config, fetchMonitor) {
    super(config, fetchMonitor);
    console.log('NEW SparqlEndpointReportSuccess has config.source.endpoint: ' + this.config.source.endpoint);
    this.serviceInfo = {
      version: '-',
    };

    const self = this;
    function _handleResponse (responseOrErrorObject) {
      if (!responseOrErrorObject) {
        self.setResultText('-');
        return;
      }

      // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      // console.log('self.config.source.endpoint: ' + self.config.source.endpoint);
      // console.log('SparqlEndpointReportSuccess._handleResponse()');
      // console.log(self);
      // console.dir(self);console.dir(responseOrErrorObject);
      // console.log('fetch status; ' + self.getFetchStatus());
      // console.log('DATA MODEL:');console.dir(self.jsonModel);
        
      let response;
      let error;
      if (responseOrErrorObject) { 
        response = responseOrErrorObject.response;
        error = responseOrErrorObject.error;
      }

      if (error) {
        console.log('TODO: ' + this.constructor.name + '_handleResponse()\nTODO url: ' + 
          (response ? response.url : '') + 
          '\nTODO: error: ' + error + 
          '\nTODO: response object: ');
          // console.dir(response);
      }

      let success = false;
      let unknownResult = response && response.status >= 400 ? 'error ' + response.status : undefined; // Errors  we haven't handled as 'unknown' result
      
      // Error code ref: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_errors
      if (unknownResult && response.status == 400 /*bad request*/) {
        unknownResult = undefined; // Unsupported query means result is known (success is false)
      } else  if (unknownResult && response.statusCode == 408 /*request timeout*/) {
        // Query not successful
        unknownResult = 'timeout';
      } else if (self.getFetchStatus() === fetchStatus.FAILED) {
        // The fetch failed without a response (e.g. blocked by CORS)
        unknownResult = 'unknown';
      } else if (self.getFetchStatus() === fetchStatus.COMPLETE) {
        // The fetch completed but the response was not understood (regarded as success)
        success = true;
      } else if (self.getFetchStatus() === fetchStatus.RESPONSE) {
        // The fetch completed but the response was not consumed (regarded as success)
        self.consumeFetchResponse(true);
        success = true;
      } else if (self.getFetchStatus() === fetchStatus.BAD_RESPONSE) {
        // The fetch completed but the response was not appropriate, so we fail
        success = false;
      }

      // Default result summary is 'yes' or 'no'
      let resultText = unknownResult ? unknownResult : (success ? 'yes' : 'no');
      let resultTextForError = self.getResultTextForError();
      if (resultTextForError) resultText = resultTextForError;

      // Checking for response content type is a yes/no status
      if (success && self.config.matchContent && self.config.matchContent !== self.responseTypeAbbrev) {
        success = false;
        resultText = 'no: got ';
        self.errorDescription = 'Unexpected response type ' + self.responseTypeAbbrev + ':\n' + self.responseText;
      } 

      self.setResultText(resultText, !success);
    }

    this.unsubscribe = this.responseStore.subscribe(_handleResponse);
  }

  updateSparqlStat () {
    console.log('SparqlEndpointReportSuccess.updateSparqlStat()');
    this.prepareForUpdate();
    if (this.config.query.trim().length)
      this.loadSparqlQuery(this.sourceResultStore, undefined, this.config.source.endpoint, this.config.query, this.config.options)
  }
}

/** Specialist class to determine SPARQL version and capabilities
 * 
 * This stat can't react to the response like SparqlEndpointReportSuccess
 * because the sourceResult and jsonModel are updated asynchronously and
 * will not be ready. So we handle update of the sourceResultStore.
 */

export class SparqlEndpointStat extends SparqlStat {
  constructor (config, fetchMonitor) {
    super(config, fetchMonitor);
    console.log('NEW SparqlEndpointStat has config.source.endpoint: ' + this.config.source.endpoint);
    this.serviceInfo = {
      version: '-',
    };

    const self = this;
    function _handleResponse (responseOrErrorObject) {
      if (!responseOrErrorObject) {
        self.setResultText('-');
        return;
      }

      // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      // console.log('self.config.source.endpoint: ' + self.config.source.endpoint);
      // console.log('SparqlEndpointStat._handleResponse()'); console.dir(self);console.dir(responseOrErrorObject);
      // console.log('fetch status; ' + self.getFetchStatus());
      // console.log('DATA MODEL:');console.dir(self.jsonModel);

      let response;
      let error;
      if (responseOrErrorObject) { 
        response = responseOrErrorObject.response;
        error = responseOrErrorObject.error;
      }

      // Error code ref: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_errors

      self.serviceInfo = { version: '1.0 (inferred)' };  // Default unless the result is not valid
      let unknownResult;  // When set we can't determine the outcome and this holds an explanatory
      if (!response) {
        // The fetch failed without a response (e.g. blocked by CORS)
        const errorText = self.getResultTextForError();
        unknownResult = 'unknown' + (errorText ? ': ' + errorText : '');
      } else {
        unknownResult = response.status >= 400 ? 'error ' + response.status : undefined; // Errors  we haven't handled as 'unknown' result

        if (unknownResult && response.status == 400 /*bad request*/) {
          unknownResult = undefined; // Unsupported query means result is known (success is false)
        } else  if (unknownResult && response.status == 408 /*request timeout*/) {
          // Query not successful
          unknownResult = 'timeout';
        }
      }
      if (unknownResult) self.serviceInfo = { version: unknownResult, }
      
      // Result can be determined
      if (unknownResult === undefined) {
        if (self.jsonModel) {
          // Request for service description worked suggests v1.1 but service
          // descriptions are not reliable so we don't trust/use what it says
          const dataset = self.jsonModel.values;
          // console.log('serviceInfo dataset:'); console.dir(dataset);
          // TODO: could extract info from service description (dataset) here
          self.serviceInfo = {
            version: '1.1 (inferred)',
          };
        } else if (self.getFetchStatus() === fetchStatus.COMPLETE) {
          // The fetch completed but the response was not understood
          self.consumeFetchResponse(true);
          console.log('Unable to obtain service description');
          self.serviceInfo = {
            version: '1.0 (inferred)',
          };      
        } else if (self.getFetchStatus() === fetchStatus.RESPONSE) {
          // The fetch completed but the response was not consumed
          self.consumeFetchResponse(true);
          console.log('Unable to obtain service description');
          self.serviceInfo = {
            version: '1.0 (inferred)',
          };      
        }
      }
  
      let resultText = self.serviceInfo.version;
      self.setResultText(resultText, unknownResult !== undefined);
    }

    this.unsubscribe = this.responseStore.subscribe(_handleResponse);
  }

  updateSparqlStat () {
    console.log('SparqlEndpointStat.updateSparqlStat()');
    this.prepareForUpdate();
    const options = {
      headers: {
        'Accept': 'text/turtle',
      }
    }
    this.loadUri(this.sourceResultStore, undefined, this.config.source.endpoint, options);
  }
}

/** Get data from website to decorate output (e.g. with favicon and title)
 * 
 */
const {getMetadata} = require('page-metadata-parser');
const domino = require('domino');

export class StatWebsite extends SparqlStat {
  constructor (config, fetchMonitor) {
    super(config, fetchMonitor);
    console.log('NEW SparqlStatWebsite has config.source.endpoint: ' + this.config.source.endpoint);
    this.setResultText(this.makeWebsiteName() + ' '); // Add a space so updateSparqlStat() will set different string
  }

  async updateSparqlStat () {
    console.log('SparqlStatWebsite.updateSparqlStat()');
    this.prepareForUpdate();
    const url = this.config.source.endpoint;
    fetch(url)
    .then(response => 
      {response.text()}   // This works for debug and production builds
      // response.text()  // This works for debug, but the production build gives this error:
      //
      //   bundle.js:28 Uncaught (in promise) TypeError: Right-hand side of 'instanceof' is not an object
      // at dt (bundle.js:28)
      // at ct (bundle.js:28)
      // at Jn (bundle.js:28)
      // at Jn (bundle.js:28)
      // at Kn (bundle.js:28)
      // at we (bundle.js:28)
      // at Ie.insertToken (bundle.js:28)
      // at nt (bundle.js:28)
      // at sn (bundle.js:28)
      // at Ue (bundle.js:28)
    )
    .then(html => {
      const doc = domino.createWindow(html).document;
      const metadata = getMetadata(doc, url);
      // console.log('METADATA TEST: ' + url);console.dir(metadata);
        
      if (metadata.icon) this.siteIconUrl = metadata.icon;
      this.setResultText(this.makeWebsiteName());
    }).catch(e => {
      console.log('SparqlStatWebsite.updateSparqlStat() error:');
      console.log(e);
      // console.dir(e);   
    });
  }
  
  makeWebsiteName () {
    let websiteName = this.config.source.name;
    
    if (!websiteName) {
      websiteName = this.config.source.endpoint;
      if (websiteName[websiteName.length-1] === '/') websiteName = websiteName.substring(0, websiteName.length-1);

      if (websiteName.indexOf('//') > 0) 
        websiteName = websiteName.substring(websiteName.indexOf('//') + 2);
      if (websiteName.indexOf('/') > 0)
        websiteName = websiteName.substring(0, websiteName.indexOf('/'));
    }

    return websiteName;
  }
}
// TODO: replace fixed interfaces with an initial set
// TODO: change uiClass to String and use a 'factory' so I can serialise (research ways to serialise first)
const testInterfaces = [
  // Test UIs
  {uiClass: WebSourceTabulatorUI, shortName: "rdf-source-tabulator", description: "Tabulate SPARQL Endpoints", options: {}},
  {uiClass: WebQueryUI, shortName: "rdf-query-sparql", description: "Query Semantic Data Stores", options: {}},
  {uiClass: WebUI, shortName: "test-dbpedia-cnut", description: "Test Cnut dbPedia SPARQL Query", options: {fixedUri: 'http://dbpedia.org/sparql/?query=PREFIX+dbo%3A+<http%3A%2F%2Fdbpedia.org%2Fontology%2F>%0D%0APREFIX+dbpedia2%3A+<http%3A%2F%2Fdbpedia.org%2Fproperty%2F>%0D%0ACONSTRUCT+{%0D%0A++%3Fsubject+rdf%3Atype+foaf%3APerson+.%0D%0A++%3Fsubject+rdf%3Atype+%3Ftypes+.%0D%0A++%3Fsubject+rdfs%3Alabel+%3Flabel+.%0D%0A++%3Fsubject+foaf%3AgivenName+%3FgivenName+.%0D%0A++%3Fsubject+foaf%3Asurname+%3Fsurname+.%0D%0A++%3Fsubject+foaf%3Agender+%3Fgender+.%0D%0A++%3Fsubject+dbo%3AbirthDate+%3FbirthDate+.%0D%0A++%3Fsubject+dbo%3AdeathDate+%3FdeathDate+.%0D%0A++%3Fsubject+foaf%3Ahomepage+%3Fhomepage+.%0D%0A++%3Fsubject+dbpedia2%3Aoccupation+%3Foccupation+.%0D%0A++%3Fsubject+foaf%3Adepiction+%3Fdepiction+.%0D%0A++%3Fsubject+dbo%3Athumbnail+%3Fthumbnail+.%0D%0A++%3Fsubject+dbo%3Achild+%3Fchild+.%0D%0A++%3Fsubject+dbo%3Aparent+%3Fparent+.%0D%0A++%3Fsubject+dbo%3Aspouse+%3Fspouse+.%0D%0A++%3Fsubject+foaf%3Agender+%3Fgender+.%0D%0A++%3FpersonReferringToParent+dbo%3Aparent+%3Fsubject+.%0D%0A++%3FpersonReferringToChild+dbo%3Achild+%3Fsubject+.%0D%0A++%3FpersonReferringToSpouse+dbo%3Aspouse+%3Fsubject+.%0D%0A++%3Fsubject+rdfs%3Acomment+%3Fcomment+.%0D%0A}%0D%0AWHERE+{%0D%0A++{%0D%0A%09%3Fsubject+rdf%3Atype+foaf%3APerson+.%0D%0A%09FILTER+(+%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FCnut_the_Great>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FSigrid_the_Haughty>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FEmma_of_Normandy>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FHarthacnut>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FGunhilda_of_Denmark>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2F%25C3%2586lfgifu_of_Northampton>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FHarold_Harefoot>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FGunhild_of_Wenden>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FEmma_of_Normandy>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2F%25C3%2586lfgifu_of_Northampton>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FSvein_Knutsson>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FThurbrand_the_Hold>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2F%25C5%259Awi%25C4%2599tos%25C5%2582awa>+||%0D%0A%09++%3Fsubject+%3D+<http%3A%2F%2Fdbpedia.org%2Fresource%2FSweyn_Forkbeard>%0D%0A%09)%0D%0A%0D%0A%09OPTIONAL+{+%3Fsubject+rdf%3Atype+%3Ftypes+.+%0D%0A%09++FILTER(+%3Ftypes+%3D+<http%3A%2F%2Fdbpedia.org%2Fclass%2Fyago%2FAristocrat109807754>+||+%3Ftypes+%3D+<http%3A%2F%2Fdbpedia.org%2Fclass%2Fyago%2FRuler110541229>+)%0D%0A%09}%0D%0A%09OPTIONAL+{+%3Fsubject+rdfs%3Alabel+%3Flabel+.+FILTER+langMatches(+lang(%3Flabel)%2C+"en"+)+}%0D%0A%09OPTIONAL+{+%3Fsubject+foaf%3AgivenName+%3FgivenName.+FILTER+langMatches(+lang(%3FgivenName)%2C+"en"+)+}%0D%0A%09OPTIONAL+{+%3Fsubject+foaf%3Asurname+%3Fsurname+.+FILTER+langMatches(+lang(%3Fsurname)%2C+"en"+)+}%0D%0A%09OPTIONAL+{+%3Fsubject+foaf%3Agender+%3Fgender+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+dbo%3AbirthDate+%3FbirthDate+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+dbo%3AdeathDate+%3FdeathDate+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+foaf%3Ahomepage+%3Fhomepage+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+dbpedia2%3Aoccupation+%3Foccupation+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+foaf%3Adepiction+%3Fdepiction+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+dbo%3Athumbnail+%3Fthumbnail+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+dbo%3Achild+%3Fchild+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+dbo%3Aparent+%3Fparent+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+dbo%3Aspouse+%3Fspouse+.+}%0D%0A%09OPTIONAL+{+%3FpersonReferringToParent+dbo%3Aparent+%3Fsubject+.+}%0D%0A%09OPTIONAL+{+%3FpersonReferringToChild+dbo%3Achild+%3Fsubject+.+}%0D%0A%09OPTIONAL+{+%3FpersonReferringToSpouse+dbo%3Aspouse+%3Fsubject+.+}%0D%0A%09OPTIONAL+{+%3Fsubject+rdfs%3Acomment+%3Fcomment+.+%0D%0A%09++FILTER+langMatches(+lang(%3Fcomment)%2C+"en"+)%0D%0A%09}%0D%0A++}%0D%0A}'}},
  {uiClass: WebUI, shortName: "test-web-csv", description: "Test WHO latest CSV data (Covid19 total_deaths.csv)", options: {fixedUri: 'https://covid.ourworldindata.org/data/ecdc/total_deaths.csv'}},
  {uiClass: JsonUI, shortName: "json-test", description: "Test JSON (Les Miserables)", options: {}},
  {uiClass: TestRdfUI, shortName: "rdf-test", description: "Test RDF/Turtle file (LOD Cloud)", options: {}},
  // {uiClass: ManualUI, shortName:  "manual-test", description: "Manual (mrh)", options: {}},
  // {uiClass: GeneratorUI, shortName:  "generator-test", description: "Generator (mrh)", options: {}},

  // Application interface UIs
  {uiClass: WebSparqlUI, shortName: "rdf-sparql", description: "SPARQL Query", options: {}},
  {uiClass: WebUI, shortName: "rdf-ldp", description: "Web resource (LDP RDF/Turtle, CSV file)", options: {}},
  {uiClass: FileUI, shortName: "file", description: "Local file (RDF/Turtle, CSV)", options: {}}, 
  {uiClass: TestCsvUI, shortName: "test-csv", description: "Test local CSV file (WHO Covid19 total_cases.csv)", options: {fixedFile: '~/visualisation/datasets/covid19/total_cases.csv'}},
 ];

