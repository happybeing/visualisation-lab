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

  // Base interface:
  getInterface () {return this.sourceInterface;}
}

// TODO: extract generic web stuff from RdfInterface
class WebInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description);
    console.warn('WebInterface - to be implemented');
  }
}

import RdfUI from "./RdfUI.svelte";
const readTtl = require('@graphy/content.ttl.read');
const RdfDataset = require('@graphy/memory.dataset.fast');
import lodCloudRdf from '../data/LODCloud_SPARQL_Endpoints.ttl';

class RdfSourceResult extends SourceResult {
  constructor (rdfInterface, rdfDataset) {
    super(rdfInterface);
    this.rdfDataset = rdfDataset;
  }

  getRdfDataset () {return this.rdfDataset;}
}

// TODO: LDP
// TODO: SPARQL
class RdfInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description, RdfUI);
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
  
  loadTestRdf (sourceResultStore) {
    this.setSourceResult(undefined);
    this.sourceResultStore = sourceResultStore;

    try {
      let rdfDataset = RdfDataset();
      let self = this;
      readTtl(lodCloudRdf, {
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

          console.log('loadTestRdf() results: ');
          console.dir(self.$sourceResultStore);
        },
      })
    } catch (err) { console.error(err); } 

  }
}

import JsonUI from "./JsonUI.svelte";

// TODO: JSON - initially just {nodes: [], links []}
class JsonInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description, JsonUI);
    console.warn('JsonInterface - to be implemented');
  }
}

// TODO: file system interface
class FileInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description);
    console.warn('FileInterface - to be implemented');
  }
  // TODO: NOW: just load a fixed local file system, passes to RdfInterface or JSON interface based on extension
  // TODO: LATER: provide file selection with optional default file exenstions
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
  ];
  