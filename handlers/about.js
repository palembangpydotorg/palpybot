const { InlineKeyboard } = require('grammy');
const { sesi } = require('./start');

async function showAbout(ctx) {
  await ctx.answerCallbackQuery();
  const id = ctx.from.id;

  const backKeyboard = new InlineKeyboard()
    .text('Kembali ke Menu', 'kembali_menu');

  const message = await ctx.reply(
    '*Tentang PalembangPy*\n\n' +
    'PalembangPy adalah komunitas pengguna dan pengembang Python di Kota Palembang.\n' +
    'Kami berkumpul untuk belajar, berbagi proyek, dan bertumbuh bersama.\n\n' +
    '📍 Palembang, Sumatera Selatan\n' +
    '🎯 Pemrograman Python, berbagi pengetahuan, dan kolaborasi.',
    { reply_markup: backKeyboard, parse_mode: 'Markdown' }
  );

  sesi[id] = { messageList: [message.message_id] };
}

module.exports = { showAbout };
