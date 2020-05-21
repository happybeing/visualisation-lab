<script>
import Notifications from 'svelte-notifications';
import { notifications } from './notifications.js';
  
import SourceUI from './interfaces/SourceUI.svelte';
import ViewModelUI from './viewmodels/ViewModelUI.svelte';

import {resultDataStore} from './stores.js';

import {Child} from 'svelte-iux'; // Test component library using yarn link

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
  <Child name={"Oh yes goodness me"}/>
  <SourceUI resultDataStore={resultDataStore}/>
  <ViewModelUI resultDataStore={resultDataStore}/>
</Notifications>
