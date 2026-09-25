/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {session} from "/framework/js/session.mjs";
import {securityguard} from "/framework/js/securityguard.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {i18n} from "/framework/js/i18n.mjs";
import {router} from "/framework/js/router.mjs";

let currTimeout; let logoutListeners = [];

async function handleLoginResult(fetchResponse) {
    logoutListeners = [];   // reset listeners on sign in
    const {url, headers, response} = fetchResponse || {};
    if (!response?.result) {LOG.error("Unified Login failed."); return false;}

    apiman.addJWTToken(url, headers, response);
    session.set(APP_CONSTANTS.USERID, response.id);
    session.set(APP_CONSTANTS.USERNAME, response.name);
    session.set(APP_CONSTANTS.USERORG, response.org);
    securityguard.setCurrentRole(response.role);
    startAutoLogoutTimer();
    router.loadPage(APP_CONSTANTS.MAIN_HTML);
    return true;
}

const addLogoutListener = listener => logoutListeners.push(listener);

async function logout() {
    for (const listener of logoutListeners) await listener();

    const savedLang = session.get($$.MONKSHU_CONSTANTS.LANG_ID);
    _stoptAutoLogoutTimer(); session.destroy(); 
    securityguard.setCurrentRole(APP_CONSTANTS.GUEST_ROLE);
    session.set($$.MONKSHU_CONSTANTS.LANG_ID, savedLang);
	await i18n.init(APP_CONSTANTS.APP_PATH);
	router.loadPage(APP_CONSTANTS.LOGIN_HTML);
}

function startAutoLogoutTimer() {
    if (!session.get(APP_CONSTANTS.USERID)) return; // not logged in
    
    const events = ["load", "mousemove", "mousedown", "click", "scroll", "keypress"];
    const resetTimer = _=> {
        _stoptAutoLogoutTimer(); 
        currTimeout = setTimeout(_=>{LOG.error("Auto logout on timeout"); logout();}, APP_CONSTANTS.TIMEOUT);
    }
    for (const event of events) {document.addEventListener(event, resetTimer);}
    resetTimer();   // start the timing
}

function _stoptAutoLogoutTimer() {
    if (currTimeout) {clearTimeout(currTimeout); currTimeout = null;}
}

export const loginmanager = {handleLoginResult, logout, startAutoLogoutTimer, addLogoutListener}
