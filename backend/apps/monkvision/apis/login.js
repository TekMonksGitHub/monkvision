/* 
 * (C) 2015 TekMonks. All rights reserved.
 */
const serverutils = require(`${CONSTANTS.LIBDIR}/utils.js`);
const httpClient = require(`${CONSTANTS.LIBDIR}/httpClient.js`);
const monkvisionconf = require(`${APP_CONSTANTS.CONF_DIR}/monkvision.json`);

const API_JWT_VALIDATION = `${monkvisionconf.TEKMONKS_LOGIN_BACKEND}/apps/loginapp/validatejwt`;

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("SSO login validation failure."); return CONSTANTS.FALSE_RESULT;}

    if (jsonReq.op == "getotk") return {...CONSTANTS.TRUE_RESULT, otk: serverutils.generateUUID(false)};
    return _verifyJWT(jsonReq.jwt);
}

async function _verifyJWT(jwt) {
    let tokenValidationResult;
    try {
        tokenValidationResult = await httpClient.fetch(`${API_JWT_VALIDATION}?jwt=${encodeURIComponent(jwt)}`);
    } catch (err) {
        LOG.error(`Network error validating Unified Login JWT: ${err}`);
        return CONSTANTS.FALSE_RESULT;
    }

    if (!tokenValidationResult.ok) {
        LOG.error("Unified Login JWT validation request failed.");
        return CONSTANTS.FALSE_RESULT;
    }

    let responseJSON;
    try { responseJSON = await tokenValidationResult.json(); }
    catch (err) { LOG.error(`Invalid Unified Login validation response: ${err}`); return CONSTANTS.FALSE_RESULT; }

    if (!responseJSON.result || responseJSON.jwt != jwt) {
        LOG.error("Unified Login JWT validation failed.");
        return CONSTANTS.FALSE_RESULT;
    }

    try {
        const jwtClaims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"));
        if (!jwtClaims.id || !jwtClaims.name || !jwtClaims.org || !jwtClaims.role) {
            LOG.error("Unified Login JWT is missing required Monkvision identity claims.");
            return CONSTANTS.FALSE_RESULT;
        }

        LOG.info(`Unified Login user logged in to Monkvision: ${jwtClaims.id}`);
        return {...CONSTANTS.TRUE_RESULT, id: jwtClaims.id, name: jwtClaims.name, org: jwtClaims.org, role: jwtClaims.role};
    } catch (err) {
        LOG.error(`Unable to decode validated Unified Login JWT claims: ${err}`);
        return CONSTANTS.FALSE_RESULT;
    }
}

const validateRequest = jsonReq => jsonReq && ((jsonReq.op == "getotk") || (jsonReq.op == "verify" && jsonReq.jwt));
