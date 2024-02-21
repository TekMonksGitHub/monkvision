/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {router} from "/framework/js/router.mjs";
import {loginmanager} from "../../js/loginmanager.mjs";
import {APP_CONSTANTS} from "../../js/constants.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

var pageData = {leftResults:[{"status":"CRITICAL","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","email":"johndoe@gmail.com"},
                              {"status":"CRITICAL","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","email":"johndoe@gmail.com"},
                              {"status":"ALERT","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","email":"johndoe@gmail.com"}],
                rightResults:[{"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
                              {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
                              {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
                              {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
                              {"status":"SYSTEM INFORMATION (TODAY)","system":"(OS METRIC) STATUS OF NODE/HOST","info":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}]}
async function elementConnected(element) {
    await all_notifs.bindData(pageData)
}
function loadProfile(){
    router.loadPage(APP_CONSTANTS.PROFILE_HTML)
}
function loadNotifs(){
    router.loadPage(APP_CONSTANTS.NOTIFICATIONS_HTML)
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM
export const all_notifs = {trueWebComponentMode, elementConnected,loadProfile,loadNotifs}

monkshu_component.register("all-notifs", `${APP_CONSTANTS.APP_PATH}/components/all-notifs/all-notifs.html`, all_notifs);
// all_notifs.bindData(pageData)