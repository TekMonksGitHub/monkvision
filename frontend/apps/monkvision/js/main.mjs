/**
 * Main app layout page for Monkvision
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */
import {utils} from "./utils.mjs";
import {i18n} from "/framework/js/i18n.mjs";
import {router} from "/framework/js/router.mjs";
import {loginmanager} from "./loginmanager.mjs";
import {session} from "/framework/js/session.mjs";
import {securityguard} from "/framework/js/securityguard.mjs";
import {chart_box} from "../components/chart-box/chart-box.mjs";
import {util as frameworkUtils} from "/framework/js/util.mjs";

const SELECTED_DATES = "__monkvision_selecteddates", DASHBOARD_TIMER = "__monkvision_dashtimer", REFRESH_INTERVAL = "__monkvision_refresh";

const dateAsHTMLDateValue = date => new Date(date.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0];

function timeRangeUpdated(stopRefresh, dates) {
    if (!dates) dates = { from: document.querySelector("input#datetimepickerfrom").value,
        to: document.querySelector("input#datetimepickerto").value };
    else { document.querySelector("input#datetimepickerfrom").value = dates.from;
        document.querySelector("input#datetimepickerto").value = dates.to;
    }

    session.set(SELECTED_DATES, dates);
    chart_box.setTimeRange(dates);
    if (stopRefresh) playPauseCharts(document.querySelector("img#playpause"), "stop"); // user selected a particular time range, stop refresh
}

function playPauseCharts(img, force) {
    if (img.src.endsWith("play.svg") && force!="stop") { img.src = "./img/pause.svg"; _startRefresh(); } 
    else if (img.src.endsWith("pause.svg") && force!="start") { img.src = "./img/play.svg"; _stopRefresh(); }
}

async function interceptPageLoadAndPageLoadData() {
    router.addOnLoadPageData(`${APP_CONSTANTS.APP_PATH}/main.html`, async data => {
        // add in css, theme and html data to the page data object
        data.themeMode = new URL(router.getCurrentURL()).searchParams.get("themeMode") || "light";
        await utils.addThemeDataAndCSS(data, "main");

        // load dashboards config and build the data object
        const dashboardsRaw = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/dashboards.json`, true);
        data.dashboards = [];
        for (const key of Object.keys(dashboardsRaw)) {
            const file = dashboardsRaw[key].split(",")[0], refresh = parseInt(dashboardsRaw[key].split(",")[1].split(":")[1]),
            name = await i18n.get(`name_${key}`, session.get($$.MONKSHU_CONSTANTS.LANG_ID)) || dashboardsRaw[key].split(",")[2].split(":")[1], 
            title = await i18n.get(`title_${key}`, session.get($$.MONKSHU_CONSTANTS.LANG_ID)) || dashboardsRaw[key].split(",")[3].split(":")[1],
            dashType = dashboardsRaw[key].split(",")[4] ? dashboardsRaw[key].split(",")[4].split(":")[1] : null;

        if (securityguard.isAllowed(key)) data.dashboards.push({ name, file, refresh, title, id: key, dashType });
        }
        
        // add in dashboard path, and page title to the page data object
        const currentURL = new URL(router.getCurrentURL());
        if (!currentURL.searchParams.get("dash")) { // load first dashboard if none was provided in the incoming URL
            data.title = data.dashboards[0].title;
            data.dash = `./dashboards/${data.dashboards[0].file}`;
            data.refresh = data.dashboards[0].refresh;
            data.pageTitle = `${await i18n.get("title", session.get($$.MONKSHU_CONSTANTS.LANG_ID))} - ${data.dashboards[0].name}`;
            data.showDateFilter = data.dashboards[0].dashType != "AI" ? true: false;
        } else {                                                // else get dashboard path and title from the URL
            data.title = currentURL.searchParams.get("title");
            data.dash = currentURL.searchParams.get("dash");
            data.refresh = currentURL.searchParams.get("refresh");
            data.pageTitle = `${await i18n.get("title", session.get($$.MONKSHU_CONSTANTS.LANG_ID))} - ${currentURL.searchParams.get("name")}`;
            data.showDateFilter = currentURL.searchParams.get("dashType") != "AI" ? true: false;
        }

        // set the dates data
        if (!session.get(SELECTED_DATES)) {
            const dateToday = new Date(), dateWeekAgo = new Date(); dateWeekAgo.setDate(dateToday.getDate() - 7);
            data.dateTimeNow = dateAsHTMLDateValue(dateToday); data.dateTimeWeekAgo = dateAsHTMLDateValue(dateWeekAgo);
        } else {
            data.dateTimeNow = session.get(SELECTED_DATES).to;
            data.dateTimeWeekAgo = session.get(SELECTED_DATES).from;
        }

        // add in page data property so page generator can receive pass through data
        data.pagedata = encodeURIComponent(JSON.stringify(data.htmlData));
    });

    router.addOnLoadPage(`${APP_CONSTANTS.APP_PATH}/main.html`, async data => {
        // select current dashboard icon on page load
        const dashboardsRaw = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/dashboards.json`, true);
        const allDashIcons = document.querySelectorAll("div#leftheader > img.dashicon");
        for (const dashIcon of allDashIcons) if (data.dash.endsWith(dashboardsRaw[dashIcon.id].split(",")[0]))
            dashIcon.classList.add("selected"); else dashIcon.classList.remove("selected");

        // load initial charts and set the refresh interval
        timeRangeUpdated(false);    // load initial charts they will get the dates from HTML
        if (data.refresh) {session.set(REFRESH_INTERVAL, data.refresh); _startRefresh()};
    });
}

