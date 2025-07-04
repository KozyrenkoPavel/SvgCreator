import "./PolygonElement";
import { savePolygons, loadPolygons, clearPolygons } from "../utils/storage";

class SvgPolygonApp extends HTMLElement {
  private zoom: number = 1;
  private offset = { x: 0, y: 0 };
  private dragging = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
    this.loadSaved();
    this.drawGrid();
    this.drawScale();
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        .controls { padding: 10px; }
        .zones { display: flex; flex-direction: column; height: 100%; }
        .buffer, .workspace { flex: 1; border: 1px solid #ccc; overflow: hidden; position: relative; }
        .buffer { background: #f0f0f0; }
        svg { width: 100%; height: 100%; cursor: grab; }
        .scale-text { font-size: 10px; fill: #999; }
        line { stroke: #eee; stroke-width: 1; }
      </style>
      <div class="controls">
        <button id="create">Создать</button>
        <button id="save">Сохранить</button>
        <button id="clear">Сбросить</button>
      </div>
      <div class="zones">
        <div class="buffer" id="buffer"></div>
        <div class="workspace" id="workspace">
          <svg id="svg-root">
            <g id="grid"></g>
            <g id="scale"></g>
            <g id="viewport"></g>
          </svg>
        </div>
      </div>
    `;
  }

  setupEvents() {
    this.shadowRoot!.getElementById("create")!.addEventListener("click", () =>
      this.createPolygons()
    );
    this.shadowRoot!.getElementById("save")!.addEventListener("click", () =>
      this.saveState()
    );
    this.shadowRoot!.getElementById("clear")!.addEventListener("click", () =>
      this.clearState()
    );

    const el = this.shadowRoot!.getElementById("svg-root");
    if (!(el instanceof SVGSVGElement)) {
      throw new Error("svg-root is not an SVGSVGElement");
    }
    const svg = el;
    svg.addEventListener("wheel", (e) => this.onZoom(e));
    svg.addEventListener("mousedown", () => this.startPan());
    window.addEventListener("mousemove", (e) => this.onPan(e));
    window.addEventListener("mouseup", () => this.stopPan());

    svg.addEventListener("dragover", (e) => e.preventDefault());
    svg.addEventListener("drop", (e) => this.onDrop(e));
  }

  createPolygons() {
    const count = Math.floor(Math.random() * 16) + 5;
    const buffer = this.shadowRoot!.getElementById("buffer")!;
    for (let i = 0; i < count; i++) {
      const poly = document.createElement("svg-polygon");
      poly.setAttribute("draggable", "true");
      buffer.appendChild(poly);
    }
  }

  saveState() {
    const viewport = this.shadowRoot!.getElementById("viewport")!;
    const workspace = Array.from(viewport.children).map(
      (el) => (el as SVGPolygonElement).getAttribute("points")!
    );

    const buffer = Array.from(
      this.shadowRoot!.getElementById("buffer")!.children
    ).map(
      (el) =>
        (
          el.shadowRoot!.querySelector("polygon") as SVGPolygonElement
        ).getAttribute("points")!
    );

    savePolygons({ buffer, workspace });
  }

  clearState() {
    clearPolygons();
    this.shadowRoot!.getElementById("viewport")!.innerHTML = "";
    this.shadowRoot!.getElementById("buffer")!.innerHTML = "";
  }

  loadSaved() {
    const data = loadPolygons();

    const buffer = this.shadowRoot!.getElementById("buffer")!;
    buffer.innerHTML = "";
    data.buffer.forEach((points) => {
      const poly = document.createElement("svg-polygon");
      poly.setAttribute("draggable", "true");
      (poly as any)._points = points;
      buffer.appendChild(poly);
    });

    const svg = this.shadowRoot!.getElementById("viewport")!;
    svg.innerHTML = "";
    data.workspace.forEach((points) => {
      const poly = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
      );
      poly.setAttribute("points", points);
      poly.setAttribute(
        "fill",
        "#" + Math.floor(Math.random() * 16777215).toString(16)
      );
      svg.appendChild(poly);
    });
  }

  drawGrid() {
    const g = this.shadowRoot!.getElementById("grid")!;
    g.innerHTML = "";
    for (let x = 0; x < 1000; x += 50) {
      g.innerHTML += `<line x1="${x * this.zoom + this.offset.x}" y1="0" x2="${
        x * this.zoom + this.offset.x
      }" y2="1000" />`;
    }
    for (let y = 0; y < 1000; y += 50) {
      g.innerHTML += `<line x1="0" y1="${
        y * this.zoom + this.offset.y
      }" x2="1000" y2="${y * this.zoom + this.offset.y}" />`;
    }
  }

  drawScale() {
    const g = this.shadowRoot!.getElementById("scale")!;
    g.innerHTML = "";
    for (let i = 0; i < 1000; i += 50) {
      g.innerHTML += `<text x="${
        i * this.zoom + this.offset.x
      }" y="10" class="scale-text">${i}</text>`;
      g.innerHTML += `<text x="0" y="${
        i * this.zoom + this.offset.y
      }" class="scale-text">${i}</text>`;
    }
  }

  onZoom(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    this.zoom *= delta;
    this.drawScale();
    this.drawGrid();
    this.shadowRoot!.getElementById("viewport")!.setAttribute(
      "transform",
      `scale(${this.zoom}) translate(${this.offset.x},${this.offset.y})`
    );
  }

  startPan() {
    this.dragging = true;
  }

  onPan(e: MouseEvent) {
    if (!this.dragging) return;
    this.offset.x += e.movementX;
    this.offset.y += e.movementY;
    this.shadowRoot!.getElementById("viewport")!.setAttribute(
      "transform",
      `scale(${this.zoom}) translate(${this.offset.x},${this.offset.y})`
    );
    this.drawScale();
    this.drawGrid();
  }

  stopPan() {
    this.dragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    const points = e.dataTransfer?.getData("text/plain");
    if (!points) return;

    const svg = this.shadowRoot!.getElementById("viewport")!;
    const poly = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    poly.setAttribute("points", points);
    poly.setAttribute(
      "fill",
      "#" + Math.floor(Math.random() * 16777215).toString(16)
    );
    svg.appendChild(poly);
  }
}

customElements.define("svg-polygon-app", SvgPolygonApp);
