<script>
export let sourceInterface;
export let sourceResultStore;

let filePath;
let fileInfo;

function handleChange(event) {
  console.log('handleChange: ', filePath);
  console.dir(event);
  console.dir(this);
  fileInfo = this.files[0];
  console.dir(fileInfo);
  
  sourceInterface.loadFiles(sourceResultStore, this.files);
}

function handleInput(event) {
  console.log('handleInput: ', filePath);
  console.dir(event);
  console.dir(this);
  fileInfo = this.files[0];
  console.dir(fileInfo);
}
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
<p>
  <b>&lt;FileUI&gt;</b>
  <!-- <button 
    enabled={sourceInterface !== undefined} 
    on:click={() => sourceInterface.loadTestRdf(sourceResultStore)}>
    Load lodCloud
  </button> -->
  <input width='600px' type="file" bind:value={filePath} on:change={handleChange} on:input={handleInput}/>
</p>

</div>
