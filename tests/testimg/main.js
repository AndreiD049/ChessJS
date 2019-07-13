var canvas = document.getElementById("canvas");

if (canvas.getContext) {
    let ctx = canvas.getContext("2d");
    let cat = new Image();
    cat.src = "catmeme.jpg";

    cat.addEventListener("load", function() {
        ctx.save();
        ctx.drawImage(cat, 200, 0, 230, 230, 40, 40, 230, 230);
        ctx.translate(40+230, 40+230);
        ctx.rotate(Math.PI / 180 * 180)
        ctx.drawImage(cat, 200, 0, 230, 230, -230, -230, 230, 230);
        ctx.restore();
    }, false);

    let grad = ctx.createLinearGradient(0, 500, 200, 700);
    grad.addColorStop(0, "red");
    grad.addColorStop(1, "blue");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 500, 200, 200);
}
