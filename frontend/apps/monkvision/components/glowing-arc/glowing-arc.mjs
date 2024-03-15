/*component usage
<glowing-arc id="fi" data-main-title="CPU usage" data-middle-text="25%" data-inner-title="production" data-inner-subtitle="Lorem ipsum" data-percentage="25" data-color="red" data-outline-color="#666" data-warning-colour="#fff" data-size1="20" data-size2="30" data-y1="40" data-y2="60" data-animate="true" ></glowing-arc>
*/
const radius = 100; //hit-n-trial to achieve result
const initialPoints = {x: 100, y: 10};
const origin = {x: 100, y: 110};

async function elementConnected(el) {
    configureElement(el);
}

async function configureElement(el){
    let p = el.dataset.percentage;
    p = Number(p);
    p = p>100? 100 : p;
    let endPoints = getEndPoints(p);
    const circle = `M ${initialPoints.x} ${initialPoints.y} A ${radius} ${radius} 0 1 1 ${initialPoints.x-0.01} ${initialPoints.y}`;
    const d = `M ${initialPoints.x} ${initialPoints.y} A ${radius} ${radius} 0 ${p>50? 1 : 0} 1 ${endPoints.x} ${endPoints.y}`;
    try {
        await glowing_arc.bindData({...el.dataset, circle,d}, el.id);
    } catch (e) {
        await glowing_arc.bindData({...el.dataset, circle,d}, el.id);
    }
}

/**
 * @param {Number} percentage percentage of circle arc should cover
 * @returns {Object} returns x and y coordinate where arc ends on circle
 */
function getEndPoints(percentage){
    const points = {};
    points.x = initialPoints.x; points.y = initialPoints.y;
    if(isNaN(percentage)) return points;
    const rad = (2*percentage*Math.PI)/100;
    const dx = initialPoints.x - origin.x; const dy = initialPoints.y -origin.y;
    points.x = Math.floor((origin.x + dx * (Math.cos(rad)) - dy * (Math.sin(rad)))*100)/100;
    points.y = Math.floor((origin.y + dx * (Math.sin(rad)) + dy * (Math.cos(rad)))*100)/100;
    return points;
}

function startAnimation(element){
    element.setAttribute('onmouseover', '');
    const a1 = element.querySelector('#a1');
    if(!a1) return;
    a1.beginElement();
    setTimeout(()=> {
        if(element.getAttribute('onmouseover') == ''){
            element.setAttribute('onmouseover', "monkshu_env.components['glowing-arc'].startAnimation(this)");
        }
    }, 4500);
}
function addAnimation(element){
    if(element.getAttribute('onmouseover') == ''){
        element.setAttribute('onmouseover', "monkshu_env.components['glowing-arc'].startAnimation(this)");
    }
}

export const glowing_arc = { trueWebComponentMode:true, trueJS:false, elementConnected, startAnimation, addAnimation}