/** 
 * Returns MonBoss or CyberWarrior log file's status as aggregated.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	const rows = await db.getLogs(jsonReq.id, utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {LOG.error("DB read issue"); return CONSTANTS.FALSE_RESULT;}

    let numTrue = 0, numFalse = 0; const infos = {0:""};
    for (const row of rows) {   // count true, false and add in system names whereever found for false
        if (row.status==1) numTrue++; else {numFalse++; if (row.system) infos[0] += row.system+"\n";}
    } infos[0] = infos[0].trim();   // get rid of trailing \n

    const result = {result: true, type: "piegraph", contents: {1: numTrue, 0: numFalse, infos}}; 
    if (jsonReq.title) result.contents.title = jsonReq.title; return result;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);