async function changePassword(_element) {
    monkshu_env.components['dialog-box'].showDialog(`${APP_CONSTANTS.DIALOGS_PATH}/changepass.html`, true, true, {}, "dialog", ["p1","p2"], async result=>{
        const done = await loginmanager.changepassword(session.get(APP_CONSTANTS.USERID), result.p1);
        if (!done) monkshu_env.components['dialog-box'].error("dialog", 
            await i18n.get("PWCHANGEFAILED", session.get($$.MONKSHU_CONSTANTS.LANG_ID)));
        else monkshu_env.components['dialog-box'].hideDialog("dialog");
    });
}

async function showQueryResult(_element) {
    const query = document.querySelector("input#searchbartext").value; if (!query) return;
    const processedQueryData = await _processQueryResult(query);

    monkshu_env.components['dialog-box'].showDialog(`${APP_CONSTANTS.DIALOGS_PATH}/nlp_search.html`, false, false, processedQueryData, "nlpsearch", ["dashboardname", "dashboardpath"], async result=>{
        const paramObj = { filename: result["dashboardname"], filepath: result["dashboardpath"], metric: processedQueryData.htmlData.metric[0], duration: processedQueryData.htmlData.duration, role: processedQueryData.role, title: processedQueryData.htmlData.elementTitle, resourceName: processedQueryData.htmlData.resourceName };
        const content = await utils.rest("createdashboard", paramObj);
        const redirectDashPath = result["dashboardpath"] ? result["dashboardpath"] : `dashboard_${result["dashboardname"]}.page`;

        if (!content) monkshu_env.components['dialog-box'].error("nlpsearch", 
            await i18n.get("dashboardError", session.get($$.MONKSHU_CONSTANTS.LANG_ID)));
        else {
            if (content.contents && content.contents.dashkey) await securityguard.addPermission(content.contents.dashkey, processedQueryData.role);
            monkshu_env.components['dialog-box'].hideDialog("nlpsearch");
            router.loadPage(`./main.html?dash=./dashboards/${redirectDashPath}&title=NLP Queries&refresh=300000&name=${result.dashboardname}&dashType=AI&themeMode=${processedQueryData.themeMode}`);
        }
    });
}

const loadPDFReport = async _ => window.open(await router.encodeURL("pdf_report.html?dash=./dashboards/dashboard_pdf_report.page&name=PDF Report"), "_blank");

const toggleTheme = async element => router.loadPage(frameworkUtils.replaceURLParamValue(router.getCurrentURL(), "themeMode", element.textContent.toLowerCase()));

const _stopRefresh = _ => {if (session.get(DASHBOARD_TIMER)) clearInterval(session.get(DASHBOARD_TIMER));}

function _startRefresh() {
    _stopRefresh(); if (!session.get(REFRESH_INTERVAL)) return;

    session.set(DASHBOARD_TIMER, setInterval(_=>{timeRangeUpdated(false, 
        {from: document.querySelector("input#datetimepickerfrom").value, to: dateAsHTMLDateValue(new Date())});
    }, session.get(REFRESH_INTERVAL)));
    loginmanager.addLogoutListener(_=>clearInterval(session.get(DASHBOARD_TIMER)));
}

async function _processQueryResult(query) {
    const content = await utils.rest("nlpsearch", `query=${query}`);    
    const data = { dash: "./dashboards/dashboard_nlp_search_preview.page" };
    await utils.addThemeDataAndCSS(data, "nlp_search");

    const dashboardsRaw = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/dashboards.json`, true);
    data.dashboards = [];
    for (const key of Object.keys(dashboardsRaw)) {
        const file = dashboardsRaw[key].split(",")[0], refresh = parseInt(dashboardsRaw[key].split(",")[1].split(":")[1]),
        name = await i18n.get(`name_${key}`, session.get($$.MONKSHU_CONSTANTS.LANG_ID)) || dashboardsRaw[key].split(",")[2].split(":")[1], 
        title = await i18n.get(`title_${key}`, session.get($$.MONKSHU_CONSTANTS.LANG_ID)) || dashboardsRaw[key].split(",")[3].split(":")[1],
        dashType = dashboardsRaw[key].split(",")[4] ? dashboardsRaw[key].split(",")[4].split(":")[1] : null;

        if (securityguard.isAllowed(key) && dashType == "AI") data.dashboards.push({ name, file, refresh, title, id: key });
    }

    Object.assign(data.htmlData, { ...content.predictedIntents, elementTitle: query });
    data.pagedata = encodeURIComponent(JSON.stringify(data.htmlData));
    
    const role = securityguard.getCurrentRole();
    Object.assign(data, {role: (typeof role == "string") ? role : role.native, themeMode: new URL(router.getCurrentURL()).searchParams.get("themeMode") || "light"});
    return data;
}

export const main = {changePassword, interceptPageLoadAndPageLoadData, timeRangeUpdated, playPauseCharts, toggleTheme, loadPDFReport, showQueryResult};