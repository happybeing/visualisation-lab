<script>
import Notifications from 'svelte-notifications';
import { notifications } from './notifications.js';
  
import SourceUI from './interfaces/SourceUI.svelte';
import ViewModelUI from './viewmodels/ViewModelUI.svelte';

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
  <p>
    Prototype visualisation workspace for analysis using a wide variety of data sources, and built to be easily extendable. Powered by Sveltejs, Vega-Lite and D3js. Code on <a href='https://github.com/theWebalyst/visualisation-lab'>github</a>.
  </p>
  <SourceUI resultDataStore={resultDataStore}/>
  <ViewModelUI resultDataStore={resultDataStore}/>
  {#each $activeViews as viewUI, i}
    <svelte:component this= {viewUI} {activeModelsByFormat}/>
  {/each}
</Notifications>
