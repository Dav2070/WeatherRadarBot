import { PrismaClient, User, RialTunnelBotPartner } from "@prisma/client"
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
	| "inputIranianBankAccountDetails"
	| "inputEuropeanBankAccountDetails"
	| "inputPartnerCode"

interface UserState {
	context: UserContext
	user: User
	partner: RialTunnelBotPartner | null
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
			// Create partner in database
			let uuid = crypto.randomUUID()

			userState.partner = await prisma.rialTunnelBotPartner.create({
				data: {
					uuid,
					userEuroId: userState.user.id
				}
			})

			ctx.replyWithMarkdownV2(
				`Alright, we created the following partner code for you:\n\`${uuid}\`\n\nFirst, please send the amount you want to transfer to Iran to the following PayPal account\\.\n*Important*: Make sure to send the partner code in the transaction, so that we know the money belongs to you\\.\n\nWe will send you a message of the next step when we have received the money\\.\n\n[paypal\\.me/dav2070](https://www.paypal.com/paypalme/dav2070)`
			)
			break
		case "inputIranianBankAccountDetails":
			let iranianBankAccountData = ctx.message.text as string
			if (ctx.message.text.length < 5) return
			// TODO
			break
		case "inputEuropeanBankAccountDetails":
			let europeanBankAccountData = ctx.message.text as string
			if (ctx.message.text.length < 5) return

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

if (rialTunnelBot != null) {
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
			partner: null
		}

		ctx.reply(
			`Hi ${chat.first_name} 👋\n\nWelcome to the Rial Tunnel Bot! This bot let's you\n- Send Rial from Iran to an european bank account\n- Send Euro to an iranian bank account\n\nWhat do you want to do?`,
			Markup.inlineKeyboard([
				Markup.button.callback("Send Rial to the EU", "rialToEuro"),
				Markup.button.callback("Send Euro to Iran", "euroToRial")
			])
		)

		rialTunnelTelegraf.action("rialToEuro", ctx => {
			let chatId = ctx.chat?.id
			if (chatId == null) return

			userStates[chatId].context = "rialToEuroSelected"
			rialTunnelBotAction(ctx)
		})

		rialTunnelTelegraf.action("euroToRial", ctx => {
			let chatId = ctx.chat?.id
			if (chatId == null) return

			userStates[chatId].context = "euroToRialSelected"
			rialTunnelBotAction(ctx)
		})

		rialTunnelTelegraf.on("text", async ctx => rialTunnelBotAction(ctx))
	})
}
