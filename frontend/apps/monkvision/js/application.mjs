/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
 
import {router} from "/framework/js/router.mjs";
import {session} from "/framework/js/session.mjs";
import {loadbalancer} from "/framework/js/loadbalancer.mjs";
import {securityguard} from "/framework/js/securityguard.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {APP_CONSTANTS as AUTO_APP_CONSTANTS} from "./constants.mjs";

const init = async hostname => {
	window.monkshu_env.apps[AUTO_APP_CONSTANTS.APP_NAME] = {};
	const mustache = await router.getMustache();
	window.APP_CONSTANTS = JSON.parse(mustache.render(JSON.stringify(AUTO_APP_CONSTANTS), {hostname}));
	window.LOG = window.monkshu_env.frameworklibs.log;
	await _addLoadbalancers();

	apiman.registerAPIKeys(APP_CONSTANTS.API_KEYS, APP_CONSTANTS.KEY_HEADER);

	if (!session.get($$.MONKSHU_CONSTANTS.LANG_ID)) session.set($$.MONKSHU_CONSTANTS.LANG_ID, "en");
	securityguard.setPermissionsMap(APP_CONSTANTS.PERMISSIONS_MAP);
	securityguard.setCurrentRole(securityguard.getCurrentRole() || APP_CONSTANTS.GUEST_ROLE);
}

async function main() {
	await _addPageDataInterceptors();

	const decodedURL = new URL(router.decodeURL(window.location.href));

	const baseURL = decodedURL.search?decodedURL.href.substring(0, decodedURL.href.length-decodedURL.search.length):decodedURL.href;
	if (securityguard.isAllowed(baseURL)) router.loadPage(decodedURL.href);
	else router.loadPage(APP_CONSTANTS.LOGIN_HTML);
}

async function _addPageDataInterceptors() {
	const interceptors = await $$.requireJSON(`${APP_CONSTANTS.CONF_PATH}/pageInterceptors.json`);
	for (const interceptor of interceptors) {
		const modulePath = interceptor.module, functionName = interceptor.function;
		let module = await import(`${APP_CONSTANTS.APP_PATH}/${modulePath}`); module = module[Object.keys(module)[0]];
		(module[functionName])();
	}
}

const interceptPageLoadData = _ => router.addOnLoadPageData("*", async (data, _url) => {
    data.APP_CONSTANTS = APP_CONSTANTS; 
});

async function _addLoadbalancers() {
    let lbConf; try { lbConf = await $$.requireJSON(`${APP_CONSTANTS.CONF_PATH}/lb.json`) } catch (err) { };
    if (!lbConf) return;    // no LBs configured
    for (const lbconfKey of Object.keys(lbConf)) {
        if (lbconfKey == "backends") lbConf[lbconfKey].roothost = new URL(APP_CONSTANTS.BACKEND).hostname;
        else if (lbconfKey == "frontends") lbConf[lbconfKey].roothost = new URL(APP_CONSTANTS.FRONTEND).hostname;
        else continue;    // not a known LB configuration
        const lbThis = loadbalancer.createLoadbalancer(lbConf[lbconfKey]);
        if (lbThis) { router.addLoadbalancer(lbThis); LOG.info(`Added load balancer for policy ${lbconfKey}`); }
        else LOG.error(`Bad load balancer policy ${lbconfKey}.`);
    }
}

export const application = {init, main,interceptPageLoadData};