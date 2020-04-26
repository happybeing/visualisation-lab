<!-- 
  Copy to clipboard Svelte component which attempts to work in all circumstances.

  Tries three methods until one works:
    1. document.execCommand('copy') 
      - deprecated but safe to try
      - the only programmatic method supported by some browsers
    2. navigator.clipboard.writeText(data) which is recommended but:
      - not supported by Firefox yet (April 2020)
      - blocked in Chrome on sites not using https 
    3. Shows a text box with the text for manual copy with Ctrl-C

  Ref:
    See the browser compatibility chart for Permissions API:
    https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API

  Inspired by https://gist.github.com/stalkerg/2b160b6aca02268506eec23b13c714f9
 -->
<script>
import { tick } from 'svelte';

export let value = null;
export let successMessage = null;

let valueCopy = null;
let manualCopy= '';
let tinyAreaDom;
let manualCopyDom;

$: copyToClipboard(value);

async function copyToClipboard(value) {
  valueCopy = value;
  console.log('copyToClipboard() length: ', valueCopy ? valueCopy.length : 0);
  if (!valueCopy || valueCopy.trim().length === 0) return;
  console.log('copying...');

  let errorMessage = await copyToClipboardViaCommand(valueCopy);
  if (errorMessage) errorMessage = await copyToClipboardViaNavigator(valueCopy);

  if (errorMessage) askUserToCopyManually(valueCopy); // Last resort

  if (!errorMessage)
    window.notifications.notify(successMessage, {removeAfter: 1000});
  else
    console.log(errorMessage);

  // we can notify by event or storage about copy status
  valueCopy = null;
}

// Method 1:
//
// Return undefined for success, or a string describing the error
async function copyToClipboardViaCommand (data) {
  await tick();
  tinyAreaDom.hidden = false;
  tinyAreaDom.focus();
  tinyAreaDom.select();
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (e) {
    console.error(e);
  }
  tinyAreaDom.hidden = true;

  return successful ? undefined : 'Copy to clipboard failed.'
}

// Method 2:
//
// Return undefined for success, or a string describing the error
async function copyToClipboardViaNavigator (data) {
  console.log('copyToClipboardViaNavigator()');

  let message;
  try {
    const result = await navigator.permissions.query({name: "clipboard-write"});
    if (result.state == "granted" || result.state == "prompt") {
      await navigator.clipboard.writeText(data);
    } else {
      message = 'Permission to write to clipboard was denied.';
    }
  } catch (e) {
    console.log(e);
    message = 'Copy to clipboard was not successful.'
  }

  return message;
}

let showDataToUser = false;

// Method 3:
//
// Show a control to the user and ask them to copy the data from it
async function askUserToCopyManually(data) {
  manualCopy = data;
  showDataToUser = true;
  await tick();
  manualCopyDom.focus();
  manualCopyDom.select();
  manualCopyDom.scrollTo({top: 0, left: 0, behavior: 'auto'});
}
</script>

<textarea class='method1' hidden=true bind:this={tinyAreaDom} width='1px' height='1px'>{valueCopy}</textarea>
<div  class='centered userCopyControl' hidden={!showDataToUser}>
  <div class='centered' style='width: 90%; height: 93%;' >
    Press Ctrl-C to copy the selected text:
    <textarea style='width: 100%; height: 90%;' bind:this={manualCopyDom}>{manualCopy}</textarea>
    <button style='display: block; float: right;' on:click={() => showDataToUser=false}>Close</button>

    <!-- Nice clipboard SVG we don't need:
      <svg on:click={copyToClipboard}
        title="Copy to clipboard"
        class="octicon octicon-clippy"
        viewBox="0 0 14 16"
        version="1.1"
        width="14"
        height="16"
        aria-hidden="true">
      <path fill-rule="evenodd"
          d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"></path>
    </svg> -->
    </div>
</div>

<style>
.method1 {
  position: fixed;
  top: 0;
  left: 0;
  width: 2em;
  height: 2em;
  padding: 0;
  border: none;
  outline: none;
  box-shadow: none;
  background: transparent;
}

.centered {
  position: fixed;
  top: 50%;
  left: 50%;
  /* bring your own prefixes */
  transform: translate(-50%, -50%);
}

.userCopyControl {
  width: 80%;
  height: 500px;
  padding: 0;
  border:  2px solid;
  border-color: rgba(5, 76, 16, 0.9);
  /* outline: 10px solid;
  box-shadow: none; */
  background: rgba(110, 170, 116, 0.9);
}

svg {
  cursor: pointer;
}
</style>
