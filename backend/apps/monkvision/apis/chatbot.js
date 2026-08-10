/**
 * Chatbot API - interactive alert assistant.
 *
 * Request:  POST { message: string, session: object }
 * Response: { result: true, reply: string, session: object }
 *
 * Session phases:
 *   idle            - ready for a new alert query
 *   awaiting_intent - AI asked follow-up, waiting for yes/no/specific
 *
 * (C) 2020 TekMonks. All rights reserved.
 */

const session_utils             = require(`${APP_CONSTANTS.LIB_DIR}/session.js`);
const { runAlertPipeline }      = require(`${APP_CONSTANTS.LIB_DIR}/chatbot/chatbot_sql_pipeline.js`);
const { runIntentPipeline }     = require(`${APP_CONSTANTS.LIB_DIR}/chatbot/chatbot_intent_pipeline.js`);

const MSG_PIPELINE_ERROR        = "Sorry, I ran into an error. Please try again.";
const MSG_UNKNOWN_PHASE         = "Sorry, I could not process that.";

exports.doService = async jsonReq => {
    if (!_validateRequest(jsonReq)) {
        LOG.error("Chatbot validation failure.");
        return CONSTANTS.FALSE_RESULT;
    }

    const message = jsonReq.message.trim();
    const session = session_utils.initSession(jsonReq.session);

    try {
        if (session.phase === session_utils.PHASE_IDLE)
            return await runAlertPipeline(message, session);
        if (session.phase === session_utils.PHASE_AWAITING_INTENT)
            return await runIntentPipeline(message, session, runAlertPipeline);
    } catch (err) {
        LOG.error(`Chatbot pipeline error: ${err.message}`);
        return session_utils.reply(message, MSG_PIPELINE_ERROR, session);
    }

    return session_utils.reply(message, MSG_UNKNOWN_PHASE, session);
};

const _validateRequest = jsonReq =>
    jsonReq && jsonReq.message && typeof jsonReq.message === "string" && jsonReq.message.trim().length > 0;