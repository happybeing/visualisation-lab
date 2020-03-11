/** Data model formats offered by SourceResult and ViewModel classes
 * 
 * See VisLab JSON ViewModel Specification:
 * https://github.com/theWebalyst/visualisation-lab/wiki/JSON-ViewModel-Specification
 * 
 */

export const modelFormats = {
  // Meta types:
  UNDEFINED: 'undefined', // Used when no data, otherwise data should have a format

  // Types for consumption by a SourceResult:
  RAW_STREAM_CSV: 'raw-stream-csv',
  RAW_STREAM_JSON: 'raw-stream-json',
  RAW_STREAM_RDF: 'raw-stream-rdf',
  RAW_TEXT_TURTLE: 'raw-text-turtle',
  RAW_JSON_ARRAY: 'raw-json-array',

  // Types for SourceResult output / ViewModel input:
  RAW_RDFDATASET: 'raw-rdfdataset',

  // Types for ViewModel output:
  VM_TABULAR_JSON: 'vm-tabular-json',
  VM_GRAPH_JSON: 'vm-graph-json',
  VM_TREE_JSON: 'vm-tree-json',
  VM_SERIES_JSON: 'vm-series-json',
  VM_GEO_JSON: 'vm-geo-json',
};

export const modelFormatsMap = new Map([
  [modelFormats.RAW_RDFDATASET, {friendlyName: 'RDF/JS Dataset', categoryName: 'RDF'}],
]);

