<script>
export let sourceInterface;
export let sourceResultStore;
export let statusTextStore;
export let options;

let filePath = options.fixedFile;
let fileInfo;

function handleChange(event) {
  console.log('handleChange: ', filePath);
  console.dir(event);
  console.dir(this);
  fileInfo = this.files[0];
  console.dir(fileInfo);

  sourceInterface.loadFiles(sourceResultStore, statusTextStore, this.files, options);
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
  <!-- {#if currentInterface.options.fixedFile}
    <button 
    enabled={currentInterface !== undefined} 
    on:click={() => currentInterface.loadFixedFile(sourceResultStore, currentInterface.options.fixedFile)}>
    Load {currentInterface.options.fixedFile}
  </button>
  {else} -->
    <input width='600px' type="file" bind:value={filePath} on:change={handleChange} on:input={handleInput}/>
</p>

</div>
