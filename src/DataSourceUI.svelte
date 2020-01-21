<!-- Svelte wrapper for an RDF data sources (files, LDP, Solid etc.)

Loads RDF into rdfDataset in ./stores.js using graphy

A basis for a generic Svelte component that interfaces to different 
RDF sources using different libraries.

TODO: scope ways to provide write/update in conjunction with ViewUI
-->

<script>
import { onMount } from 'svelte';

const readTtl = require('@graphy/content.ttl.read');

// Loads RDF into rdfDataset store using graphy
import { rdfDataset } from "./stores.js";

console.log('DataSourceUI using graphy...');
console.log('test', $rdfDataset);
console.dir($rdfDataset);

// import fetch from '@rdfjs/fetch';

// const label = 'http://www.w3.org/2000/01/rdf-schema#label'

// fetch('http://www.w3.org/2000/01/rdf-schema')
//   .then(res => res.dataset())
//   .then(dataset => {
//     for (const quad of dataset) {
//       if (quad.predicate.value === label) {
//         console.log(`${quad.subject.value}: ${quad.object.value}`)
//       }
//     }
//   }).catch(err => console.error(err));


import lodCloudRdf from './data/LODCloud_SPARQL_Endpoints.ttl';
const textRdf = `
  @prefix foaf: <http://xmlns.com/foaf/0.1/> .

  <#spiderman> a foaf:Person ;
      foaf:name "Spiderman" .
`;

onMount(() => {
  try {
    readTtl(lodCloudRdf, {
      data(y_quad) {
          console.log(JSON.stringify(y_quad));
          $rdfDataset.add(y_quad);
          console.log('rdfDataset size: ', $rdfDataset.size);
          $rdfDataset = $rdfDataset;
      },

      eof(h_prefixes) {
          console.log('done!');
          console.log('rdfDataset size: ', $rdfDataset.size);
      },
    })
  } catch (err) { console.error(err); } 

  // let streamRdf;
  // fetch('http://www.w3.org/2000/01/rdf-schema')
  //   .then(res => res.body)
  //   .then(body => {
  //     body.pipeTo(readTtl({
  //         data(y_quad) {
  //             console.log(JSON.stringify(y_quad));
  //             $rdfDataset.add(y_quad);
  //             console.log('rdfDataset size: ', $rdfDataset.size);
  //             $rdfDataset = $rdfDataset;
  //         },

  //         eof(h_prefixes) {
  //             console.log('done!');
  //             console.log('rdfDataset size: ', $rdfDataset.size);
  //         },
  //     }))
  //   })
  //   .catch(err => console.error(err));

  // let streamRdf;
  // fetch('http://www.w3.org/2000/01/rdf-schema')
  //   .then(res => {
  //     console.dir(res);
  //       res.body.pipeTo(readTtl())
  //       .on('data', (y_quad) => {
  //           console.log(JSON.stringify(y_quad));
  //           $rdfDataset.add(y_quad);
  //           console.log('rdfDataset size: ', $rdfDataset.size);
  //           $rdfDataset = $rdfDataset;
  //         })
  //         .on('eof', () => {
  //           console.log('done!');
  //           console.log('rdfDataset size: ', $rdfDataset.size);
  //         });
  //   })
  //   .catch(err => console.error(err));
});

</script>

<!-- <div><h2>DataSourceUI debug...</h2>
<ul>
	{#each [...$rdfDataset] as quad, i}
		<li>{quad}</li>
	{/each}
</ul>
</div> -->