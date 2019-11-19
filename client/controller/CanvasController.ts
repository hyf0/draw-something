import Point from './Point';

export interface ICanvasControllerSetting {
  penSize?: number;
  penColor?: string;
}

export default class CanvasController {
  public ctx: CanvasRenderingContext2D;
  public canvasEl: HTMLCanvasElement;
  get penColor() {
    return this.ctx.strokeStyle as string;
  }
  set penColor(color: string) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
  }
  get penSize() {
    return this.ctx.lineWidth;
  }
  set penSize(size: number) {
    this.ctx.lineWidth = size;
  }
  constructor(canvasEl?: HTMLCanvasElement, options?: {
    penColor?: string;
    penSize?: number;
  }) {
    this.canvasEl =
      canvasEl == null ? document.createElement('canvas') : canvasEl;
    this.ctx = this.canvasEl.getContext('2d') as CanvasRenderingContext2D;
    this.init();
    if (options != null) {
      if (options.penColor != null) this.setPenColor(options.penColor);
      if (options.penSize != null) this.setPenSize(options.penSize);
    }
  }

  init() {
    this.ctx.fillStyle = this.penColor;
    this.ctx.strokeStyle = this.penColor;
    this.ctx.lineWidth = this.penSize;
  }

  // new

  getSetting(): Required<ICanvasControllerSetting> {
    return {
      penSize: this.penSize,
      penColor: this.penColor,
    }
  }

  setting(s: ICanvasControllerSetting) {
    if (s.penColor != null) this.penColor = s.penColor;
    if (s.penSize != null) this.penSize = s.penSize;
  }

  drawImage(image: HTMLImageElement | string) {
    // console.log('image', image);
    if (typeof image === 'string') {
      const img = new Image();
      img.onload = () => {
        this.clearCanvas();
        this.drawImage(img);
      };
      img.src = image;
    } else {
      this.ctx.drawImage(image, 0, 0);
    }
  }

  drawPoint(to: Point, r: number = this.penSize / 2) {
    const { ctx } = this;
    console.log('drawPoint', 'r',r , 'lineWidth', this.ctx.lineWidth);
    ctx.beginPath();
    ctx.arc(to.x, to.y, r, 0, Math.PI * 2);
    ctx.fill();
    // ctx.stroke();
    ctx.closePath();
  }

  getSnapshot() {
    return this.canvasEl.toDataURL('image/jpeg', 1);
  }

  startDrawLine(startPoint: Point) {
    const sp = startPoint;
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
  }

  drawLineTo(to: Point) {
    // console.log('to', to);
    const { ctx } = this;
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  mount(elementSelector: string) {
    const el = document.querySelector(elementSelector);
    (window as any).el = el;
    console.log(el, elementSelector);
    if (el != null) {
      el.append(this.canvasEl);
      this.canvasEl.height = el.clientHeight;
      this.canvasEl.width = el.clientWidth;
      this.clearCanvas();
    } else {
      throw new Error(`无法通过 ${elementSelector} 找到相应的元素，请确定选择器书写正确`);
    }
  }

  clearCanvas() {
    const prevFillStyle = this.ctx.fillStyle;
    this.ctx.fillStyle = '#fff';
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.ctx.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.ctx.fillStyle = prevFillStyle;
  }

  // end new

  setOptions(op: {
    penColor?: string;
    penSize?: number;
  }) {
    if (op.penColor != null) this.setPenColor(op.penColor);
    if (op.penSize != null) this.setPenSize(op.penSize);
  }

  getOptions() {
    return {
      penColor: this.penColor,
      penSize: this.penSize,
    }
  }

  setPenSize(size: number) {
    this.ctx.lineWidth = size;
  }

  setPenColor(color: string) {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
  }


}
