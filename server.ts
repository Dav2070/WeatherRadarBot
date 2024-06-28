import express from "express"
import { PrismaClient } from "@prisma/client"
import { Telegraf } from "telegraf"
import "dotenv/config"

const port = process.env.PORT || 5000
const app = express()
const prisma = new PrismaClient()
const startMessage = `Hey {0} 👋\n\nWe are still working on building this bot and making it great! Please have some patience, we will send you a message once you can start using this bot! ✌️`

//#region WeatherRadarBot
const weatherRadarTelegraf = new Telegraf(process.env.WEATHER_RADAR_BOT_TOKEN)
const weatherRadarBot = await prisma.bot.findFirst({
	where: { name: "weatherradarbot" }
})

weatherRadarTelegraf.start(async ctx => {
	let chat = await weatherRadarTelegraf.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	ctx.reply(startMessage.replace("{0}", chat.first_name))

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: weatherRadarBot.id,
			chatId: chat.id
		}
	})

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

//#region AmazonSearchBot
const amazonSearchTelegraf = new Telegraf(
	process.env.AMAZON_QUICK_SEARCH_BOT_TOKEN
)
const amazonSearchBot = await prisma.bot.findFirst({
	where: { name: "amazonquicksearchbot" }
})

amazonSearchTelegraf.start(async ctx => {
	let chat = await amazonSearchTelegraf.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	ctx.reply(startMessage.replace("{0}", chat.first_name))

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: amazonSearchBot.id,
			chatId: chat.id
		}
	})

	if (user == null) {
		// Create a new user
		await prisma.user.create({
			data: {
				botId: amazonSearchBot.id,
				chatId: chat.id
			}
		})
	}
})

amazonSearchTelegraf.launch()

process.once("SIGINT", () => amazonSearchTelegraf.stop("SIGINT"))
process.once("SIGTERM", () => amazonSearchTelegraf.stop("SIGTERM"))
//#endregion

//#region WriteForMeBot
const writeForMeTelegraf = new Telegraf(
	process.env.WRITE_FOR_ME_BOT_TOKEN
)
const writeForMeBot = await prisma.bot.findFirst({
	where: { name: "writeforme_writer_bot" }
})

writeForMeTelegraf.start(async ctx => {
	let chat = await writeForMeTelegraf.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	ctx.reply(startMessage.replace("{0}", chat.first_name))

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: writeForMeBot.id,
			chatId: chat.id
		}
	})

	if (user == null) {
		// Create a new user
		await prisma.user.create({
			data: {
				botId: writeForMeBot.id,
				chatId: chat.id
			}
		})
	}
})

writeForMeTelegraf.launch()

process.once("SIGINT", () => writeForMeTelegraf.stop("SIGINT"))
process.once("SIGTERM", () => writeForMeTelegraf.stop("SIGTERM"))
//#endregion

//#region Express server
app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})
//#endregion
