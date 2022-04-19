const { createCanvas, loadImage } = require('canvas');
const express = require("express");
const config = require("./config.json");

const app = express();

function setTextSize(ctx, text, maxwidth) {
    let size = 50;
    ctx.font = `bold ${size}px Sans`;
    while (ctx.measureText(text).width > maxwidth) {
        size--;
        if (size < 8) break;
        ctx.font = `bold ${size}px Sans`;
    }
}

async function createExperienceCard(req, res) {
    const avatarURL = req.query.avatar_url;
    const xpAchieved = req.query.xp;
    const xpNeededToLevelUp = req.query.xp_needed;
    const level = req.query.level;
    const rank = req.query.rank;
    const username = req.query.username;
    const background = req.query.bg_colour;
    const barColour = req.query.bar_colour;

    const barWidth = 600;

    const canvas = createCanvas(1000, 300)
    const ctx = canvas.getContext('2d');
    const avatar = await loadImage(avatarURL);

    console.log("Making card for " + username);

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //XP Bar properties
    ctx.lineJoin = "round";
    ctx.lineWidth = 69;

    //Background Bar
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(340, 200, barWidth, 0);

    //Progress Bar
    ctx.strokeStyle = barColour
    ctx.strokeRect(340, 200, barWidth * xpAchieved / xpNeededToLevelUp, 0);

    //Username
    setTextSize(ctx, username, 650);
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.fillText(username, 310, 100, 750);

    //Rank and Level
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 35px Sans";
    ctx.textAlign = "left";
    ctx.fillText("Rank #" + rank + " | Level " + level, 310, 280);

    //XP and percentage
    ctx.fillStyle = "#737373";
    ctx.font = "bold 35px Sans";
    ctx.textAlign = "left";
    const experienceFraction = `${xpAchieved} / ${xpNeededToLevelUp} XP`;
    const experiencePercentage = `${((xpAchieved * 100) / xpNeededToLevelUp).toFixed(0)}%`;
    ctx.fillText(experienceFraction + " (" + experiencePercentage + ")", 310, 150);

    //Round the avatar corners
    ctx.beginPath();
    ctx.arc(150, 150, 144, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();

    //Avatar
    ctx.drawImage(avatar, 10, 10, 290, 290);

    //Avatar outline
    ctx.beginPath();
    ctx.arc(150, 150, 145, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    ctx.closePath();

    //Send Base64 back
    res.send(canvas.toDataURL());
    console.log("Made card for " + username);
}

app.get('/api', (req, res) => createExperienceCard(req, res));
app.listen(config.port);
console.log("Listening on port " + config.port);