// ================= PRECEDENCE =================
function precedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
}

// ================= DELAY =================
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ================= STACK VISUAL =================
function updateStack(stack) {
    const box = document.getElementById("stackBox");
    box.innerHTML = "";
    stack.slice().reverse().forEach(el => {
        const d = document.createElement("div");
        d.innerText = el;
        box.appendChild(d);
    });
}

// ================= INFIX → POSTFIX (ANIMATED) =================
async function infixToPostfix(infix) {
    let stack = [];
    let postfix = "";

    for (let ch of infix) {
        document.getElementById("currentChar").innerText = ch;

        if (/[A-Za-z0-9]/.test(ch)) {
            postfix += ch;
        }
        else if (ch === '(') {
            stack.push(ch);
        }
        else if (ch === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                postfix += stack.pop();
                updateStack(stack);
                await delay(400);
            }
            stack.pop();
        }
        else {
            while (
                stack.length &&
                precedence(stack[stack.length - 1]) >= precedence(ch)
            ) {
                postfix += stack.pop();
                updateStack(stack);
                await delay(400);
            }
            stack.push(ch);
        }

        updateStack(stack);
        await delay(400);
    }

    while (stack.length) {
        postfix += stack.pop();
        updateStack(stack);
        await delay(400);
    }

    document.getElementById("currentChar").innerText = "-";
    document.getElementById("stackDone").style.display = "block";

    return postfix;
}

// ================= TREE NODE =================
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// ================= BUILD TREE =================
function buildExpressionTree(postfix) {
    let stack = [];
    for (let ch of postfix) {
        if (/[A-Za-z0-9]/.test(ch)) {
            stack.push(new TreeNode(ch));
        } else {
            let node = new TreeNode(ch);
            node.right = stack.pop();
            node.left = stack.pop();
            stack.push(node);
        }
    }
    return stack.pop();
}

// ================= TRAVERSALS =================
function inorder(n) {
    if (!n) return "";
    return inorder(n.left) + n.val + inorder(n.right);
}
function preorder(n) {
    if (!n) return "";
    return n.val + preorder(n.left) + preorder(n.right);
}
function postorder(n) {
    if (!n) return "";
    return postorder(n.left) + postorder(n.right) + n.val;
}

// ================= DRAW TREE (FIXED SIZE) =================
function drawTree(ctx, node, x, y, gap) {
    if (!node) return;

    const RADIUS = 28;
    const FONT_SIZE = 18;

    // node
    ctx.beginPath();
    ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#cfefff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#020617";
    ctx.stroke();

    // text
    ctx.fillStyle = "#020617";
    ctx.font = `bold ${FONT_SIZE}px Segoe UI`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.val, x, y);

    // connections
    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 2.5;

    if (node.left) {
        ctx.beginPath();
        ctx.moveTo(x, y + RADIUS);
        ctx.lineTo(x - gap, y + 90);
        ctx.stroke();
        drawTree(ctx, node.left, x - gap, y + 120, gap / 2);
    }

    if (node.right) {
        ctx.beginPath();
        ctx.moveTo(x, y + RADIUS);
        ctx.lineTo(x + gap, y + 90);
        ctx.stroke();
        drawTree(ctx, node.right, x + gap, y + 120, gap / 2);
    }
}

// ================= MAIN =================
async function convert() {
    document.getElementById("stackBox").innerHTML = "";
    document.getElementById("postfixOutput").innerText = "";
    document.getElementById("currentChar").innerText = "-";
    document.getElementById("stackDone").style.display = "none";

    let infix = document.getElementById("infixInput").value.replace(/\s+/g, "");
    if (!infix) {
        alert("Enter an infix expression");
        return;
    }

    let postfix = await infixToPostfix(infix);
    document.getElementById("postfixOutput").innerText = postfix;

    let root = buildExpressionTree(postfix);

    document.getElementById("inorder").innerText = inorder(root);
    document.getElementById("preorder").innerText = preorder(root);
    document.getElementById("postorder").innerText = postorder(root);

    let canvas = document.getElementById("treeCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTree(ctx, root, canvas.width / 2, 50, 200);
}
