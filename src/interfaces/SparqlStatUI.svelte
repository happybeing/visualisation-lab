<script>
import {fetchStatus} from './SourceInterface.js';

export let sparqlStat;
// console.log('======');console.dir(sparqlStat)
$: statusTextStore = sparqlStat ? sparqlStat.statusTextStore : undefined;
$: statStatus = statusTextStore ? $statusTextStore : undefined;

$: resultTextStore = sparqlStat ? sparqlStat.resultTextStore : undefined;
$: statValueText = resultTextStore ? $resultTextStore : undefined;


function statClass(text) {
  if (awaitingResponse || text === '-') return 'main value-unknown';

  let classValue = 'main value-error';

  if (sparqlStat.config.type === 'sparql-stat') {
    const respType = sparqlStat.responseTypeAbbrev;
    if (respType === 'Ttl' || respType === 'XMl' || respType === 'Json')
      classValue = 'main';
    else if (text.startsWith('1.') || text.startsWith('2.') || text.startsWith('3.'))
      classValue = 'main value-unknown';
    else if (text === 'unknown')
      classValue = 'main value-unkown';
  } else if (text.startsWith('unknown') || text === '-') 
    classValue = 'main value-unknown';
  else if (sparqlStat.config.type === 'stat-website' || !isError)
    classValue = 'main';

  return classValue;
}

// We pass statValueText here so trigger update of awaitingResponse whenever the text is updated
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
.value-error {
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
      <a href={sparqlStat.config.source.endpoint}>{statValueText}</a>
    {:else}
      {statValueText}
    {/if}

      <span title={responseTooltip}>
      {sparqlStat.responseTypeAbbrev ? sparqlStat.responseTypeAbbrev : ''}
      </span>
      {#if isError && overallTooltip}
        <img title={overallTooltip} width='20px' style='vertical-align: text-top;' src='/images/i-for-info.png'/>
        {#if overallTooltip && overallTooltip.startsWith('DBG')}
          DBG
        {/if}
      {/if}
  {/if}
</div>
