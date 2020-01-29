<script>
import NetworkGraphD3SVG from './NetworkGraphD3SVG.svelte';
// import GraphSvelteSVG from './NetworkGraphSvelteSVG.svelte';
import NetworkGraphCanvas from './NetworkGraphCanvas.svelte';
import SourceUI from './interfaces/SourceUI.svelte';
import ViewModelUI from './viewmodels/ViewModelUI.svelte';

import {resultDataStore} from './stores.js';
import {graph} from './stores.js';

</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Visualisation Lab</h1>
<p>Prototype visualisation workspace, initially for visualisation of 
RDF data sources. Built using Sveltejs and D3js to be extendable. Code on <a href='https://github.com/theWebalyst/visualisation-lab'>github</a>.
</p>
<p>SourceUI handles interaction with data sources:
<SourceUI resultDataStore={resultDataStore}/>
</p>

<p>ViewModelUI maps the RDF to objects for visualisation:
</p>
<ViewModelUI resultDataStore={resultDataStore}/>
<h2>&lt;NetworkGraphCanvas&gt;</h2>
<p>NetworkGraphCanvas uses d3-force to display the graph.</p>
<p>TODO: wrap NetworkGraphCanvas & co. in View (or ViewUI?)</p>
<NetworkGraphCanvas {graph} />
