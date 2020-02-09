<!-- Top level UI for data source interaction

 -->

<script>
import { SourceInterfaceManager } from "./SourceInterface.js";
import Notifications from 'svelte-notifications';

import {getNotificationsContext} from 'svelte-notifications';
window.notifications.setNotificationsContext(getNotificationsContext);

export let resultDataStore; // Output SourceResult

// TODO: pass an initial set of sources to constructor as a JSON array (see SourceInterfaceManager)
const interfaceManager = new SourceInterfaceManager();
let currentInterface;
import {statusTextStore} from '../stores.js';

function handleChange(e) { statusTextStore.set('');}
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
<Notifications>
<div class="main">
  <h3>&lt;SourceUI&gt;</h3>
  <p><b>Data Source:</b> <select bind:value={currentInterface} title='Data Source' on:change={handleChange}>
    {#each [...interfaceManager.sourceInterfaces] as source}
      <option value={source[1]}>
        {source[0]} : {source[1].description}
      </option>
    {/each}
  </select>
  </p>
  <p><b>Current interface:</b> {currentInterface ? currentInterface.description : 'none'}
  <b>&nbsp;&nbsp;&nbsp;&nbsp;Status:</b> {$statusTextStore && $statusTextStore != '' ? $statusTextStore : 'idle'}
  </p>
  <svelte:component 
    this={currentInterface ? currentInterface.uiComponent : undefined}
    sourceInterface={currentInterface}
    sourceResultStore={resultDataStore}
    statusTextStore={statusTextStore}
  />
</div>
</Notifications>
