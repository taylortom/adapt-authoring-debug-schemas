// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Backbone = require('backbone');
  var OriginView = require('core/views/originView');

  var SchemasView = OriginView.extend({
    tagName: 'div',
    className: 'schemas',

    fetchSchema: async function() {
      try {
        this.model.set('schema', await $.post(`/api/schema/${schemaName}`);
        this.render();

      } catch(e) {
        console.log(e);
      }
    }
  }, {
    template: 'schemas'
  });

  return LogsView;
});
