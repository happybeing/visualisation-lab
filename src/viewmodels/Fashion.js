/** Fashion - reactive state which controls filtering and presentation 

A Fashion is owned by SourceResult but is closest to ViewModel, View and 
Filters.

A Fashion is intended to be held in a Svelte 'store' to support reactive
updates to different parts of the UI and visual presentation when it is
modified.

Design Notes (DRAFT)
------------
- A Fashion UI uses the Fashion object of its chosen active ViewModel, to 
determine the styling, presentation and behaviour of the Fashion UI and 
View components. Fashion settings can determine what is visible, what is 
selected and other qualities such as how the data is to be interpreted in 
particular contexts such as the kind of view. Some Fashion will be generic 
(e.g. "this field is temporal data") some will depend on context (e.g. 
"for plots this field maps to the X-axis", or "for networks field should 
determine icon representation").

- The Fashion includes Filters can be simple, such as a list of fields to 
be shown/hidden (where field can be a 'subject' in RDF, a 'column' in CSV 
etc). A more complex Filter might allow expressions (such as "show/hide 
rows whose 'subject' equals S", or "show/hide values with time greater than 
T" etc). Parts of the UI will provide ways to mutate the Fashion (e.g. a 
filter UI), some will just respond (e.g. a simple x-y chart view), but in 
most cases the UI will do both (e.g. a table view that lets you set a 
filter for row values in a column). Most will do both because it makes 
sense that if I can set something in more than one place (e.g. which fields 
to show), that should be reflected in any part of the UI that can change 
the setting or whose presentation is affected by it.   

- Provide multiple Fashion UIs which all work on the same underlying 
control data, each tailored to a particular context (ViewModel structure + 
View type). These can share the same underlying control data (synchronised) 
or maintain separate control data per context (independent). For example, 
when working with tabular data and line charts, or network data and graph 
presentation, when you switch between these contexts the changes made in 
one could be reflected in the other (synchronised), or changes applied in 
one might not affect the other (independent).
**/

export class Fashion {
  constructor (viewModel) {
    this.viewModel = viewModel ? viewModel : {};

    this.fieldProperties = new Map;
  }

  getViewModel () {return this.viewModel;}

  /** Early features - proof of concept level
   * 
   * TODO: WARNING - these need review and are likely to change (feedback welcome!)
   *
   * TODO: For now many things are on this class which might migrate to separate objects
   * such as 'Filters', 'Styles' and perhaps with sub-objects for different contexts
   * such as data models or View types (see ViewModel classes, modelFormats.js and View
   * components).
   */

  //// Prototype support for simple filters
  getFields () { return this.viewModel.getFields();}
  setFieldsVisibility (fieldNames, visible) {
    fieldNames.forEach( field => {
      const properties = this.fieldProperties.get(field) || {};
      properties.visible = visible;
      this.fieldProperties.set(field, properties);
    });
  }

  getFieldsVisibility (visible, defaultVisibility) {
    const visibleFields = []
    this.fieldProperties.keys().forEach(properties, field => {
      if (properties.visible ? properties.visible : defaultVisibility) visibleFields.push(field);
    });
    return visibleFields;
  }

  setFieldsProperty (fieldNames, property, value) {
    fieldNames.forEach( field => {
      const properties = this.fieldProperties.get(field) || {};
      properties[property] = value;
      this.fieldProperties.set(field, properties);
    });  
  }

  getFieldsWithProperty (property, value, defaultValue) {
    const matchingFields = []
    this.fieldProperties.forEach((properties, field) => {
      if ((properties && properties[property] ? properties[property] : defaultValue) == value) matchingFields.push(field);
    });
    return matchingFields;
  }

  /** compare field property with a given value
   * 
   * Note: the result of the comparison will depend on the type of the
   * stored property, the value and defaultValue. So if you want numeric
   * ordering, you should take care to pass a Number type when setting the
   * property and when calling this function.
   * 
   * @param {*} field         name of the field
   * @param {*} property      name of the property
   * @param {*} value         value to compare
   * @param {*} defaultValue  a default if the property is not set
   * 
   * @returns -1 for less than, 
   *           0 for equal, 
   *           1 for value greater than the property value (or defaultValue)
   */
  compareFieldProperty (field, property, value, defaultValue) {
    const properties = this.fieldProperties.get(field) || {};
    const propertyValue = properties[property] || defaultValue;
    return (propertyValue < value ? -1 : 
            propertyValue > value ? 1 : 0);
   }
}