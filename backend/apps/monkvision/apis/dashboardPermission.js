/* 
 * (C) 2015 TekMonks. All rights reserved.
 */
const userid = require(`${__dirname}/lib/userid.js`);
const DASHBOARD = require(`${APP_CONSTANTS.CONF_DIR}/dashboards.json`);

/**
 * Sends a list of dashboard allowed for logged in user
 * @param {object} jsonReq The incoming request
 */
exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	LOG.debug("Got request for dashboard permission for: " + jsonReq.userId);

	const result = await userid.getRoleId(JSON.parse(jsonReq.userId));

	if (result.result) {
		LOG.info(`Got Role Id  ${result.roleID}`); 
	}else LOG.error(`Error getting Role Id :`);

	const roleParsed=JSON.parse(result.roleID);
	const result_permission= await userid.getPermission(roleParsed);
	const permission=result_permission.permission;
	
	let dashboard={};
	for(const key of Object.keys(DASHBOARD)){
		if(permission.includes(key)){
			const file = DASHBOARD[key].split(",")[0], refresh = parseInt(DASHBOARD[key].split(",")[1].split(":")[1])
			dashboard[key]=file+",refresh:"+refresh;
		}
	}
	return {result: result.result, dashboard};
}

const validateRequest = jsonReq => (jsonReq && jsonReq.userId);
