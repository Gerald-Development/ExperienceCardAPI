const { createCanvas, loadImage } = require('canvas');
const express = require("express");
const config = require("./config.json");

const app = express();

function setTextSize(ctx, text, maxwidth) {
    let size = 50;
    ctx.font = `bold ${size}px Sans`;
    while (ctx.measureText(text).width > maxwidth && size > 8) {
        size--;
        ctx.font = `bold ${size}px Sans`;
    }
}

function roundedClipBox(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
}

async function createExperienceCard(req, res) {
    const avatarURL = req.query.avatar_url;
    const xpAchieved = req.query.xp;
    const xpNeededToLevelUp = req.query.xp_needed;
    const level = req.query.level;
    const rank = req.query.rank;
    const username = req.query.username;
    const background = req.query.bg_colour;
    const barFromColour = req.query.bar_colour_from;
    const barToColour = req.query.bar_colour_to;

    const barWidth = 650;
    const barX = 310;
    const barY = 185;
    const canvas = createCanvas(1000, 300)
    const ctx = canvas.getContext('2d');
    const avatar = await loadImage(avatarURL);

    console.log("Making card for " + username);

    //Round edges of card
    roundedClipBox(ctx, 0, 0, canvas.width, canvas.height, 20);

    //Fill in background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //XP Bar properties
    ctx.lineJoin = "round";
    ctx.lineWidth = 20;

    //Background Bar
    ctx.strokeStyle = "#242424";
    ctx.strokeRect(barX, barY, barWidth, 0);

    //Progress Bar
    const gradient = ctx.createLinearGradient(barX, barY, 315 + barWidth, 195);
    gradient.addColorStop(0, barFromColour);
    gradient.addColorStop(1, barToColour);

    ctx.strokeStyle = gradient;
    ctx.strokeRect(barX, barY, barWidth * xpAchieved / xpNeededToLevelUp, 0);

    //Username
    setTextSize(ctx, username, 680);
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.fillText(username, 295, 100, 680);

    //Rank and Level
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 35px Sans";
    ctx.textAlign = "left";
    ctx.fillText("Rank #" + rank + " • Level " + level, 295, 240);

    //XP and percentage
    ctx.fillStyle = "#737373";
    ctx.font = "bold 35px Sans";
    ctx.textAlign = "left";
    const experienceFraction = `${xpAchieved} / ${xpNeededToLevelUp} XP`;
    const experiencePercentage = `${((xpAchieved * 100) / xpNeededToLevelUp).toFixed(0)}%`;
    ctx.fillText(experienceFraction + " • " + experiencePercentage, 295, 155);

    //Round the avatar corners
    roundedClipBox(ctx, 38, 38, 224, 224, 20);

    //Add avatar
    ctx.drawImage(avatar, 38, 38, 224, 224);

    //Send Base64 back
    res.send(canvas.toDataURL('image/png', 1));
    console.log("Made card for " + username);
}

app.get('/api/xpcard', (req, res) => createExperienceCard(req, res));
app.listen(config.port);
console.log("Listening on port " + config.port);