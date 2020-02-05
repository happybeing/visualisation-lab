<!-- Top level UI for data source interaction

 -->
 
 <script>
import { SourceInterfaceManager } from "./SourceInterface.js";

import TestUI from "./TestRdfUI.svelte";

export let resultDataStore; // Output SourceResult

// TODO: pass an initial set of sources to constructor as a JSON array (see SourceInterfaceManager)
const interfaceManager = new SourceInterfaceManager();
let currentInterface;

 </script>

<style>

.main { background: rgba(0, 0, 255, 0.144);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
</style>

<div class="main">
  <h3>&lt;SourceUI&gt;</h3>
  <p>
  <br/>TODO: error handling / status messages in the interface UIs (investigate Svelte error handling)
  <br/>TODO: use store to add status text in SourceInterface (loading / building model (with nodes + links counts))
  </p>

  <label>Data Source:</label>
  <select bind:value={currentInterface} title='Data Source'>
    {#each [...interfaceManager.sourceInterfaces] as source}
      <option value={source[1]}>
        {source[0]} : {source[1].description}
      </option>
    {/each}
  </select>
  <p><b>Current interface:</b> {currentInterface ? currentInterface.description : 'none'}</p>
  <svelte:component 
    this={currentInterface ? currentInterface.uiComponent : undefined}
    sourceInterface={currentInterface}
    sourceResultStore={resultDataStore}
  />
</div>
