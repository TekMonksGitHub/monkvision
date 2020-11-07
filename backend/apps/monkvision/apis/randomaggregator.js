/** 
 * Returns random aggregated data contents. For pie type graphs.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	const contents = {}; for (let i = 0; i < jsonReq.numys; i++) contents[i] = _getRandomIntegerInThisRange(10, 100);

    const result = {result: true, type: "piegraph", contents}; 
    if (jsonReq.title) result.contents.title = jsonReq.title; return result;
}

function _getRandomIntegerInThisRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.numys);