/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */

async function elementConnected(el) {
    loadSideProfile(el)
}

async function loadSideProfile(el){
    const pageData = await getData();

    try {
        await side_profile.bindData(pageData, el.id);
    } catch (error) {
        await side_profile.bindData(pageData, el.id);
    }
}

async function getData(){
    return ({
        children:[
            {
                firstChild: true,
                name: "Jon Snow",
                role: "Lord Commander",
                icon: "./img/man1.jpg",
                buttonText: "LogOut"
            },
            {
                icon: "./img/edit_profile.svg",
                buttonText: "Edit Profile"
            },
            {
                icon: "./img/notification_icon.svg",
                buttonText: "Notifications",
                redirect: "notifications.html"
            },
            {
                icon: "./img/shield.svg",
                buttonText: "Security"
            },
            {
                icon: "./img/settings.svg",
                buttonText: "System Settings"
            }
        ]
    });
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM
export const side_profile = {trueWebComponentMode, trueJS:false, elementConnected}