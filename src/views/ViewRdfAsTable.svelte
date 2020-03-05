<!-- A tabular view for an RDF Dataset 
-->

<script>
import SvelteTable from 'svelte-table';

import {resultDataStore} from "../stores.js";
import {modelFormats} from '../modelTypes.js';
import {VMTable} from '../viewmodels/viewModel.js';

let rows = [];
let columns = [
  {
    key: "Subject",
    title: "Subject",
    value: v => v.Subject,
    sortable: true,
    filterValue: v => v.Subject,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.Subject)) {
          filterMap.set(row.Subject);
          filterArray.push({name: row.Subject, value: row.Subject});
        }
      });
      // filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
  },
  {
    key: "Predicate",
    title: "Predicate",
    value: v => v.Predicate,
    sortable: true,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.Predicate)) {
          filterMap.set(row.Predicate);
          filterArray.push({name: row.Predicate, value: row.Predicate});
        }
      });
      // filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
  },
  {
    key: "Object",
    title: "Object",
    value: v => v.Object,
    sortable: true,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.Object)) {
          filterMap.set(row.Object);
          filterArray.push({name: row.Object, value: row.Object});
        }
      });
      // filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
  },
  {
    key: "Object Type",
    title: "Object Type",
    value: v => v.ObjectType,
    sortable: true,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.ObjectType)) {
          filterMap.set(row.ObjectType);
          filterArray.push({name: row.ObjectType, value: row.ObjectType});
        }
      });
      filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
  }
];

// NEXT>>> do this and 
// - have each model list what it can consume and what it can generate
// - model offers a set/subset of output modelFormats given an input modelFormat
// - ViewModel: provide consume functions that accepts an outputFormat param

// Available ViewModel subclasses per SourceResults type
// TODO: construct this dynamically using SourceInterface.js and ViewModel.js helpers
// TODO: offer choice of view model type where more than one is available for the current SourceResult
const availableViewModels = new Map([
  [modelFormats.RAW_GRAPH_RDFDATASET, [VMTable]],
]);

// Active view models by SourceResult type
const resultsModelMap = new Map;  // Map of SourceResults types to a ViewModel (that consumes the result type)

const unsubscribe = resultDataStore.subscribe(rds => {
  console.log('ViewRdfAsTable rds update:');
  console.dir(rds);
  if (rds === undefined || rds === 0) {return;}

  try {
    let resultType = rds.getModelFormat();
    let viewModel = resultsModelMap.get(resultType);
    if (viewModel === undefined) {
      let modelClass = availableViewModels.get(resultType)[0]; 
      viewModel = new modelClass;   // TODO: later handle multiple models per SourceResultType
      resultsModelMap.set(resultType, viewModel);
    }

    // Generate/update view model
    console.dir(viewModel);
    if (viewModel !== undefined) {
      const table = viewModel.consumeSourceResult(rds);
      rows = table.rows;
      columns = columns;
    }
  } catch(e) {
    console.log('ViewRdfAsTable - failed to consume results (SourceResult)');
  }
});

</script>
<style>
.main { 
  background: rgba(134, 212, 147, 0.959);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
</style>

<div class="main">
<h2>&lt;ViewRdfAsTableUI&gt;</h2>
<p>
TODO: add ontologies<br/>
TODO: maybe allow text entry on filters<br/>
TODO: clear views (including table) on start of query<br/>
</p>
<p>Triples: {$resultDataStore && $resultDataStore.getRdfDataset() ? $resultDataStore.getRdfDataset().size : 'none'}<br/>
<br/>
<SvelteTable columns="{columns}" rows="{rows}"></SvelteTable>
</div>