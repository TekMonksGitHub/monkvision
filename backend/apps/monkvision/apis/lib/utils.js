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