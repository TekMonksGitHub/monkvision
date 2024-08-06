import { main } from "../../js/main.mjs";

const origin = {x: 399, y:399};
async function elementConnected(el) {
    // setTimeout(()=>populateSvg(el), 2500)
    populateSvg(el);
}

const sampleApiData = {
    reactor: {
        lastTimeStamp: "19:15:47",
        boxText: "139.17.16.151:22",
        arcs: [
            {
                color: "#FF2002",
                percent: 10,
            },
            {
                color: "#FF9C07",
                percent: 15,
            },
            {
                color: "#47C4FB",
                percent: 50,
            }
        ],
        bottomHead: "Theshold at:",
        bottomVal: 88,
        leftArc: {
            color: "#FF9C07",
            percent: 50
        },
        mainText: "100.00%",
        mainTextType: "Status",
        blocksCount: 9,
        blocksColor: "#62FF02",
        graph: [14, 24, 32, -80, 50, 60, -40, 27, -20, -70, 50, 21, 77]
    }
}

async function populateSvg(el){
    let pageData = sampleApiData;
    if(pageData.reactor){
        pageData = {
            ...pageData,
            ...(getArcPoints(pageData.reactor.arcs)),
          };
        let lastPt = pageData.points[pageData.points.length-1];
        pageData.lastDot = getLastDot(lastPt, pageData.reactor.lastTimeStamp);
        pageData.graphPath = getGraphPath(pageData.reactor.graph);
        pageData.leftArc = getLeftArc(pageData.reactor.leftArc);
        pageData.blocks = [
            `<path opacity="0.61" d="M643.986 537.139C648.734 539.959 654.887 538.404 657.533 533.556C659.147 530.601 660.707 527.616 662.211 524.604C664.679 519.663 662.442 513.724 657.416 511.436L646.814 506.611C641.787 504.323 635.877 506.554 633.386 511.483C632.384 513.465 631.356 515.432 630.301 517.386C627.678 522.245 629.222 528.372 633.97 531.192L643.986 537.139Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M660.542 504.292C665.633 506.432 671.513 504.045 673.468 498.88C674.66 495.731 675.794 492.56 676.87 489.369C678.635 484.136 675.602 478.561 670.309 476.986L659.144 473.665C653.85 472.091 648.303 475.114 646.513 480.339C645.794 482.439 645.046 484.529 644.27 486.609C642.34 491.783 644.712 497.639 649.804 499.779L660.542 504.292Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M672.24 470.16C677.574 471.594 683.078 468.435 684.318 463.053C685.074 459.772 685.769 456.477 686.405 453.17C687.448 447.746 683.69 442.632 678.233 441.786L666.722 440.002C661.265 439.156 656.175 442.9 655.108 448.319C654.678 450.497 654.22 452.669 653.731 454.835C652.517 460.222 655.658 465.704 660.991 467.137L672.24 470.16Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M679.262 434.484C684.741 435.179 689.765 431.301 690.261 425.801C690.564 422.447 690.805 419.088 690.985 415.726C691.28 410.211 686.863 405.655 681.341 405.559L669.694 405.357C664.172 405.261 659.639 409.662 659.318 415.175C659.189 417.392 659.03 419.606 658.841 421.818C658.37 427.321 662.228 432.324 667.707 433.019L679.262 434.484Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M681.361 397.735C686.883 397.669 691.326 393.137 691.06 387.621C690.898 384.257 690.675 380.897 690.39 377.541C689.923 372.038 684.921 368.134 679.438 368.799L667.875 370.202C662.392 370.867 658.508 375.85 658.949 381.356C659.127 383.568 659.274 385.784 659.391 388C659.682 393.516 664.191 397.941 669.714 397.875L681.361 397.735Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M678.415 361.264C683.877 360.443 687.657 355.345 686.639 349.917C686.018 346.607 685.337 343.309 684.596 340.024C683.38 334.637 677.891 331.454 672.55 332.863L661.288 335.835C655.948 337.244 652.783 342.712 653.973 348.105C654.451 350.273 654.9 352.447 655.319 354.627C656.363 360.05 661.435 363.817 666.897 362.996L678.415 361.264Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M670.547 325.68C675.845 324.122 678.896 318.557 677.147 313.318C676.081 310.124 674.957 306.949 673.775 303.796C671.837 298.625 665.964 296.22 660.866 298.343L650.114 302.823C645.016 304.947 642.625 310.795 644.539 315.975C645.309 318.058 646.05 320.15 646.762 322.253C648.535 327.483 654.073 330.524 659.372 328.966L670.547 325.68Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M657.551 290.721C662.58 288.439 664.824 282.503 662.362 277.559C660.861 274.545 659.305 271.558 657.695 268.601C655.055 263.75 648.904 262.187 644.152 265.002L634.129 270.937C629.377 273.751 627.826 279.875 630.444 284.738C631.496 286.693 632.522 288.662 633.52 290.644C636.005 295.577 641.914 297.815 646.943 295.533L657.551 290.721Z" fill="${pageData.reactor.blocksColor}"/>`,
            `<path opacity="0.61" d="M640.721 259.369C645.402 256.438 646.837 250.256 643.739 245.684C641.85 242.896 639.91 240.143 637.921 237.426C634.658 232.97 628.354 232.24 624.019 235.662L614.876 242.878C610.54 246.3 609.817 252.576 613.059 257.047C614.362 258.844 615.641 260.659 616.895 262.491C620.014 267.049 626.168 268.481 630.849 265.55L640.721 259.369Z" fill="${pageData.reactor.blocksColor}"/>`,
        ].splice(0, pageData.reactor.blocksCount);
        
        try {
            await arc_reactor.bindData(pageData, el.id);
        } catch (error) {
            await arc_reactor.bindData(pageData, el.id);
        }
    }
}

