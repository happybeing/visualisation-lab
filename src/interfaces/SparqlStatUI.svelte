<script>
import {fetchStatus} from './SourceInterface.js';

export let sparqlStat;
console.log('======');console.dir(sparqlStat)
$: statusTextStore = sparqlStat ? sparqlStat.statusTextStore : undefined;
$: statStatus = statusTextStore ? $statusTextStore : undefined;

$: resultTextStore = sparqlStat ? sparqlStat.resultTextStore : undefined;
$: statValueText = resultTextStore ? $resultTextStore : undefined;

function statClass(text) {
  return text === 'no' ? 'main value-no' : (text === 'unknown' || text === '-' ? 'main value-unknown' : 'main');
}

$: awaitingResponse = sparqlStat.getFetchStatus(statValueText) === fetchStatus.FETCHING;
$: isError = awaitingResponse ? false : sparqlStat.isError;
$: responseTooltip = awaitingResponse ? '' : sparqlStat.responseText;
$: overallTooltip = awaitingResponse ? 'awaiting response' : isError ? sparqlStat.getErrorDescription() : responseTooltip;

</script>

<style>
.main {
  background: rgba(0, 255, 146, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 0.5cm;
  padding-right: 0.5cm;
}
.value-no {
  background: rgba(248, 179, 188, 0.782)  ;
} 
.value-unknown {
  background: rgba(30, 179, 188, 0.782)  ;
} 
</style>

<div class={statClass(statValueText)} title={awaitingResponse ? 'awaiting response' : ''}>
  {#if statValueText && sparqlStat.siteIconUrl}
    <img alt='' src={sparqlStat.siteIconUrl} height='15px' style='vertical-align: text-top; margin-top: 1px'/>
  {/if}

  {#if awaitingResponse}
    <img src='/images/activity-ellipsis.svg' alt='awaiting response'/>
  {:else}
    {#if sparqlStat.config.type === 'stat-website'}
      <a href={sparqlStat.config.source.endpoint}>{statValueText ? statValueText : 'no value'}</a>
    {:else}
      {statValueText ? statValueText : 'no value'}
    {/if}

      <span title={overallTooltip}>
      {!isError && sparqlStat.responseTypeAbbrev ? sparqlStat.responseTypeAbbrev : ''}
      {#if isError && overallTooltip}
        <img width='20px' style='vertical-align: text-top;' src='/images/i-for-info.png'/>
        {#if overallTooltip && overallTooltip.startsWith('DBG')}
          DBG!
        {/if}
      {/if}
      </span>
  {/if}
</div>
