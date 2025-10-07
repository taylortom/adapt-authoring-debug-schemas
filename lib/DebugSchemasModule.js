import { AbstractModule } from 'adapt-authoring-core';
/**
* Adds schemas to the debug panel
* @extends debug
* @extends {AbstractModule}
*/
class DebugSchemasModule extends AbstractModule {
  /** @override */
  async init() {
    const [auth, server, ui] = await this.app.waitForModule('auth', 'server', 'ui');
    ui.addUiPlugin(`${this.rootDir}/ui-plugins`);

    const router = server.api.createChildRouter('schema', [{
      route: '/list',
      handlers: { get: this.handleSchemaList.bind(this) }
    }, {
      route: '/reload',
      handlers: { post: this.handleSchemaReload.bind(this) }
    }, {
      route: '/:schemaName',
      handlers: { get: this.handleSchema.bind(this) }
    }])

    auth.secureRoute(`${router.path}/:schemaName`, 'GET', ['debug'])
    auth.secureRoute(`${router.path}/list`, 'GET', ['debug'])
    auth.secureRoute(`${router.path}/reload`, 'POST', ['debug'])
  }

  async handleSchemaList(req, res, next) {
    const schema = await this.app.waitForModule('jsonschema')
    return res.json(Object.keys(schema.schemas).sort())
  }
  
  async handleSchemaReload(req, res, next) {
    const [contentplugin, framework, schema] = await this.app.waitForModule('contentplugin', 'adaptframework', 'jsonschema')
    await schema.registerSchemas()
    await framework.loadSchemas()
    await contentplugin.processPluginSchemas()
    return res.sendStatus(200)
  }
  
  async handleSchema(req, res, next) {
    const jsonschema = await this.app.waitForModule('jsonschema')
    const schemaName = req.params.schemaName
    const schema = jsonschema.schemas[schemaName]
    const raw = schema.raw
    if(!schema) {
      return next(this.app.errors.NOT_FOUND.setData({ type: 'schema', id: req.params.schemaName }))
    }
    raw.extensions = schema.extensions
    raw.ancestors = []
    let parent = raw
    while(parent?.$merge) {
      parent = jsonschema.schemas[parent.$merge.source?.$ref]?.raw
      if(parent) raw.ancestors = [parent.$anchor, ...raw.ancestors]
    }
    if(schemaName !== 'base') raw.ancestors = ['base', ...raw.ancestors]
    res.type('application/schema+json').json(raw)
  }
}

export default DebugSchemasModule;
