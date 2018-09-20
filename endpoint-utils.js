const Sql = require('mssql');
const Config = require('./config');
const ProceduresUtils = require('./procedures-utils');
const LogUtils = require('./log-utils');

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
                // LogUtils.logInfo('Passing param with name: ' + paramName + ' and value: ' + req.body[paramName] + ' and type: ');
                // console.log(ProceduresUtils.getTypeForParam(param));
                request.input(ProceduresUtils.prepareParamName(paramName), ProceduresUtils.getTypeForParam(param), req.body[paramName]);
            } else {
                LogUtils.logWarning('Parameter: ' + paramName + ' was not passed');
            }
        }
        // request execting
        let results;
        try {
            results = await request.execute(procedureName);
        } catch (err) {
            res.status(500).send(err);
        }

        return res.json(results);
    });
};

module.exports = EndpointUtils;