import {
	PrismaClient,
	User,
	RialTunnelBotPartner,
	RialTunnelBotUser
} from "@prisma/client"
import { Telegraf, Markup, Context } from "telegraf"

const prisma = new PrismaClient()

export const rialTunnelTelegraf = new Telegraf(
	process.env.RIAL_TUNNEL_BOT_TOKEN ?? ""
)
const rialTunnelBot = await prisma.bot.findFirst({
	where: { name: "rial_tunnel_bot" }
})

type UserContext =
	| null
	| "rialToEuroSelected"
	| "euroToRialSelected"
	| "inputAmount"
	| "inputIranianBankAccountDetails"
	| "inputEuropeanBankAccountDetails"
	| "inputPartnerCode"
	| "inputAdminPassword"
	| "waitForPartnerToConnect"
	| "adminStart"
	| "adminMoneyReceived"
	| "adminMoneyReceivedInputPartnerCode"
	| "adminMoneyReceivedInputAmount"

interface UserState {
	user: User
	rialTunnelBotUser: RialTunnelBotUser
	partner: RialTunnelBotPartner
	isAdmin: boolean
	inputs: {
		amount: number
		adminSelectedPartner: RialTunnelBotPartner
	}
}

let userStates: { [chatId: number]: UserState } = {}

if (rialTunnelBot != null) {
	rialTunnelTelegraf.start(async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		ctx.reply(
			`Hi ${ctx.chat.first_name} 👋\n\nWelcome to the Rial Tunnel Bot! This bot let's you\n- Send Rial from Iran to an european bank account\n- Send Euro to an iranian bank account\n\nWhat do you want to do?`,
			Markup.inlineKeyboard([
				Markup.button.callback("Send Rial to the EU", "rialToEuro"),
				Markup.button.callback("Send Euro to Iran", "euroToRial")
			])
		)
	})

	rialTunnelTelegraf.command("admin", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"inputAdminPassword"
		)
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.command("adminMoneyReceived", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"adminMoneyReceived"
		)
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("rialToEuro", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"rialToEuroSelected"
		)
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("euroToRial", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"euroToRialSelected"
		)
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("10", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(userStates[ctx.chat.id].rialTunnelBotUser, "inputAmount")
		userStates[ctx.chat.id].inputs.amount = 10
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("50", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(userStates[ctx.chat.id].rialTunnelBotUser, "inputAmount")
		userStates[ctx.chat.id].inputs.amount = 50
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("100", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(userStates[ctx.chat.id].rialTunnelBotUser, "inputAmount")
		userStates[ctx.chat.id].inputs.amount = 100
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.action("200", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(userStates[ctx.chat.id].rialTunnelBotUser, "inputAmount")
		userStates[ctx.chat.id].inputs.amount = 200
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.on("text", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		rialTunnelBotAction(ctx)
	})
}

async function init(ctx: Context<any>) {
	if (ctx.chat.type != "private" || userStates[ctx.chat.id] != null) return

	// Check if the user is already in the database
	let user = await prisma.user.findFirst({
		where: {
			botId: rialTunnelBot.id,
			chatId: ctx.chat.id
		}
	})

	if (user == null) {
		// Create a new user
		user = await prisma.user.create({
			data: {
				botId: rialTunnelBot.id,
				chatId: ctx.chat.id
			}
		})
	}

	// Find the rial tunnel bot user
	let rialTunnelBotUser = await prisma.rialTunnelBotUser.findFirst({
		where: {
			userId: user.id
		}
	})

	if (rialTunnelBotUser == null) {
		// Create a new rial tunnel bot user
		rialTunnelBotUser = await prisma.rialTunnelBotUser.create({
			data: {
				userId: user.id
			}
		})
	}

	// Initialize the user state
	userStates[ctx.chat.id] = {
		user,
		rialTunnelBotUser,
		partner: null,
		isAdmin: false,
		inputs: {
			amount: null,
			adminSelectedPartner: null
		}
	}
}

async function rialTunnelBotAction(ctx: Context<any>) {
	let userState = userStates[ctx.chat.id]

	switch (userState.rialTunnelBotUser.context) {
		case "rialToEuroSelected":
			ctx.reply(
				"To send rial to an european bank account, you need a partner who wants to send the same amount of money from the EU to Iran.\n\nYour partner will receive a code. Please enter the code, so we can connect you with your partner."
			)

			await setContext(userState.rialTunnelBotUser, "inputPartnerCode")
			break
		case "euroToRialSelected":
			ctx.reply(
				"How much do you want to transfer? Select a value or send one in the chat.",
				Markup.inlineKeyboard([
					Markup.button.callback("10 €", "10"),
					Markup.button.callback("50 €", "50"),
					Markup.button.callback("100 €", "100"),
					Markup.button.callback("200 €", "200")
				])
			)

			userState.inputs.amount = null
			await setContext(userState.rialTunnelBotUser, "inputAmount")
			break
		case "inputAmount":
			let amount = userState.inputs.amount

			if (amount == null) {
				amount = Number(
					(ctx.message.text as string).replace("€", "").trim()
				)

				if (isNaN(amount) || amount <= 0) {
					ctx.reply("Amount invalid")
					break
				}
			}

			// Create a new partner object if necessary
			if (userState.partner == null) {
				let uuid = crypto.randomUUID()

				userState.partner = await prisma.rialTunnelBotPartner.create({
					data: {
						uuid,
						userEuroId: userState.user.id
					}
				})
			}

			// Save the amount
			await prisma.rialTunnelBotPartner.update({
				where: {
					id: userState.partner.id
				},
				data: {
					amount
				}
			})

			ctx.reply(
				"Please enter the details of your iranian bank account, where you want to send the money to."
			)

			await setContext(
				userState.rialTunnelBotUser,
				"inputIranianBankAccountDetails"
			)
			break
		case "inputIranianBankAccountDetails":
			let iranianBankAccountData = ctx.message.text as string
			if (ctx.message.text.length < 5) break

			// Update partner in the database
			await prisma.rialTunnelBotPartner.update({
				where: { id: userState.partner?.id },
				data: {
					userEuroBankAccountData: iranianBankAccountData
				}
			})

			ctx.replyWithMarkdownV2(
				`Alright, we created a partner code for you\\. Please send this code to your partner, so we can connect you two\\.\n\n\`${userState.partner.uuid}\`\n\nYou will receive a message with the next step when your partner has connected using your code\\.`
			)

			await setContext(
				userState.rialTunnelBotUser,
				"waitForPartnerToConnect"
			)
			break
		case "inputEuropeanBankAccountDetails":
			let europeanBankAccountData = ctx.message.text as string
			if (ctx.message.text.length < 5) break

			// Update partner in the database
			await prisma.rialTunnelBotPartner.update({
				where: { id: userState.partner?.id },
				data: {
					userRialBankAccountData: europeanBankAccountData
				}
			})

			ctx.reply(
				"Thank you! You will receive a message when the money was sent to your bank account."
			)

			// Send message to other user that the partner connected successfully
			let user = await prisma.user.findFirst({
				where: { id: userState.partner.userEuroId }
			})

			rialTunnelTelegraf.telegram.sendMessage(
				user.chatId.toString(),
				`Your partner has successfully connected using your code\\!\n\nNow, please send ${(
					userState.partner.amount * 1.025
				)
					.toFixed(2)
					.replace(
						".",
						"\\."
					)} € to the following PayPal account\\.\n*Important*: Make sure to send the partner code in the transaction, so that we know the money belongs to you\\.\n\nWe will send you a message of the next step when we have received the money\\.\n\n[paypal\\.me/dav2070](https://www.paypal.com/paypalme/dav2070)`,
				{ parse_mode: "MarkdownV2" }
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

				ctx.reply(
					"We successfully connected you with your partner!\n\nNow please enter the bank account details, where you want to send the money."
				)

				await setContext(
					userState.rialTunnelBotUser,
					"inputEuropeanBankAccountDetails"
				)
			}
			break
		case "inputAdminPassword":
			let input = ctx.message.text

			if (!userState.isAdmin) {
				// Check the password
				if (input == "/admin") {
					ctx.reply("Please enter the admin password.")
					break
				} else if (input != process.env.RIAL_TUNNEL_ADMIN_PASSWORD) {
					ctx.reply("Password incorrect.")
					break
				}
			}

			userState.isAdmin = true
			await setContext(userState.rialTunnelBotUser, "adminStart")
			rialTunnelBotAction(ctx)
			break
		case "adminStart":
			ctx.reply("Available admin commands:\n/admin\n/adminMoneyReceived")
			break
		case "adminMoneyReceived":
			ctx.reply(
				"Enter the partner code for which you want to send the money received message."
			)
			await setContext(
				userState.rialTunnelBotUser,
				"adminMoneyReceivedInputPartnerCode"
			)
			break
		case "adminMoneyReceivedInputPartnerCode":
			let adminPartnerCodeInput = ctx.message.text as string

			let adminPartner = await prisma.rialTunnelBotPartner.findFirst({
				where: {
					uuid: adminPartnerCodeInput
				}
			})

			if (adminPartner == null) {
				ctx.reply("No partner found, please try again.")
			} else {
				ctx.reply("Please enter the amount of euro that was tranferred.")
				userState.inputs.adminSelectedPartner = adminPartner

				await setContext(
					userState.rialTunnelBotUser,
					"adminMoneyReceivedInputAmount"
				)
			}

			break
		case "adminMoneyReceivedInputAmount":
			let adminPartnerAmount = Number(ctx.message.text as string)

			if (isNaN(adminPartnerAmount) || adminPartnerAmount <= 0) {
				ctx.reply("Amount is invalid.")
			} else {
				// Update the partner in the database
				await prisma.rialTunnelBotPartner.update({
					where: {
						id: userState.partner.id
					},
					data: {
						amount: adminPartnerAmount
					}
				})

				ctx.reply("Amount was successfully saved!")

				// Send next message to the user
				let user = await prisma.user.findFirst({
					where: { id: userState.partner.userEuroId }
				})

				rialTunnelTelegraf.telegram.sendMessage(
					user.chatId.toString(),
					`Thank you\\! We received ${adminPartnerAmount} €\\.\n\nNow, please send the partner code to your partner\\. We will let you know when the money in Rial was sent to your Iranian bank account\\.\n\n\`${userState.partner.uuid}\``,
					{ parse_mode: "MarkdownV2" }
				)

				await setContext(userState.rialTunnelBotUser, "adminStart")
				rialTunnelBotAction(ctx)
			}

			break
	}
}

async function setContext(
	rialTunnelBotUser: RialTunnelBotUser,
	context: UserContext
) {
	rialTunnelBotUser.context = context

	await prisma.rialTunnelBotUser.update({
		where: { id: rialTunnelBotUser.id },
		data: { context }
	})
}
