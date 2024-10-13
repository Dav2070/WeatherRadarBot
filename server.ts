import express from "express"
import { PrismaClient } from "@prisma/client"
import { Telegraf } from "telegraf"
import "dotenv/config"
import { rialTunnelTelegraf } from "./src/rialTunnelBot.js"

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
const writeForMeTelegraf = new Telegraf(process.env.WRITE_FOR_ME_BOT_TOKEN)
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

//#region CanvaBot
const canvaTelegraf = new Telegraf(process.env.CANVA_BOT_TOKEN)
const canvaBot = await prisma.bot.findFirst({
	where: { name: "canva_design_bot" }
})

canvaTelegraf.start(async ctx => {
	let chat = await canvaTelegraf.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	ctx.reply(startMessage.replace("{0}", chat.first_name))

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: canvaBot.id,
			chatId: chat.id
		}
	})

	if (user == null) {
		// Create a new user
		await prisma.user.create({
			data: {
				botId: canvaBot.id,
				chatId: chat.id
			}
		})
	}
})

canvaTelegraf.launch()

process.once("SIGINT", () => canvaTelegraf.stop("SIGINT"))
process.once("SIGTERM", () => canvaTelegraf.stop("SIGTERM"))
//#endregion

//#region InstagramStoryBot
const instagramStoryTelegraf = new Telegraf(
	process.env.INSTAGRAM_STORY_BOT_TOKEN
)
const instagramStoryBot = await prisma.bot.findFirst({
	where: { name: "instagram_story_crosspost_bot" }
})

instagramStoryTelegraf.start(async ctx => {
	let chat = await instagramStoryTelegraf.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	ctx.reply(startMessage.replace("{0}", chat.first_name))

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: instagramStoryBot.id,
			chatId: chat.id
		}
	})

	if (user == null) {
		// Create a new user
		await prisma.user.create({
			data: {
				botId: instagramStoryBot.id,
				chatId: chat.id
			}
		})
	}
})

instagramStoryTelegraf.launch()

process.once("SIGINT", () => instagramStoryTelegraf.stop("SIGINT"))
process.once("SIGTERM", () => instagramStoryTelegraf.stop("SIGTERM"))
//#endregion

//#region FlirtBot
const flirtTelegraf = new Telegraf(process.env.FLIRT_BOT_TOKEN)
const flirtBot = await prisma.bot.findFirst({
	where: { name: "flirter_chat_bot" }
})

flirtTelegraf.start(async ctx => {
	let chat = await flirtTelegraf.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	ctx.reply(startMessage.replace("{0}", chat.first_name))

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: flirtBot.id,
			chatId: chat.id
		}
	})

	if (user == null) {
		// Create a new user
		await prisma.user.create({
			data: {
				botId: flirtBot.id,
				chatId: chat.id
			}
		})
	}
})

flirtTelegraf.launch()

process.once("SIGINT", () => flirtTelegraf.stop("SIGINT"))
process.once("SIGTERM", () => flirtTelegraf.stop("SIGTERM"))
//#endregion

//#region RialTunnel
rialTunnelTelegraf.launch()

process.once("SIGINT", () => rialTunnelTelegraf.stop("SIGINT"))
process.once("SIGTERM", () => rialTunnelTelegraf.stop("SIGTERM"))
//#endregion

//#region Express server
app.get("/", (req, res) => {
	res.send("Hello World!")
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})
//#endregion
