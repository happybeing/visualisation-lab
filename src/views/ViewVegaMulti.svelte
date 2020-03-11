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

const xSpec = ``;

const treeSpec = `{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "An example of Cartesian layouts for a node-link diagram of hierarchical data.",
  "width": 600,
  "height": 1600,
  "padding": 5,

  "signals": [
    {
      "name": "labels", "value": true,
      "bind": {"input": "checkbox"}
    },
    {
      "name": "layout", "value": "tidy",
      "bind": {"input": "radio", "options": ["tidy", "cluster"]}
    },
    {
      "name": "links", "value": "diagonal",
      "bind": {
        "input": "select",
        "options": ["line", "curve", "diagonal", "orthogonal"]
      }
    },
    {
      "name": "separation", "value": false,
      "bind": {"input": "checkbox"}
    }
  ],

  "data": [
    {
      "name": "tree",
      "values": {},
      "transform": [
        {
          "type": "stratify",
          "key": "index",
          "parentKey": "parent"
        },
        {
          "type": "tree",
          "method": {"signal": "layout"},
          "size": [{"signal": "height"}, {"signal": "width - 100"}],
          "separation": {"signal": "separation"},
          "as": ["y", "x", "depth", "children"]
        }
      ]
    },
    {
      "name": "links",
      "source": "tree",
      "transform": [
        { "type": "treelinks" },
        {
          "type": "linkpath",
          "orient": "horizontal",
          "shape": {"signal": "links"}
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "color",
      "type": "linear",
      "range": {"scheme": "magma"},
      "domain": {"data": "tree", "field": "depth"},
      "zero": true
    }
  ],

  "marks": [
    {
      "type": "path",
      "from": {"data": "links"},
      "encode": {
        "update": {
          "path": {"field": "path"},
          "stroke": {"value": "#ccc"}
        }
      }
    },
    {
      "type": "symbol",
      "from": {"data": "tree"},
      "encode": {
        "enter": {
          "size": {"value": 100},
          "stroke": {"value": "#fff"}
        },
        "update": {
          "x": {"field": "x"},
          "y": {"field": "y"},
          "fill": {"scale": "color", "field": "depth"}
        }
      }
    },
    {
      "type": "text",
      "from": {"data": "tree"},
      "encode": {
        "enter": {
          "text": {"field": "name"},
          "fontSize": {"value": 9},
          "baseline": {"value": "middle"}
        },
        "update": {
          "x": {"field": "x"},
          "y": {"field": "y"},
          "dx": {"signal": "datum.children ? -7 : 7"},
          "align": {"signal": "datum.children ? 'right' : 'left'"},
          "opacity": {"signal": "labels ? 1 : 0"}
        }
      }
    }
  ]
}`;

const testSchema = JSON.parse(treeSpec);

onMount(() => {

  // option 1: where the spec is a string
   embed("#vega-embed", testSchema, { actions: false }).catch(error =>
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

let viewModel;
$: updateTree($activeModelsByFormat);

function updateTree (activeModelsByFormat) {
  console.log('updateTree()...');
  let allModels = activeModelsByFormat.get(modelFormats.VM_TREE_JSON);
  if (allModels === undefined) return [];

  // TODO how to handle multiple compatible models? (We visualise only the first)
  viewModel = allModels[0];      
  const values = viewModel.getValues();
  testSchema.data.values = values;
  console.dir(testSchema);
  // console.dir(testSchema.data);
  embed("#vega-embed", testSchema, { actions: false }).catch(error =>
    console.log(error));
}

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