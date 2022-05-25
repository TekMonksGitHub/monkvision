/* 
 * (C) 2020 TekMonks. All rights reserved.
 */

module.exports.initSync = _ => {
    global.APP_CONSTANTS = require(`${__dirname}/../apis/lib/constants.js`);
    require(`${APP_CONSTANTS.LIB_DIR}/db.js`).init();
    require(`${APP_CONSTANTS.LIB_DIR}/nlp.js`).init();
}