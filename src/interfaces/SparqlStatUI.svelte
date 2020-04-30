<script>
import {fetchStatus} from './SourceInterface.js';

export let sparqlStat;
export let saveTextToClipboard;

$: resultTextStore = sparqlStat ? sparqlStat.resultTextStore : undefined;
$: statValueText = resultTextStore ? $resultTextStore : undefined;

$: testResultStore = sparqlStat ? sparqlStat.testResultStore : undefined;
$: testResult = testResultStore ? $testResultStore : undefined;

// We pass statValueText here so trigger update of awaitingResponse whenever the text is updated
$: awaitingResponse = sparqlStat.getFetchStatus(statValueText) === fetchStatus.FETCHING;

$: isError = awaitingResponse ? false : sparqlStat.isError || testResult === 'X';
$: responseTooltip = awaitingResponse ? '' : sparqlStat.responseText;
$: overallTooltip = awaitingResponse ? 'awaiting response' : isError ? sparqlStat.getErrorDescription() : responseTooltip;

$: statClass = updateOnResult(testResult, isError, awaitingResponse);

// Test Summary values determine cell colour
//
// Values are chosen to help sort CSV imported into spreadsheet:
// 'G' = Good = at least one SparqlStat resolved to 'yes'
// 'I' = Invalid = at least one response was Turtle, XML or JSON though not invalid
// 'U' = Unknown = no good responses (as above) but not all fetches completed
// 'X' = Failed = all fetches completed with errors

function updateOnResult(testResult, isError, awaitingResponse) {
  if (isError) return 'value-fail';
  if (awaitingResponse) return 'value-unknown';

let classValue = 'value-unknown';
  switch (testResult) { 
    case 'G': classValue = 'value-good'; break;
    case 'I': classValue = 'value-invalid'; break;
    case 'X': classValue = 'value-fail'; break;
  }
  return 'main ' + classValue;
}

function handleClick(e) {
  if (awaitingResponse) return;
  let text = sparqlStat.responseText;
  let message = '';

  if (isError) {
    message += 'Incorrect '
    if (!text || text.length === 0) 
      text = sparqlStat.getErrorDescription();
  }

  message += sparqlStat.responseTypeAbbrev ? sparqlStat.responseTypeAbbrev : '';
  message += ' response saved to clipboard';
  saveTextToClipboard(text, message);
}
</script>

<style>
.main {
  /* border: 1px solid;
  border-radius: 1cm;
  padding-left: 0.5cm;
  padding-right: 0.5cm; */
}
.value-good {
  background: rgba(0, 255, 146, 0.582);
} 
.value-invalid {
  background: rgba(231, 231, 37, 1)  ;
} 
.value-unknown {
  background: rgba(30, 179, 188, 0.782)  ;
} 
.value-fail {
  background: rgba(248, 179, 188, 0.782)  ;
} 
</style>

<div class={statClass} title={awaitingResponse ? 'awaiting response' : ''} on:click={() => handleClick()}>
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
