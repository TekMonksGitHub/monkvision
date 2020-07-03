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

        const x = [], y = [], info = [];
        for (const split of splits) {
            const tuples = split.split("\t\t"); time = tuples[0].substring(tuples[0].indexOf(":")+1).trim();
            if (!_isInRange(time, JSON.parse(jsonReq.timeRange))) continue;  // only send data within time range

            x.push(time);
            if (jsonReq.statusAsBoolean && jsonReq.statusAsBoolean.toLowerCase() == "true") 
                y.push(tuples[1].substring(tuples[1].indexOf(":")+1).trim());
            else y.push(tuples[1].substring(tuples[1].indexOf(":")+1).trim()=="true"?1:0.1);
            info.push(tuples[2].trim());
        }

        return {result: true, type: "bargraph", contents: {x,y,info}};
    } catch (err) {
        LOG.error(`File read issue: ${err}`);
        return {result: false};
    }
}

function _isInRange(time, range) {
    const dateFrom = new Date(range.from); const dateTo = new Date(range.to);
    
    const timeStrSplits = time.split(":")
    const timeStrFormatted = `${timeStrSplits[0]}-${timeStrSplits[1]}-${timeStrSplits[2]}T${timeStrSplits[3]}:${timeStrSplits[4]}:${timeStrSplits[5]}`;
    const timeParsed = new Date(timeStrFormatted);

    return (timeParsed >= dateFrom && timeParsed <= dateTo);
}

const validateRequest = jsonReq => (jsonReq && jsonReq.id && jsonReq.timeRange);