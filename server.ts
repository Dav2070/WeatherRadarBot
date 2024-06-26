import { Telegraf } from "telegraf"
import "dotenv/config"

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.start(ctx => ctx.reply("Welcome"))
bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))
