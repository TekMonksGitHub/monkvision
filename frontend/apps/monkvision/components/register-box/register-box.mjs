/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {router} from "/framework/js/router.mjs";
import {loginmanager} from "../../js/loginmanager.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

async function elementConnected(element) {
	const data = {};

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
	
	if (element.id) {
		if (!register_box.datas) register_box.datas = {}; register_box.datas[element.id] = data;
	} else register_box.data = data;
}

async function register(element) {	
	const shadowRoot = register_box.getShadowRootByContainedElement(element);

	const nameSelector = shadowRoot.querySelector("input#name"); const name = nameSelector.value;
	const idSelector = shadowRoot.querySelector("input#id"); const id = idSelector.value;
	const passSelector = shadowRoot.querySelector("input#pass"); const pass = passSelector.value;
	const orgSelector = shadowRoot.querySelector("input#org"); const org = orgSelector.value;
	const routeOnSuccess = register_box.getHostElement(element).getAttribute("routeOnSuccess");
	const totpSecret = APP_CONSTANTS.DUMMY_TOTP_SECRET;
	
	if (!await loginmanager.register(name, id, pass, org, totpSecret)) shadowRoot.querySelector("span#error").style.display = "inline";
	else router.loadPage(routeOnSuccess);
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM
export const register_box = {register, trueWebComponentMode, elementConnected}
monkshu_component.register("register-box", `${APP_CONSTANTS.APP_PATH}/components/register-box/register-box.html`, register_box);