const canvas = document.getElementById('tetris');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SCALE = 20;



const context = canvas.getContext('2d');
context.scale(SCALE,SCALE);

context.fillStyle = "#000";
context.fillRect(0, 0, canvas.width, canvas.height); 

const arena = createMatrix(WIDTH/SCALE,HEIGHT/SCALE); 

var counter = 0;
const score = document.getElementById('score');


let player = {
    matrix:createPiece('L'),
    pos:{ x:5, y:0 },
    prev_pos:{x:5 , y:0}
};

// import {colors ,createPiece} from "variables";


const piece= ['I','L','J','O','Z','S','T'];
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}





//Handle keyboard event
document.addEventListener('keydown',e => {
    e.preventDefault();
    player.prev_pos.x = player.pos.x;
    player.prev_pos.y = player.pos.y;
    switch(e.keyCode){
        case 37://left
        player.pos.x --;
      
        break;

        case 39://right
        player.pos.x ++;
      
        break;

        case 40://down
        player.pos.y ++;
        dropCounter = 0;
      
        break;

        case 38://UP, turn right
        playerRotate(1);
        break;

        case 90://z, turn left
        playerRotate(-1);
        break;

        case 88://x, turn right
        playerRotate(1);
        break;

        case 32://space, drop
        playerDrop();
        break;

    }
});

function merge(arena , player ){
    player.matrix.forEach( (row , y)=>{
        row.forEach( (value , x)=>{
            if(value!== 0){
                arena[y+player.pos.y][x+player.pos.x] = value;
            }
        });
    }); 
}

function createMatrix(w ,h){
    let matrix=[];
    for(var i=0; i<h; i++) {
        matrix[i] = new Array(w).fill(0);
    }
    return matrix;
};






//Check collision
function collide(arena, player) {
    const [m ,o] = [player.matrix, player.pos];

    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
             
                return true;
            }
        }
    }
    return false;
}

//Rotate = transpose + reverse
function rotate(matrix , dir){
    //Transpose
    for(let y=0; y<matrix.length; y++){
        for(let x=0; x<y; x++){

            [
                matrix[y][x] , matrix[x][y]
            ] = [
                matrix[x][y] , matrix[y][x]
            ]; 
        }
    }
    //Reverse
    if(dir >0){
        matrix.forEach( row => row.reverse() );
    }else{
        matrix.reverse();
    }
};

function playerRotate(dir){
    rotate(player.matrix, dir);
    if(collide(arena,player)){
        rotate(player.matrix, dir*(-1));
    }
    
}



function drawMatrix(matrix, offset){
    
    matrix.forEach(function(row,y){
        row.forEach(function(value,x){
            if(value!==0){
                context.fillStyle = colors[value];
                context.fillRect(x+offset.x,
                                 y+offset.y,
                                 1, 1);
                context.lineWidth = .1;
                context.strokeStyle = "white";
                context.strokeRect(x+offset.x,
                    y+offset.y,
                    1, 1);//white border
                
            } 
        });
    });
}


function resetPiece(){
 
    const rand = Math.floor(Math.random() * 7);   
    player = {
        matrix:createPiece(piece[rand]),
        pos:{ x:5, y:0 },
        prev_pos:{x:5, y:0 }
    };
    player.pos.y=0;
    player.pos.x=(WIDTH/SCALE)/2-1;

    if(collide(arena,player)){
      
        gameover();


    }
}


function cleanAll(arena){
  
    arena.forEach( (row,y)=>{
        console.log('y:'+y);
        row.forEach( (value,x)=>{
            arena[y][x] = 0;
        })
    })
}

export function gameover(){
    alert('Game over!!,You score:'+score.innerHTML);
    
    score.innerHTML = 0;
    cleanAll(arena);

    toggleUpdate(0);//pause when gameover

    console.log('game over,restart!');
  
}




function draw(){
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    
    if( collide(arena,player) ){     
        if(player.prev_pos.y < player.pos.y ){
            console.log('collide + reset piece!!,'+
                        'prev_x:'+player.prev_pos.x+'prev_y:'+player.prev_pos.y+
                        'x:'+player.pos.x+'y:'+player.pos.y);
            player.pos.y--;
            merge(arena ,player);
            resetPiece();
        }else{
            player.pos.x = player.prev_pos.x;
            player.pos.y = player.prev_pos.y;
            console.log('collide!');
        }
    }

    drawMatrix(arena, {x:0 , y:0});
    drawMatrix(player.matrix, player.pos);
}

//Drop Effect
function fall() {
    player.prev_pos.y = player.pos.y;
    player.pos.y++;
    dropCounter = 0;
}

function playerDrop(){
    while(!collide(arena , player)){
        player.prev_pos.y = player.pos.y;
        player.pos.y++;
    }
}

function checkEliminate(){
    let full_row = [];
    arena.forEach((row,y) =>{
        if(row.every(isFull)){
            const row = arena.splice(y,1)[0].fill(0);
            arena.unshift(row);
            counter+=50;
            score.innerHTML=counter;
        }
    }); 
}

function isFull(x){
    return x!=0
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Page Refresh
function update(time=0){

    if (exceedTimeInterval(time)) {     
        fall();
    }
    draw();
    checkEliminate();
    if(game_start){
        requestAnimationFrame(update);
    }
    
}

function exceedTimeInterval(time){
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    lastTime = time;

    if(dropCounter > dropInterval){
        return true;
    }else{
        return false;
    }
}



//Pause and Start

var game_start=false;


export function predictClass(classId){
    var keyboard = ['UP','DOWN','LEFT','RIGHT'];
    var keycode = {
        'UP':38,
        'DOWN':40,
        'LEFT':37,
        'RIGHT':39
    };
    let keyPressed = keyboard[classId];
    console.log('keypressed:'+keyPressed);

    
    //emit keyboard event
    event = new KeyboardEvent('keydown',{
        "keyCode":keycode[keyPressed]
    });
    document.dispatchEvent(event);

    draw();

}


export function toggleUpdate(flag){
    flag==true? game_start=1 : game_start=0;
    update();
}










