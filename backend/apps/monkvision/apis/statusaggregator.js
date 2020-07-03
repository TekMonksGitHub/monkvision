/** 
 * Returns MonBoss or CyberWarrior log file's contents.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

const readFileAsync = require("util").promisify(require("fs").readFile);
const filePath = "c:/Users/Rohit Kapoor/source/cyberwarrior/log"

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	try {
        const contents = await readFileAsync(`${filePath}/${jsonReq.id}`, "utf8");
        const rawSplits = contents.split("\n\n"); const splits = [];
        for (const split of rawSplits) if (split.startsWith("time:")) splits.push(split); else splits[splits.length - 1] += `\n\n${split}`;

        let numTrue = 0, numFalse = 0;
        for (const split of splits) {
            const tuples = split.split("\t\t");
            if (tuples[1].substring(tuples[1].indexOf(":")+1).trim()=="true") numTrue++; else numFalse++;
        }

        return {result: true, type: "piegraph", contents: {1: numTrue, 0: numFalse}};
    } catch (err) {
        LOG.error(`File read issue: ${err}`);
        return {result: false};
    }
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id);