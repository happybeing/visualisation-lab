<!-- A tabular view for an RDF Dataset 
-->

<script>
import SvelteTable from 'svelte-table';

import {resultDataStore} from "../stores.js";
import {modelFormats} from '../modelFormats.js';
export let activeModelsByFormat;

let viewModel;
$: table = updateTable($activeModelsByFormat);
$: rows = table.rows;
$: headings = table.headings;

function updateTable (activeModelsByFormat) {
  let allModels = activeModelsByFormat.get(modelFormats.VM_TABULAR_JSON);
  if (allModels === undefined) return {rows: [], headings: []};

  // TODO how to handle multiple compatible models? (We visualise only the first)
  viewModel = allModels[0]; 
  let rows = viewModel.getJsonModelValues();
  let headings = viewModel.getJsonModel().header;

  if (!headings) {
    headings = rows[0];
    rows = rows.slice(1);
  }
  return {
      rows: rows, 
      headings: headings
    };
}

$: columns = makeColumns(rows, headings);

function makeColumns(rows, headings) {
  let columns = [];
  let filterOptions = []

  headings.forEach((heading, i) => {
    columns.push({
      key: heading,
      title: heading,
      value: v => v[i],
      sortable: true,
      filterValue: v => v[i],
      filterOptions: function(r) {
        let filterMap = new Map;
        let filterArray = [];
        r.forEach(row => {
          if (!filterMap.has(row[i])) {
            filterMap.set(row[i]);
            filterArray.push({name: row[i], value: row[i]});
          }
        });
        
        filterArray.sort((v1, v2) => {
          const n1 = Number(v1.value);
          const n2 = Number(v2.value);
          if (n1 !== undefined && n2 !== undefined) {
            if (n1 > n2) return 1;
            if (n1 < n2) return -1;
            return 0;
          } else
            return v1.value.localeCompare(v2.value);
        });
        return filterArray;
      },
    });
  });
  return columns;
}

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
<h2>&lt;ViewTable&gt;</h2>
<SvelteTable columns="{columns}" rows="{rows}"></SvelteTable>
<p>TODO: NOTE this is using a local fork of svelte-table<br/>
TODO: maybe make svelte-table allow text entry on filters<br/></p>
</div>