import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';

const INTERVAL_DURATION = 1; // 1 ms
const QPM = 120;
const STEPS_PER_QUARTER = 4;

const STEPS_PER_SEC = (QPM * STEPS_PER_QUARTER) / 60;
const STEP_DURATION = 1000 / STEPS_PER_SEC;
const TICKS_PER_STEP = STEP_DURATION / INTERVAL_DURATION;

class Sequencer {
  constructor(midiOutput, sequence) {
    this.output = midiOutput;
    this.sequence = sequence;
    this.currentStep = 0;
    this.maxStep = Object.keys(this.sequence).map((i) => parseInt(i)).reduce((accumulator, currentValue) => { if (currentValue > accumulator) { accumulator = currentValue}; return accumulator;},0);
  }

  tick() {
    const note = this.sequence[this.currentStep];
    if (note) {
      console.log("found note");
      const message = [0x90, 60, 0x7f];
      this.output.send(message); 
    }
    if (this.currentStep === this.maxStep) {
      this.currentStep = 0;
    } else {
      this.currentStep = this.currentStep + 1;
    }
  }
}



function onMIDISuccess(midiAccess) {
  console.log(midiAccess.outputs);
  const polyseqOutput = midiAccess.outputs.get("AtngWt2M8Gx81EPYqfwQKYaq2MREzSh/fqcN+8f638k=");
  return polyseqOutput;
  /*const noteOnMessage = [0x90, 60, 0x7f];
  const noteOffMessage = [0x80, 0x3C, 0x40];
  polyseqOutput.send(noteOnMessage);

  setTimeout(() => polyseqOutput.send(noteOffMessage), 1000);*/
  
}

function onMIDIFailure(msg) {
  console.error(msg);
}

const polyseqOut = await navigator.requestMIDIAccess().then(onMIDISuccess);
const sequencer = new Sequencer(polyseqOut, { 1: "a", 2:"b", 4:"c"});

function sendNote() {
  const noteOnMessage = [0x90, 60, 0x7f];
  const noteOffMessage = [0x80, 0x3C, 0x40];
  polyseqOut.send(noteOnMessage);
  setTimeout(() => polyseqOut.send(noteOffMessage), 100);
}

function startClock() {
  let counter = 0;
  console.log("starting clock!");
  setInterval(() => { 
    if (counter == TICKS_PER_STEP-1) {
      console.log("tick");
      sequencer.tick();
      counter = 0;
    } else {
      counter += 1;
    }
  }, INTERVAL_DURATION);
}

function stopClock() {
}

function App() {
  return (
    <div className="App">
     <h5>polyseq</h5> 
     <button onClick={sendNote}>start</button>
     <button onClick={startClock}>clock start</button>
     <button onClick={stopClock}>clock stop</button>
    </div>
  );
}

export default App;
