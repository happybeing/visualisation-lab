// Base class for managing a data source
//
// TODO: move subclasses to separate files and export from this file

class SourceInterface {
  constructor () {
    console.warn('SourceInterface - to be implemented');
  // TODO: define base interface
  }

    // TODO: maintain named, id'd list of all SourceInterface objects for SourceUI
    // TODO: start with four fixed interfaces: 
    // TODO:  - RDF (fixed LDP access)
    // TODO:  - File (a fixed file)
    // TODO:  - Manual (fixed user)
    // TODO:  - Generated (ngraph)
    // TODO: add serialisation (file save/load and incorporate in app-wide project/template serialisation)
    // TODO: add UI for create, copy and edit SourceInterface (and in each subclass UI component)

}

class SourceResult {
  constructor () {
    console.warn('SourceResult - to be implemented');
  }
  // TODO: define base interface, or if none needed eliminate this class

}

// TODO: extract generic web stuff from RdfInterface
class WebInterface extends SourceInterface {
  constructor () {
    console.warn('WebInterface - to be implemented');
  }
}

// TODO: LDP
// TODO: SPARQL
class RdfInterface extends SourceInterface {
  constructor () {
    console.warn('RdfInterface - to be implemented');
  }
}

// TODO: file system interface
class FileInterface extends SourceInterface {
  constructor () {
    console.warn('FileInterface - to be implemented');
  }
  // TODO: NOW: just load a fixed local file system
  // TODO: LATER: provide file selection with optional default file exenstions
}

// TODO: manual input interface
class ManualInterface extends SourceInterface {
  constructor () {
    console.warn('ManualInterface - to be implemented');
  }

}

// TODO: auto-generator interface
class GeneratorInterface extends ManualInterface {
  constructor () {
    console.warn('GeneratorInterface - to be implemented');
  }


}
