<script>
export let sparqlStat;
console.log('======');console.dir(sparqlStat)
$: statusTextStore = sparqlStat ? sparqlStat.statusTextStore : undefined;
$: statStatus = statusTextStore ? $statusTextStore : undefined;

$: resultTextStore = sparqlStat ? sparqlStat.resultTextStore : undefined;
$: statValueText = resultTextStore ? $resultTextStore : 'bdfsdjflkfds';
// $: statValueTextProxy = resultStore ? $resultStore : undefined;
// $: statValueText = statValueTextProxy ? statValueTextProxy.instance.getResultText() : '';
</script>

<style>
.main { 
  background: rgba(0, 255, 146, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
} 
</style>

<div class="main">
  {sparqlStat && sparqlStat.config ? sparqlStat.config.heading : 'unknown'}: 
  {#if sparqlStat.siteIconUrl}
  <img alt='Website thumbnail image' src={sparqlStat.siteIconUrl} height='15px' style='vertical-align: text-top; margin-top: 1px'/>
  {/if}
  {statValueText ? statValueText : 'no value'}
</div>
