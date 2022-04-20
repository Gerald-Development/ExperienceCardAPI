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
    return ctx.measureText(text).width;
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
    const discriminator = req.query.discriminator;
    const background = req.query.bg_colour;
    const barFromColour = req.query.bar_colour_from;
    const barToColour = req.query.bar_colour_to;

    const barWidth = 650;
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
    ctx.lineWidth = 15;

    //Background Bar
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(315, 195, barWidth, 0);

    //Progress Bar
    const gradient = ctx.createLinearGradient(315, 195, barWidth * xpAchieved / xpNeededToLevelUp, 0);
    gradient.addColorStop(0, barFromColour);
    gradient.addColorStop(1, barToColour);

    ctx.strokeStyle = gradient;
    ctx.strokeRect(315, 195, barWidth * xpAchieved / xpNeededToLevelUp, 0);

    //Username
    const usernameWidth = setTextSize(ctx, username, 570);
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.fillText(username, 310, 100, 570);

    ctx.fillStyle = "#737373";
    ctx.font = "bold 35px Sans";
    ctx.fillText(discriminator, 310 + usernameWidth, 100);

    //Rank and Level
    ctx.fillStyle = "#737373";
    ctx.font = "bold 35px Sans";
    ctx.textAlign = "left";
    ctx.fillText("Rank #" + rank + " | Level " + level, 310, 260);

    //XP and percentage
    ctx.fillStyle = "#737373";
    ctx.font = "bold 35px Sans";
    ctx.textAlign = "left";
    const experienceFraction = `${xpAchieved} / ${xpNeededToLevelUp} XP`;
    const experiencePercentage = `${((xpAchieved * 100) / xpNeededToLevelUp).toFixed(0)}%`;
    ctx.fillText(experienceFraction + " • " + experiencePercentage, 310, 155);

    //Round the avatar corners
    roundedClipBox(ctx, 38, 38, 224, 224, 20);

    //Add avatar
    ctx.drawImage(avatar, 38, 38, 224, 224);

    //Send Base64 back
    res.send(canvas.toDataURL('image/png'));
    console.log("Made card for " + username);
}

app.get('/api/xpcard', (req, res) => createExperienceCard(req, res));
app.listen(config.port);
console.log("Listening on port " + config.port);