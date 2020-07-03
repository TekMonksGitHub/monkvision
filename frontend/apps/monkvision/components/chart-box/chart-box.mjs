/**
 * Can draw charts, tables and text dashboard components.
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */
import {chart} from "./lib/chart.mjs";
import {loginmanager} from "../../js/loginmanager.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

async function elementRendered(element) {
	if (!element.__skip_refresh) _refreshData(element, true); else return;
	const refreshInterval = element.getAttribute("refresh");
	if (refreshInterval && !element.__chart_box_timer) {
		element.__chart_box_timer = setInterval(_=>_refreshData(element), refreshInterval);
		loginmanager.addLogoutListener(_=>clearInterval(element.__chart_box_timer));
	}
}

function setRefresh(enabled) {
	for (const element of chart_box.getAllElementInstances()) {
		if (element.__chart_box_timer) {clearInterval(element.__chart_box_timer); delete element.__chart_box_timer;}	// delete old timers
		if (enabled && element.getAttribute("refresh")) element.__chart_box_timer = setInterval(_=>_refreshData(element), element.getAttribute("refresh"));	// set new refresh timers
	}
}

function getTimeRange() {
	if (!chart_box.timeRange) {
		const dateToday = new Date(), dateWeekAgo = new Date(); dateWeekAgo.setDate(dateToday.getDate() - 7);
		const dateTimeNow = new Date(dateToday.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0],
			dateTimeWeekAgo = new Date(dateWeekAgo.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0];

		setTimeRange({from: dateTimeWeekAgo, to: dateTimeNow});
	}

	return chart_box.timeRange;
} 

function setTimeRange(timeRange) {
	chart_box.timeRange = timeRange; 
	for (const element of chart_box.getAllElementInstances()) _refreshData(element);
}

async function _refreshData(element, force) {
	const id = element.id, api = element.getAttribute("api"), params = element.getAttribute("params"), type = element.getAttribute("type");
	const content =  await _getContent(api, params); if (!content || !content.contents) return;	// nothing to do
	const memory = chart_box.getMemory(id);

	if (!force && JSON.stringify(memory.contents) == JSON.stringify(content.contents)) return;	// return if data didn't change
	else memory.contents = content.contents;

	const data = {}; if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
	data.title = element.getAttribute("title");

	const bindData = async (data, id) => {
		element.__skip_refresh = true; 
		await chart_box.bindData(data, id); 
		delete element.__skip_refresh;
	}

	const contentDiv = chart_box.getShadowRootByHostId(id).querySelector("div#content"); 
	if (type == "text") {
		contentDiv.innerHTML = "";	// clear it so scrollHeight below is always accurate
		data.textcontent = content.contents;
		await bindData(data, id);
		contentDiv.scrollTop = contentDiv.scrollHeight; 
	}	// scroll to bottom
	
	if (type == "table") {
		const labelHash = {}; for (const label of element.getAttribute("labels").split(",")){
			const tuple = label.split(":");
			labelHash[tuple[0].trim()] = tuple[1].trim();
		}
		const headers = []; for (const key of Object.keys(content.contents)) headers.push(labelHash[key]);
		const key0 = Object.keys(content.contents)[0]; const length = content.contents[key0].length;
		const rows = []; for (let i = 0; i < length; i++) {
			const rowContent = []; for (const key of Object.keys(content.contents)) rowContent.push(content.contents[key][i]);
			rows.push(rowContent);
		}

		data.table = {headers, rows};
		await bindData(data, id);
		contentDiv.scrollTop = contentDiv.scrollHeight; 
	}

	if (memory.chart) {memory.chart.destroy(); delete memory.chart;}	// destroy the old chart if it exists.

	if (type == "bargraph" || type == "linegraph") {
		await bindData(data, id);

		const labels = {}; const labelsRAW = element.getAttribute("ylabels"); 
		for (const label of labelsRAW.split(",")) {const splits = label.split(":"); labels[splits[0]] = splits[1]};

		if (type == "bargraph") {
			const colorHash = {}, ycolors = element.getAttribute("ycolors").split(","); for (const ycolor of ycolors) {
				const tuples = ycolor.split(":");
				colorHash[tuples[0].trim()] = [tuples[1].trim(), tuples[2].trim()];
			}
	
			const bgColors = [], brColors = []; for (const y of content.contents.y) {
				if (colorHash[y]) {bgColors.push(colorHash[y][0]); brColors.push(colorHash[y][1]);}
				else {bgColors.push(colorHash["else"][0]); brColors.push(colorHash["else"][1]);}
			}

			memory.chart = await chart.drawBargraph(contentDiv.querySelector("canvas#canvas"), content.contents, 
				element.getAttribute("maxticks"), element.getAttribute("ystep"), labels, bgColors, brColors);
		}

		if (type == "linegraph") memory.chart = await chart.drawLinegraph(contentDiv.querySelector("canvas#canvas"), content.contents, 
			element.getAttribute("maxticks"), element.getAttribute("ystep"), labels, element.getAttribute("fillColor"), 
			element.getAttribute("borderColor"));
	}

	if (type == "piegraph" || type == "donutgraph") {
		await bindData(data, id);
		const colorHash = {}, colors = element.getAttribute("colors").split(","); for (const color of colors) {
			const tuples = color.split(":");
			colorHash[tuples[0].trim()] = [tuples[1].trim(), tuples[2].trim()];
		}

		const labelHash = {}, labels = element.getAttribute("labels").split(","); for (const label of labels) {
			const tuple = label.split(":");
			labelHash[tuple[0].trim()] = tuple[1].trim();
		}
		
		memory.chart = await chart.drawPiegraph(contentDiv.querySelector("canvas#canvas"), content.contents, labelHash, colorHash, type == "donutgraph");
	}
}

async function _getContent(api, params) {
	const API_TO_CALL = `${APP_CONSTANTS.API_PATH}/${api}`;

	const paramObj = {timeRange: getTimeRange()}; if (params) for (const param of params.split("&")) paramObj[param.split("=")[0]] = param.split("=")[1];
	const resp = await apiman.rest(API_TO_CALL, "GET", paramObj, true, false);

	if (resp && resp.type=="text" && resp.contents) resp.contents = resp.contents.replace(/(?:\r\n|\r|\n)/g, '<br>');

	return resp;
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM
export const chart_box = {trueWebComponentMode, elementRendered, setTimeRange, getTimeRange, setRefresh}
monkshu_component.register("chart-box", `${APP_CONSTANTS.APP_PATH}/components/chart-box/chart-box.html`, chart_box);