export default class PolygonElement extends HTMLElement {
  private shadow: ShadowRoot;
  private points: string = '';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.points) {
      this.points = this.generateRandomPolygonPoints();
    }

    this.render();
    this.setupDrag();
  }

  static get observedAttributes() {
    return ['points'];
  }

  attributeChangedCallback(name: string, _old: string, value: string) {
    if (name === 'points') {
      this.points = value;
      this.render();
    }
  }

  private generateRandomPolygonPoints(): string {
    const cx = Math.random() * 100 + 50;
    const cy = Math.random() * 100 + 50;
    const radius = Math.random() * 30 + 20;
    const sides = Math.floor(Math.random() * 5) + 3;

    const angleStep = (2 * Math.PI) / sides;
    const points: string[] = [];

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 120px;
          height: 120px;
        }
        svg {
          width: 100%;
          height: 100%;
        }
      </style>
      <svg viewBox="0 0 200 200">
        <polygon points="${this.points}" fill="#800000" />
      </svg>
    `;
  }

  private setupDrag() {
    this.setAttribute('draggable', 'true');

    this.addEventListener('dragstart', (e: DragEvent) => {
      e.dataTransfer?.setData('text/plain', this.points);
      e.dataTransfer?.setDragImage(this.shadow.querySelector('svg')!, 0, 0);
    });
  }

  get polygonPoints(): string {
    return this.points;
  }

  set polygonPoints(value: string) {
    this.points = value;
    this.setAttribute('points', value);
  }
}

customElements.define('svg-polygon', PolygonElement);
