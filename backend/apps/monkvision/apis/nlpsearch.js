/** 
 * Returns Predicted Intents from NLP model.
 * 
 * (C) 2022 TekMonks. All rights reserved.
 */

const nlp = require(`${APP_CONSTANTS.LIB_DIR}/nlp.js`);

exports.doService = async jsonReq => {
    if (!validateRequest(jsonReq)) { LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT; }

    return { result: false };
    /*const predictedIntents = await nlp.predictIntents({ text: jsonReq["query"] });
    return { result: true, predictedIntents };*/
}

const validateRequest = jsonReq => (jsonReq && jsonReq.query);