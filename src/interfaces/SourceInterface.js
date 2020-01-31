// Base class for managing a data source
//
// TODO: move subclasses to separate files and export from this file
// TODO: remove all console.dir

class SourceInterface {
  constructor (shortName, description, uiComponent) {
    console.warn('SourceInterface - to be implemented');
    this.shortName = shortName;
    this.description = description;
    this.uiComponent = uiComponent;

    this.sourceResult = undefined;  // A subclass of SourceResult
  }
  
  // Base interface:
  setSourceResult (sourceResult) {this.sourceResult = sourceResult;}
  getSourceResult () {return this.sourceResult;}
  // Subclass can define it's own getter with typed name for clarity, e.g getResultRdfDataset()

  // TODO: maintain named, id'd list of all SourceInterface objects for SourceUI
  // TODO: start with four fixed interfaces: 
  // TODO:  - RDF (fixed LDP access)
  // TODO:  - File (a fixed file)
  // TODO:  - Manual (fixed user)
  // TODO:  - Generated (ngraph)
  // TODO: add serialisation (file save/load and incorporate in app-wide project/template serialisation)
  // TODO: add UI for create, copy and edit SourceInterface (and in each subclass UI component)

}


export class SourceInterfaceManager {
  constructor (interfaceDefinitions) {
    console.warn('SourceInterfaceManager - to be implemented');
    
    this.initialiseInterfaces(interfaceDefinitions !== undefined ? interfaceDefinitions : testInterfaces);
  }
  
  ////////////////////////////////
  
  initialiseInterfaces (interfaceDefinitions) {
    console.log('SourceInterfaceManager.initialiseInterfaces()...');
    this.sourceInterfaces = new Map;
    
    interfaceDefinitions.forEach(def => {
      try {
        let newInterface = new def.iClass(def.shortName, def.description);
        this.sourceInterfaces.set(def.shortName, newInterface);
        console.dir(newInterface);
      } catch(e) {console.warn(e);}
    });    
  }
}

class SourceResult {
  constructor (sourceInterface) {
    console.warn('SourceResult - to be implemented');
    this.sourceInterface = sourceInterface;
  }

  getInterface () {return this.sourceInterface;}
  
  // Base interface:
  getSourceResultType () {throw Error('SourceResult - no SourceResult type');}
}

// TODO: extract generic web stuff from RdfInterface
class WebInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description);
    console.warn('WebInterface - to be implemented');
  }
}

import RdfUI from "./RdfUI.svelte";
const ttlReader = require('@graphy/content.ttl.read');
const RdfDataset = require('@graphy/memory.dataset.fast');

export class RdfSourceResult extends SourceResult {
  constructor (rdfInterface, rdfDataset) {
    super(rdfInterface);
    this.rdfDataset = rdfDataset;
  }

  getSourceResultType () { return sourceResultTypes.RDFJS_DATASET;}
  getRdfDataset () {return this.rdfDataset;}
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

fetch('http://www.w3.org/2000/01/rdf-schema')

// TODO: LDP
// TODO: SPARQL
class RdfInterface extends SourceInterface {
  constructor (shortName, description, uiComponent) {
    super(shortName, description, uiComponent ? uiComponent : RdfUI);
    console.warn('RdfInterface - to be implemented');
  }

  // import fetch from '@rdfjs/fetch';
  
  // const label = 'http://www.w3.org/2000/01/rdf-schema#label'
  
  // fetch('http://www.w3.org/2000/01/rdf-schema')
  //   .then(res => res.dataset())
  //   .then(dataset => {
  //     for (const quad of dataset) {
  //       if (quad.predicate.value === label) {
  //         console.log(`${quad.subject.value}: ${quad.object.value}`)
  //       }
  //     }
  //   }).catch(err => console.error(err));
  
  consumeRdfFile (sourceResultStore, file) {
    console.log('RdfInterface.consumeRdfFile()');
    console.dir(file);
    this.setSourceResult(undefined);
    this.sourceResultStore = sourceResultStore;

    try {
      const rdfDataset = RdfDataset();
      const self = this;
      const graphyReader = ttlReader({
        data (y_quad) {
          console.log(JSON.stringify(y_quad));
          rdfDataset.add(y_quad);
          console.log('rdfDataset size: ', rdfDataset.size);
        },
        eof () {
          console.log('done!');
          console.log('rdfDataset size: ', rdfDataset.size);
          let sourceResult = new RdfSourceResult(this, rdfDataset);
          self.setSourceResult(sourceResult);
          self.sourceResultStore.update(v => sourceResult);
          
          console.log('loadTestRdf() results: ');
          console.dir(self.$sourceResultStore);
          }
        });
        readableStreamToGraphyReader(file.stream(), graphyReader);

      // The above code allows me to use whatwg (browser) streams with graphy.
      // When graphy adds whatwg streams the following can be used instead (issue #20).
      // let rdfDataset = RdfDataset(); 
      // let self = this;
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
    } catch(e) {console.error(e);}
  }

