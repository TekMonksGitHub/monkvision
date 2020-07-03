/** 
 * Returns MonBoss or CyberWarrior alert file's contents.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const readFileAsync = require("util").promisify(require("fs").readFile);
const filePath = "c:/Users/Rohit Kapoor/source/cyberwarrior/log/alert.log"

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	try {
        const contents = await readFileAsync(filePath, "utf8");
        return {result: contents?true:false, type: "text", contents};
    } catch (err) {
        LOG.error(`File read issue: ${err}`);
        return {result: false};
    }
}

const validateRequest = jsonReq => jsonReq?true:false;