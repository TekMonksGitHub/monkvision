/** 
 * Returns MonBoss or CyberWarrior log file's status as banner text.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	const rows = await db.getLogs(jsonReq.id, utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {LOG.error(`DB read issue: ${err}`); return CONSTANTS.FALSE_RESULT;}

    let numTrue = 0, numFalse = 0;
    for (const row of rows) if (row.status==1) numTrue++; else numFalse++;

    // calculate issue percentage
    const round = Math.round, truePercent = numTrue*100/(numTrue+numFalse), colorCode = `percent${round(truePercent)}Colors`, 
        iconCode = `percent${round(truePercent)}Icon`, explanationCode = `percent${round(truePercent)}Explanation`, 
        titleCode = `percent${round(truePercent)}Title`;

    // set title
    let title = null;
    if (jsonReq[titleCode]) title = jsonReq[titleCode];
    else if (jsonReq["elseTitle"]) title = jsonReq["elseTitle"];

    // set icon
    let icon = null;
    if (jsonReq[iconCode]) icon = jsonReq[iconCode];
    else if (jsonReq["elseIcon"]) icon = jsonReq["elseIcon"];;
    
    // set color codes based on success percentage
    let fgcolor = "rgb(72,72,72)", bgcolor = "white";
    if (jsonReq[colorCode]) {fgcolor = jsonReq[colorCode].split(",")[0], bgcolor = jsonReq[colorCode].split(",")[1]}
    else if (jsonReq["elseColors"]) {fgcolor = jsonReq["elseColors"].split(",")[0], bgcolor = jsonReq["elseColors"].split(",")[1]};

    // set explanation text based on success percentage
    let textexplanation = "Percent true";
    if (jsonReq[explanationCode]) textexplanation = jsonReq[explanationCode];
    else if (jsonReq["elseExplanation"]) textexplanation = jsonReq["elseExplanation"];

    const result = {result: true, type: "metrictext", contents: {textmain:`${round(truePercent)} %`, fgcolor, bgcolor, textexplanation}}; 
    if (title) result.contents.title = title; if (icon) result.contents.icon = icon; return result;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);