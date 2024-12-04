/** 
 * Returns random loggraph data for MonkVision.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const utils = require(`${APP_CONSTANTS.LIB_DIR}/utils.js`);

/**
 * Note this API works in UTC unless the local time adjustment flag is specified. 
 * @param {object} jsonReq Incoming request, must have the following
 *                  numentries - The number of entries needed
 *                  numys - The number of Ys required
 *                  yrange - The range for Ys
 *                  timeRange - {from:"UTC Time", to: "UTC Time"}
 *                  
 *              Optionally
 *                  notUTC - Return results in server's local time not UTC
 */
exports.doService = async jsonReq => {
    if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    jsonReq.yrange = {from: parseInt(jsonReq.yrange.split("-")[0]), to: parseInt(jsonReq.yrange.split("-")[1])}; 
    
    const x = _getRandomTimes(jsonReq.timeRange, jsonReq.numentries, jsonReq.notUTC), 
        ys = _getRandomYs(jsonReq.numys, jsonReq.numentries, jsonReq.yrange), 
        {infos, legends} = _getRandomInfosAndLegends(jsonReq.numys, jsonReq.numentries);

    const result = {result: true, type: "bargraph", contents: {length:x.length,x,ys,infos,legends}}; 
    if (jsonReq.title) result.contents.title = jsonReq.title; return result;
}

function _getRandomTimes(timeRange, numentries, notUTC) {
    const from = Date.parse(timeRange.from), to = Date.parse(timeRange.to), randomDates = [];
    for (let i = 0; i < numentries; i++) randomDates.push(_getRandomIntegerInThisRange(from, to));
    randomDates.sort((a,b)=>a-b);

    for (const [i,randomTimestamp] of randomDates.entries()) {
        randomDate = new Date(randomTimestamp), sqliteFormat = utils.fromISOToSQLite(randomDate.toISOString()),
            finalFormat = utils.fromSQLiteToUTCOrLocalTime(sqliteFormat, notUTC);
        randomDates[i] = finalFormat;
    }

    return randomDates;
}

function _getRandomYs(numys, numentries, yrange) {
    const ys = [];
    for (let i = 0; i < numys; i++) {
        const col = [];
        for (j = 0; j < numentries; j++) col.push(_getRandomIntegerInThisRange(yrange.from, yrange.to));
        ys.push(col);
    }

    return ys;
}

function _getRandomInfosAndLegends(numys, numentries) {
    const infos = [], legends = [];
    for (let i = 0; i < numys; i++) {
        const col = [];
        for (j = 0; j < numentries; j++) col.push(_getRandomText());
        infos.push(col); legends.push(`Data ${i+1}`);
    }

    return {infos, legends};
}

function _getRandomText(wordCount=4) {
    const alphabet = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,r,s,t,u,v,w,x,y,z".split(",");
    
    let text = "";
    for (let i=0; i<wordCount; i++) {
        for (let x=0; x<7; x++) {
            const rand = Math.floor(Math.random() * alphabet.length);
            text += alphabet[rand];
        }
        if (i<wordCount-1) text += " "; else text += ".";
    }

    return text;
}

function _getRandomIntegerInThisRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.numys && jsonReq.yrange && jsonReq.numentries && jsonReq.timeRange);