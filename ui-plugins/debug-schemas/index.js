// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  const Origin = require('core/origin');
  const SchemasView = require('./views/schemasView');

  Origin.on('debug:ready', () => {
    Origin.trigger(`debug:addView`, { 
      name: 'schemas', 
      icon: 'file', 
      title: Origin.l10n.t('app.schemas'), 
      view: SchemasView
    })
  })
});
