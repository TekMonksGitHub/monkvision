/** 
 * Returns MonBoss or CyberWarrior log file's contents.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    
    const rows = await db.getLogs(jsonReq.id, _getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {LOG.error(`DB read issue: ${err}`); return CONSTANTS.FALSE_RESULT;}

    const x = [], y = [], info = [], falseStatusValue = jsonReq.statusFalseValue?jsonReq.statusFalseValue:0.1;
    for (const row of rows) {
        x.push(row.timestamp);
        if (jsonReq.statusAsBoolean && jsonReq.statusAsBoolean.toLowerCase() == "true") 
            y.push(row.status==1?true:false); else y.push(row.status==1?1:falseStatusValue);
        info.push(row.additional_status);
    }

    return {result: true, type: "bargraph", contents: {length:x.length,x,ys:[y],infos:[info]}};
}

function _getTimeRangeForSQLite(range) {
    const fromISOToSQLIte = date => {
        const dateThis = new Date(date);
        const strDate = dateThis.toISOString();
        const splits = strDate.split("T");
        const joins = splits.join(" ");
        const withoutZ = joins.slice(0, -1);
        return withoutZ;
    }
    return {from: fromISOToSQLIte(range.from), to:  fromISOToSQLIte(range.to)}
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);