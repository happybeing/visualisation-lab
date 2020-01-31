<script>
export let sourceInterface;
export let sourceResultStore;

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
      <b>&lt;WebUI&gt;</b>
      <input list="example-urls" inputmode="url" width="100%" type="url" bind:value={uri} placeholder="enter a web uri"/>
    </p>
  </div>
  <div>
    <button 
      enabled={sourceInterface !== undefined} 
      on:click={() => sourceInterface.loadUri(sourceResultStore, uri)}>
      Load RDF
    </button>
    <text enabled={lastError !== undefined}></text>
  </div>

</div>
