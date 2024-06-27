import express from "express"
import { PrismaClient } from "@prisma/client"
import { Telegraf } from "telegraf"
import "dotenv/config"

const port = process.env.PORT || 5000
const app = express()
const prisma = new PrismaClient()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const weatherRadarBot = await prisma.bot.findFirst({
	where: { name: "weatherradarbot" }
})

bot.start(async ctx => {
	let chat = await bot.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	ctx.reply(
		`Hey ${chat.first_name} 👋\n\nWe are still working on building this bot and making it great! Please have some patience, we will send you a message once you can start using this bot! ✌️`
	)

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({ where: { chatId: chat.id } })

	if (user == null) {
		// Create a new user
		await prisma.user.create({
			data: {
				botId: weatherRadarBot.id,
				chatId: chat.id
			}
		})
	}
})

bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))

app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})
