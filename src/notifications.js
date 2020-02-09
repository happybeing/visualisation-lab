/** Helper to provide access to svelte-notifications throughout app including imported JS files

Usage - in App.svelte (earlier the better):
  <script>
  import Notifications from 'svelte-notifications';
  import { notifications } from './notifications.js';

  // From this point any script can get/set the default svelte-notification options with
  //   window.notifications.setOptions(options) / window.notifications.setOptions(options)
  //
  // Details: https://github.com/keenethics/svelte-notifications#getnotificationscontextaddnotification
  </script>

  <Notifications>
  <div><h1>Hello world</h1></div>
  </Notifications>

Usage - inside component:
  <script>
  import Notifications from 'svelte-notifications';

  import {getNotificationsContext} from 'svelte-notifications';
  window.notifications.setNotificationsContext(getNotificationsContext);
  </script>

  <Notifications>
  <div>A component</div>
  </Notifications>

  // Then within the component JS or in any JS files imported by components:
  window.notifications.notify(message);
  window.notifications.notifyWarning(message);
  window.notifications.notifyError(message);
  window.clearNotifications();
  // and...
  <button on:click={() => window.notifications.notifySuccess('Well done!')}>Notify me</button>

BUG: Notifications that don't disappear and can't be dismissed with a click.
This can occur when creating multiple notifications in succession. I was not able to replicate 
this in my src/svelte/test-svelte-notifications repo. It happens every time if I have the 
following code in the Visualisation Lab WebSparqlUI.loadSparqlQuery() method AND I 
click 'Run Query' multiple times:

  window.notifications.notify('Blimey');
  window.notifications.notifyWarning('Warn');
  window.notifications.notifyError('Err');
  window.notifications.notifySuccess('Succ');

The issue might related to the memory being used in processing multiple query returns as these
are quite large and I have a lot of console.log() output in there right now. I plan to monitor
this and see if the issue happens in other situations.
*/ 

import { getNotificationsContext } from 'svelte-notifications';

class AppNotifications {
  constructor () {
    window.notifications = this;
    this.nextKey = 1;

    // Default notification options. To customise use setOptions() at any time.
    this.notificationOptions = {
      type: 'default',
      position: 'bottom-center',
      removeAfter: 5000,
    }
  }
    
  // AppNotifications API (see 'usage' at top of notifications.js)
 
  setNotificationsContext (svelteNotificationsContext) {
  let {addNotification, removeNotification, clearNotifications, subscribe} = svelteNotificationsContext();
  
  this.addNotification = addNotification;
  this.removeNotification = removeNotification;
  this.clearNotifications = clearNotifications;
  this.subscribe = subscribe;
  }

  getOptions () {return this.notificationOptions;}
  setOptions (options) { Object.assign(this.notificationOptions, options);}

  notify(message) {
    this._notify(Object.assign({key: this.nextKey++}, this.notificationOptions,  {text: message, type: 'default'}));
  }

  notifySuccess(message) {
    this._notify(Object.assign({key: this.nextKey++}, this.notificationOptions,  {text: message, type: 'success'}));
  }

  notifyWarning(message) {
    this._notify(Object.assign({key: this.nextKey++}, this.notificationOptions,  {text: message, type: 'warning'}));
  }

  notifyError(message) {
    this._notify(Object.assign({key: this.nextKey++}, this.notificationOptions,  {text: message, type: 'danger'}));
  }
    
  removeNotification (id) {
    if (!window.notifications) return;
    this.removeNotification(id);
  }

  clearNotifications () {
    if (!window.notifications) return;
    this.clearNotifications();
  }

  subscribe (callback) {
    if (!window.notifications) return;
    this.subscribe(callback);
  }

  // AppNotifications implementation

  _notify(options) {
    console.log('_notify('+JSON.stringify(options)+')');
    if (!window.notifications) return _prematureNotify(options);

    Object.assign(options, {text: options.text});
    this.addNotification(options);
  }

  _prematureNotification(options) {
    throw Error('AppNotifications used before notifier has been initialised. Notification failed for: ' + JSON.stringify(options));
  }
}

export const notifications = new AppNotifications;