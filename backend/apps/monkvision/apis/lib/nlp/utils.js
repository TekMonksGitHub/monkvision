/**
 * utils.js - NLP Search Utility functions
 * 
 * (C) 2022 TekMonks. All rights reserved.
 */

const numericWords = {
    units: {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 
        'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    },
    magnitudes: {
        'hundred': 100, 'thousand': 1000, 'million': 1000000, 'billion': 1000000000, 'trillion': 1000000000000
    },
    commonWords: ["and"]
}

const durationUnits = {
    hours: ["hours", "hrs", "hr", "hour"], minutes: ["minutes", "mins", "min"], seconds: ["seconds", "second"],
    days: ["days", "day"], weeks: ["weeks", "week"], months: ["months", "month"], years: ["years", "year", "yrs"]
}

const resourceTerm = ["cluster", "server", "host", "resource"];

/**
 * Convert Numbers in string to integer
 * @param {string} sentence - Plain english sentence 
 * @returns - number (total)
 */
function _wordsToNumbers(sentence) {
    const words = sentence.toString().split(/[\s-]+/);
    const position = { base: 0, digits: 0 }; 
    words.forEach((word)=>{ _calculateNumeral(word, position) });
    return position;
}

/**
 * Calculate Numeral 
 * @param {string} word - Numbers(string or word format) 
 * @param {object} position - numeral object(total)
 */
function _calculateNumeral(word, position) {
    let value = numericWords.units[word];
    if (value != null) {
        if (!position.startWord) position.startWord = word;
        position.digits += value;
    }
    else if (numericWords.commonWords.includes(word)) return;
    else {
        value = numericWords.magnitudes[word];
        if (value != null) {
            position.base += position.digits * value;
            position.digits = 0;
        }
    }
}

/**
 * Extracted durations from query
 * @param {string} query - Plain english sentence
 * @param {string} durationIntent - Pedicted duration intent  
 */
exports.getDurationUnit = (query, durationIntent) => durationUnits[durationIntent].filter(unit => exports.intentExists(query, unit)); 

/**
 * Extract resource from query
 * @param {string} query - Plain english sentence
 */
exports.resourceExists = (query) => resourceTerm.filter(unit => exports.intentExists(query, unit)); 

/**
 * Check intents are exists in the query
 * @param {string} query - Plain english sentence
 * @param {string} unit - Intent units
 */
exports.intentExists = (query, unit) => query.split(" ").includes(unit);

/**
 * Calculate durations in minutes
 * @param {object} durations - Predicted duration Intent weight and unit
 */
exports.calculateDurationInMinutes = (durations) => {
    durations.weight = 0;
    durations.unit = "minutes";
    
    if (durations.hours) durations.weight += durations.hours * 60;
    if (durations.minutes) durations.weight += durations.minutes;
    if (durations.seconds) durations.weight += (durations.seconds / 60);
    if (durations.days) durations.weight += (durations.days * 1440);
    if (durations.weeks) durations.weight += (durations.weeks * 10080);
    if (durations.months) durations.weight += (durations.months * 43800);
    if (durations.years) durations.weight += (durations.years * 525600);

    return durations;
}

/**
 * Get Duration weight from query
 * @param {string} query - Plain english sentence
 * @param {string} durationIntent - Predicted duration Intent
 */
exports.getDurationWeight = (query, durationIntent) => {
    const durationUnit = exports.getDurationUnit(query, durationIntent);
    const queryArr = query.substring(0, query.indexOf(durationUnit[0])).trim().split(" ");
    const extractDurationWeight = queryArr[queryArr.length-1];
    if (isNaN(extractDurationWeight)) return _wordsToNumbers(queryArr.join(" "));
    else return Number(extractDurationWeight);
}