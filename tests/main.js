var el = document.getElementById("canvas");
el.width = 400;
el.height = 400;

function clear(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function draw(ctx) {
    let time = new Date();

    clear(ctx);
    // draw outer circle
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.fillStyle = "rgba(255, 20, 147, 0.5)";
    ctx.arc(0, 0, 105, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("XII", 0, -90);
    ctx.fillText("III", 90, 0);
    ctx.fillText("VI", 0, 90);
    ctx.fillText("IX", -90, 0);
    ctx.rotate(Math.PI / 6);
    ctx.fillText("I", 0, -90);
    ctx.fillText("VII", 0, 90);
    ctx.rotate(Math.PI / 6);
    ctx.fillText("II", 0, -90);
    ctx.fillText("VIII", 0, 90);
    ctx.rotate(-Math.PI/3-Math.PI/6);
    ctx.fillText("XI", 0, -90);
    ctx.fillText("V", 0, 90);
    ctx.rotate(-Math.PI/6);
    ctx.fillText("X", 0, -90);
    ctx.fillText("IV", 0, 90);
    ctx.restore();

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height /2);
    ctx.rotate(Math.PI + (Math.PI * 2) / 60 * time.getSeconds() + (Math.PI * 2) / 60000 * time.getMilliseconds());
    ctx.fillRect(0, 0, 1, 100);
    ctx.restore();

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height /2);
    ctx.rotate(Math.PI + (Math.PI * 2) / 60 * time.getMinutes());
    ctx.fillRect(0, 0, 3, 100);
    ctx.restore();

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height /2);
    console.log(time.getHours())
    ctx.rotate(Math.PI + (Math.PI * 2) / 12 * time.getHours());
    ctx.fillRect(0, 0, 5, 100);

    ctx.beginPath();
    ctx.fillStyle = "rgb(255, 20, 147)";
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    

    window.requestAnimationFrame(draw.bind(this, ctx));
}

if (el.getContext) {
    var ctx = el.getContext("2d");

    draw(ctx);
}