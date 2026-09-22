const { createCanvas, registerFont } = require('canvas');
const { InputFile } = require('grammy');

registerFont('./assets/fonts/Inter-SemiBold.ttf', { family: 'Inter' });

function calculateLevel(xp) {
  const perLevel = 100;
  return Math.floor(Math.sqrt(xp / perLevel));
}

function getXpRangeForLevel(level) {
  const perLevel = 100;
  const currentStart = level * level * perLevel;
  const nextStart = (level + 1) * (level + 1) * perLevel;
  return { currentStart, nextStart };
}

async function generateRankCard(username, xp, memberCode) {
  const level = calculateLevel(xp);
  const { currentStart, nextStart } = getXpRangeForLevel(level);
  const progress = xp - currentStart;
  const required = nextStart - currentStart;
  const progressPercent = Math.min(progress / required, 1);

  const width = 600;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#16213e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.fillText(username, 40, 90);

  ctx.fillStyle = '#a0a0a0';
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText(memberCode, 40, 125);

  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 48px Inter, sans-serif';
  ctx.fillText(`Lv. ${level}`, width - 150, 100);

  const barX = 40;
  const barY = 170;
  const barWidth = 520;
  const barHeight = 24;

  ctx.fillStyle = '#2a2a4a';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 12);
  ctx.fill();

  ctx.fillStyle = '#00d9ff';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth * progressPercent, barHeight, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${xp} / ${nextStart} XP`, width / 2, barY + 17);

  return canvas.toBuffer();
}

async function sendRankCard(ctx, username, xp, memberCode) {
  const imageBuffer = await generateRankCard(username, xp, memberCode);
  await ctx.replyWithPhoto(new InputFile(imageBuffer, { filename: 'rank.png' }));
}

module.exports = {
  calculateLevel,
  getXpRangeForLevel,
  generateRankCard,
  sendRankCard
};
