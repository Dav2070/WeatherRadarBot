import {
	PrismaClient,
	User,
	RialTunnelBotPartner,
	RialTunnelBotUser
} from "@prisma/client"
import { Telegraf, Markup, Context } from "telegraf"
import axios from "axios"
import { JSDOM } from "jsdom"

const prisma = new PrismaClient()
const exchangeRatesUrl =
	"https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json"
const exchangeRatesFallbackUrl =
	"https://latest.currency-api.pages.dev/v1/currencies/eur.min.json"

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
	| "moneyReceived"
	| "moneyReceivedConfirm"
	| "moneyReceivedConfirmInput"
	| "adminStart"
	| "adminEuroReceived"
	| "adminEuroReceivedInputPartnerCode"
	| "adminEuroReceivedIncorrectAmount"
	| "adminEuroReceivedIncorrectAmountInputPartnerCode"
	| "adminEuroReceivedIncorrectAmountInputAmount"

interface UserState {
	user: User
	rialTunnelBotUser: RialTunnelBotUser
	partner: RialTunnelBotPartner
	isAdmin: boolean
	inputs: {
		adminEuroReceivedIncorrectAmountPartner: RialTunnelBotPartner
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
				[
					Markup.button.callback("Send Rial to the EU", "rialToEuro"),
					Markup.button.callback("Send Euro to Iran", "euroToRial")
				],
				[
					Markup.button.callback(
						"Check the current exchange rate",
						"exchangeRate"
					)
				]
			])
		)
	})

	rialTunnelTelegraf.command("admin", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(userStates[ctx.chat.id].rialTunnelBotUser, "adminStart")
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.command("adminEuroReceived", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"adminEuroReceived"
		)
		rialTunnelBotAction(ctx)
	})

	rialTunnelTelegraf.command("adminEuroReceivedIncorrectAmount", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"adminEuroReceivedIncorrectAmount"
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

	rialTunnelTelegraf.action("exchangeRate", async ctx => {
		if (ctx.chat.type != "private") return

		let exchangeRateEur = await getRialExchangeRate()
		let exchangeRateIrr = 1 / exchangeRateEur

		ctx.replyWithMarkdownV2(
			`The current exchange rate:\n\n*1 EUR \\= ${numberWithCommas(
				Math.floor(exchangeRateEur)
			)} IRR*\n*1 IRR \\= ${exchangeRateIrr
				.toFixed(8)
				.toString()
				.replace(".", "\\.")} EUR*`
		)
	})

	rialTunnelTelegraf.action("moneyReceived", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"moneyReceived"
		)
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

	// Find the last rial tunnel bot partner of the user
	let partner = await prisma.rialTunnelBotPartner.findFirst({
		where: {
			OR: [{ userEuroId: user.id }, { userRialId: user.id }]
		},
		orderBy: { createdAt: "desc" }
	})

	// Initialize the user state
	userStates[ctx.chat.id] = {
		user,
		rialTunnelBotUser,
		partner,
		isAdmin: false,
		inputs: {
			adminEuroReceivedIncorrectAmountPartner: null
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
				"How many Euros do you want to transfer? Please send a value in the chat."
			)

			await setContext(userState.rialTunnelBotUser, "inputAmount")
			break
		case "inputAmount":
			let amount = Number(
				(ctx.message.text as string).replace("€", "").trim()
			)

			if (isNaN(amount) || amount <= 0) {
				ctx.reply("Amount invalid")
				break
			} else if (amount < 10) {
				ctx.reply("Amount is too low. Please input at least 10 €.")
				break
			}

			// Create a new partner object
			let uuid = crypto.randomUUID()

			userState.partner = await prisma.rialTunnelBotPartner.create({
				data: {
					uuid,
					userEuroId: userState.user.id
				}
			})

			// Save the amount
			let exchangeRate = await getRialExchangeRate()

			userState.partner = await prisma.rialTunnelBotPartner.update({
				where: {
					id: userState.partner.id
				},
				data: {
					amountEUR: amount * 100,
					amountIRR: amount * exchangeRate
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
			userState.partner = await prisma.rialTunnelBotPartner.update({
				where: { id: userState.partner.id },
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
			userState.partner = await prisma.rialTunnelBotPartner.update({
				where: { id: userState.partner?.id },
				data: {
					userRialBankAccountData: europeanBankAccountData
				}
			})

			ctx.reply(
				"Thank you! You will receive a message when the money will be sent to your bank account."
			)

			// Send message to other user that the partner connected successfully
			let user = await prisma.user.findFirst({
				where: { id: userState.partner.userEuroId }
			})

			let formattedAmount = ((userState.partner.amountEUR / 100) * 1.025)
				.toFixed(2)
				.replace(".", "\\.")

			rialTunnelTelegraf.telegram.sendMessage(
				user.chatId.toString(),
				`Your partner has successfully connected using your code\\!\n\nNow, please send \`${formattedAmount}\` € to the following PayPal account\\.\n*Important*: Make sure to send the partner code in the transaction, so that we know the money belongs to you\\.\n\nWe will send you a message of the next step when we have received the money\\.\n\n[paypal\\.me/tabdilyar](https://paypal.me/tabdilyar/${formattedAmount}EUR)`,
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
		case "moneyReceived":
			ctx.reply(
				"Are you sure? To confirm, please send `confirm` in the chat\\.",
				{ parse_mode: "MarkdownV2" }
			)

			await setContext(userState.rialTunnelBotUser, "moneyReceivedConfirm")
			break
		case "moneyReceivedConfirm":
			let moneyReceivedCheckInput = ctx.message.text as string

			if (moneyReceivedCheckInput.toLowerCase().trim() == "confirm") {
				ctx.reply(
					"Thank you for the confirmation! We will now send your money to your partner.\n\nThis is the end of this transaction, you don't have to do anything more. If you want to use this bot again, type /start."
				)

				await setContext(userState.rialTunnelBotUser, null)

				userState.partner = await prisma.rialTunnelBotPartner.update({
					where: { id: userState.partner.id },
					data: { rialReceived: true }
				})

				// Send message to the other user
				let iranUser = await prisma.user.findFirst({
					where: { id: userState.partner.userRialId }
				})

				rialTunnelTelegraf.telegram.sendMessage(
					iranUser.chatId.toString(),
					`Your partner has confirmed that he received your money\\. Your european bank account will receive *${(
						(userState.partner.amountEUR / 100) *
						0.975
					)
						.toFixed(2)
						.replace(
							".",
							"\\."
						)} €* within the next few days\\.\n\nThis is the end of the transaction\\. Thank you for using this bot\\! If you want to start a new transaction, type /start\\.`,
					{ parse_mode: "MarkdownV2" }
				)
			} else {
				ctx.reply("Incorrect input, please try it again.")
			}

			break
		case "inputAdminPassword":
			let input = ctx.message.text as string

			if (!userState.isAdmin) {
				// Check the password
				if (input.startsWith("/")) {
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
			if (!userState.isAdmin) {
				await setContext(userState.rialTunnelBotUser, "inputAdminPassword")
				rialTunnelBotAction(ctx)
				break
			}

			ctx.reply(
				"Available admin commands:\n/admin\n/adminEuroReceived\n/adminEuroReceivedIncorrectAmount"
			)
			break
		case "adminEuroReceived":
			if (!userState.isAdmin) {
				await setContext(userState.rialTunnelBotUser, "inputAdminPassword")
				rialTunnelBotAction(ctx)
				break
			}

			ctx.reply(
				"Enter the partner code for which you want to send the money received message."
			)
			await setContext(
				userState.rialTunnelBotUser,
				"adminEuroReceivedInputPartnerCode"
			)
			break
		case "adminEuroReceivedInputPartnerCode":
			if (!userState.isAdmin) {
				await setContext(userState.rialTunnelBotUser, "inputAdminPassword")
				rialTunnelBotAction(ctx)
				break
			}

			let adminPartnerCodeInput = ctx.message.text as string

			let adminPartner = await prisma.rialTunnelBotPartner.findFirst({
				where: {
					uuid: adminPartnerCodeInput
				}
			})

			if (adminPartner == null) {
				ctx.reply("No partner found, please try again.")
			} else {
				// Update the partner to set euroReceived to true
				try {
					userState.partner = await prisma.rialTunnelBotPartner.update({
						where: { id: adminPartner.id },
						data: { euroReceived: true }
					})

					ctx.sendMessage("The partner was successfully updated!")

					// Send next message to the user in EU
					let euUser = await prisma.user.findFirst({
						where: { id: adminPartner.userEuroId }
					})

					rialTunnelTelegraf.telegram.sendMessage(
						euUser.chatId.toString(),
						`Thank you, we received *${(
							(adminPartner.amountEUR / 100) *
							1.025
						)
							.toFixed(2)
							.replace(
								".",
								"\\."
							)} €*\\!\n\nNext, your partner will send *${numberWithCommas(
							Math.floor(adminPartner.amountIRR * 0.975)
						)} Rial* to your iranian bank account\\. Please check your bank account regularly and let us know when your iranian bank has received the money by clicking the button below\\.`,
						{
							parse_mode: "MarkdownV2",
							reply_markup: {
								inline_keyboard: [
									[
										Markup.button.callback(
											"Money received",
											"moneyReceived"
										)
									]
								]
							}
						}
					)

					// Send next message to the user in Iran
					let iranUser = await prisma.user.findFirst({
						where: { id: adminPartner.userRialId }
					})

					rialTunnelTelegraf.telegram.sendMessage(
						iranUser.chatId.toString(),
						`Hey there 👋 Your partner has sent the requested amount to us\\. Next, please send \`${numberWithCommas(
							Math.floor(adminPartner.amountIRR * 0.975)
						)}\` Rial to the following bank account\\. When you have done that and your partner has confirmed that he has received the money, we will send *${(
							(adminPartner.amountEUR / 100) *
							0.975
						)
							.toFixed(2)
							.replace(".", "\\.")} €* to your bank account\\.\n\n\`${
							adminPartner.userEuroBankAccountData
						}\``,
						{ parse_mode: "MarkdownV2" }
					)
				} catch (error) {
					console.error(error)
					ctx.sendMessage("An unexpected error occured, please try again")
				}

				await setContext(userState.rialTunnelBotUser, "adminStart")
				rialTunnelBotAction(ctx)
			}
			break
		case "adminEuroReceivedIncorrectAmount":
			if (!userState.isAdmin) {
				await setContext(userState.rialTunnelBotUser, "inputAdminPassword")
				rialTunnelBotAction(ctx)
				break
			}

			ctx.reply("Enter the partner code of the transaction.")

			await setContext(
				userState.rialTunnelBotUser,
				"adminEuroReceivedIncorrectAmountInputPartnerCode"
			)
			break
		case "adminEuroReceivedIncorrectAmountInputPartnerCode":
			if (!userState.isAdmin) {
				await setContext(userState.rialTunnelBotUser, "inputAdminPassword")
				rialTunnelBotAction(ctx)
				break
			}

			let adminPartnerCodeInput2 = ctx.message.text as string

			let adminPartner2 = await prisma.rialTunnelBotPartner.findFirst({
				where: {
					uuid: adminPartnerCodeInput2
				}
			})

			if (adminPartner2 == null) {
				ctx.reply("No partner found, please try again.")
				break
			}

			userState.inputs.adminEuroReceivedIncorrectAmountPartner =
				adminPartner2

			ctx.reply("Enter the amount of Euros that was sent.")

			await setContext(
				userState.rialTunnelBotUser,
				"adminEuroReceivedIncorrectAmountInputAmount"
			)
			break
		case "adminEuroReceivedIncorrectAmountInputAmount":
			let amount2 = Number(
				(ctx.message.text as string).replace("€", "").trim()
			)
			let expectedAmount = parseFloat(
				((userState.partner.amountEUR / 100) * 1.025).toFixed(2)
			)

			if (isNaN(amount2) || amount2 <= 0) {
				ctx.reply("Amount invalid")
				break
			}

			let amountDiff = Math.abs(amount2 - expectedAmount)

			if (amount2 > expectedAmount) {
				ctx.reply(
					`Amount is ${amountDiff} more than expected. Please sent the excess amount back to the user.`
				)
				break
			} else if (amount2 == expectedAmount) {
				ctx.reply("Amount is the same as the expected amount.")
				break
			}

			// Send message to the user to send the rest of the amount
			let user2 = await prisma.user.findFirst({
				where: {
					id: userState.inputs.adminEuroReceivedIncorrectAmountPartner
						.userEuroId
				}
			})

			let formattedExpectedAmount = expectedAmount
				.toFixed(2)
				.replace(".", "\\.")

			let formattedAmountDiff = amountDiff.toFixed(2).replace(".", "\\.")

			rialTunnelTelegraf.telegram.sendMessage(
				user2.chatId.toString(),
				`Thank you, we received *${amount2
					.toFixed(2)
					.replace(
						".",
						"\\."
					)} €*\\!\n\nTo match the amount of *${formattedExpectedAmount} €*, we need you to send the remaining \`${formattedAmountDiff}\` € to continue the transaction\\.\nDon't forget to send the partner code in the transaction again\\.\n\n[paypal\\.me/tabdilyar](https://paypal.me/tabdilyar/${formattedAmountDiff}EUR)`,
				{ parse_mode: "MarkdownV2" }
			)

			ctx.sendMessage(
				"Message for sending the remaining amount was sent successfully!"
			)

			await setContext(userState.rialTunnelBotUser, "adminStart")
			rialTunnelBotAction(ctx)
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

async function getRialExchangeRate(): Promise<number> {
	try {
		let result = await axios({
			method: "get",
			url: "https://www.tgju.org/profile/price_eur"
		})

		const dom = new JSDOM(result.data)

		let exchangeRateElement = dom.window.document.querySelector(
			"#main > div.stocks-profile > div.fs-row.bootstrap-fix.widgets.full-w-set.profile-social-share-box > div.row.tgju-widgets-row > div.tgju-widgets-block.col-md-12.col-lg-4.tgju-widgets-block-bottom-unset.overview-first-block > div > div:nth-child(2) > div > div.tables-default.normal > table > tbody > tr:nth-child(1) > td.text-left"
		)

		return Number(exchangeRateElement.innerHTML.replaceAll(",", ""))
	} catch (error) {
		console.error("Error in getting exchange rates")
		console.error(error)
	}

	try {
		let result = await axios({
			method: "get",
			url: exchangeRatesUrl
		})

		return result.data.eur.irr * 1.628291 * 10
	} catch (error) {
		console.error("Error in getting exchange rates (2)")
		console.error(error)
	}

	try {
		let result = await axios({
			method: "get",
			url: exchangeRatesFallbackUrl
		})

		return result.data.eur.irr * 1.628291 * 10
	} catch (error) {
		console.error("Error in getting exchange rates (3)")
		console.error(error)
	}
}

function numberWithCommas(x: number) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
