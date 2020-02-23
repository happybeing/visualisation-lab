<!-- A tabular view for an RDF Dataset 
-->

<script>
import SvelteTable from 'svelte-table';

import {resultDataStore} from "../stores.js";
import {RdfTabulator} from '../rdf/rdfjsUtils.js';

let rows = [];
let columns = [
  {
    key: "Subject",
    title: "Subject",
    value: v => v.Subject,
    sortable: true
  },
  {
    key: "Predicate",
    title: "Predicate",
    value: v => v.Predicate,
    sortable: true
  },
  {
    key: "Object",
    title: "Object",
    value: v => v.Object,
    sortable: true
  },
  {
    key: "Object Type",
    title: "Object Type",
    value: v => v.ObjectType,
    sortable: true
  }
];

let rdfTable;
const unsubscribe = resultDataStore.subscribe(rds => {
  console.log('ViewRdfAsTable rds update:');
  console.dir(rds);
  if (rds === undefined || rds === 0) {return;}

  try {
    rdfTable = new RdfTabulator(rds.getRdfDataset());
    const table = rdfTable.Table();
    console.log('RDF as a Table:')
    console.dir(table);
    rows = table.rows;
  } catch(e) {
    console.log('ViewRdfAsTable - failed to consume results (SourceResult)');
    console.error(e);
  }
});

</script>
<style>
.main { 
  background: rgba(134, 212, 147, 0.959);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
  padding-right: 1cm;
  padding-bottom: 1cm;
}
</style>

<div class="main">
<h2>&lt;ViewRdfAsTableUI&gt;</h2>
<p>
TODO: add ontologies<br/>
TODO: ??? clear views (including table) on start of query<br/>
</p>
<p>Triples: {$resultDataStore && $resultDataStore.getRdfDataset() ? $resultDataStore.getRdfDataset().size : 'none'}<br/>
<br/>
<SvelteTable columns="{columns}" rows="{rows}"></SvelteTable>
</div>