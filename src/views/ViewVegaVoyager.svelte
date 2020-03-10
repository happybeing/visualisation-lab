<!-- Vega Voyager view 

-->

<script>
import {Voyager, CreateVoyager} from 'datavoyager';

import {onMount} from 'svelte';
import {resultDataStore} from "../stores.js";
import {modelFormats} from '../modelFormats.js';
export let activeModelsByFormat;

let voyagerInstance;

onMount(() => {
  const container = document.getElementById("voyager-embed");
  const config = undefined;
  const data = undefined;
  voyagerInstance = CreateVoyager(container, config, data);
});

</script>
<style>
.main { 
  background: rgba(174, 202, 127, 0.959);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
</style>

<svelte:head>
	<link rel='stylesheet' href='./style.css'>
</svelte:head>


<div class="main">
<h2>&lt;ViewVegaVoyager&gt;</h2>
<p><a href='https://github.com/vega/voyager#voyager-2'>About Vega Voyager </a> / <a href='https://github.com/vega/vega-datasets'>Example Datasets</a> / 
Example URI to paste into Vega Voyager via the 'Load' button: https://vega.github.io/vega-datasets/data/cars.json
<p/>
<div id='voyager-embed'></div>
</div>