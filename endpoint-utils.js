const Sql = require('mssql');
const Config = require('./config');
const ProceduresUtils = require('./procedures-utils');

let EndpointUtils = {};

EndpointUtils.createEndpointForStoredProcedure = function(app, connection, procedure) {
    const params = ProceduresUtils.getParams(procedure);

    // TODO maybe we should define somewhere method for EP POST and GET
    const procedureName = ProceduresUtils.getName(procedure);
    app.post(Config.API + procedureName, async function (req, res) {
        // creating request
        const request = new Sql.Request(connection);
        // adding params to request
        for (let param of params) {
            const paramName = param.name;
            if (req.body && req.body[paramName]) {
                request.input(paramName, ProceduresUtils.getTypeForParam(param), req.body[paramName]);
            }
        }
        // request execting
        let results = await request.execute(procedureName);

        return results;
    });
};

module.exports = EndpointUtils;