<!-- A generic Vega view for multiple Vega/Vega-Lite Schemas using Vega Embed 

TODO: - add multiple schemas, at least one for each Visual Model format
TODO: - allow selection of the schema from a drop down of pre-defined schemas
TODO: - ability to load additional schemas from file system
TODO: - think about useful schema tweaks to support (should UI for this be here or outside?)
-->

<script>
import {onMount} from 'svelte';
import {resultDataStore} from "../stores.js";
import {modelFormats} from '../modelFormats.js';
export let activeModelsByFormat;

// let viewModel;
// $: rows = updateTree($activeModelsByFormat);

// function updateTree (activeModelsByFormat) {
//   let allModels = activeModelsByFormat.get(modelFormats.VM_TREE_JSON);
//   if (allModels === undefined) return [];

//   // TODO how to handle multiple compatible models? (We visualise only the first)
//   viewModel = allModels[0];      
// // ???  return viewModel.getValues().rows;
// }

onMount(() => {
});

</script>
<style>
.main { 
  background: rgba(174, 202, 127, 0.959);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
</style>

<div class="main">
<h2>&lt;ViewVegaMulti&gt;</h2>
<p>
</p>
<p>Triples: {$resultDataStore && $resultDataStore.getRdfDataset() ? $resultDataStore.getRdfDataset().size : 'none'}<br/>
<br/>
<div id='vega-embed'></div>
</div>