/** 
 * Returns contents as csv formatted data.
 * 
 * Incoming params
 *  id - The log ID, which is passed from dashboard_*.page as one of param.
 *  timeRange - Timestamp format -> `{from:"UTC Time", to: "UTC Time"}`
 *  propertyToGather - Specify which key to access in additional status property.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

exports.doService = async jsonReq => {
    if (!validateRequest(jsonReq)) {
        LOG.error("Validation failure.");
        return CONSTANTS.FALSE_RESULT;
    }

    const rows = await db.getLogs(jsonReq.id, utils.getTimeRangeForSQLite(JSON.parse(jsonReq.timeRange)));
    if (!rows) {
        LOG.error("DB read issue");
        return CONSTANTS.FALSE_RESULT;
    }

    let headers = ["Timestamp"], firstRow = Object.keys(JSON.parse(rows[0].additional_status)), 
            lastRow = Object.keys(JSON.parse(rows[rows.length - 1].additional_status)),
            nodeList = (lastRow.length > firstRow.length) ? lastRow : firstRow;
    
    headers = headers.concat(nodeList); 
    headers.push("Additional Error");

    let csvContent = [], csvData;
    for (let row of rows) {
        let rowContent = []; rowContent.push(utils.fromSQLiteToUTCOrLocalTime(row.timestamp, jsonReq.notUTC));
        try{
            parsedAddStatus = JSON.parse(row.additional_status);
            for (let i=1; i<headers.length-1; i++)
                rowContent[i] = parsedAddStatus[headers[i]] ? (parsedAddStatus[headers[i]][jsonReq.propertyToGather] || "-") : "-";
        }catch(e){
            for (let i=1; i<headers.length-1; i++) rowContent[i] = "N/A";
            rowContent.push(JSON.stringify(row.additional_status).replace(/\\/g, ''));
        }
        csvContent.push(rowContent);
    }
    csvData = headers+ "\n" +csvContent.join("\n");

    const result = {
        result: true,
        type: "csv",
        contents: {
            csvData
        }
    };
    if (jsonReq.title) result.contents.title = jsonReq.title;
    return result;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);