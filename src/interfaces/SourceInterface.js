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
  }
  
  // TODO: define base interface

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
  constructor () {
    console.warn('SourceResult - to be implemented');
  }
  // TODO: define base interface, or if none needed eliminate this class

}

// TODO: extract generic web stuff from RdfInterface
class WebInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description);
    console.warn('WebInterface - to be implemented');
  }
}

import RdfUI from "./RdfUI.svelte";

// TODO: LDP
// TODO: SPARQL
class RdfInterface extends SourceInterface {
  constructor (shortName, description) {
    super(shortName, description, RdfUI);
    console.warn('RdfInterface - to be implemented');
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
  