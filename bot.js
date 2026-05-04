const TelegramBot = require('node-telegram-bot-api');

const token = '8749743852:AAFxZ3DgesEFRypeueYS_8nw2mGM-hl1MgI';
const adminGroupId = -1003749967867;

const orderSupport = 'https://wa.me/447453559403';
const paymentSupport = 'https://wa.me/16693068310';

const bot = new TelegramBot(token, { polling: true });

console.log("Bot started...");

let userState = {};
let userData = {};

// MAIN MENU
function mainMenu(chatId) {
    bot.sendMessage(chatId, "Select your issue:", {
        reply_markup: {
            keyboard: [
                ["Order Issue", "Payment Issue"],
                ["Other Contact", "End Chat"]
            ],
            resize_keyboard: true
        }
    });
}

// START (FIXED ORDER)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    userState[chatId] = null;
    userData[chatId] = {};

    bot.sendPhoto(chatId, "welcome.jpg", {
        caption:
`🚀 Welcome to SalezMedia Support

Powered by the Hype Machine.

Select your issue below and our team will handle it quickly.`
    });

    setTimeout(() => {
        mainMenu(chatId);
    }, 600);
});

// MESSAGE HANDLER
bot.on('message', (msg) => {
    if (msg.chat.type !== 'private') return;

    const chatId = msg.chat.id;
    const text = msg.text;
    const username = msg.from.username || "NoUsername";

    if (!text || text.startsWith('/')) return;

    console.log("User:", chatId, text);

    // END CHAT (FIXED)
    if (text === "End Chat") {
        userState[chatId] = null;
        userData[chatId] = {};
        return bot.sendMessage(chatId, "✅ Chat ended. Type /start to begin again.");
    }

    // BLOCK MID-FLOW SPAM
    if (userState[chatId] && ["Order Issue", "Payment Issue", "Other Contact"].includes(text)) {
        return bot.sendMessage(chatId, "⚠️ Complete current request or click End Chat.");
    }

    // MAIN OPTIONS
    if (text === "Order Issue") {
        userState[chatId] = "choose_type";

        return bot.sendMessage(chatId, "Select order issue:", {
            reply_markup: {
                keyboard: [
                    ["Refill", "Speed Up"],
                    ["Cancel", "End Chat"]
                ],
                resize_keyboard: true
            }
        });
    }

    if (text === "Payment Issue") {
        userState[chatId] = null;

        return bot.sendMessage(chatId,
`💳 Payment Support:
${paymentSupport}`);
    }

    if (text === "Other Contact") {
        userState[chatId] = null;

        return bot.sendMessage(chatId,
`📞 Contact Support:
${orderSupport}`);
    }

    // SUB OPTIONS
    if (["Refill", "Speed Up", "Cancel"].includes(text)) {
        userState[chatId] = "waiting_order";
        userData[chatId].type = text;

        return bot.sendMessage(chatId, `Enter Order ID for ${text}:`);
    }

    // ORDER ID → FINAL STEP
    if (userState[chatId] === "waiting_order") {
        const orderId = text;
        const type = userData[chatId].type;

        bot.sendMessage(adminGroupId,
`📩 New Ticket

User: @${username}
UserID: ${chatId}
Type: ${type}
Order ID: ${orderId}`);

        userState[chatId] = null;
        userData[chatId] = {};

        return bot.sendMessage(chatId, "✅ Request submitted. Our team will respond soon.");
    }

    // DEFAULT
    mainMenu(chatId);
});

// ADMIN REPLY
bot.onText(/\/reply (.+)/, (msg, match) => {
    const parts = match[1].split(' ');
    const userId = parts[0];
    const replyMessage = parts.slice(1).join(' ');

    bot.sendMessage(userId, `💬 Support:\n${replyMessage}`);
});