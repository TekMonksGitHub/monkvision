/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {router} from "/framework/js/router.mjs";
import {APP_CONSTANTS} from "../../js/constants.mjs";

async function elementConnected(el) {
    loadProfile(el);
}
async function loadProfile(el){
    let data = await getProfileData();
    try {
        await profile_comp.bindData(data, el.id);
    } catch (error) {
        await profile_comp.bindData(data, el.id);
    }
}

/**
 * Api call to get profile data
 */
async function getProfileData(){
    //returning sample data, two versions of this component can be rendered by setting either of v1 or v2 as true.
    return ({
        name: "John",
        dp: "./img/man1.jpg",
        start: new Date().toISOString().slice(0,19),
        end: new Date(new Date().getTime() - 24*60*60*1000).toISOString().slice(0,19),
        v1: true
    })
}

function toggle(){
    const [c, area] = ['#container', '#area'].map(q => document.querySelector('side-profile').shadowRoot.querySelector(q))
    if (c.style.right === '0px') {
        c.style.right = '-30vw';
        area.style.left = '-70%';
    } else {
        c.style.right = '0px';
        area.style.left = '0';
    }
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM
export const profile_comp = {trueWebComponentMode, trueJS:false, elementConnected,loadProfile,toggle}