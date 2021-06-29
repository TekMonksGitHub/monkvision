/* 
 * (C) 2015 TekMonks. All rights reserved.
 */
const userid = require(`${__dirname}/lib/userid.js`);

/**
 * Logs a user in
 * @param {object} jsonReq The incoming request, must have pwph property set
 */
exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	LOG.debug("Got login request for pwph: " + jsonReq.pwph);

	const result = await userid.login(jsonReq.pwph);

	if (result.result) LOG.info(`User logged in: ${result.name}`); else LOG.error(`Bad login for pwph: ${jsonReq.pwph}`);

	return {result: result.result, name: result.name, id: result.id, org: result.org, role: result.role};
}

const validateRequest = jsonReq => (jsonReq && jsonReq.pwph);
