class SvgPolygonApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
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
}

customElements.define('svg-polygon-app', SvgPolygonApp);
