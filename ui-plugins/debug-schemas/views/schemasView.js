// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require){
  var Backbone = require('backbone');
  var OriginView = require('core/views/originView');

  var SchemasView = OriginView.extend({
    tagName: 'div',
    className: 'schemas',
    events: {
      'click .schemas-list a': 'fetchSchema'
    },

    initialize: async function(options) {
      this.model = new Backbone.Model({ schemas: await $.get(`/api/schema/list`) });
      this.listenTo(this.model, 'change', this.render)

      OriginView.prototype.initialize.apply(this, arguments);
    },
    
    fetchSchema: async function(e) {
      e.preventDefault();
      try {
        const schema = await $.get($(e.currentTarget).attr('href'));
        this.$('.schema').html(JSON.stringify(schema, null, 2));
      } catch(e) {
        console.log(e);
      }
    }
  }, {
    template: 'schemas'
  });

  return SchemasView;
});
