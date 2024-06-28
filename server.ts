import express from "express"
import { PrismaClient } from "@prisma/client"
import { Telegraf } from "telegraf"
import "dotenv/config"

const port = process.env.PORT || 5000
const app = express()
const prisma = new PrismaClient()

//#region WeatherRadarBot
const weatherRadarTelegraf = new Telegraf(process.env.WEATHER_RADAR_BOT_TOKEN)
const weatherRadarBot = await prisma.bot.findFirst({
	where: { name: "weatherradarbot" }
})

weatherRadarTelegraf.start(async ctx => {
	let chat = await weatherRadarTelegraf.telegram.getChat(ctx.chat.id)
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

weatherRadarTelegraf.launch()

process.once("SIGINT", () => weatherRadarTelegraf.stop("SIGINT"))
process.once("SIGTERM", () => weatherRadarTelegraf.stop("SIGTERM"))
//#endregion

//#region Express server
app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})
//#endregion
