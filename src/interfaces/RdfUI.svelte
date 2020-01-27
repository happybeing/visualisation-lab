<script>
export let sourceInterface;
export let sourceResultStore;
</script>

$sourceResultStore.subscribe(() => {console.log('<RdfUI> sourceResultStore.subscribe()')});

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
  <b>&lt;RdfUI&gt;</b>
  <button 
    enabled={sourceInterface !== undefined} 
    on:click={() => sourceInterface.loadTestRdf(sourceResultStore)}>
    Load lodCloud
  </button>
</p>

</div>
