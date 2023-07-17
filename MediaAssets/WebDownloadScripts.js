function getImgURL(imgElem){ return imgElem.srcset.match(/1.5x, (.*) 2x/gm)[0].split(' ')[1]; }
var ImgArray = []; for(var i = 0; i < imgElems.length; i++) { var tempObj = {}; tempObj["filename"]=getImgURL(imgElems[i]); tempObj['src']=imgElems[i].alt; ImgArray.push(tempObj); }

function getImgURL(table_elem){ return table_elem.getElementsByTagName("img")[0].srcset.match(/1.5x, (.*) 2x/gm)[0].split(' ')[1]; }

function getLocalName(table_elem) { return table_elem.querySelectorAll("td")[2].innerText; }

var img_urls={}; for(var i=0; i < table_elms.length; i++){ try{img_urls[getLocalName(table_elms[i])]= getImgURL(table_elms[i]);}catch(err){}}

var ImgArray = []; for(var property in img_urls) { var tempObj = {}; tempObj["filename"]=property.replace(/\s+/g, '_')+".jpg"; tempObj['src']=img_urls[property]; ImgArray.push(tempObj); }

var ImgArray = [];
for(var name in myObj) {
	ImgArray.push({"filename": name, "src": myObj[name]["URL"]});
}

function setImgArray(myObj) {
	ImgArray = [];
	for(var name in myObj) {
		ImgArray.push({"filename": name, "src": myObj[name]["URL"]});
	}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function downloadImage(url,name){
    fetch(url).then(res => res.blob()).then(res => {
        const link = document.createElement('a');
        link.setAttribute('download',name);
        const href = URL.createObjectURL(res);
        link.href = href;
        link.setAttribute('target', '_blank');
        link.click();

        setTimeout(() => {
            URL.revokeObjectURL(href)
        }, 0)
    })
}

async function downloadThem(delay){
	for(var i = 0; i < ImgArray.length; i++) { downloadImage(ImgArray[i].src,ImgArray[i].filename); await sleep(delay);}
}

downloadThem(1000);