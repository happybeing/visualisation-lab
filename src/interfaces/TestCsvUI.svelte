<script>
export let sourceInterface;
export let sourceResultStore;

import {statusTextStore} from '../stores.js';

import totalCasesCovid19 from '../data/total_cases.csv';
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
  <b>&lt;TestCsvUI&gt;</b>
  <button 
    enabled={sourceInterface !== undefined} 
    on:click={() => sourceInterface.consumeCsvText(sourceResultStore, statusTextStore, totalCasesCovid19)}>
    Load Covid 19 Total Cases (CSV)
  </button>
</p>

</div>
