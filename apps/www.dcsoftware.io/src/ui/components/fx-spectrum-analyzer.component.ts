import { Component, Input, OnDestroy, OnViewInit, ViewChild } from '@microphi/flux';

@Component({
  selector: 'fx-spectrum-analyzer',
  template: `
    <canvas #canvas></canvas>
  `
})
export class FxSpectrumAnalyzer implements OnViewInit, OnDestroy {

  @ViewChild('canvas') canvas!: HTMLCanvasElement;
  @Input() width: number = 300;
  @Input() height: number = 150;

  audioContext!: AudioContext;
  analyser!: AnalyserNode;
  dataArray!: Uint8Array;
  animationId!: number;


  fxOnViewInit() {
    // Set default canvas size
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    //const stream = this.getAttribute('stream');
    //if (stream) {
    //  this.start(stream);
    //}
  }

  async start(stream: MediaStream) {
    try {
      // Initialize the audio context
      this.audioContext = new AudioContext();

      // Create an audio source from the media stream
      const source = this.audioContext.createMediaStreamSource(stream);

      // Create an analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      // Connect the source to the analyser
      source.connect(this.analyser);

      // Prepare the frequency data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Start visualizing
      this.draw();
    } catch (error) {
      console.error('Error initializing Spectrum Analyzer:', error);
    }
  }

  draw() {
    const canvasCtx = this.canvas.getContext('2d')!;
    const { width, height } = this.canvas;

    const renderFrame = () => {
      // Clear the canvas
      canvasCtx.clearRect(0, 0, width, height);

      // Get frequency data
      this.analyser.getByteFrequencyData(this.dataArray);

      // Draw the spectrum
      const barWidth = (width / this.dataArray.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
        barHeight = this.dataArray[i];

        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }

      this.animationId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  fxOnDestroy() {
    // Stop animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}


// Usage Example:
// navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//     const spectrumAnalyzer = document.createElement('spectrum-analyzer');
//     document.body.appendChild(spectrumAnalyzer);
//     spectrumAnalyzer.start(stream);
// });
