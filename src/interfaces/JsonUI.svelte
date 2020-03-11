<script>
export let sourceInterface;
export let sourceResultStore;

</script>

<style>
.main { 
  background: rgba(255, 0, 234, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
</style>

<div class="main">
<p>
  <b>&lt;JsonUI&gt;</b>
  <button 
    enabled={sourceInterface !== undefined} 
    on:click={() => sourceInterface.consumeJson(sourceResultStore)}>
    Load 'Les Miserables'
  </button>
</p>
</div>
