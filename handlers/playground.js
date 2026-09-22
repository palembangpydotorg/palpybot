const { InlineKeyboard } = require('grammy');
const { sesi } = require('./start');

let pyodide = null;
let loading = null;

async function loadPyodideInstance() {
  if (pyodide) return pyodide;
  if (loading) return loading;
  
  loading = (async () => {
    const { loadPyodide } = await import('pyodide');
    pyodide = await loadPyodide();
    console.log('Pyodide Ready');
    loading = null;
    return pyodide;
  })();
  
  return loading;
}

loadPyodideInstance();

async function executeCode(rawCode) {
  let code = rawCode.trim();
  
  const match = code.match(/```(?:python)?\n?([\s\S]*?)\n?```/);
  if (match) code = match[1].trim();

  if (!code) return { success: false, result: 'Kode tidak ditemukan' };

  const pd = await loadPyodideInstance();

  try {
    const fullCode = `
import sys
from io import StringIO
_out = StringIO()
sys.stdout = _out
sys.stderr = _out

${code}

sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_out.getvalue()
    `.trim();

    const result = await pd.runPythonAsync(fullCode);
    const output = (result || '').trim();
    
    return { 
      success: true, 
      result: output || '(selesai, tidak ada output)' 
    };
  } catch (err) {
    return { success: false, result: `Error:\n${err.message}` };
  }
}

async function showPlayground(ctx) {
  try {
    await ctx.answerCallbackQuery();
  } catch {
    return;
  }
  
  const id = ctx.from.id;

  const backKeyboard = new InlineKeyboard()
    .text('Kembali ke Menu', 'kembali_menu');

  const message = await ctx.reply(
    '*Playground Python*\n\n' +
    'Ketik kode Python di bawah ini:\n' +
    'Contoh: `print("Halo PalembangPy!")`',
    { parse_mode: 'Markdown' }
  );

  sesi[id] = {
    messageList: [message.message_id],
    step: 'wait_python_code'
  };
}

async function processPythonCode(ctx, id, userSession) {
  const rawCode = ctx.message.text;
  userSession.messageList.push(ctx.message.message_id);

  const output = await executeCode(rawCode);

  const keyboard = new InlineKeyboard()
    .text('Coba Lagi', 'playground')
    .text('Kembali ke Menu', 'kembali_menu');

  const text =
    '*Hasil*\n' +
    '```python\n' + output.result + '\n```';

  await ctx.reply(text, {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });

  delete sesi[id];
}

module.exports = {
  showPlayground,
  processPythonCode
};
