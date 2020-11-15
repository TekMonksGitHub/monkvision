/** 
 * db.js - DB layer. Auto creates the DB with the DDL if needed.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
const util = require("util");
const sqlite3 = require("sqlite3");
const DB_QUERIES = require(`${APP_CONSTANTS.CONF_DIR}/monkvision.json`).queries;
const DB_PATH = require("path").resolve(require(`${APP_CONSTANTS.CONF_DIR}/monkvision.json`).db);

let dbInstance, dbRunAsync, dbAllAsync;

/**
 * Read given alerts from the DB
 * @param {object} range The time range
 * @param {callback} function Optional callback function
 * @return The rows read or false on error - returned via async or callback (if callback is provided)
 */
exports.getAlerts = async (range, callback) => {
    const query = "select timestamp, error, additional_err from alerts where timestamp >= ? and timestamp <= ?";
    const rows = await exports.getQuery(query, [range.from, range.to]);
    if (callback) callback(rows?null:"DB read error", rows?rows:null);
    else return rows;
}

/**
 * Read given log entries from the DB
 * @param {string} logid The log ID
 * @param {object} range The time range
 * @param {callback} function Optional callback function
 * @return The rows read or false on error - returned via async or callback (if callback is provided)
 */
exports.getLogs = async (logid, range, callback) => {
    const query = "select timestamp, status, additional_status from logs where logid = ? and timestamp >= ? and timestamp <= ?";
    const rows = await exports.getQuery(query, [logid, range.from, range.to]);
    if (callback) callback(rows?null:"DB read error", rows?rows:null);
    else return rows;
}

/**
 * Runs the given SQL command e.g. insert, delete etc.
 * @param {string} cmd The command to run
 * @param {array} params The params for SQL - array or object
 * @return true on success, and false on error
 */
exports.runCmd = async (cmd, params=[]) => {
    await _initDB(); 
    try {await dbRunAsync(cmd, params); return true}
    catch (err) {LOG.error(`DB error running, ${cmd}, with params ${params}, error: ${err}`); return false;}
}

/**
 * Runs the given query e.g. select and returns the rows from the result.
 * @param {string} cmd The command to run
 * @param {object} params The params for SQL - array or object
 * @return rows array on success, and false on error 
 */
exports.getQuery = async(cmd, params=[]) => {
    await _initDB(); 
    try {return await dbAllAsync(cmd, params);}
    catch (err) {LOG.error(`DB error running, ${cmd}, with params ${JSON.stringify(params)}, error: ${err}`); return false;}
}

/**
 * Runs the given query from ID, e.g. select and returns the rows from the result.
 * @param {string} id The query ID
 * @param {array} params The params for the SQL
 */
exports.runGetQueryFromID = async (id, params=[]) => await exports.getQuery(DB_QUERIES[id], params);

exports.init = async _ => await _initDB();

async function _initDB() {
    if (!await _openDB()) return false; else return true;
}

function _openDB() {
    return new Promise(resolve => {
		if (!dbInstance) dbInstance = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE, err => {
            if (err) {LOG.ERROR(`Error opening DB, ${err}`, true); resolve(false);} 
            else {
                dbRunAsync = util.promisify(dbInstance.run.bind(dbInstance)); 
                dbAllAsync = util.promisify(dbInstance.all.bind(dbInstance)); 
                resolve(true);
            }
		}); else resolve(true);
	});
}