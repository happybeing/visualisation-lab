/** Fashions control filtering and presentation of ViewModels

A Fashion View is similar to and has the same API as a View component.

The main difference between View and Fashion components is that a View presents ViewModel 
data, whereas a Fashion View both presents that data and augments the ViewModel with control 
properties which can affect Views (and other Fashion components).

A Fashion View is passed a store holding a ViewModel which it uses to modify and react to 
changes in the model.

A Fashion View can be created stand-alone and will affect any Views also subscribed to the 
store.

A View may also use a Fashion View as a sub-component to add functionality for filtering 
and controlling how it presents its

**/
export class Fashion {
  constructor (viewModel) {
    this.viewModel = viewModel ? viewModel : {};

    this.fieldProperties = new Map;
    // console.log('DEBUG Fashion() DONE fieldProperties: '); this.fieldProperties.forEach(logMapElements); console.dir(this.fieldProperties);
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
    // console.log('DEBUG setFieldsVisibility() DONE fieldProperties: '); this.fieldProperties.forEach(logMapElements); console.dir(this.fieldProperties);
  }

  getFieldsWithVisibility (visible, defaultVisibility) {
    const visibleFields = []
    this.viewModel.getJsonModelFields().forEach(field => {
      let properties = this.fieldProperties.get(field);
      if (properties && properties.visible ? properties.visible : defaultVisibility) visibleFields.push(field);
    });
    return visibleFields;
  }

  setFieldsProperty (fieldNames, property, value) {
    // console.log('DEBUG setFieldsProperty()');
    fieldNames.forEach( field => {
      const properties = this.fieldProperties.get(field) || {};
      properties[property] = value;
      this.fieldProperties.set(field, properties);
    });  
    // console.log('DEBUG setFieldsProperty() DONE fieldProperties: '); this.fieldProperties.forEach(logMapElements); console.dir(this.fieldProperties);
  }

  clearAllFieldsOfProperty (property) {
    this.fieldProperties.forEach( properties => {
      if (properties[property] != undefined) delete properties[property];
    });

    // console.log('DEBUG clearAllFieldsOfProperty() DONE fieldProperties: '); this.fieldProperties.forEach(logMapElements); console.dir(this.fieldProperties);
  }

  getFieldsWithProperty (property, value, defaultValue) {
    const matchingFields = [];
    // console.log('DEBUG getFieldsWithProperty(' + property + ')');console.dir(this.fieldProperties);
    this.viewModel.getJsonModelFields().forEach(field => {
      let properties = this.fieldProperties.get(field);
      if ((properties && properties[property] !== undefined ? properties[property] : defaultValue) === value) matchingFields.push(field);
    });
    // console.log('DEBUG getFieldsWithProperty(' + property + ', ' + value + ', ' + defaultValue + ')');console.dir(matchingFields);
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
   * @param {*} caseSensitive [optional] if true, and property is a string ignore case in comparisson
   * 
   * @returns -1 for less than, 
   *           0 for equal, 
   *           1 for value greater than the property value (or defaultValue)
   */
  compareFieldProperty (field, property, value, defaultValue, caseSensitive) {
    const properties = this.fieldProperties.get(field) || {};
    caseSensitive = caseSensitive || false;

    let propertyValue = properties[property] || defaultValue;
    if (!caseSensitive && typeof(value) === String && typeof(propertyValue) === String) {
      value = value.toLowerCase();
      propertyValue = value.toLowerCase();
    }
    return (propertyValue < value ? -1 : 
            propertyValue > value ? 1 : 0);
   }
}

// DEBUG helper
function logMapElements(value, key, map) {
  console.log(`m[${key}] = ${JSON.stringify(value)}`);
}
