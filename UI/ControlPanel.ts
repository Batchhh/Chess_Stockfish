class ControlPanel {
    private panel: HTMLElement;
    private isDragging: boolean = false;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private randomDelayMin: number = 1; // in seconds
    private randomDelayMax: number = 5; // in seconds
    private calculatedMove: string = 'none';
    private depth: number = 15; // default depth

    constructor() {
        this.panel = document.createElement('div');
        this.panel.className = 'control-panel';
        this.panel.innerHTML = `
            <div class="header">
                <span class="material-icons">android</span>
            </div>
            <label class="toggle">
                <span class="material-icons">queue</span>
                <span class="label-text">Auto Queue</span>
                <input type="checkbox" id="toggleAutoQueue">
                <span class="slider"></span>
            </label>
            <label class="toggle">
                <span class="material-icons">play_arrow</span>
                <span class="label-text">Auto Move</span>
                <input type="checkbox" id="toggleAutoMove">
                <span class="slider"></span>
            </label>
            <div class="delay-settings" id="delaySettings">
                <label>
                    Min Delay (s):
                    <input type="number" id="minDelay" value="${this.randomDelayMin}" min="0">
                </label>
                <label>
                    Max Delay (s):
                    <input type="number" id="maxDelay" value="${this.randomDelayMax}" min="0">
                </label>
            </div>
            <label class="toggle">
                <span class="material-icons">edit</span>
                <span class="label-text">Marking</span>
                <input type="checkbox" id="toggleMarking">
                <span class="slider"></span>
            </label>
            <div class="depth-slider">
                <label>
                    Depth: <span id="depthValue">${this.depth}</span>
                    <input type="range" id="depthSlider" min="1" max="20" value="${this.depth}">
                </label>
            </div>
            <hr class="separator">
            <div class="calculated-move" id="calculatedMove">
                <span id="moveDisplay">${this.calculatedMove}</span>
            </div>
        `;

        this.applyStyles();
        document.body.appendChild(this.panel);
        this.addEventListeners();
    }

    private applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

            .control-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 260px;
                padding: 20px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                cursor: move;
                z-index: 1000;
                transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
                opacity: 0;
                transform: translateY(-20px);
                animation: fadeIn 0.3s forwards;
            }
            @keyframes fadeIn {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .control-panel:hover {
                transform: scale(1.02);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
            .header {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 20px;
            }
            .header .material-icons {
                font-size: 36px;
                color: #3f51b5;
            }
            .toggle {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                font-size: 16px;
                color: #333;
                transition: color 0.3s ease;
            }
            .toggle:hover {
                color: #3f51b5;
            }
            .toggle input {
                display: none;
            }
            .slider {
                position: relative;
                width: 50px;
                height: 24px;
                background-color: #ccc;
                border-radius: 34px;
                margin-left: 12px;
                transition: background-color 0.3s;
            }
            .slider:before {
                content: "";
                position: absolute;
                width: 20px;
                height: 20px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            input:checked + .slider {
                background-color: #3f51b5;
            }
            input:checked + .slider:before {
                transform: translateX(26px);
            }
            .label-text {
                flex-grow: 1;
                font-family: 'Roboto', sans-serif;
                margin-left: 8px;
            }
            .material-icons {
                font-size: 22px;
                color: #757575;
                transition: color 0.3s;
            }
            .toggle:hover .material-icons {
                color: #3f51b5;
            }
            .delay-settings {
                margin-top: 20px;
                display: none;
            }
            .delay-settings label {
                display: block;
                margin-bottom: 10px;
                font-size: 14px;
                color: #333;
            }
            .delay-settings input {
                width: 100%;
                padding: 5px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                background-color: #f5f5f5;
                color: #000;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .depth-slider {
                margin-top: 20px;
                font-size: 14px;
                color: #333;
            }
            .depth-slider input[type="range"] {
                -webkit-appearance: none;
                width: 100%;
                height: 8px;
                background: #ddd;
                border-radius: 5px;
                outline: none;
                transition: background 0.3s;
            }
            .depth-slider input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: #3f51b5;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.3s;
            }
            .depth-slider input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #3f51b5;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.3s;
            }
            .separator {
                border: none;
                border-top: 1px solid #ddd;
                margin: 20px 0;
            }
            .calculated-move {
                margin-top: 20px;
                font-size: 14px;
                color: #333;
                text-align: center;
            }
            #moveDisplay {
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    private addEventListeners() {
        const toggleAutoQueue = this.panel.querySelector('#toggleAutoQueue') as HTMLInputElement;
        const toggleAutoMove = this.panel.querySelector('#toggleAutoMove') as HTMLInputElement;
        const toggleMarking = this.panel.querySelector('#toggleMarking') as HTMLInputElement;
        const minDelayInput = this.panel.querySelector('#minDelay') as HTMLInputElement;
        const maxDelayInput = this.panel.querySelector('#maxDelay') as HTMLInputElement;
        const delaySettings = this.panel.querySelector('#delaySettings') as HTMLElement;
        const depthSlider = this.panel.querySelector('#depthSlider') as HTMLInputElement;
        const depthValue = this.panel.querySelector('#depthValue') as HTMLElement;

        toggleAutoQueue.addEventListener('change', () => {
            window.main.autoQueue = toggleAutoQueue.checked;
        });

        toggleAutoMove.addEventListener('change', () => {
            window.main.autoMove = toggleAutoMove.checked;
            delaySettings.style.display = toggleAutoMove.checked ? 'block' : 'none';
            if (!toggleAutoMove.checked) {
                this.updateCalculatedMove('none', 'none');
            }
        });

        toggleMarking.addEventListener('change', () => {
            window.main.marking = toggleMarking.checked;
        });

        minDelayInput.addEventListener('input', () => {
            this.randomDelayMin = parseInt(minDelayInput.value) || 0;
        });

        maxDelayInput.addEventListener('input', () => {
            this.randomDelayMax = parseInt(maxDelayInput.value) || 0;
        });

        depthSlider.addEventListener('input', () => {
            this.depth = parseInt(depthSlider.value);
            depthValue.textContent = this.depth.toString();
        });

        depthSlider.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });

        this.panel.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.offsetX = event.clientX - this.panel.offsetLeft;
            this.offsetY = event.clientY - this.panel.offsetTop;
            this.panel.style.transition = 'none'; // Disable transition during drag
        });

        document.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                this.panel.style.left = `${event.clientX - this.offsetX}px`;
                this.panel.style.top = `${event.clientY - this.offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.panel.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'; // Re-enable transition
        });
    }

    public getRandomDelay(): number {
        return (Math.floor(Math.random() * (this.randomDelayMax - this.randomDelayMin + 1)) + this.randomDelayMin) * 1000;
    }

    public getDepth(): number {
        return this.depth;
    }

    public updateCalculatedMove(move: string, type: string, delay: number = 0): void {
        const delayInSeconds = delay / 1000;
        this.calculatedMove = move !== 'none' ? `${move} | ${type} | ${delayInSeconds}s` : 'none';
        const moveDisplay = this.panel.querySelector('#moveDisplay') as HTMLElement;
        moveDisplay.textContent = this.calculatedMove;
    }
}

export default ControlPanel;
