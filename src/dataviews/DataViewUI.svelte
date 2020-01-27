<!-- Map SourceResult to objects for visualisation 

Provides
- TODO: a UI defining filters to apply to SourceResults
- TODO: allows selection of a suitable view model (available for the active SourceResults subclass)
- TODO: filters the SourceResults subclass and generates chosen view model
- TODO: provides UI to select a View component which can visualise the active view model
-->

<script>
import {onMount} from 'svelte';

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

<div>
<h2>&lt;DataViewUI&gt;</h2>
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