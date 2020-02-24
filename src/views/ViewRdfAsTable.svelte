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
    sortable: true,
    filterValue: v => v.Subject,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.Subject)) {
          filterMap.set(row.Subject);
          filterArray.push({name: row.Subject, value: row.Subject});
        }
      });
      // filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
  },
  {
    key: "Predicate",
    title: "Predicate",
    value: v => v.Predicate,
    sortable: true,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.Predicate)) {
          filterMap.set(row.Predicate);
          filterArray.push({name: row.Predicate, value: row.Predicate});
        }
      });
      // filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
  },
  {
    key: "Object",
    title: "Object",
    value: v => v.Object,
    sortable: true,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.Object)) {
          filterMap.set(row.Object);
          filterArray.push({name: row.Object, value: row.Object});
        }
      });
      // filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
  },
  {
    key: "Object Type",
    title: "Object Type",
    value: v => v.ObjectType,
    sortable: true,
    filterOptions: rows => {
      let filterMap = new Map;
      let filterArray = [];
      rows.forEach(row => {
        if (!filterMap.has(row.ObjectType)) {
          filterMap.set(row.ObjectType);
          filterArray.push({name: row.ObjectType, value: row.ObjectType});
        }
      });
      filterArray.sort((v1, v2) => v1.name.localeCompare(v2.name));
      return filterArray;
    },
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
    columns = columns;
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
TODO: add filtering<br/>
TODO: ??? clear views (including table) on start of query<br/>
</p>
<p>Triples: {$resultDataStore && $resultDataStore.getRdfDataset() ? $resultDataStore.getRdfDataset().size : 'none'}<br/>
<br/>
<SvelteTable columns="{columns}" rows="{rows}"></SvelteTable>
</div>