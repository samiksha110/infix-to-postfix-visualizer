let speed = 400;

document.getElementById("speedSlider").addEventListener("input", e => {
    speed = e.target.value;
});

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function precedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
}

function updateStack(stack) {
    const box = document.getElementById("stackBox");
    box.innerHTML = "";
    stack.slice().reverse().forEach(v => {
        const d = document.createElement("div");
        d.innerText = v;
        box.appendChild(d);
    });
}

function addStep(msg) {
    const box = document.getElementById("stepsBox");
    const p = document.createElement("p");
    p.className = "step";
    p.innerHTML = msg;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
}

async function infixToPostfix(infix) {
    let stack = [];
    let postfix = "";

    for (let ch of infix) {
        document.getElementById("currentChar").innerText = ch;

        if (/[A-Za-z0-9]/.test(ch)) {
            postfix += ch;
            addStep(`Operand <b>${ch}</b> added to postfix`);
        }
        else if (ch === '(') {
            stack.push(ch);
            addStep(`Opening bracket pushed to stack`);
        }
        else if (ch === ')') {
            addStep(`Closing bracket → pop until (`);
            while (stack.length && stack.at(-1) !== '(') {
                postfix += stack.pop();
                updateStack(stack);
                await delay(speed);
            }
            stack.pop();
        }
        else {
            addStep(`Operator <b>${ch}</b> checking precedence`);
            while (stack.length && precedence(stack.at(-1)) >= precedence(ch)) {
                postfix += stack.pop();
                updateStack(stack);
                await delay(speed);
            }
            stack.push(ch);
        }

        updateStack(stack);
        await delay(speed);
    }

    while (stack.length) {
        postfix += stack.pop();
        updateStack(stack);
        await delay(speed);
    }

    document.getElementById("currentChar").innerText = "-";
    return postfix;
}

class Node {
    constructor(v) {
        this.v = v;
        this.l = null;
        this.r = null;
    }
}

function buildTree(postfix) {
    const s = [];
    for (let ch of postfix) {
        if (/[A-Za-z0-9]/.test(ch)) s.push(new Node(ch));
        else {
            const n = new Node(ch);
            n.r = s.pop();
            n.l = s.pop();
            s.push(n);
        }
    }
    return s.pop();
}

function inorder(n){ return n ? inorder(n.l)+n.v+inorder(n.r) : ""; }
function preorder(n){ return n ? n.v+preorder(n.l)+preorder(n.r) : ""; }
function postorder(n){ return n ? postorder(n.l)+postorder(n.r)+n.v : ""; }

function drawTree(ctx, n, x, y, g) {
    if (!n) return;

    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(x,y,22,0,Math.PI*2);
    ctx.fillStyle="#fed7aa";
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle="#020617";
    ctx.font="16px Segoe UI";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(n.v,x,y);

    if (n.l) {
        ctx.beginPath();
        ctx.moveTo(x,y+22);
        ctx.lineTo(x-g,y+80);
        ctx.stroke();
        drawTree(ctx,n.l,x-g,y+100,g/2);
    }
    if (n.r) {
        ctx.beginPath();
        ctx.moveTo(x,y+22);
        ctx.lineTo(x+g,y+80);
        ctx.stroke();
        drawTree(ctx,n.r,x+g,y+100,g/2);
    }
}

async function convert() {
    const infix = document.getElementById("infixInput").value.replace(/\s+/g,"");
    if (!infix) return alert("Enter expression");

    document.getElementById("statusText").innerText = "Processing";
    document.getElementById("stackDone").style.display="none";
    document.getElementById("stepsBox").innerHTML="";

    const postfix = await infixToPostfix(infix);
    document.getElementById("postfixOutput").innerText = postfix;

    const root = buildTree(postfix);
    document.getElementById("inorder").innerText = inorder(root);
    document.getElementById("preorder").innerText = preorder(root);
    document.getElementById("postorder").innerText = postorder(root);

    const c = document.getElementById("treeCanvas");
    const ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    drawTree(ctx, root, c.width/2, 40, 180);

    document.getElementById("statusText").innerText = "Done";
    document.getElementById("stackDone").style.display="block";
}
