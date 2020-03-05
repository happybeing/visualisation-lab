/** Data model types offered by SourceResult and ViewModel classes
 * 
 * See VisLab JSON ViewModel Specification
 * 
 */

export const modelFormats = {
  // Types for SourceResult output / ViewModel input:
  RAW_GRAPH_RDFDATASET: 'raw-graph-rdfdataset',

  // Types for ViewModel output:
  VM_TABULAR_JSON: 'vm-tabular-json',
  VM_GRAPH_JSON: 'vm-graph-json',
  VM_TREE_JSON: 'vm-tree-json',
  VM_SERIES_JSON: 'vm-series-json',
  VM_GEO_JSON: 'vm-geo-json',
};

export const modelTypeMap = new Map([
  [modelFormats.RAW_GRAPH_RDFDATASET, {friendlyName: 'RDF/JS Dataset', categoryName: 'RDF'}],
]);

