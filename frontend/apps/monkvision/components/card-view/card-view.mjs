import { main } from "./../../js/main.mjs";
import { all_cards } from "../all-cards/all-cards.mjs"

const sampleApiData = {
  name: "All cards",
  items: [
      {
        html: "glowing-arc",
        id: 0,
        "main-title": "USAGE %",
        "middle-text": "60%",
        "inner-title": "RAM",
        "inner-subtitle": "NA",
        "percentage": "60",
        "color": "#169632",
        "outline-color": "#666",
        "warning-colour": "#abc",
        "size1": "20",
        "size2": "30",
        "y1": "40",
        "y2": "60",
        "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 1,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 2,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 3,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#abc",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 4,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 5,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 6,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#abc",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 7,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 8,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 9,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#abc",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 10,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 11,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 12,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#abc",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 13,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 14,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#abc",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 15,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 16,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#abc",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      },
      {
          html: "glowing-arc",
          id: 17,
          "main-title": "USAGE %",
          "middle-text": "60%",
          "inner-title": "RAM",
          "inner-subtitle": "NA",
          "percentage": "60",
          "color": "#169632",
          "outline-color": "#666",
          "warning-colour": "#fff",
          "size1": "20",
          "size2": "30",
          "y1": "40",
          "y2": "60",
          "animate": "true"
      }
  ]
}

async function elementConnected(element) {
    populateCards(element);
}

async function populateCards(element){
    let pageData = sampleApiData;
    pageData.items[0]['selected-item'] = true; //start with 0
    main.addFlattenedHtml(pageData.items);
    try {
        await card_view.bindData(pageData, element.id);
    } catch (error) {
        await card_view.bindData(pageData, element.id);
    }
    selectItemHandler(main.querySelector(element, '#_0.flex-child')); //select 0th child
}

function scrollFlex(path, flag){
    const flexContainer = main.querySelector(path, '.flex-container');
    let width = flexContainer.offsetWidth;
    width = (0.9)*width;
    flexContainer.scrollBy({
        left: flag*width,
        behavior: "smooth"
    })
}

function scrollEndHandler(cont){
    const [prev, next] = ['.bg #prev', '.bg #next'].map(q => main.querySelector(cont, q).parentElement);
    const [attr, dim, bright] = ['opacity', '0.4', '1'];
    if(cont.scrollLeft == 0) prev.setAttribute(attr, dim);
    else if(cont.scrollLeft >=  cont.scrollWidth - cont.clientWidth) next.setAttribute(attr, dim);
    else{
        prev.setAttribute(attr, bright);
        next.setAttribute(attr, bright);
    }
}

async function selectItemHandler(el, fromModal) {
    let root = el.getRootNode();
    let cardID = fromModal? root.host.getRootNode().host.id : root.host.id;
    let [cardRoot, modalRoot] = fromModal? [root.host.getRootNode(), root] : [root, root.querySelector('all-cards').shadowRoot];
    let pageData = card_view.getData(cardID);
    let newSelectionID = el.getAttribute('id').substring(1);
    if(pageData.selectedItem){
        [cardRoot, modalRoot].forEach(_ => _.querySelector(`#_${pageData.selectedItem}.flex-child`).classList.remove('selected'))
        delete pageData.items[pageData.selectedItem]['selected-item'];
    }
    pageData.items[newSelectionID]['selected-item'] = true;
    pageData.selectedItem = newSelectionID;
    [cardRoot, modalRoot].forEach(_ => {
        const el = _.querySelector(`#_${newSelectionID}.flex-child`);
        el?.classList.add('selected');
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    })
    card_view.setData(cardID, pageData);
    if (fromModal) {
        await all_cards.setData(`mod${cardID}`, pageData);
    }
}


function openModal(el) {
  const modal = main.querySelector(el, '.modal');
  const modalContent = main.querySelector(el, '.modal-content')
  const closeBtn = main.querySelector(el, '#closeModal')
  const backdrop = main.querySelector(el, '.backdrop');
  modal.style.display = 'block';
  backdrop.style.display = 'block';
//   modalContent.innerHTML = `<all-cards id='mod${card_view.getHostElementID(el)}'></all-cards>`;
  setTimeout(() => {
    modal.style.cssText = modal.style.cssText + 'width: 70%; height: 80%; opacity: 1;';
  }, 50);
  setTimeout(()=>{
    main.querySelector(el, '#closeModal').style.display = 'flex';
    main.querySelector(el, '.header').style.display = 'flex'
  }, 500);
  closeBtn.onclick = closeModal;
  backdrop.onclick = closeModal;
}

function closeModal() {
  const el = this;
  const modal = main.querySelector(el, '.modal');
  main.querySelector(el, '#closeModal').style.display = 'none';
  main.querySelector(el, '.header').style.display = 'none'
  modal.style.cssText = modal.style.cssText + 'width: 0%; height: 0%; opacity: 0';
  setTimeout(() => {
    modal.style.display = 'none';
    main.querySelector(el, '.backdrop').style.display = 'none';
  }, 500);
}

function _refresh() { 
	for (const element of card_view.getAllElementInstances()) populateCards(element);
}

export const card_view = { trueWebComponentMode:true, trueJS:false,elementConnected, scrollFlex, scrollEndHandler, selectItemHandler, openModal, _refresh}