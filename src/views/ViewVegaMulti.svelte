<!-- A generic Vega view for multiple Vega/Vega-Lite Schemas using Vega Embed 

TODO: - add multiple schemas, at least one for each Visual Model format
TODO: - allow selection of the schema from a drop down of pre-defined schemas
TODO: - ability to load additional schemas from file system
TODO: - think about useful schema tweaks to support (should UI for this be here or outside?)
-->

<script>
import {onMount} from 'svelte';
import {default as embed}  from 'vega-embed';

import {resultDataStore} from "../stores.js";
import {modelFormats} from '../modelFormats.js';
export let activeModelsByFormat;

// const testTreeSchema = {};

// import simpleChartSpec from './data/vega-simple-chart.js';

onMount(() => {
  const spec = `{
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "description": "Simple bar chart",
      "data": {
          "values": [
              {"x": "A", "y": 28}, {"x": "y", "B": 55}, {"x": "C", "y": 43},
              {"x": "D", "y": 91}, {"x": "E", "y": 81}, {"x": "F", "y": 53},
              {"x": "G", "y": 19}, {"x": "H", "y": 87}, {"x": "I", "y": 52}
          ]
      },
      "mark": "bar",
      "encoding": {
          "x": {"field": "x", "type": "ordinal"},
          "y": {"field": "y", "type": "quantitative"}
      }
    }`;

  // option 1: where the spec is a string
   embed("#vega-embed", JSON.parse(spec), { actions: false }).catch(error =>
     console.log(error)
   );

  // // option 2: js file
  //  embed("#vis2", simpleChartSpec, { actions: false }).catch(error =>
  //    console.log(error)
  //  );

  // // option 3: json file
  //  embed("#vis3", './force.vg.json', { actions: false }).catch(error =>
  //    console.log(error)
  //  );
});

// let viewModel;
// $: rows = updateTree($activeModelsByFormat);

// function updateTree (activeModelsByFormat) {
//   let allModels = activeModelsByFormat.get(modelFormats.VM_TREE_JSON);
//   if (allModels === undefined) return [];

//   // TODO how to handle multiple compatible models? (We visualise only the first)
//   viewModel = allModels[0];      
// // ???  return viewModel.getValues().rows;
// }

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