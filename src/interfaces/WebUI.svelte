<script>
export let sourceInterface;
export let sourceResultStore;
export let statusTextStore;

let uri;
let lastError;
</script>

<style>
.main { 
  background: rgba(0, 47, 255, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
</style>

<div class="main">
  <datalist id="example-urls">
    <option value="https://theWebalyst.solid.community/public/">
    <option value="https://solidpay.solid.community/public/">
    <option value="https://spoggy.solid.community/public/">
    <option value="https://agora.solid.community/public/">
  </datalist>
  <div>
    <p>
      &lt;WebUI&gt; allows loading of CSV or RDF from a web address.
    </p>
    <p>
      {#if !sourceInterface.options.fixedUri}
      <p><b>Enter URI, or select from list:</b></p>
      <input list="example-urls" inputmode="url" width="100%" type="url" bind:value={uri} placeholder="enter a web uri"/>
      {/if}
    </p>
  </div>
  <div>
    <button 
      enabled={sourceInterface !== undefined} 
      on:click={() => sourceInterface.loadUri(sourceResultStore, statusTextStore, sourceInterface.options.fixedUri ? sourceInterface.options.fixedUri : uri)}>
      Load data from URI
    </button>
    <text enabled={lastError !== undefined}></text>
  </div>

</div>
