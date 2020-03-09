<!-- Map SourceResult to objects for visualisation 

Provides
- TODO: a UI defining filters to apply to SourceResults
- TODO: allows selection of a suitable view model (available for the active SourceResults subclass)
- TODO: filters the SourceResults subclass and generates chosen view model
- TODO: provides UI to select a View component which can visualise the active view model
-->

<script>
import {onMount} from 'svelte';

import FiltersUI from './FiltersUI.svelte'

import {modelFormats, modelTypeMap} from '../modelFormats.js';
import {VMGraph, availableViewModels} from './viewModel.js';

import ViewNetworkGraphCanvas from '../views/ViewNetworkGraphCanvas.svelte';
import ViewRdfAsTableUI from '../views/ViewRdfInSvelteTable.svelte';

import {resultDataStore, graph, activeViews} from "../stores.js";

let rdfViewModel;
let showViewDebug = false;

// Active view models by SourceResult type
const resultsModelMap = new Map;  // Map of SourceResults types to a ViewModel (that consumes the result type)

const unsubscribe = resultDataStore.subscribe(rds => {
  console.log('ViewModelUI rds update:');
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
      $graph = viewModel.consumeSourceResult(rds);
    }
  } catch(e) {
    console.log('ViewModelUI - failed to consume results (SourceResult)');
    console.error(e);
  }
});

onMount(() => {
  $activeViews = [ViewNetworkGraphCanvas, ViewRdfAsTableUI];
  $graph = {nodes: [], links: []};
  rdfViewModel = new VMGraph;
});

</script>
<style>
.main { 
  background: rgba(241, 203, 152, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
</style>

<div class="main">
<h2>&lt;ViewModelUI&gt;</h2>
<p>The ViewModelUI provides control over the view model, and 
provides filters that are applied to the model to show/hide 
elements in the View.</p>
<FiltersUI/>

<label>
  <input type=checkbox bind:checked={showViewDebug}>
  Show ViewModelUI debug
</label>

{#if showViewDebug}
  <h2>ViewUI debug...</h2>

  <h3>nodes</h3>
  <ul>
  {#each $graph.nodes as node}
  <li>{node.id}</li>
  {/each}
  </ul>
  <h3>links</h3>
  <ul>
  {#each $graph.links as link}
  <li>{JSON.stringify(link)}:<br/>{link.source} -&gt; {link.target}</li>
  {/each}
  </ul>
{/if}

</div>