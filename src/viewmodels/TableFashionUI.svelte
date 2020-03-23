<!-- UI to control Fashion (filtering and presentation) of VMTable
-->
<script>
import {onMount} from 'svelte';
import {resultDataStore} from '../stores.js';

import {modelFormats} from '../modelFormats.js';

export let viewModelStore;
$: viewModel = $viewModelStore;

$: fashion = viewModel ? viewModel.getFashion() : undefined;
$: allFields = viewModel ? viewModel.getJsonModelFields() : [];
$: visibleFields = fashion ? fashion.getFieldsWithProperty('visible', true, true) : [];
$: invisibleFields = fashion ? fashion.getFieldsWithProperty('visible', false, true) : [];

</script>

<style>
.main { 
  background: rgba(238, 148, 30, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
</style>

<div class="main">
  <p>&lt;FashionUI&gt; for tabular data</p>
  <p>TODO: extend range of filters<br/>
  TODO: improve filter UI<br/>
  TODO: extend Fashion properties, add FashionUI for network data (e.g. display nodes with property P, use node property I for style S)<br/>
  TODO: add ability to switch between available FashionUI<br/>
  TODO: make Vega chart View respond to tabular fashion controls
  TODO: make Svelte Table View respond to and update tabular fashion controls
  TODO: make Network Graph View respond to network fashion controls (visibility, node type, node style)
  </p>
  <p>
    {#each allFields as field}
      {field} 
      {#if fashion}
        {fashion.compareFieldProperty(field, 'visible', true, true ) == 0 ? 'visible' : 'not visible'}  
      {/if}<br/>
    {/each}
  </p>
</div>
