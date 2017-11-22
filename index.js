"use strict";

const
    fs = require("fs"),
    electron = require("electron"),
    chalk = require("chalk"),
    slimesFileName = "../slimes.json",
    slimesXMLFileName = "slimes.xml";


/**
 * @typedef Food
 * @prop {object|string} type
 * @prop {string|boolean|object} hasCrop
 * @prop {object|string} fav
 */
/**
 * @typedef Slime
 * @prop {string} type
 * @prop {Food} food
 * @prop {boolean|string} largoable
 * @prop {string} plot
 * @prop {string} color
 */


function main(){
    fs.readFile(slimesFileName, "utf8",parseFile);
}
/**
 * @param {NodeJS.ErrnoException} err
 * @param {string} slimesFile
 */
function parseFile(err,slimesFile){
    /** @type { [Slime] } */
    let slimes = JSON.parse(slimesFile);
    let xml = createXMLRoot();
    for(let slime of slimes){
        createCell(xml, `${slime.type}`, { fillColor: slime.color, dashed: slime.food.hasCrop?1:0 });
    }
    fs.writeFile(slimesXMLFileName, xml.interface.documentElement.outerHTML, "utf8", err=>{
        if(err)
            throw err;
        electron.remote.app.quit();
    });
}

/**
 * 
 * @param {{interface: Document, root: HTMLElement}} xmlObj
 * @param {String} label 
 * @param {Object} styleOptions 
 */
function createCell(xmlObj, label, styleOptions){
    styleOptions = Object.assign({}, {
        rounded: 1,
        whiteSpace: "wrap",
        html: 1,
        fontSize: 15,
        align: "center",
        fontFamily: "Comic Sans MS",
        labelBackgroundColor: "none",
        fillColor: "#ffffff",
        arcSize: 50,
        fontStyle: 0,
        text: "Text"
    }, styleOptions);
    
    let lastId = parseInt(xmlObj.interface.querySelector("mxCell:last-child").getAttribute("id"));
    let style = Object.entries(styleOptions).map(([key,val])=>{
        return `${key}=${val}`;
    }).join(";");

    // for(let option in styleOptions){
    //     let optVal = styleOptions[option];
    // }

    let rootCell = setAttributes(xmlObj.root.appendChild(xmlObj.interface.createElement("mxCell")), {id: lastId+1, parent: 1, value: label, vertex: 1, style: style});
    let x = (lastId-1)*80,
        y = 0,
        w = 80, 
        h = 45;
        
    setAttributes(rootCell.appendChild(xmlObj.interface.createElement("mxGeometry")), {x,y,width:w,height:h,as:"geometry"});
}
/**
 * 
 * @param {HTMLElement} el 
 * @param {Object} atts 
 */
function setAttributes(el, attrs){
    for(let attr in attrs)
        el.setAttribute(attr, attrs[attr]);
    return el;
}

function createXMLRoot(){
    let xml = document.implementation.createDocument(null, "mxGraphModel");
    let xmlRoot = xml.documentElement, currentRoot = xmlRoot;
    setAttributes(currentRoot, {
        dx: "519", 
        dy: "428", 
        grid: "1", 
        gridSize: "10", 
        guides: "1", 
        tooltips: "1", 
        connect: "1", 
        arrows: "1", 
        fold: "1", 
        page: "1", 
        pageScale: "1", 
        pageWidth: "850", 
        pageHeight: "1100", 
        background: "#ffffff", 
        math: "0", 
        shadow: "0"
    });
    
    currentRoot = currentRoot.appendChild(xml.createElement("root"));
    
    setAttributes(currentRoot.appendChild(xml.createElement("mxCell")), {id: 0});
    setAttributes(currentRoot.appendChild(xml.createElement("mxCell")), {id: 1, parent: 0});

    console.log(xml);
    window.xml = xml;
    return {interface: xml, root: currentRoot};
}

function hexToColor(colorString){
    return colorString.match(/[0-9a-f]{2}/gi)
    .reduce((c,v,ch)=>{c[["r","g", "b"][ch]]=parseInt(v,16); return c;}, {});
}

electron.remote.getCurrentWebContents().openDevTools({mode: "right"});

// createXMLRoot();
main();