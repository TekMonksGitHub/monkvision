import { main } from "../../js/main.mjs";
import {card_view} from '../card-view/card-view.mjs';


async function elementConnected(el) {
  populateCards(el);
}

async function populateCards(el){
  let pageData = card_view.getData(el.getRootNode().host.id);
  try {
      await all_cards.bindData(pageData);
  } catch (error) {
      await all_cards.bindData(pageData);
  }
}

function search(inp){
    let val = inp.value.toLowerCase();
    if(val.length){
      main.querySelector(inp, '.flex-child glowing-arc', true).forEach(el => el.getAttribute('innerTitle').toLowerCase().startsWith(val)? el.closest(".flex-child").style.order=1 : el.closest(".flex-child").style.order=2)
    } else{
      main.querySelector(inp, '.flex-child', true).forEach(el => el.style.order = 'initial');
    }
}

export const all_cards = { trueWebComponentMode:true, trueJS:false, elementConnected, search}