function getArcPoints(arcs){
    let sP = {x:399, y:205};
    let p=0;
    let points = [];
    let paths = [];
    for(let i=0,l=arcs.length; i<l; i++){
        p+= arcs[i].percent;
        let lastEp = points[points.length-1]?? sP;
        const eP = {};
        eP.x = sP.x; eP.y = sP.y;
        if(isNaN(p)){
            points.push(sP);
        }
        else{
            const rad = (2*p*Math.PI)/100;
            const dx = sP.x - origin.x; const dy = sP.y -origin.y;
            eP.x = Math.floor((origin.x + dx * (Math.cos(rad)) - dy * (Math.sin(rad)))*100)/100;
            eP.y = Math.floor((origin.y + dx * (Math.sin(rad)) + dy * (Math.cos(rad)))*100)/100;
            points.push(eP);
        }
        let path = `<path stroke-width="25" d="M ${lastEp.x} ${lastEp.y} A 194 194 0 ${arcs[i].percent>50? 1 : 0} 1 ${eP.x} ${eP.y}" stroke="${arcs[i].color}" stroke-linecap="round" filter="url(#airbrush-effect)"/>
        <path opacity="0.8" stroke-width="15" d="M ${lastEp.x} ${lastEp.y} A 194 194 0 ${arcs[i].percent>50? 1 : 0} 1 ${eP.x} ${eP.y}" stroke="${arcs[i].color}" stroke-linecap="round"/>`;
        paths.push(path);
    }
    return {paths, points};
}

function getLastDot(lastPt, text){
    let a,b,c,d,e,f,g;

    if(lastPt.x<399){
        a = lastPt.x + 21;
        c = lastPt.x + 19.5;
        e = c+ 37;
        if(lastPt.y<399){ //4th
            b = lastPt.y + 27;
            d = lastPt.y + 16.5;
        }
        else{ //3rd
            b = lastPt.y - 17;
            d = lastPt.y - 14.5;
        }
    }
    else{
        a= lastPt.x - 55;
        c = lastPt.x - 19.5;
        e = c - 37;
        if(lastPt.y<399){ //1st
            b = lastPt.y + 27;
            d = lastPt.y + 16.5;
        }
        else{ //2nd
            b = lastPt.y - 17;
            d = lastPt.y - 14.5;
        }
    }
   

    return `
    <text x="${a}" y="${b}" fill="snow" font-size="10">${text}</text>
    <line x1="${c}" y1="${d}" x2="${lastPt.x}" y2="${lastPt.y}" stroke="snow"/>
    <line x1="${c}" y1="${d}" x2="${e}" y2="${d}" stroke="snow"/>
    <circle cx="${e}" cy="${d}" r="3px" fill="snow"/>
    <g filter="url(#filter3_d_128_21)">
    <circle cx="${lastPt.x}" cy="${lastPt.y}" r="5.59304" fill="white"/>
    </g>`;
}

