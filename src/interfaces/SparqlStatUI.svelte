<script>
export let sparqlStat;
console.log('======');console.dir(sparqlStat)
$: statusTextStore = sparqlStat ? sparqlStat.statusTextStore : undefined;
$: statStatus = statusTextStore ? $statusTextStore : undefined;

$: resultTextStore = sparqlStat ? sparqlStat.resultTextStore : undefined;
$: statValueText = resultTextStore ? $resultTextStore : undefined;
</script>

<style>
.main {
  background: rgba(0, 255, 146, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 0.5cm;
  padding-right: 0.5cm;
}
.valueno {
  background: rgba(248, 179, 188, 0.782)  ;
} 
</style>

  <div class={statValueText !== 'no' ? 'main' : 'main valueno'}>
  {#if statValueText && sparqlStat.siteIconUrl}
    <img alt='' src={sparqlStat.siteIconUrl} height='15px' style='vertical-align: text-top; margin-top: 1px'/>
  {/if}
  {#if 1}
    <a href={sparqlStat.config.source.endpoint}>{statValueText ? statValueText : 'no value'}</a>
  {:else}
    {statValueText ? statValueText : 'no value'}
  {/if}
</div>
