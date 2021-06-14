/** 
 * Returns contents as bar graph with data based on dynamic queries.
 * 
 * Incoming params
 *  id - The query ID, which is used then to pickup the query from monkvision.json in conf. This
 *       query must return x, y<0 to n> and infos<0 to n>
 *  timeRange - The time range for the query
 *  $qa_<something> - The query parameters
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

    const x = [], ys = [], infos = [];
    for (const [index,row] of rows.entries()) {
        x.push(utils.fromSQLiteToUTCOrLocalTime(row.x, jsonReq.notUTC)); 

        let i = 0; while (row[`y${i}`]) {if (!ys[i]) ys.push([]); ys[i][index] = row[`y${i}`]; i++;}

        for (let j = 0; j < i; j++) {   // i holds the total ys now
            if (!infos[j]) infos.push([]); 
            let additional_status = row[`info${j}`];

            additional_status = (!additional_status) || additional_status=="" ? 
                (jsonReq.nullValue?jsonReq.nullValue:additional_status) : additional_status.split(",").join("\n");

            additional_status = _getValueTemplate(jsonReq, row[`y${j}`], additional_status);

            infos[j][index] = additional_status;
        }
    }

    const result = {result: true, type: "bargraph", contents: {length:x.length,x,ys,infos}}; 
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