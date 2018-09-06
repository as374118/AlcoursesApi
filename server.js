const Config = require('./config');
const Express = require('express');
const Sql = require('mssql');
const ProceduresUtils = require('./procedures-utils');
const LogUtils = require('./log-utils');
const EndpointUtils = require('./endpoint-utils');

run(Express());

async function run(app) {
    try {
        // Connecting to DB
        LogUtils.logInfo('Connection started');
        const connection = await Sql.connect(Config.db.magicLink);
        LogUtils.logOk('Connected');

        // Fetching and preparing procedures data
        const proceduresDetails = await ProceduresUtils.getStoreProceduresInfo(connection);
        const preparedProceduresDetails = ProceduresUtils.prepareProceduresData(proceduresDetails.recordset);
        await LogUtils.logProceduresInfo(preparedProceduresDetails);

        // Endpoints creating
        for (let procedureName in preparedProceduresDetails) {
            LogUtils.logInfo('Creating endpoint for: ' + procedureName);
            const procedure = preparedProceduresDetails[procedureName];
            console.log(procedure);

            EndpointUtils.createEndpointForStoredProcedure(app, connection, procedure);
        }
        
        // App running
        app.listen(Config.PORT, function () {
            LogUtils.logInfo('AlcoursesApi app listening on port ' + Config.PORT);
        });
    } catch (err) {
        LogUtils.logInfo(err);
    }
}