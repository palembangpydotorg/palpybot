require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { checkRegistered, addPoints } = require('../services/api');

const GROUP_ID = process.env.GROUP_CHAT_ID;

const TOPICS_FILE = path.join(__dirname, '..', 'threads.json');
let topicList = {};

try {
  topicList = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
} catch {
  topicList = {};
  saveTopicList();
}

function saveTopicList() {
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topicList, null, 2));
}

const ALLOWED_TOPIC_NAMES = ['Compiler', 'Playground', 'Playground Python'];

function isTopicAllowed(threadId) {
  const id = String(threadId);
  const topic = topicList[id];
  return topic && ALLOWED_TOPIC_NAMES.includes(topic.name);
}

function scanAndSaveTopic(ctx) {
  const threadId = ctx.message?.message_thread_id;
  if (!threadId) return null;

  const id = String(threadId);
  if (topicList[id]) return topicList[id];

  const topicName = ctx.message?.reply_to_message?.forum_topic_created?.name;
  if (!topicName) return null;

  topicList[id] = {
    name: topicName,
    chatId: String(ctx.chat.id),
    lastSeen: new Date().toISOString()
  };
  saveTopicList();
  console.log('Topik tersimpan:', topicName, threadId);

  return topicList[id];
}

async function handleMemberJoin(ctx) {
  const newMembers = ctx.message.new_chat_members;

  for (const user of newMembers) {
    if (user.is_bot) continue;

    const userId = String(user.id);
    const name = user.first_name || 'Teman';

    const memberData = await checkRegistered(userId);

    if (!memberData) {
      await ctx.reply(
        `Halo ${name}!\n\n` +
        `Maaf, untuk bergabung di grup PalembangPy silakan daftar dulu.\n` +
        `Kirim pesan ke saya secara pribadi /start untuk mendaftar.\n\n` +
        `Setelah berhasil daftar, saya akan undang kamu masuk ke grup.`
      );
      await ctx.api.banChatMember(ctx.chat.id, userId);
      await ctx.api.unbanChatMember(ctx.chat.id, userId);
      continue;
    }

    await ctx.reply(
      `Selamat datang, ${name}!\n\n` +
      `Senang kamu bergabung di grup PalembangPy.\n` +
      `Kode Member: \`${memberData.member_code || '-'}\`\n` +
      `Semoga aktif berbagi & belajar bersama ya!`,
      { parse_mode: 'Markdown' }
    );

    await addPoints(userId, 5);
  }
}

async function handleMemberLeave(ctx) {
  const user = ctx.message.left_chat_member;
  if (user.is_bot) return;

  const name = user.first_name || 'Teman';
  await ctx.reply(
    `Sampai jumpa, ${name}...\n` +
    `Terima kasih sudah pernah bergabung di PalembangPy.\n` +
    `Kapan-kapan kembali lagi ya!`
  );
}

async function trackActivity(ctx, next) {
  scanAndSaveTopic(ctx);

  if (String(ctx.chat.id) !== GROUP_ID) return await next();

  const userId = String(ctx.from.id);
  if (ctx.from.is_bot) return await next();

  const memberData = await checkRegistered(userId);
  if (memberData) {
    await addPoints(userId, 1);
  }

  await next();
}

async function inviteToGroup(ctx, userId) {
  try {
    await ctx.api.unbanChatMember(GROUP_ID, userId);
    await ctx.api.exportChatInviteLink(GROUP_ID).then(async (link) => {
      await ctx.reply(
        `Akun sudah terdaftar!\n\n` +
        `Silakan masuk ke grup lewat tautan ini:\n${link.invite_link}\n\n` +
        `Selamat bergabung!`
      );
    });
    return true;
  } catch (e) {
    console.log('Gagal undang:', e.message);
    await ctx.reply('Sudah terdaftar! Silakan masuk ke grup sekarang.');
    return false;
  }
}

module.exports = {
  handleMemberJoin,
  handleMemberLeave,
  trackActivity,
  inviteToGroup,
  isTopicAllowed,
  scanAndSaveTopic,
  topicList
};
