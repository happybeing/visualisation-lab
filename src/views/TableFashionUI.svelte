<!-- UI to control Fashion (filtering and presentation) of VMTable

TODO: accept a config object to control properties, type, values, defaults to apply via the UI
TODO: extend range of filters
TODO: improve filter UI
TODO: extend Fashion properties, add NetworkFashionUI for network data (e.g. display nodes with property P, use node property I for style S)
TODO: make Svelte Table View respond to and update tabular fashion controls
TODO: make Network Graph View respond to NetworkFashionUI controls (visibility, node type, node style)

-->
<script>
import {onMount} from 'svelte';
import Tags from "svelte-tags-input";

import {resultDataStore} from '../stores.js';

import {modelFormats} from '../modelFormats.js';

export let filterFieldsStore;

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

let setTags = [];  // Used only to set tags, changes picked up via handleTags()

export let viewModelProxyStore;
$: viewModel = $viewModelProxyStore && $viewModelProxyStore.viewModel;

$: fashion = viewModel ? viewModel.getFashion() : undefined; console.log('NEW fashion');
$: allFields = viewModel ? viewModel.getJsonModelFields() : []; console.log('NEW allFields');
$: visibleFields = fashion ? fashion.getFieldsWithProperty('visible', true, false) : []; console.log('NEW visibleFields');
$: invisibleFields = fashion ? fashion.getFieldsWithProperty('visible', false, false) : []; console.log('NEW invisibleFields');
$: updateTags(visibleFields);

function updateTags (visibleFields) {
  if (setTags.length === visibleFields.length) {
    for (let i = 0 ; i < setTags.length ; i++) {
      if (setTags[i] !== visibleFields[i]) break;
    }
    return;
  }
  setTags = [...visibleFields];
};

let xAxis;
$: updateXAxis(xAxis);
$: updateFromViewModel(viewModel);

function updateXAxis (xAxis) {
  console.log('updateXAxis() to ' + xAxis);
  if (fashion) {
      const xAxisProperty = 'x-axis';
      fashion.clearAllFieldsOfProperty(xAxisProperty);
      fashion.setFieldsProperty([xAxis], xAxisProperty, true);
      fashion = fashion;
      $viewModelProxyStore = {viewModel: viewModel};
    }
}

function updateFromViewModel(viewModel) {
  console.log('updateFromViewModel()..');console.dir(viewModel);
  if (viewModel) {
    const fashion = viewModel.getFashion();
    xAxis = fashion.getFieldsWithProperty('x-axis', true, false)[0];
  }
}

function handleFields (e) {
  console.log('================================ handleFields() =================================='); console.dir(e);
  sanitiseTags(e.detail.tags, allFields, true);
  allFields.forEach(field => {
    fashion.setFieldsProperty([field], 'visible', e.detail.tags.includes(field));
  });
  fashion = fashion;
  $viewModelProxyStore = {viewModel: viewModel};
}

/** update an array of strings using an array of acceptable values
 * 
 * @param {String[]}  tags - tag names to sanitise
 * @param {String[]}  allowedTags - list of allowed tag names
 * @param {Boolean}   allowAnyCase - if true, match names regardless of case but use the version from allowedTags
 */
function sanitiseTags (tags, allowedTags, allowAllCase) {
  let matchAllTags = allowedTags;
  if (allowAllCase) {
    matchAllTags = [];
    allowedTags.forEach(tag => matchAllTags.push(tag.toLowerCase()));
  }

  console.dir(matchAllTags);
  for (let i = 0 ; i < tags.length ; ) {
    const tag = tags[i];
    if (!allowAllCase) {
      if (!matchAllTags.includes(tag)) {
        tags.splice(i, 1);
      } else {
        ++i;
      }
    } else {
      const matchedIndex = matchAllTags.indexOf(tag.toLowerCase());
      if (matchedIndex >= 0) {
        tags.splice(i, 1, allowedTags[matchedIndex]); // Replace with allFields value
        ++i;
      } else {
          tags.splice(i, 1); // Remove non-matched tag
      }
    } 
  }
}

</script>

<style>
.main { 
  background: rgba(238, 148, 30, 0.582);
  border: 1px solid;
  border-radius: 1cm;
  padding-left: 1cm;
}

fieldset {
  display: -webkit-box;
  border-width: 1px;
  border-style: none;
  border-color: none;
}
</style>

<div class="main">
  <p>&lt;TableFashionUI&gt; for tabular data
  </p>
  <p>TODO make checkbox a component option</p>
  <label><input type=checkbox bind:checked={$filterFieldsStore}>Show only the following fields:</label>
<div >
  <p><b>X-Axis:</b> <select disabled={!$filterFieldsStore} bind:value={xAxis} title='X-axis' placeholder={"Choose filed for X-axis"}>
      <option value=''></option>
    {#each invisibleFields as field}
      <option value={field}>{field}</option>
    {/each}
    </select>

  <p><b>Countries:</b></p>
    <fieldset disabled={!$filterFieldsStore}>
      <Tags
        setTags={setTags}
        placeholder={"Enter names of countries"}  
        on:tags={handleFields}
        autoComplete={invisibleFields}
        allowDrop={true}
        allowPaste={true}
        onlyUnique={true}
        />
    </fieldset>
  <br/>
  TODO: NOTE this is using a local fork of svelte-tags-input 
</div>
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
