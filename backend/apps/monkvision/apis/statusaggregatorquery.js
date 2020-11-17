/** 
 * Returns as aggregated by query.
 * 
 * Incoming params
 *  id - The query ID, which is used then to pickup the query from monkvision.json in conf. This query
 *       must return various y values, e.g. as y0, y1 etc. and then information about them as y0_info, 
 *       y1_info etc. assuming the info_suffix is _info, in this case.
 *  timeRange - The time range for the query
 *  info_suffix - The suffix for columns which carry information for the aggregated value columns
 *  $qa_<something> - The query parameters
 *  title - Optional - the title to return back
 *  
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	const queryParams = _getAdditionalQueryParams(jsonReq); const timeRange = utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange));
    queryParams.$from = timeRange.from; queryParams.$to = timeRange.to;
    const rows = await db.runGetQueryFromID(jsonReq.id, queryParams);
    if (!rows) {LOG.error("DB read issue"); return CONSTANTS.FALSE_RESULT;}

    const contents = {infos:{}}; for (const key of Object.keys(rows[0])) {
        if (key.endsWith(jsonReq.info_suffix)) 
            contents.infos[key.substring(0, key.length - jsonReq.info_suffix.length)] = rows[0][key].split(",").join("\n");
        else contents[key] = rows[0][key];
    }

    const result = {result: true, type: "piegraph", contents}; 
    if (jsonReq.title) result.contents.title = jsonReq.title; return result;
}

function _getAdditionalQueryParams(jsonReq) {
    const additional_params = {};
    for (const key of Object.keys(jsonReq)) if (key.startsWith("$qp_")) {
        const paramName = key.substring(4);
        additional_params[`$${paramName}`] = jsonReq[key];
    }
    return additional_params;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.info_suffix && jsonReq.timeRange);