<!-- UI to control Fashion (filtering and presentation) of VMTable
-->
<script>
import {onMount} from 'svelte';
import Tags from "svelte-tags-input";

import {resultDataStore} from '../stores.js';

import {modelFormats} from '../modelFormats.js';

export let viewModelStore;
$: viewModel = $viewModelStore;

$: fashion = viewModel ? viewModel.getFashion() : undefined; console.log('NEW fashion');
$: allFields = viewModel ? viewModel.getJsonModelFields() : []; console.log('NEW allFields');
$: visibleFields = fashion ? fashion.getFieldsWithProperty('visible', true, false) : []; console.log('NEW visibleFields');
$: invisibleFields = fashion ? fashion.getFieldsWithProperty('visible', false, false) : []; console.log('NEW invisibleFields');

let xAxis;
let lastXAxis;
$: updateXAxis(xAxis)

function updateXAxis (xAxis) {
  console.log('updateXAxis() to ' + xAxis);
  if (fashion) {
      if (lastXAxis) {
        fashion.setFieldsProperty([lastXAxis], 'x-axis', false);
      }
      lastXAxis = xAxis;
      fashion.setFieldsProperty([xAxis], 'x-axis', true);
      fashion = fashion;
      viewModelStore.set(viewModel);
    }
}

function handleFields (e) {
  // console.log('handleFields()'); console.dir(e);
  sanitiseTags(e.detail.tags, allFields, true);
  allFields.forEach(field => {
    fashion.setFieldsProperty([field], 'visible', e.detail.tags.includes(field));
  });
  fashion = fashion;
  viewModelStore.set(viewModel);
}

/** Return a list of all tags which are in allTags
 * 
 * @param {String[]}  tags - tag names to sanitise
 * @param {String[]}  allTags - list of allowed tag names
 * @param {Boolean}   allowAnyCase - if true, match names regardless of case but use the version from allTags
 */
function sanitiseTags (tags, allTags, allowAllCase) {
  let matchAllTags = allTags;
  if (allowAllCase) {
    matchAllTags = [];
    allTags.forEach(tag => matchAllTags.push(tag.toLowerCase()));
  }

  tags.forEach((tag, i) => {
    if (!allowAllCase) {
      if (!matchAllTags.includes(tag)) tags.splice(i, 1);
    } else {
      const matchedIndex = matchAllTags.indexOf(tag.toLowerCase());
      if (matchedIndex > 0) {
        tags.splice(i, 1, allTags[matchedIndex]); // Replace with allFields value
        } else {
          tags.splice(i, 1); // Remove non-matched tag
      }
    } 
  });
}

</script>

<style>
.main { 
  background: rgba(238, 148, 30, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}
</style>

<div class="main">
  <p>&lt;TableFashionUI&gt; for tabular data
  </p>
  <p>
  TODO: add way to restrict input to fields present in the model<br/>
  TODO: add way to match with fields in the model if case is different (its a partial match?)<br/>
  TODO: test if just editing the Vega spec object is enough to redraw the Vega chart<br/>
  TODO: accept a config object to control properties, type, values, defaults to apply via the UI<br/>
  TODO: extend range of filters<br/>
  TODO: improve filter UI<br/>
  TODO: extend Fashion properties, add NetworkFashionUI for network data (e.g. display nodes with property P, use node property I for style S)<br/>
  TODO: make Vega chart View respond to tabular fashion controls
  TODO: make Svelte Table View respond to and update tabular fashion controls
  TODO: make Network Graph View respond to NetworkFashionUI controls (visibility, node type, node style)
  </p>
  <p><b>X-Axis:</b> <select bind:value={xAxis} title='X-axis'>
    {#each invisibleFields as field}
      <option value={field}>{field}</option>
    {/each}
    </select>

  <p><b>Countries:</b>
    <Tags 
      placeholder={"Enter names of countries"}  
      on:tags={handleFields}
      autoComplete={invisibleFields}
      allowDrop={true}
      allowPaste={true}
      onlyUnique={true}
      />
  </p><br/>
  <!-- <p>List:
  </p>
    <table>
    {#each allFields as field}
      <tr><td>{field}</td><td> 
      {#if fashion}
        {fashion.compareFieldProperty(field, 'visible', true, false ) == 0 ? 'visible' : 'not visible'}  
      {/if}
      </td></tr>
    {/each}
    </table> -->
</div>
