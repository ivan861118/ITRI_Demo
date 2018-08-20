import {Webcam} from "./webcam.js";
import {ControllerDataset} from './controller_dataset.js';
import * as ui from './ui.js';
// import * as model from './model';

// const cam_dom =  document.getElementById('webcam');
// cam_dom.addEventListener('loadeddata',function(){
//   const webcam = new Webcam(cam_dom);
//   const img = webcam.capture();
//   img.print();

// })


  

// The number of classes we want to predict. In this example, we will be
// predicting 4 classes for up, down, left, and right.
const NUM_CLASSES = 4;

export const BATCH_SIZE = 1;

// A webcam class that generates Tensors from the images from the webcam.
const webcam = new Webcam(document.getElementById('webcam'));

// The dataset object where we will store activations.
const controllerDataset = new ControllerDataset(NUM_CLASSES);

let mobilenet;
let model;


// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadMobilenet() {
  const mobilenet = await tf.loadModel(
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  console.log('load mobilnet success');
  return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
}




  // When the UI buttons are pressed, read a frame from the webcam and associate
// it with the class label given by the button. up, down, left, right are
// labels 0, 1, 2, 3 respectively.
ui.setExampleHandler(label => {
    tf.tidy(() => {

      const img = webcam.capture();
      console.log('webcam dim ='+img.shape[1]+'x'+img.shape[2]+'x'+img.shape[3]);
    
      controllerDataset.addExample(mobilenet.predict(img), label);
      console.log('Dataset dim ='+controllerDataset.shape[0]+'x'+controllerDataset.shape[1]+'x'+controllerDataset.shape[2]);

      console.log('add data success');
   
  
    });
});



async function train(){
  if (controllerDataset.xs == null) {
    throw new Error('Add some examples before training!');
  }


model = tf.sequential({
  layers: [
    // Flattens the input to a vector so we can use it in a dense layer. While
    // technically a layer, this only performs a reshape (and has no training
    // parameters).
    tf.layers.flatten({inputShape: [7, 7, 256]}),
    // Layer 1
    tf.layers.dense({
      units: ui.getDenseUnits(),
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
      useBias: true
    }),
    // Layer 2. The number of units of the last layer should correspond
    // to the number of classes we want to predict.
    tf.layers.dense({
      units: NUM_CLASSES,
      kernelInitializer: 'varianceScaling',
      useBias: false,
      activation: 'softmax'
    })
  ]
});


//  // Creates the optimizers which drives training of the model.
const optimizer = tf.train.adam(ui.getLearningRate());

//   // We use categoricalCrossentropy which is the loss function we use for
//   // categorical classification which measures the error between our predicted
//   // probability distribution over classes (probability that an input is of each
//   // class), versus the label (100% probability in the true class)>
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});
 



  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize:ui.getBatchSizeFraction(),
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        ui.trainStatus('Loss: ' + logs.loss.toFixed(5));
        console.log('loss:'+logs.loss.toFixed(5));
        await tf.nextFrame();
      }
    }
  });
}

let isPredicting = false;

async function predict(){
    // ui.isPredicting();
    // while (isPredicting) {
      const predictedClass = tf.tidy(() => {
        // Capture the frame from the webcam.
        const img = webcam.capture();
  
        // Make a prediction through mobilenet, getting the internal activation of
        // the mobilenet model.
        tf.print(mobilenet);
        const activation = mobilenet.predict(img);


  
        // // Make a prediction through our newly-trained model using the activation
        // // from mobilenet as input.
        
        const predictions = model.predict(activation);

        tf.print("predict tensor="+predictions);


        
  
        // Returns the index with the maximum probability. This number corresponds
        // to the class the model thinks is the most probable given the input.
        return predictions.as1D().argMax();
      });

      console.log('predicted class:'+predictedClass);
  
      const classId = (await predictedClass.data())[0];
      predictedClass.dispose();
  
      ui.predictClass(classId);
      await tf.nextFrame();
    // }
    
    // ui.donePredicting();
  

}








document.getElementById('train').addEventListener('click', async () => {
  isPredicting = false;
  train();
});

document.getElementById('predict').addEventListener('click', () => {

  isPredicting = true;
  predict();
});



async function init() {

    mobilenet = await loadMobilenet();
  
    // Warm up the model. This uploads weights to the GPU and compiles the WebGL
    // programs so the first time we collect data from the webcam it will be
    // quick.
    tf.print(mobilenet);
    tf.tidy(() => mobilenet.predict(webcam.capture()));

  
    // ui.init();
}
  
// Initialize the application.
init();


