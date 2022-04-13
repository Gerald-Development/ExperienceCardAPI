const { createCanvas, loadImage } = require('canvas');
const express = require("express");
const config = require("./config.json");

const app = express();

function setTextSize(ctx, text, maxwidth) {
    let size = 40;
    ctx.font = `bold ${size}px Sans`;
    while (ctx.measureText(text).width > maxwidth) {
        size--;
        if (size < 8) break;
        ctx.font = `bold ${size}px Sans`;
        console.log(ctx.measureText(text).width);
        console.log(size);
    }
}

async function createExperienceCard(req, res) {
    const avatarURL = req.query.avatarURL;
    const xpAchieved = req.query.xp;
    const xpNeededToLevelUp = req.query.xp_needed;
    const level = req.query.level;
    const rank = req.query.rank;
    const username = req.query.username;

    const bar_width = 600;
    const bar_colour = config.bar_colour

    const canvas = createCanvas(1000, 300)
    const ctx = canvas.getContext('2d');
    const avatar = await loadImage(avatarURL);
    const background = config.bg_colour;

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // XP Bar
    ctx.lineJoin = "round";
    ctx.lineWidth = 69;

    // Empty Bar
    ctx.strokeStyle = "black";
    ctx.strokeRect(340, 200, bar_width, 0);

    // Filled Bar
    ctx.strokeStyle = bar_colour
    ctx.strokeRect(340, 200, bar_width * xpAchieved / xpNeededToLevelUp, 0);

    // Adding Username
    setTextSize(ctx, username, 650);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(username, 310, 100, 750);

    // Adding titles
    ctx.fillStyle = "#737373";
    ctx.font = "bold 20px Sans";
    ctx.textAlign = "right";
    ctx.fillText("Rank #" + rank + "\nLevel " + level, 950, 125);

    // Adding bar title
    ctx.fillStyle = "#737373";
    ctx.font = "bold 15px Sans";
    ctx.textAlign = "left";
    const experienceFraction = `${xpAchieved} / ${xpNeededToLevelUp} XP`;
    const experiencePercentage = `${((xpAchieved * 100) / xpNeededToLevelUp).toFixed(0)}%`;
    ctx.fillText(experienceFraction + " (" + experiencePercentage + ")", 310, 150);

    // Remove the corners
    ctx.beginPath();
    ctx.arc(150, 150, 144, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();

    // Add the avatar
    ctx.drawImage(avatar, 10, 10, 290, 290);

    // Middle circle for Avatar Background
    ctx.beginPath();
    ctx.arc(150, 150, 145, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();

    res.send(canvas.toDataURL());
}

app.get('/api', (req, res) => createExperienceCard(req, res));
app.listen(config.port);
console.log("Listening on port " + config.port);