function getLeftArc(arc){
    try {
        const eP = {};
        eP.x = 203; eP.y = 598;
        const rad = (2*(arc.percent/4)*Math.PI)/100;
        const dx = eP.x - origin.x; const dy = eP.y -origin.y;
        const r = Math.sqrt(Math.pow(399-eP.x, 2) + Math.pow(399-eP.y, 2));  279.31;
        eP.x = Math.floor((origin.x + dx * (Math.cos(rad)) - dy * (Math.sin(rad)))*100)/100;
        eP.y = Math.floor((origin.y + dx * (Math.sin(rad)) + dy * (Math.cos(rad)))*100)/100;
        return `
        <path opacity="0.8" d="M211.274 592.641 A 269.699 269.699 0 0 1 211.274 205.359" stroke="#D9D9D9" stroke-width="4"/>
        <path stroke-width="15" opacity="0.7" d="M 199 594 A ${r} ${r} 0 0 1 ${eP.x} ${eP.y}" stroke="${arc.color}" stroke-linecap="round"/>
        `;
    } catch (e) {
        console.log(e);
        return '';
    }
}

function getGraphPath(rf) {
    let width = 254;
    let _x= 254/(rf.length - 1), _y=-1.27;
    const xi = 399-width/2, yi = 400;
    const pts = [];
    for (let i = 0, l = rf.length; i < l; i++) pts.push([_x * i + xi, yi + _y * rf[i]]);
    // const scatter = getGraphPoints(pts); //for scatter plot make use of these scatter points
    return (svgPath(pts, 399-width/2, 399+width/2));
}

function svgPath(points, xs, xe) {
    if(points.length<2) return '';
    const d = points.reduce((acc, point, i, a) => i === 0
        // if first point
        ? `M ${point[0]},${point[1]}`
        // else
        : `${acc} ${bezierCommand(point, i, a)}`
        , '')
    return (
    `
    <g id="graph">
    <path opacity="0.5" d="${d} L${xe},527 H${xs} Z" fill="url(#paint1_linear_128_21)"/>
    <path stroke-width="2" stroke="green" d="${d}"/>
    </g>
    `)
}

function bezierCommand(point, i, a) {
    // start control point
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point)
    // end control point
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true)
    let seg = `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    return seg;
}

function controlPoint(current, previous, next, reverse) {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current
    const n = next || current
    // The smoothing ratio
    const smoothing = 0.2;
    // Properties of the opposed-line
    const o = line(p, n)
    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.length * smoothing
    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length
    const y = current[1] + Math.sin(angle) * length
    return [x, y]
}

function line(pointA, pointB) {
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    }
}

function getGraphPoints(pts) {
    let c = '';
    pts.forEach(a => {
        c += `<circle cx="${a[0]}" cy="${a[1]}" r="2" fill="rgba(0,255,0,0.3)"/>`;
    });
    return c;
}

function setCrossHair(boxText){
    getElement('g#crossHair').innerHTML = 
    `<line x1="399.781" y1="256.035" x2="399.781" y2="557.233" stroke="white" stroke-width="2" stroke-dasharray="2 2"/>
    <line x1="248.089" y1="402.139" x2="549.473" y2="402.139" stroke="white" stroke-width="2" stroke-dasharray="2 2"/>
    <rect x="302" y="327" width="90" height="26" rx="4" fill="#169632"/>
    <text x="345.703" y="341" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="snow" font-size="11px">${boxText}</text>
    `
}

function _refresh() { 
	for (const element of arc_reactor.getAllElementInstances()) populateSvg(element);
}

export const arc_reactor = { trueWebComponentMode:true, trueJS:false,elementConnected, _refresh}