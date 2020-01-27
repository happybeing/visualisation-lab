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

// $: graph.update(() => rdfToVis(newDataResult));

let rdfDataView;
let rdsValue;


const unsubscribe = resultDataStore.subscribe(rds => {
  console.log('DataViewUI rds update:');
  console.dir(rds);
  rdsValue = rds;

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
<h2>DataViewUI test...</h2>
<!-- <p>{resultDataStore !== undefined && $resultDataStore !== undefined ? JSON.stringify($resultDataStore) : "no data"}</p> -->
<h2>rdsValue: {rdsValue}</h2>
</div>

<!-- <div>
  <RdfDataView {newDataResult}/>
</div> -->

<!-- <div>
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
</div> -->