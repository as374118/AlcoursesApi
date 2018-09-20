const Config = require('./config');
const Express = require('express');
const Sql = require('mssql');
const ProceduresUtils = require('./procedures-utils');
const LogUtils = require('./log-utils');
const EndpointUtils = require('./endpoint-utils');
const BodyParser = require('body-parser');

let app = Express();

run(app);

async function run(app) {
    try {
        // Connecting to DB
        LogUtils.logInfo('Connection started');
        const connection = await Sql.connect(Config.db.magicLink);
        LogUtils.logOk('Connected to DB');

        // Fetching and preparing procedures data
        const proceduresDetails = await ProceduresUtils.getStoreProceduresInfo(connection);
        const preparedProceduresDetails = ProceduresUtils.prepareProceduresData(proceduresDetails.recordset);
        await LogUtils.logProceduresInfo(preparedProceduresDetails);

        // App configuration
        app.use(BodyParser.json()); // parse application/json
        // get all data/stuff of the body (POST) parameters
        app.use(BodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
        app.use(BodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

        // Endpoints creating
        for (let procedureName in preparedProceduresDetails) {
            LogUtils.logInfo('Creating endpoint for: ' + procedureName);
            const procedure = preparedProceduresDetails[procedureName];

            EndpointUtils.createEndpointForStoredProcedure(app, connection, procedure);
        }
        
        // App running
        app.listen(Config.PORT, function () {
            LogUtils.logOk('AlcoursesApi app listening on port ' + Config.PORT);
        });
    } catch (err) {
        LogUtils.logError('Error occured: ' + err);
    }
}