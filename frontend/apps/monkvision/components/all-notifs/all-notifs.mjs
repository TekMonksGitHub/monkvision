/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {router} from "/framework/js/router.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {APP_CONSTANTS} from "../../js/constants.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

// var pageData = {leftResults:[{"status":"CRITICAL","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","email":"johndoe@gmail.com"},
//                               {"status":"CRITICAL","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","email":"johndoe@gmail.com"},
//                               {"status":"ALERT","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","email":"johndoe@gmail.com"}],
//                 rightResults:[{"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
//                               {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
//                               {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
//                               {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
//                               {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}]}
async function elementConnected(element) {
    let api = element.getAttribute("api");
    let params = element.getAttribute("params");
    const API_TO_CALL = `${APP_CONSTANTS.API_PATH}/${api}`;
    const paramObj = {timeRange: getTimeRange()}; if (params) for (const param of params.split("&")) paramObj[param.split("=")[0]] = param.split("=")[1];
	const resp = await apiman.rest(API_TO_CALL, "GET", paramObj, true, false);
    let pageData = resp.pageData;
    await all_notifs.bindData(pageData)
}
function loadProfile(){
    router.loadPage(APP_CONSTANTS.PROFILE_HTML)
}
function loadNotifs(){
    router.loadPage(APP_CONSTANTS.NOTIFICATIONS_HTML)
}

function getTimeRange() {
	if (!all_notifs.timeRange) {
		const dateToday = new Date(), dateWeekAgo = new Date(); dateWeekAgo.setDate(dateToday.getDate() - 7);
		const dateTimeNow = new Date(dateToday.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0],
			dateTimeWeekAgo = new Date(dateWeekAgo.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0];

		setTimeRange({from: dateTimeWeekAgo, to: dateTimeNow});
	}

	return all_notifs.timeRange;
} 

function setTimeRange(timeRange) {
	all_notifs.timeRange = timeRange; 
	for (const element of all_notifs.getAllElementInstances()) _refreshData(element);
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM
export const all_notifs = {trueWebComponentMode, elementConnected,loadProfile,loadNotifs,getTimeRange,setTimeRange}

monkshu_component.register("all-notifs", `${APP_CONSTANTS.APP_PATH}/components/all-notifs/all-notifs.html`, all_notifs);
// all_notifs.bindData(pageData)