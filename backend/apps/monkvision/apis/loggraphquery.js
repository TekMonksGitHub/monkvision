/** 
 * Returns MonBoss or CyberWarrior log file's contents as bar graph
 * data based on dynamic queries.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */
const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

/**
 * Returns the log entries from MonBoss, or MonBoss type DBs. Note this API works in UTC unless the local
 * time adjustment flag is specified. Query is variable and a parameter.
 * @param {object} jsonReq Incoming request, must have the following
 *                  id - query file ID
 *                  timeRange - String in this format -> `{from:"UTC Time", to: "UTC Time"}`
 *                  
 *              Optionally
 *                  nullValue - If additonal status is null or empty return it as this value
 *                  notUTC - Return results in server's local time not UTC
 */
exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    
    const queryParams = _getAdditionalQueryParams(jsonReq); const timeRange = utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange));
    queryParams.$from = timeRange.from; queryParams.$to = timeRange.to;
    const rows = await db.runGetQueryFromID(jsonReq.id, queryParams);
    if (!rows) {LOG.error("DB read issue"); return CONSTANTS.FALSE_RESULT;}

    const x = [], y = [], info = [];
    for (const row of rows) {
        x.push(utils.fromSQLiteToUTCOrLocalTime(row.timestamp, jsonReq.notUTC)); y.push(row.status);
        info.push(!row.additional_status || row.additional_status=="" ? 
            (jsonReq.nullValue?jsonReq.nullValue:row.additional_status) : 
                _getValueTemplate(jsonReq, row.status, row.additional_status.split(",").join("\n")));
    }

    const result = {result: true, type: "bargraph", contents: {length:x.length,x,ys:[y],infos:[info]}}; 
    if (jsonReq.title) result.contents.title = jsonReq.title; return result;
}

function _getValueTemplate(jsonReq, y, value) {
    if (!jsonReq.valueTemplate) return value;
    let finalValue = jsonReq.valueTemplate; finalValue = finalValue.replace("$$yvalue$$", y).replace("$$value$$", value);
    return finalValue;
}

function _getAdditionalQueryParams(jsonReq) {
    const additional_params = {};
    for (const key of Object.keys(jsonReq)) if (key.startsWith("$qp_")) {
        const paramName = key.substring(4);
        additional_params[`$${paramName}`] = jsonReq[key];
    }
    return additional_params;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);