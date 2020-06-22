<!-- A view for tabular data (vm-tabular-json) 
-->

<script>
import {writable} from 'svelte/store';
import SvelteTable from 'svelte-table';

import TableFashionUI from './TableFashionUI.svelte'

import {resultDataStore,
        filterFieldsStore,
        tableViewModelStore as viewModelProxyStore} from "../stores.js";
import {modelFormats} from '../modelFormats.js';

export let activeModelsByFormat;

const emptyTable = {rows: [], headings: []};

$: viewModel = $viewModelProxyStore && $viewModelProxyStore.viewModel ? $viewModelProxyStore.viewModel : undefined;
$: table = initialiseTable($activeModelsByFormat);
$: table = updateTable(viewModel);
$: rows = table.rows;
$: headings = table.headings;
$: allFields = viewModel ? viewModel.getJsonModelFields() : [];

function initialiseTable (activeModelsByFormat) {
  let allModels = activeModelsByFormat.get(modelFormats.VM_TABULAR_JSON);
  if (allModels === undefined) return emptyTable;

  // TODO how to handle multiple compatible models? (We visualise only the first)
  viewModel = allModels[0]; 
  $viewModelProxyStore = {viewModel: viewModel};
  return updateTable(viewModel);
}

function updateTable (viewModel) {
  if (viewModel === undefined) return emptyTable;

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

$: columns = makeColumns(rows, headings, viewModel, $filterFieldsStore);

function makeColumns(rows, headings, viewModel, filterFields) {
  console.log('makeColumns()..filterFields: ' + filterFields);
  let columns = [];
  let filterOptions = [];
  let fieldsFilter = [];
  let filteredHeadings = headings;

  if (filterFields && viewModel && viewModel.fashion) {
    filteredHeadings = [...headings];
    fieldsFilter = viewModel.fashion.getFieldsWithVisibility(true, false);
    console.log('fieldsFilter:');console.dir(fieldsFilter);
    sanitiseTags(filteredHeadings, fieldsFilter, true);
    const xAxis = viewModel.fashion.getFieldsWithProperty('x-axis', true, false);
    if (xAxis[0]) {
      console.log('filteredHeadings:');console.dir(filteredHeadings);
      console.log('splicing xAxis: ', xAxis[0]);
      filteredHeadings.splice(0, 0, xAxis[0]);
    }

    console.log('filteredHeadings:');console.dir(filteredHeadings);
  }

  filteredHeadings.forEach((heading) => {
    let i = headings.indexOf(heading);
    if (i >= 0) columns.push({
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

/** update an array of strings using an array of acceptable values
 * 
 * @param {String[]}  tags - tag names to sanitise
 * @param {String[]}  allowedTags - list of allowed tag names
 * @param {Boolean}   allowAnyCase - if true, match names regardless of case but use the version from allowedTags
 */
function sanitiseTags (tags, allowedTags, allowAllCase) {
  let matchAllTags = allowedTags;
  if (allowAllCase) {
    matchAllTags = [];
    allowedTags.forEach(tag => matchAllTags.push(tag.toLowerCase()));
  }

  for (let i = 0 ; i < tags.length ; ) {
    const tag = tags[i];
    if (!allowAllCase) {
      if (!matchAllTags.includes(tag)) {
        tags.splice(i, 1);
      } else {
        ++i;
      }
    } else {
      const matchedIndex = matchAllTags.indexOf(tag.toLowerCase());
      if (matchedIndex >= 0) {
        tags.splice(i, 1, allowedTags[matchedIndex]); // Replace with allFields value
        ++i;
      } else {
          tags.splice(i, 1); // Remove non-matched tag
      }
    } 
  }
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

.disable {
  enabled: false;
}
</style>

<div class={window.debugView ? "main" : ""}>
  {#if window.debugView}
  <p>&lt;ViewTable&gt; is a prototype tabular view with sorting and filtering.
  </p>
  <p>TODO: NOTE this is using a local fork of svelte-table<br/>
  TODO: maybe make svelte-table allow text entry on filters<br/>
  </p>
  {/if}

  <TableFashionUI disabled=true {viewModelProxyStore} {filterFieldsStore}/>
  <SvelteTable {columns} {rows}></SvelteTable>
</div>