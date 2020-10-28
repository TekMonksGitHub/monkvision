/** 
 * Returns MonBoss or CyberWarrior log file's contents.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);

/**
 * Returns the log entries from MonBoss, or MonBoss type DBs. Note this API works in UTC unless the local
 * time adjustment flag is specified. 
 * @param {object} jsonReq Incoming request, must have the following
 *                  id - The ID of the log
 *                  timeRange - String in this format -> `{from:"UTC Time", to: "UTC Time"}`
 *                  
 *              Optionally
 *                  statusFalseValue - If status is false, then return it as this value, used only if statusAsBoolean - false
 *                  statusTrueeValue - If status is true, then return it as this value, used only if statusAsBoolean - false
 *                  statusAsBoolean - Return status as a boolean variable, not values
 *                  nullValue - If additonal status is null or empty return it as this value
 *                  notUTC - Return results in server's local time not UTC
 */
exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    
    const rows = await db.getLogs(jsonReq.id, _getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {LOG.error(`DB read issue: ${err}`); return CONSTANTS.FALSE_RESULT;}

    const x = [], y = [], info = [], falseStatusValue = jsonReq.statusFalseValue?jsonReq.statusFalseValue:0.1,
        trueStatusValue = jsonReq.statusTrueValue?jsonReq.statusTrueValue:1;
    for (const row of rows) {
        const dateThisUTC = new Date(row.timestamp.split(" ").join("T")+"Z");
        const dateThisLocal = new Date(dateThisUTC.getTime()+dateThisUTC.getTimezoneOffset()*60*1000);
        x.push(_fromISOToSQLIte(jsonReq.notUTC?dateThisLocal.toISOString():dateThisUTC.toISOString()));
        if (jsonReq.statusAsBoolean && jsonReq.statusAsBoolean.toLowerCase() == "true") 
            y.push(row.status==1?true:false); else y.push(row.status==1?trueStatusValue:falseStatusValue);
        info.push(!row.additional_status || row.additional_status=="" ? 
            (jsonReq.nullValue?jsonReq.nullValue:row.additional_status) : row.additional_status);
    }

    const result = {result: true, type: "bargraph", contents: {length:x.length,x,ys:[y],infos:[info]}}; 
    if (jsonReq.title) result.title = jsonReq.title; return result;
}

const _fromISOToSQLIte = date => new Date(date).toISOString().split("T").join(" ").slice(0, -1);

function _getTimeRangeForSQLite(range) {
    return {from: _fromISOToSQLIte(range.from), to: _fromISOToSQLIte(range.to)}
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);