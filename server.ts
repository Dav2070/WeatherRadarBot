import express from "express"
import { PrismaClient, User, RialTunnelBotPartner } from "@prisma/client"
import { Telegraf, Markup, Context } from "telegraf"
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
const rialTunnelTelegraf = new Telegraf(process.env.RIAL_TUNNEL_BOT_TOKEN)
const rialTunnelBot = await prisma.bot.findFirst({
	where: { name: "rial_tunnel_bot" }
})

type UserContext =
	| "rialToEuroSelected"
	| "euroToRialSelected"
	| "amountSelected10"
	| "amountSelected50"
	| "amountSelected100"
	| "amountSelected200"
	| "selectAmount"
	| "inputIranianBankAccountDetails"
	| "inputEuropeanBankAccountDetails"
	| "inputPartnerCode"

interface UserState {
	context: UserContext
	user: User
	partner: RialTunnelBotPartner
	inputs: {
		amount: number
	}
}

let userStates: { [chatId: number]: UserState } = {}

async function rialTunnelBotAction(ctx: Context<any>) {
	let userState = userStates[ctx.chat.id]

	switch (userState.context) {
		case "rialToEuroSelected":
			userState.context = "inputPartnerCode"

			ctx.reply(
				"To send rial to an european bank account, you need a partner who wants to send euro to Iran.\n\nYour partner will receive a code. Please enter the code, so we can connect you with your partner."
			)
			break
		case "euroToRialSelected":
			userState.context = "selectAmount"

			ctx.reply(
				"How much do you want to transfer? Select a value or send one in the chat.",
				Markup.inlineKeyboard([
					Markup.button.callback("10 €", "10"),
					Markup.button.callback("50 €", "50"),
					Markup.button.callback("100 €", "100"),
					Markup.button.callback("200 €", "200")
				])
			)
			break
		case "amountSelected10":
			setAmount(ctx, userState, 10)
			break
		case "amountSelected50":
			setAmount(ctx, userState, 50)
			break
		case "amountSelected100":
			setAmount(ctx, userState, 100)
			break
		case "amountSelected200":
			setAmount(ctx, userState, 200)
			break
		case "selectAmount":
			let amount = Number(ctx.message.text.replaceAll("€", "").trim())

			if (amount <= 0 || isNaN(amount)) {
				ctx.reply("The value is invalid.")
			} else {
				setAmount(ctx, userState, amount)
			}
			break
		case "inputIranianBankAccountDetails":
			let iranianBankAccountData = ctx.message.text
			if (ctx.message.text.length < 5) return

			// Create partner in database
			let uuid = crypto.randomUUID()

			userState.partner = await prisma.rialTunnelBotPartner.create({
				data: {
					uuid,
					userEuroId: userState.user.id,
					amount: userState.inputs.amount,
					userEuroBankAccountData: iranianBankAccountData
				}
			})

			ctx.replyWithMarkdownV2(
				`Alright\\! Please send the following code to your partner:\n\`${uuid}\`\n\nWe will send you the next instructions when your partner has connected using your code\\.`
			)
			break
		case "inputEuropeanBankAccountDetails":
			let europeanBankAccountData = ctx.message.text
			if (ctx.message.text.length < 5) return

			// Update partner in the database
			await prisma.rialTunnelBotPartner.update({
				where: { id: userState.partner.id },
				data: {
					userRialBankAccountData: europeanBankAccountData
				}
			})

			ctx.reply(
				"Thank you! You will receive a message when the money was sent to your bank account."
			)
			break
		case "inputPartnerCode":
			let partner = await prisma.rialTunnelBotPartner.findFirst({
				where: {
					uuid: ctx.message.text,
					userRialId: null
				}
			})

			if (partner == null) {
				ctx.reply(
					"No partner with this code found. Please enter a different code or start again using /start"
				)
			} else {
				// Update partner in database with the user id
				userState.partner = await prisma.rialTunnelBotPartner.update({
					where: { id: partner.id },
					data: { userRialId: userState.user.id }
				})

				userState.context = "inputEuropeanBankAccountDetails"

				ctx.reply(
					"We successfully connected you with your partner!\n\nNow please enter the bank account details, where you want to send the money."
				)
			}
			break
	}
}

function setAmount(ctx: Context<any>, userState: UserState, amount: number) {
	userState.inputs.amount = amount
	userState.context = "inputIranianBankAccountDetails"

	ctx.reply(
		"Now, please enter the bank account details of your bank account in Iran, where you want to send the money to."
	)
}

rialTunnelTelegraf.start(async ctx => {
	let chat = await rialTunnelTelegraf.telegram.getChat(ctx.chat.id)
	if (chat.type != "private") return

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: rialTunnelBot.id,
			chatId: chat.id
		}
	})

	if (user == null) {
		// Create a new user
		user = await prisma.user.create({
			data: {
				botId: rialTunnelBot.id,
				chatId: chat.id
			}
		})
	}

	// Initialize user state
	userStates[ctx.chat.id] = {
		context: null,
		user,
		partner: null,
		inputs: {
			amount: 0
		}
	}

	ctx.reply(
		`Hi ${chat.first_name} 👋\n\nWelcome to the Rial Tunnel Bot! This bot let's you\n- Send Rial from Iran to an european bank account\n- Send Euro to an iranian bank account\n\nWhat do you want to do?`,
		Markup.inlineKeyboard([
			Markup.button.callback("Send Rial to the EU", "rialToEuro"),
			Markup.button.callback("Send Euro to Iran", "euroToRial")
		])
	)

	rialTunnelTelegraf.action("rialToEuro", ctx => {
		userStates[ctx.chat.id].context = "rialToEuroSelected"
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("euroToRial", ctx => {
		userStates[ctx.chat.id].context = "euroToRialSelected"
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("10", ctx => {
		userStates[ctx.chat.id].context = "amountSelected10"
		rialTunnelBotAction(ctx)
	})
	rialTunnelTelegraf.action("50", ctx => {
		userStates[ctx.chat.id].context = "amountSelected50"
		rialTunnelBotAction(ctx)
	})
	rialTunnelTelegraf.action("100", ctx => {
		userStates[ctx.chat.id].context = "amountSelected100"
		rialTunnelBotAction(ctx)
	})
	rialTunnelTelegraf.action("200", ctx => {
		userStates[ctx.chat.id].context = "amountSelected200"
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.on("text", async ctx => rialTunnelBotAction(ctx))
})

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
