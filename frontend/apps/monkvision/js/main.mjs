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
import {chart_box} from "../components/chart-box/chart-box.mjs";

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

async function interceptPageLoadData() {

    const pagedata_func = async data => {
        // add in css, theme and html data to the page data object
        await utils.addThemeDataAndCSS(data, "main");
        if(!main.theme) main.theme = "light";
        // load dashboards config and build the data object
        const dashboardsRaw = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/dashboards.json`);
        data.dashboards = [];
        for (const key of Object.keys(dashboardsRaw)) {
            const fn =  dashboardsRaw[key].split(",")[0];
            const file = fn.replace(fn.slice(fn.lastIndexOf("_"), fn.indexOf(".page")),`_${main.theme}`), refresh = parseInt(dashboardsRaw[key].split(",")[1].split(":")[1]),
                name = await i18n.get(`name_${key}`, session.get($$.MONKSHU_CONSTANTS.LANG_ID)), title = await i18n.get(`title_${key}`, session.get($$.MONKSHU_CONSTANTS.LANG_ID));
            data.dashboards.push({ name, file, refresh, title, id: key });
        }
        console.log("BBT: ",data.dashboards);
        // if(main.theme && router.getCurrentURL().includes("?")) data.dashboards = data.dashboards.map(ele => ele["file"].replace(ele["file"].slice(ele["file"].lastIndexOf("_"), ele["file"].indexOf(".page")),`_${main.theme}`))
        // console.log("AT: ",data.dashboards);
        
        // add in dashboard path, and page title to the page data object
        const currentURL = new URL(router.getCurrentURL());
        if (!currentURL.searchParams.get("dash")) { // load first dashboard if none was provided in the incoming URL
            data.title = data.dashboards[0].title;
            data.dash = `./dashboards/${data.dashboards[0].file}`;
            data.refresh = data.dashboards[0].refresh;
            data.toggleThemeBtnState = _toggleThemeBtnState() ? "checked" : "";
            data.pageTitle = `${await i18n.get("title", session.get($$.MONKSHU_CONSTANTS.LANG_ID))} - ${data.dashboards[0].name}`;
        } else {                                                // else get dashboard path and title from the URL
            data.title = currentURL.searchParams.get("title");
            data.dash = currentURL.searchParams.get("dash");
            data.refresh = currentURL.searchParams.get("refresh");
            data.toggleThemeBtnState = _toggleThemeBtnState() ? "checked" : "";
            data.pageTitle = `${await i18n.get("title", session.get($$.MONKSHU_CONSTANTS.LANG_ID))} - ${currentURL.searchParams.get("name")}`;
            console.log(data.dash);
            console.log("URL: ",currentURL);
        }

        // set the dates data
        if (!session.get(SELECTED_DATES)) {
            const dateToday = new Date(), dateWeekAgo = new Date(); dateWeekAgo.setDate(dateToday.getDate() - 7);
            data.dateTimeNow = dateAsHTMLDateValue(dateToday); data.dateTimeWeekAgo = dateAsHTMLDateValue(dateWeekAgo);
        } else {
            data.dateTimeNow = session.get(SELECTED_DATES).to;
            data.dateTimeWeekAgo = session.get(SELECTED_DATES).from;
        }
    }

    const pageload_func = async data => {
        // select current dashboard icon on page load
        console.log("DATA: ", data);
        const dashboardsRaw = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/dashboards.json`);
        const allDashIcons = document.querySelectorAll("div#leftheader > img.dashicon");
        for (const dashIcon of allDashIcons) if (data.dash.endsWith(dashboardsRaw[dashIcon.id].split(",")[0]))
            dashIcon.classList.add("selected"); else dashIcon.classList.remove("selected");

        // if (data.toggleThemeBtnState) document.querySelector("#toggleTheme").checked = true;
        
        // load initial charts and set the refresh interval
        timeRangeUpdated(false);    // load initial charts they will get the dates from HTML
        if (data.refresh) {session.set(REFRESH_INTERVAL, data.refresh); _startRefresh()};
    }

    router.addOnLoadPageData(`${APP_CONSTANTS.APP_PATH}/main.html`, pagedata_func);
    router.addOnLoadPage(`${APP_CONSTANTS.APP_PATH}/main.html`, pageload_func);
}

async function changePassword(_element) {
    monkshu_env.components['dialog-box'].showDialog(`${APP_CONSTANTS.DIALOGS_PATH}/changepass.html`, true, true, {}, "dialog", ["p1","p2"], async result=>{
        const done = await loginmanager.changepassword(session.get(APP_CONSTANTS.USERID), result.p1);
        if (!done) monkshu_env.components['dialog-box'].error("dialog", 
            await i18n.get("PWCHANGEFAILED", session.get($$.MONKSHU_CONSTANTS.LANG_ID)));
        else monkshu_env.components['dialog-box'].hideDialog("dialog");
    });
}

const _stopRefresh = _ => {if (session.get(DASHBOARD_TIMER)) clearInterval(session.get(DASHBOARD_TIMER));}

function _startRefresh() {
    _stopRefresh(); if (!session.get(REFRESH_INTERVAL)) return;

    session.set(DASHBOARD_TIMER, setInterval(_=>{timeRangeUpdated(false, 
        {from: document.querySelector("input#datetimepickerfrom").value, to: dateAsHTMLDateValue(new Date())});
    }, session.get(REFRESH_INTERVAL)));
    loginmanager.addLogoutListener(_=>clearInterval(session.get(DASHBOARD_TIMER)));
}

const toggleTheme = async _ =>{
    main.toggleThemeBtnState = document.querySelector("#toggleTheme").checked ? true : false;
    if (main.toggleThemeBtnState) {
        window.APP_THEME = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/theme_dark.json`); main.theme = "dark";
    } else {
        window.APP_THEME = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/theme_light.json`); main.theme = "light";
    }
    const allDashIcons = document.querySelectorAll("div#leftheader > img.dashicon");
    for(const dash of allDashIcons){
        let routerLink = dash.getAttribute("onclick"); 
        routerLink = routerLink.replace(routerLink.slice(routerLink.lastIndexOf("_"), routerLink.indexOf(".page")),`_${main.theme}`);
        dash.setAttribute("onclick", routerLink);
    }
    if(session.get($$.MONKSHU_CONSTANTS.PAGE_URL).native.includes("?")){
        let reloadRouterLink = session.get($$.MONKSHU_CONSTANTS.PAGE_URL).native;
        reloadRouterLink = reloadRouterLink.replace(reloadRouterLink.slice(reloadRouterLink.lastIndexOf("_"), reloadRouterLink.indexOf(".page")),`_${main.theme}`);
        session.set($$.MONKSHU_CONSTANTS.PAGE_URL, reloadRouterLink);
    }
    // window.APP_THEME = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/theme_dark.json`);
    // main.theme = "dark";
    // interceptPageLoadData();
    router.reload();
}

function _toggleThemeBtnState() {
    if(!main.toggleThemeBtnState){
        main.toggleThemeBtnState = false;    // set default theme and checked
    }
    console.log(main.toggleThemeBtnState);
    return main.toggleThemeBtnState;
}

export const main = {changePassword, interceptPageLoadData, timeRangeUpdated, playPauseCharts, toggleTheme};