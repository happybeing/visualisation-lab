<!-- Map RDF to objects for visualisation

input:
  @param {RDF/JS: Dataset}  rdfDataset (./stores.js) 

output:
  @param {Object}           graph {nodes: [], links: []} (./stores.js) 

This separates the raw RDF from data which is made available to a 
visualisation component, such that:
- TODO: maps between triples (Rdfjs dataset) and visualisation (JSON)
- TODO: it isolates RDF and and application specific modelling from the visualisation and app
- TODO: provides default representations for different visualisation types/components
- TODO: support addition of custom representations per the application or the data source
- TODO: allow the application to modify or select the visual representation programmatically
 -->

<script>
import { onMount } from 'svelte';

const readTtl = require('@graphy/content.ttl.read');
import testGraph from './data/data-les-miserables.js';

import {rdfDataset} from "./stores.js";
import {graph} from "./stores.js";

$: graph.update(() => rdfToVis($rdfDataset));

function rdfToVis (dataset) {
  let graphMap = {nodes: new Map(), links: new Map() };

  console.log('rdfToVis', dataset)
try {
    for (const quad of dataset) {
      console.log('Mapping quad: ', quad)
      // TODO: implement better mapping to nodes and links
      graphMap.nodes.set(quad.subject.value, {id: quad.subject.value, group: 1});
      graphMap.links.set(quad.subject.value + '--LINK--' + quad.object.value, {source: quad.subject.value, target:quad.object.value, value: 1});

      // TODO: Don't treat all values as nodes as here:
      graphMap.nodes.set(quad.object.value, {id: quad.object.value, group: 1});
    }
    // Create nodes and links from triples
    return {nodes: [...graphMap.nodes.values()], links: [...graphMap.links.values()]};
  } catch (err) {
    console.log(err);
  }
}

</script>

<!-- <div>
<h2>ViewUI debug...</h2>
<h3>nodes</h3>
<ul>
{#each $graph.nodes as node}
<li>{node.id}</li>
{/each}
</ul>
<h3>links</h3>
<ul>
{#each $graph.links as link}
<li>{JSON.stringify(link)}:<br/>{link.source} -&gt; {link.target}</li>
{/each}
</ul>
</div> -->