  consumeRdfTextTtl (sourceResultStore, textTtl) {
    this.setSourceResult(undefined);
    this.sourceResultStore = sourceResultStore;

    try {
      let rdfDataset = RdfDataset();
      let self = this;
      ttlReader(textTtl, {
        data(y_quad) {
          console.log(JSON.stringify(y_quad));
          rdfDataset.add(y_quad);
          console.log('rdfDataset size: ', rdfDataset.size);
        },
  
        eof(h_prefixes) {
          console.log('done!');
          console.log('rdfDataset size: ', rdfDataset.size);
          let sourceResult = new RdfSourceResult(this, rdfDataset);
          self.setSourceResult(sourceResult);
          self.sourceResultStore.update(v => sourceResult);

          console.log('consumeRdfTextTtl() results: ');
          console.dir(self.$sourceResultStore);
        },
      })
    } catch (err) { console.error(err); } 

  }
}

// File system interface (for loading local files)
//
// Uses FileAPI: https://w3c.github.io/FileAPI
// Examples: https://www.javascripture.com/FileReader
//
import FileUI from "./FileUI.svelte";
class FileInterface extends RdfInterface {
  constructor (shortName, description, uiComponent) {
    super(shortName, description, uiComponent ? uiComponent : FileUI);
    console.warn('FileInterface - to be implemented');
  }
  // TODO: LATER: provide file selection with optional default file extensions (use 'options' in the interfaces list)

  /** Load and parse RDF files into a SourceResult store 
   * 
   * @param {Writeable<SourceResult>} sourceResultStore 
   * @param {FileList} fileList 
   */
  loadFiles(sourceResultStore, fileList) {
    console.log('FileInterface.loadFiles()');

    // TODO: load multiple files into same store
    // TODO: consider loading multiple files into separate stores/views
    const file = fileList[0]
    if (file !== undefined) {
      try {
        console.log('Loading ', file.size, ' bytes from ', file);
        this.consumeRdfFile(sourceResultStore, file);
      } catch(e) {
        console.warn('File load error');
        console.error(e);
      }
    } else {
      console.warn('No file selected.');
    }
  }
}


import JsonUI from "./JsonUI.svelte";
import lesMisData from '../data/data-les-miserables.js';

// TODO: JSON - initially just {nodes: [], links []}
export class JsonSourceResult extends SourceResult {
  constructor (jsonInterface, jsonResult) {
    super(jsonInterface);
    this.jsonResult = jsonResult;
  }

  getSourceResultType () { return sourceResultTypes.JSON_ARRAY;}
  getJsonResult () {return this.jsonResult;}
}

class JsonInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description, JsonUI);
    console.warn('JsonInterface - to be implemented');
  }

  loadTestJson (sourceResultStore) {
    let sourceResult = new JsonSourceResult(this, lesMisData);
    this.setSourceResult(sourceResult);
      sourceResultStore.update(v => sourceResult);
  }
}


// TODO: manual input interface
class ManualInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description);
    console.warn('ManualInterface - to be implemented');
  }

}

// TODO: auto-generator interface
class GeneratorInterface extends ManualInterface {
  constructor (shortName, description) {
    super(shortName, description);
    console.warn('GeneratorInterface - to be implemented');
  }
}

// TODO: replace fixed interfaces with an initial set
// TODO: change iClass to String and use a 'factory' so I can serialise (research ways to serialise first)
const testInterfaces = [
  // {className: "", shortName: "", description: "", options: {}},
  {iClass: RdfInterface, shortName: "ldp-test", description: "LDP (RDF/Turtle)", options: {}},
  {iClass: RdfInterface, shortName: "sparql-test", description: "SPARQL (RDF/Turtle) - TBD", options: {}},
  {iClass: JsonInterface, shortName: "json-test", description: "File (JSON)", options: {}},
  {iClass: ManualInterface, shortName:  "manual-test", description: "Manual (mrh)", options: {}},
  {iClass: GeneratorInterface, shortName:  "generator-test", description: "Generator (mrh)", options: {}},
    
  // Application interface UIs
  {iClass: FileInterface, shortName: "rdf-file", description: "Load from file (RDF/Turtle)", options: {}},
  ];
  
  // Source result types

export const sourceResultTypes = {
  RDFJS_DATASET: 'RDFJS_DATASET',
  JSON_ARRAY: 'JSON_ARRAY',
};

// const sourceResultDataTypeList = [
//   {resultType: RDFJS_DATASET, friendlyName: 'RDF/JS Dataset', resultClass: RdfSourceResult, categoryName: 'RDF'},
//   {resultType: JSON_ARRAY, friendlyName: 'JSON', resultClass: JsonSourceResult, categoryName: 'JSON'},
// ];
 
export const sourceResultTypeMap = new Map([
  [sourceResultTypes.RDFJS_DATASET, {friendlyName: 'RDF/JS Dataset', resultClass: RdfSourceResult, categoryName: 'RDF'}],
  [sourceResultTypes.JSON_ARRAY, {friendlyName: 'JSON', resultClass: JsonSourceResult, categoryName: 'JSON'}],
]);

