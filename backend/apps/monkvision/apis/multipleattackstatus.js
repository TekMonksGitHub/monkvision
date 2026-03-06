/**
 * Returns multiple attack statuses in a single API call for Live Threat Status display.
 *
 * (C) 2020 TekMonks. All rights reserved.
 */
const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

/**
 * Returns the status of multiple attacks from MonBoss DB.
 * @param {object} jsonReq Incoming request, must have the following
 *                  id - The ID of the log
 *                  timeRange - String in this format -> `{from:"UTC Time", to: "UTC Time"}`
 *                  $qp_logID - Comma-separated list of log IDs to check
 */
exports.doService = async jsonReq => {
    LOG.info("Incoming request: " + JSON.stringify(jsonReq));

    if (!validateRequest(jsonReq)) {
        LOG.error("Validation failure.");
        return CONSTANTS.FALSE_RESULT;
    }

    const timeRange = utils.getTimeRangeForSQLite(jsonReq.timeRange);
    const logIDs = jsonReq.$qp_logID ? jsonReq.$qp_logID.split(',') : [];

    const attackStatuses = [];

    for (const logID of logIDs) {
        const id = logID.trim();

        try {
            const rows = await db.runGetQueryFromID(jsonReq.id, [id, timeRange.from, timeRange.to]);
            const hasAttack = rows?.some(row => row.status === 0);

        attackStatuses.push({
            name: id,
            status: hasAttack ? "THREAT" : "SAFE",
            color: hasAttack ? "#EF6461" : "#63A375",
            bgColor: `rgba(${hasAttack ? "239,100,97" : "99,163,117"},0.15)`
        });

        } catch (e) {
            LOG.error(`Error processing ${id}: ${e}`);
        }
    }
    return { result: true, type: "metriclist", contents: { attacks: attackStatuses }};
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);
