require('dotenv').config();
const { Bot } = require('grammy');
const { showMainMenu, clearHistory, sesi } = require('./handlers/start');
const { showAbout } = require('./handlers/about');
const { processRegistration } = require('./handlers/auth');
const { showPlayground, processPythonCode } = require('./handlers/playground');
const { handleMemberJoin, handleMemberLeave, trackActivity, scanAndSaveTopic } = require('./handlers/group');
const { login } = require('./services/api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL;

const bot = new Bot(BOT_TOKEN);

bot.use(trackActivity);

bot.command('start', async (ctx) => {
  await showMainMenu(ctx, ctx.from.id);
});

bot.command('jumlah', async (ctx) => {
  try {
    const total = await ctx.api.getChatMemberCount(ctx.chat.id);
    await ctx.reply(`Jumlah anggota: *${total}* orang`, {
      parse_mode: 'Markdown'
    });
  } catch (e) {
    await ctx.reply('Gagal mengambil data anggota');
    console.log('Error:', e.message);
  }
});

bot.on(':new_chat_members', handleMemberJoin);
bot.on(':left_chat_member', handleMemberLeave);

bot.on([
  ':new_chat_members',
  ':left_chat_member',
  ':new_chat_title',
  ':new_chat_photo',
  ':delete_chat_photo',
  ':pinned_message',
  ':group_chat_created'
], async (ctx) => {
  try {
    await ctx.api.deleteMessage(ctx.chat.id, ctx.msg.message_id);
    console.log('Pesan sistem dihapus:', ctx.chat.title);
  } catch (e) {
    console.log('Gagal hapus pesan sistem:', e.message);
  }
});

bot.callbackQuery('buat_akun', async (ctx) => {
  await ctx.answerCallbackQuery();
  const id = ctx.from.id;
  sesi[id] = {
    messageList: [...(sesi[id]?.messageList || [])],
    step: 'ask_name'
  };
  const message = await ctx.reply('Silakan masukkan Nama Lengkap Anda:');
  sesi[id].messageList.push(message.message_id);
});

bot.callbackQuery('tentang', showAbout);
bot.callbackQuery('playground', showPlayground);

bot.callbackQuery('kembali_menu', async (ctx) => {
  await ctx.answerCallbackQuery();
  const id = ctx.from.id;
  await clearHistory(ctx, sesi[id]?.messageList || []);
  await showMainMenu(ctx, id);
});

const topicMap = new Map();

bot.on('message', async (ctx) => {
  const threadId = ctx.message?.message_thread_id;
  let topicName = 'Utama / Tanpa Topik';

  if (threadId) {
    if (topicMap.has(threadId)) {
      topicName = topicMap.get(threadId);
    } else if (ctx.message?.reply_to_message?.forum_topic_created?.name) {
      topicName = ctx.message.reply_to_message.forum_topic_created.name;
      topicMap.set(threadId, topicName);
    } else {
      topicName = `Topik #${threadId}`;
    }
  }

  scanAndSaveTopic(ctx);

  console.log('========================================');
  console.log('PESAN MASUK');
  console.log('  Chat ID      :', ctx.chat.id);
  console.log('  Tipe Chat    :', ctx.chat.type);
  console.log('  Nama Grup    :', ctx.chat.title || '-');
  console.log('  Thread ID    :', threadId || '-');
  console.log('  Nama Topik   :', topicName);
  console.log('  Pengguna ID  :', ctx.from.id);
  console.log('  Nama Pengguna:', ctx.from.first_name, ctx.from.last_name || '');
  console.log('  Username     :', '@' + (ctx.from.username || '-'));
  console.log('  Isi Pesan    :', ctx.message.text || '[bukan teks / kosong]');
  console.log('  Ada Sesi?    :', sesi[ctx.from.id] ? 'Ya — ' + sesi[ctx.from.id].step : 'Tidak');
  console.log('========================================');

  const id = ctx.from.id;
  const userSession = sesi[id];
  const text = ctx.message.text;

  if (ctx.chat.type !== 'private') {
    console.log('Abaikan — bukan chat pribadi');
    return;
  }

  if (userSession) {
    if (userSession.step === 'ask_name') {
      console.log('Proses: Daftar Akun');
      await processRegistration(ctx, id, userSession);
      return;
    }
    if (userSession.step === 'wait_python_code') {
      console.log('Proses: Playground Python');
      await processPythonCode(ctx, id, userSession);
      return;
    }
  }

  console.log('Pesan tidak diproses lebih lanjut');
});

bot.catch = (err) => {
  console.error('Error:', err.message);
};

async function main() {
  if (!API_URL) {
    console.error('ERROR: API_URL belum diatur di .env');
    process.exit(1);
  }

  const loginResult = await login(
    process.env.API_USERNAME,
    process.env.API_PASSWORD
  );
  if (!loginResult) {
    console.warn('Gagal login ke API');
  }

  console.log('Bot berjalan...');
  await bot.start();
}

main().catch(err => console.error('Error:', err));
