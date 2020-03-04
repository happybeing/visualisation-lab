/** The set of data model types offered by SourceResult and ViewModel classes
 * 
 */

export const modelFormats = {
  RDFJS_DATASET: 'RDFJS_DATASET',
  JSON_ARRAY: 'JSON_ARRAY',
};

export const modelTypeMap = new Map([
  [modelFormats.RDFJS_DATASET, {friendlyName: 'RDF/JS Dataset', categoryName: 'RDF'}],
  [modelFormats.JSON_ARRAY, {friendlyName: 'JSON', categoryName: 'JSON'}],
]);

