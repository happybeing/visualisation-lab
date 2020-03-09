<script>
import Notifications from 'svelte-notifications';
import { notifications } from './notifications.js';
  
import SourceUI from './interfaces/SourceUI.svelte';
import ViewModelUI from './viewmodels/ViewModelUI.svelte';

import ViewNetworkGraphD3SVG from './views/ViewNetworkGraphD3SVG.svelte';
import ViewNetworkGraphCanvas from './views/ViewNetworkGraphCanvas.svelte';
import ViewRdfAsTableUI from './views/ViewRdfInSvelteTable.svelte';


import {resultDataStore, activeViews} from './stores.js';
import {activeModelsByFormat} from './stores.js';

</script>

<style>
	h1 {
		color: purple;
	}
</style>

<Notifications>
<h1>Visualisation Lab</h1>
<p>Prototype visualisation workspace, initially for visualisation of 
RDF data sources. Built using Sveltejs and D3js to be extendable. Code on <a href='https://github.com/theWebalyst/visualisation-lab'>github</a>.
</p>
<p>SourceUI handles interaction with data sources:
<SourceUI resultDataStore={resultDataStore}/>
</p>

<p>ViewModelUI selects and configures active views:
</p>
<ViewModelUI resultDataStore={resultDataStore}/>
{#each $activeViews as viewUI, i}
  <svelte:component this= {viewUI} {activeModelsByFormat}/>
{/each}

</Notifications>
