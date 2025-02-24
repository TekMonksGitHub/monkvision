/**
 * utils.js - Utility functions
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

/**
 * Returns SQLite date from ISO date
 * @param {string} date Date in ISO format
 */
exports.fromISOToSQLite = date => new Date(date).toISOString().split("T").join(" ").slice(0, -1);

/**
 * Returns UTC or local time from SQLite UTC time string
 * @param {string} sqliteDate The incoming date from SQLite
 * @param {boolean} notUTC Set to true to convert to local time
 */
exports.fromSQLiteToUTCOrLocalTime = function(sqliteDate, notUTC) {
    const dateThisUTC = new Date(sqliteDate.split(" ").join("T")+"Z");
    const dateThisLocal = new Date(dateThisUTC.getTime()+dateThisUTC.getTimezoneOffset()*60*1000);
    const finalDate = exports.fromISOToSQLite(notUTC?dateThisLocal.toISOString():dateThisUTC.toISOString());
    return finalDate.substring(0, finalDate.lastIndexOf(".")!=-1?finalDate.lastIndexOf("."):finalDate.length);
}

 /**
  * Converts from ISO to SQLite time
  * @param {object} range Time range, {from: string in ISO time format, to: string in ISO time format}
  */
exports.getTimeRangeForSQLite = (range) => {
    return {from: exports.fromISOToSQLite(range.from), to: exports.fromISOToSQLite(range.to)}
}

/**
 * Fetches data from the database and caches it if necessary.
 * @param {string} queryFunc - The database query function name.
 * @param {string} id -  Log ID Unique identifier.
 * @param {Object} timeRange - Time range (optional).
 * @param {...any} extraParams - Additional parameters to pass to the query function.
 * @returns  Returns an array of fetched or cached data.
 */
const cache = {}; 

async function fetchAndCache(id, range, queryFunc, prepend = false, ...extraParams) {
    const rows = await db[queryFunc](id, range, ...extraParams);
    if (prepend) cache[id].data.unshift(...rows);
    else cache[id].data.push(...rows);
}

exports.fetchDBData = async function (queryFunc, id, timeRange, ...extraParams) {
    if (!timeRange) return db[queryFunc](id, ...extraParams);
    if (!cache[id]) cache[id] = { data: [], lastRange: null };
    const { lastRange } = cache[id];

    if (!lastRange) {
        await fetchAndCache(id, timeRange, queryFunc, false, ...extraParams);
        cache[id].lastRange = { ...timeRange };
    } else {
        let newFrom = timeRange.from; newTo = timeRange.to; oldFrom = lastRange.from; oldTo = lastRange.to;

        if ((newFrom < oldFrom) && (newTo > oldTo)) {
            await fetchAndCache(id, { from: newFrom, to: oldFrom }, queryFunc, true, ...extraParams);
            await fetchAndCache(id, { from: oldTo, to: newTo }, queryFunc, false, ...extraParams);
            cache[id].lastRange = { ...timeRange };
        } else if ((newTo > oldTo) && (newFrom === oldFrom)) {
            await fetchAndCache(id, { from: oldTo, to: newTo }, queryFunc, false, ...extraParams);
            cache[id].lastRange.to = newTo;
        }
    }

    return cache[id].data.filter(row => (row.timestamp >= timeRange.from) && (row.timestamp <= timeRange.to));
};

