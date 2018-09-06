// This module exists to increase manual control
// This module also allow to make so-called filtering for procedures
// TODO maybe it has sense to add some options object for each procedureName {adminRequired, loggingRequired}

const Sql = require('mssql');
const LogUtils = require('./log-utils');

let ProceduresUtils = {};

const storedProceduresNames = [
    'spUserAuthenticate',
    'spAddCourseInternal',
    'spGetElementTypes',
    'spAddCourse',
    'spCheckUserRoles',
    'spGetCourses',
    'spAddAccessForUser',
    'spGetCoursesToRead',
    'spGetCoursesToModify',
    'spCheckUserAccess',
    'spAddLessonInternal',
    'spAddLesson',
    'spAddElementInternal',
    'spAddElement',
    'spGetAllLanguages',
    'spGetCourseLanguages',
    'spGetCourse',
    'spGetUserDetails',
    'spUserCreate',
    'spUpdateCourse',
    'spUpdateLesson',
    'spUpdateElement'
];

ProceduresUtils.prepareProceduresData = proceduresJSON => {
    let result = {};
    let skipped = {};


    proceduresJSON.forEach(parameter => {
        const procedureName = parameter.ObjectName;

        if (storedProceduresNames.includes(procedureName)) {
            const paramDescription = extractParameterDescription(parameter);

            if (!result[procedureName]) {
                result[procedureName] = {name: procedureName, params: [paramDescription]};
            } else {
                result[procedureName].params.push(paramDescription);
            }
        } else {
            if (!skipped[procedureName]) {
                skipped[procedureName] = true;
                LogUtils.logWarning(procedureName + ' was skipped.');
                LogUtils.logInfo('If you want to add it - please make some changes in procedure-utils file');
            }
        }
    });

    return result;
};

function extractParameterDescription(parameter) {
    return {
        name: parameter.ParameterName,
        type: parameter.ParameterDataType,
        maxBytes: parameter.ParameterMaxBytes
    };
}

ProceduresUtils.getStoreProceduresInfo = async function (connection) {
    let proceduresDetails = await connection.request().query(`
        SELECT
            SCHEMA_NAME(SCHEMA_ID) AS [Schema], 
            SO.name AS [ObjectName],
            SO.Type_Desc AS [ObjectType (UDF/SP)],
            P.parameter_id AS [ParameterID],
            P.name AS [ParameterName],
            TYPE_NAME(P.user_type_id) AS [ParameterDataType],
            P.max_length AS [ParameterMaxBytes],
            P.is_output AS [IsOutPutParameter]
        FROM sys.objects AS SO
            INNER JOIN sys.parameters AS P 
            ON SO.OBJECT_ID = P.OBJECT_ID
        WHERE SO.OBJECT_ID IN (
            SELECT OBJECT_ID 
            FROM sys.objects
            WHERE TYPE IN ('P','FN')
        )
        ORDER BY [Schema], SO.name, P.parameter_id
    `);

    return proceduresDetails;
};

ProceduresUtils.getTypeForParam = function (param) {
    switch (param.type) {
        case 'uniqueidentifier':
            return Sql.UniqueIdentifier;
        case 'int':
            return Sql.Int;
        case 'bit':
            return Sql.Bit;
        case 'nvarchar':
            return Sql.NVarChar(param.maxBytes);
        default:
            throw "Unknown type";
    }
};

ProceduresUtils.getParams = function (procedure) {
    return procedure.params;
};

ProceduresUtils.getName = function (procedure) {
    return procedure.name;
}

module.exports = ProceduresUtils;
