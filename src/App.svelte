<script>
import Notifications from 'svelte-notifications';
import { notifications } from './notifications.js';
  
import SourceUI from './interfaces/SourceUI.svelte';
import ViewModelUI from './viewmodels/ViewModelUI.svelte';

import NetworkGraphD3SVG from './views/NetworkGraphD3SVG.svelte';
// import GraphSvelteSVG from './views/NetworkGraphSvelteSVG.svelte';
import NetworkGraphCanvas from './views/NetworkGraphCanvas.svelte';
import ViewRdfAsTableUI from './views/ViewRdfAsTable.svelte';


import {resultDataStore} from './stores.js';
import {graph} from './stores.js';

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
<p>ViewRdfAsTableUI provides a tabular summary of the current RDF dataset</p>
<ViewRdfAsTableUI/>

<p>ViewModelUI maps the RDF to objects for visualisation:
</p>
<ViewModelUI resultDataStore={resultDataStore}/>
<h2>&lt;NetworkGraphCanvas&gt;</h2>
<p>NetworkGraphCanvas uses d3-force to display the graph.</p>
<p>TODO: wrap NetworkGraphCanvas & co. in View (or ViewUI?)</p>
<NetworkGraphCanvas {graph} />
</Notifications>
