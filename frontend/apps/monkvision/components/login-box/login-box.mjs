/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {router} from "/framework/js/router.mjs";
import {loginmanager} from "../../js/loginmanager.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

async function elementConnected(element) {
	let data = {};

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
	
	if (element.id) {
		if (!login_box.datas) login_box.datas = {}; login_box.datas[element.id] = data;
	} else login_box.data = data;
}

async function signin(signInButton) {	
	const shadowRoot = login_box.getShadowRootByContainedElement(signInButton);
	const userid = shadowRoot.getElementById("userid").value;
	const pass = shadowRoot.getElementById("pass").value;
	const routeOnSuccess = login_box.getHostElement(signInButton).getAttribute("routeOnSuccess");
		
	_handleLoginResult(await loginmanager.signin(userid, pass), shadowRoot, routeOnSuccess);
}

function _handleLoginResult(result, shadowRoot, routeOnSuccess) {
	if (result) router.loadPage(routeOnSuccess);
	else shadowRoot.getElementById("notifier").style.display = "inline";
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM
export const login_box = {signin, trueWebComponentMode, elementConnected}
monkshu_component.register("login-box", `${APP_CONSTANTS.APP_PATH}/components/login-box/login-box.html`, login_box);