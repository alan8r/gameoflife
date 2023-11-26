const DEBUG = false

let canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d"),
    btnStep = document.querySelector("#step"),
    btnStart = document.querySelector("#start"),
    btnPause = document.querySelector("#pause"),
    btnClear = document.querySelector("#clear"),
    inputFPS = document.querySelector("input"),
    spanCurrGen = document.querySelector("#gen"),
    checkFlipDim = document.querySelector("#check")

let cellSizePx = 10,
    cellsWide = 60,
    cellsHigh = 40,
    currGen = 1,
    pxScale = 1,
    targetFPS = 15

if(!DEBUG) console.debug = ()=>null

function initCanvas() {
    canvas.width = cellsWide * cellSizePx * pxScale
    canvas.height = cellsHigh * cellSizePx * pxScale
}

let cellGrid = []
    flipQueue = []

let mainLoop;

class Cell {
    constructor(x, y, isAlive=false) {
        this.x = x
        this.y = y
        this.isAlive = isAlive
    }

    flipState() {
        this.isAlive = !this.isAlive
    }

    countLivingAdj() {
        let xx, yy, liveCount = 0;
        for (let y = -1; y <= 1; y++) {
            yy = this.y + y
            for (let x = -1; x <= 1; x++) {
                xx = this.x + x
                if (x==0 && y==0) continue;
                if (validBounds(xx, yy))
                    if (cellGrid[yy][xx].isAlive)
                        liveCount++
            }
        }
        return liveCount;
    }
}

function validBounds(x, y) { 
    return x >= 0 && x < cellsWide
        && y >= 0 && y < cellsHigh
}

function initCells(){
    cellGrid = []
    for (let y=0; y < cellsHigh; y++) {
        cellGrid.push([])
        for (let x=0; x < cellsWide; x++) {
            cellGrid[y].push(new Cell(x, y, false))
        }
    }
}

btnStep.onclick = function() {
    update()
    render()
}

btnStart.onclick = function() {
    btnStep.disabled = true
    inputFPS.disabled = true
    this.disabled = true
    btnPause.disabled = false
    mainLoop = setInterval(()=> {
        console.debug("#loop running!")
        update()
        render()
    }, 1000 / targetFPS)
    console.debug("#loop started!")
}

btnPause.onclick = function() {
    btnStep.disabled = false
    this.disabled = true
    btnStart.disabled = false
    clearInterval(mainLoop)
    inputFPS.disabled = false
    console.debug("#loop stopped!")
}

btnClear.onclick = function() {
    flipQueue = []
    currGen = 1
    initCells()
    render()
}

inputFPS.onchange = function() {
    if (inputFPS.value <= 1)
        inputFPS.value = targetFPS = 1 
    targetFPS = inputFPS.value
    console.debug(`NEW FPS SET -- ${targetFPS}`)
}

checkFlipDim.onchange = function() {
    let newWidth = cellsHigh,
        newHeight = cellsWide
    
    cellsHigh = newHeight
    cellsWide = newWidth
    currGen = 1
    initCanvas()
    initCells()
    render()
}

canvas.onclick = function(e) {
    let mX = Math.floor(e.offsetX / (cellSizePx*pxScale)),
        mY = Math.floor(e.offsetY / (cellSizePx*pxScale))
    console.debug(`cell clicked (${mX},${mY})`)
    cellGrid[mY][mX].flipState()
    render()
}

canvas.oncontextmenu = function(e) {
    e.preventDefault()
    let mX = Math.floor(e.offsetX / (cellSizePx*pxScale)),
        mY = Math.floor(e.offsetY / (cellSizePx*pxScale))
    console.log(`Living adj @ (${mX},${mY}): ${cellGrid[mY][mX].countLivingAdj()}`)
}

function drawGrid() {
    ctx.strokeStyle = "#aaa"
    ctx.lineWidth = 1
    
    for (let y = 0.5; y < canvas.height + 0.5; y += cellSizePx * pxScale) 
    {
        ctx.moveTo(0.5, y)
        ctx.lineTo(canvas.width + 0.5, y)
    }

    for (let x = 0; x < canvas.width; x += cellSizePx * pxScale)
    {
        ctx.moveTo(x + 0.5, 0.5)
        ctx.lineTo(x + 0.5, canvas.height + 0.5)
    }
    ctx.stroke()
}

function handleCurrentCells() {
    for (let y=0; y<cellsHigh; y++) {
        for (let x=0; x<cellsWide; x++) {
            let cell = cellGrid[y][x],
                aliveAdj = cell.countLivingAdj()
            if (cell.isAlive) {
                // cell is alive
                if (aliveAdj <= 1 || aliveAdj >= 4) {
                    console.debug(`Killing cell @ (${x},${y})`)
                    flipQueue.push({x,y})
                }
            } else {
                // cell is dead
                if (aliveAdj == 3) {
                    console.debug(`Spawning cell @ (${x},${y})`)
                    flipQueue.push({x,y})
                }
            }
        }
    }
}

function spawnNextCells() {
    while (flipQueue.length > 0) {
        let coord = flipQueue.pop()
        cellGrid[coord.y][coord.x].flipState()
    }
}

function update() {
    handleCurrentCells()
    spawnNextCells()
    currGen++;
}

function render() {
    for (let y=0; y<cellGrid.length; y++) {
        for (let x=0; x<cellGrid[y].length; x++) {
            let cell = cellGrid[y][x]
            ctx.fillStyle = cell.isAlive?'#222':'#fff'
            let wh = cellSizePx * pxScale,
                xx = cell.x * wh,
                yy = cell.y * wh
            ctx.fillRect(xx, yy, wh, wh);
        }
    }
    drawGrid()
    spanCurrGen.innerText = currGen;
}



/* ###################
### MAIN LOOP HERE ###
################### */ 

(function main() {
    initCanvas()
    initCells()
    render()
    inputFPS.value = targetFPS
})();
