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
    await Promise.all([
      schema.registerSchemas(),
      framework.loadSchemas(),
      contentplugin.processPluginSchemas()
    ])
    return res.sendStatus(200)
  }
  
  async handleSchema(req, res, next) {
    const schema = await this.app.waitForModule('jsonschema')
    const schemaName = req.params.schemaName
    const s = schema.schemas[schemaName]?.raw
    if(!s) {
      return next(this.app.errors.NOT_FOUND.setData({ type: 'schema', id: req.params.schemaName }))
    }
    res.type('application/schema+json').json(s)
  }
}

export default DebugSchemasModule;
