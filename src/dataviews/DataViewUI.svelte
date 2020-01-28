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

import {RdfDataView} from './DataView.js';

import {resultDataStore} from "../stores.js";
import {graph} from "../stores.js";

let rdfDataView;
let showViewDebug = false;

const unsubscribe = resultDataStore.subscribe(rds => {
  console.log('DataViewUI rds update:');
  console.dir(rds);

  // Generate/update view model
  console.dir(rdfDataView);
  if (rdfDataView !== undefined) {
    $graph = rdfDataView.rdfToVis(rds.getRdfDataset())
  }
});

onMount(() => {
  $graph = {nodes: [], links: []}
  rdfDataView = new RdfDataView;
});

</script>
<style>
.main { 
  background: rgba(241, 203, 152, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
</style>

<div class="main">
<h2>&lt;DataViewUI&gt;</h2>
<p>The DataViewUI provides control over the view model, and 
provides filters that are applied to the model to show/hide 
elements in the View.</p>
<FiltersUI/>

<label>
  <input type=checkbox bind:checked={showViewDebug}>
  Show DataViewUI debug
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