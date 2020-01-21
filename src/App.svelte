<script>
  import NetworkGraphD3SVG from "./NetworkGraphD3SVG.svelte";
  // import GraphSvelteSVG from './NetworkGraphSvelteSVG.svelte';
  import NetworkGraphCanvas from './NetworkGraphCanvas.svelte';
  import DataSourceUI from "./DataSourceUI.svelte";
  import DataViewUI from "./DataViewUI.svelte";

  import {graph} from "./stores.js";

</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Visualisation Lab</h1>
<p>Prototype visualisation workspace, initially for visualisation of 
RDF data sources. Built using Sveltejs and D3js to be extendable. Code on <a href="https://github.com/theWebalyst/visualisation-lab">github</a>.
</p>
<p>DataSourceUI loads the RDF,  
<DataSourceUI/>
DataViewUI maps the RDF to objects for visualisation,
<DataViewUI/>
NetworkGraphCanvas uses d3-force to display the graph.</p>
<NetworkGraphCanvas {graph} />
