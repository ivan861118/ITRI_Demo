var img__container = document.querySelectorAll(".img__container");
var screenshot_btn = document.querySelectorAll('.screenshot__btn'); 
var video = document.querySelector("#webcam");


const CONTROLS = ['up', 'down', 'left', 'right'];



// Set hyper params from UI values.
const learningRateElement = document.getElementById('learningRate');
export const getLearningRate = () => learningRate.value;


const batchSizeFractionElement = document.getElementById('batchSizeFraction');
export const getBatchSizeFraction = () => +batchSizeFractionElement.value;

const denseUnitsElement = document.getElementById('dense-units');
export const getDenseUnits = () => +denseUnitsElement.value;






let mouseDown = false;
//Data-collection Event listener 

screenshot_btn.forEach( (element, label) => {
    element.addEventListener('mousedown', () => handler(label) );
    element.addEventListener('mouseup',() => { mouseDown = false;} );
});


async function handler(label) {
    mouseDown = true;
    // while(mouseDown){

        //ui part
        var dataURL = await getScreenshotURL();  
        img__container[label].querySelector("img").src = dataURL;
        
        
        //data part
        addExampleHandler(label);


        await tf.nextFrame();
    // }
}

//這個寫法好屌
//first declare a var ,it'd become a function as "setExampleHandler" is called
export let addExampleHandler;

export function setExampleHandler(handler) {
  addExampleHandler = handler;
}

function getScreenshotURL(){
    
    var canvas= document.createElement('canvas');
    canvas.width = video.width;
    canvas.height = 168; 
    var ctx = canvas.getContext('2d');

    ctx.drawImage(video,0,0,video.width,video.height);//video is a global var
    var dataURL = canvas.toDataURL();
    
    return dataURL    
}

export function predictClass(classId){
    document.body.setAttribute('data-active', CONTROLS[classId]);
    
}

export function trainStatus(status) {
    trainStatusElement.innerText = status;
  }


