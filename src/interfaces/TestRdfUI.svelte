<script>
export let sourceInterface;
export let sourceResultStore;

import {statusTextStore} from '../stores.js';

import lodCloudRdf from '../data/LODCloud_SPARQL_Endpoints.ttl';
//import lodCloudRdf from '../data/1521803020108-tickled-turtles.ttl';
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
  <b>&lt;TestRdfUI&gt;</b>
  <button 
    enabled={sourceInterface !== undefined} 
    on:click={() => sourceInterface.consumeRdfTextTtl(sourceResultStore, statusTextStore, lodCloudRdf)}>
    Load lodCloud
  </button>
</p>

</div>
