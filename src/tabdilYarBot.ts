import {
	PrismaClient,
	User,
	RialTunnelBotPartner,
	RialTunnelBotUser
} from "@prisma/client"
import { Telegraf, Markup, Context } from "telegraf"
import axios from "axios"
import { JSDOM } from "jsdom"
import { de, fa } from "./locales/tabdilYar.js"

const prisma = new PrismaClient()
const commission = 0.025

export const tabdilYarTelegraf = new Telegraf(
	process.env.TABDIL_YAR_BOT_TOKEN ?? ""
)
const tabdilYarBot = await prisma.bot.findFirst({
	where: { name: "tabdil_yar_bot" }
})

type UserContext =
	| null
	| "rialToEuroSelected"
	| "euroToRialSelected"
	| "inputAmount"
	| "inputIranianBankAccountDetails"
	| "inputEuropeanBankAccountDetails"
	| "inputPartnerCode"
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
	inputs: {
		adminEuroReceivedIncorrectAmountPartner: RialTunnelBotPartner
	}
}

let userStates: { [chatId: number]: UserState } = {}

if (tabdilYarBot != null) {
	tabdilYarTelegraf.start(async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		ctx.reply(
			de.startMessage.replace("{0}", ctx.chat.first_name),
			Markup.inlineKeyboard([
				[
					Markup.button.callback(de.startMessageOption1, "rialToEuro"),
					Markup.button.callback(de.startMessageOption2, "euroToRial")
				],
				[Markup.button.callback(de.startMessageOption3, "exchangeRate")],
				[Markup.button.callback(de.startMessageOption4, "info")]
			])
		)
	})

	tabdilYarTelegraf.command("info", async ctx => {
		if (ctx.chat.type != "private") return

		ctx.reply(fa.infoMessage)
	})

	tabdilYarTelegraf.command("exchangerate", async ctx => {
		if (ctx.chat.type != "private") return

		await showExchangeRate(ctx)
	})

	tabdilYarTelegraf.command("admin", async ctx => {
		if (ctx.chat.type != "private" || !isAdmin(ctx.chat.username)) return

		await init(ctx)

		await setContext(userStates[ctx.chat.id].rialTunnelBotUser, "adminStart")
		rialTunnelBotAction(ctx)
	})

	tabdilYarTelegraf.command("adminEuroReceived", async ctx => {
		if (ctx.chat.type != "private" || !isAdmin(ctx.chat.username)) return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"adminEuroReceived"
		)
		rialTunnelBotAction(ctx)
	})

	tabdilYarTelegraf.command("adminEuroReceivedIncorrectAmount", async ctx => {
		if (ctx.chat.type != "private" || !isAdmin(ctx.chat.username)) return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"adminEuroReceivedIncorrectAmount"
		)
		rialTunnelBotAction(ctx)
	})

	tabdilYarTelegraf.action("rialToEuro", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"rialToEuroSelected"
		)
		rialTunnelBotAction(ctx)
	})

	tabdilYarTelegraf.action("euroToRial", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"euroToRialSelected"
		)
		rialTunnelBotAction(ctx)
	})

	tabdilYarTelegraf.action("exchangeRate", async ctx => {
		if (ctx.chat.type != "private") return

		await showExchangeRate(ctx)
	})

	tabdilYarTelegraf.action("info", ctx => {
		if (ctx.chat.type != "private") return

		ctx.reply(fa.infoMessage)
	})

	tabdilYarTelegraf.action("moneyReceived", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setContext(
			userStates[ctx.chat.id].rialTunnelBotUser,
			"moneyReceived"
		)
		rialTunnelBotAction(ctx)
	})

	tabdilYarTelegraf.on("text", async ctx => {
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
			botId: tabdilYarBot.id,
			chatId: ctx.chat.id
		}
	})

	if (user == null) {
		// Create a new user
		user = await prisma.user.create({
			data: {
				botId: tabdilYarBot.id,
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
		inputs: {
			adminEuroReceivedIncorrectAmountPartner: null
		}
	}
}

async function rialTunnelBotAction(ctx: Context<any>) {
	let userState = userStates[ctx.chat.id]

	switch (userState.rialTunnelBotUser.context) {
		case "rialToEuroSelected":
			ctx.reply(de.rialToEuroSelectedMessage)

			await setContext(userState.rialTunnelBotUser, "inputPartnerCode")
			break
		case "euroToRialSelected":
			ctx.reply(de.euroToRialSelectedMessage)

			await setContext(userState.rialTunnelBotUser, "inputAmount")
			break
		case "inputAmount":
			let amount = Number(
				(ctx.message.text as string).replace("€", "").trim()
			)

			if (isNaN(amount) || amount <= 0) {
				ctx.reply(de.inputAmount.amountInvalid)
				break
			} else if (amount < 10) {
				ctx.reply(de.inputAmount.amountTooLow)
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

			ctx.reply(de.inputIranianBankAccountDetailsMessage)

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
				de.inputIranianBankAccountDetailsSuccessMessage.replace(
					"{0}",
					userState.partner.uuid
				)
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

			ctx.reply(de.inputEuropeanBankAccountDetailsSuccessMessage)

			// Send message to other user that the partner connected successfully
			let user = await prisma.user.findFirst({
				where: { id: userState.partner.userEuroId }
			})

			let formattedAmount = (
				(userState.partner.amountEUR / 100) *
				(1 + commission)
			)
				.toFixed(2)
				.replace(".", "\\.")

			tabdilYarTelegraf.telegram.sendMessage(
				user.chatId.toString(),
				de.inputEuropeanBankAccountDetailsPartnerMessage.replaceAll(
					"{0}",
					formattedAmount
				),
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
				ctx.reply(de.inputPartnerCodeNoPartnerFoundMessage)
			} else {
				// Update partner in database with the user id
				userState.partner = await prisma.rialTunnelBotPartner.update({
					where: { id: partner.id },
					data: { userRialId: userState.user.id }
				})

				ctx.reply(de.inputPartnerCodeSuccessMessage)

				await setContext(
					userState.rialTunnelBotUser,
					"inputEuropeanBankAccountDetails"
				)
			}
			break
		case "moneyReceived":
			ctx.reply(de.moneyReceivedMessage, { parse_mode: "MarkdownV2" })

			await setContext(userState.rialTunnelBotUser, "moneyReceivedConfirm")
			break
		case "moneyReceivedConfirm":
			let moneyReceivedCheckInput = ctx.message.text as string

			if (moneyReceivedCheckInput.toLowerCase().trim() == "confirm") {
				ctx.reply(de.moneyReceivedConfirmSuccessMessage)

				await setContext(userState.rialTunnelBotUser, null)

				userState.partner = await prisma.rialTunnelBotPartner.update({
					where: { id: userState.partner.id },
					data: { rialReceived: true }
				})

				// Send message to the other user
				let iranUser = await prisma.user.findFirst({
					where: { id: userState.partner.userRialId }
				})

				tabdilYarTelegraf.telegram.sendMessage(
					iranUser.chatId.toString(),
					de.moneyReceivedConfirmPartnerMessage.replace(
						"{0}",
						((userState.partner.amountEUR / 100) * (1 - commission))
							.toFixed(2)
							.replace(".", "\\.")
					),
					{ parse_mode: "MarkdownV2" }
				)
			} else {
				ctx.reply(de.moneyReceivedIncorrectInputMessage)
			}

			break
		case "adminStart":
			ctx.reply(de.adminStartMessage)
			break
		case "adminEuroReceived":
			ctx.reply(de.adminEuroReceivedMessage)

			await setContext(
				userState.rialTunnelBotUser,
				"adminEuroReceivedInputPartnerCode"
			)
			break
		case "adminEuroReceivedInputPartnerCode":
			let adminPartnerCodeInput = ctx.message.text as string

			let adminPartner = await prisma.rialTunnelBotPartner.findFirst({
				where: {
					uuid: adminPartnerCodeInput
				}
			})

			if (adminPartner == null) {
				ctx.reply(de.noPartnerFoundMessage)
			} else {
				// Update the partner to set euroReceived to true
				try {
					userState.partner = await prisma.rialTunnelBotPartner.update({
						where: { id: adminPartner.id },
						data: { euroReceived: true }
					})

					ctx.sendMessage(de.partnerUpdatedMessage)

					// Send next message to the user in EU
					let euUser = await prisma.user.findFirst({
						where: { id: adminPartner.userEuroId }
					})

					tabdilYarTelegraf.telegram.sendMessage(
						euUser.chatId.toString(),
						de.adminEuroReceivedEuroPartnerMessage
							.replace(
								"{0}",
								((adminPartner.amountEUR / 100) * (1 + commission))
									.toFixed(2)
									.replace(".", "\\.")
							)
							.replace(
								"{1}",
								numberWithCommas(
									Math.floor(adminPartner.amountIRR * (1 - commission))
								)
							),
						{
							parse_mode: "MarkdownV2",
							reply_markup: {
								inline_keyboard: [
									[
										Markup.button.callback(
											de.adminEuroReceivedEuroPartnerMessageMoneyReceived,
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

					tabdilYarTelegraf.telegram.sendMessage(
						iranUser.chatId.toString(),
						de.adminEuroReceivedRialPartnerMessage
							.replace(
								"{0}",
								numberWithCommas(
									Math.floor(adminPartner.amountIRR * (1 - commission))
								)
							)
							.replace(
								"{1}",
								((adminPartner.amountEUR / 100) * (1 - commission))
									.toFixed(2)
									.replace(".", "\\.")
							)
							.replace("{2}", adminPartner.userEuroBankAccountData),
						{ parse_mode: "MarkdownV2" }
					)
				} catch (error) {
					console.error(error)
					ctx.sendMessage(de.unexpectedErrorMessage)
				}

				await setContext(userState.rialTunnelBotUser, "adminStart")
				rialTunnelBotAction(ctx)
			}
			break
		case "adminEuroReceivedIncorrectAmount":
			ctx.reply(de.adminEuroReceivedIncorrectAmountMessage)

			await setContext(
				userState.rialTunnelBotUser,
				"adminEuroReceivedIncorrectAmountInputPartnerCode"
			)
			break
		case "adminEuroReceivedIncorrectAmountInputPartnerCode":
			let adminPartnerCodeInput2 = ctx.message.text as string

			let adminPartner2 = await prisma.rialTunnelBotPartner.findFirst({
				where: {
					uuid: adminPartnerCodeInput2
				}
			})

			if (adminPartner2 == null) {
				ctx.reply(de.noPartnerFoundMessage)
				break
			}

			userState.inputs.adminEuroReceivedIncorrectAmountPartner =
				adminPartner2

			ctx.reply(de.adminEuroReceivedIncorrectAmountInputPartnerCodeMessage)

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
				(
					(userState.inputs.adminEuroReceivedIncorrectAmountPartner
						.amountEUR /
						100) *
					(1 + commission)
				).toFixed(2)
			)

			if (isNaN(amount2) || amount2 <= 0) {
				ctx.reply(de.inputAmount.amountInvalid)
				break
			}

			let amountDiff = Math.abs(amount2 - expectedAmount)
			let formattedAmountDiff = amountDiff.toFixed(2).replace(".", "\\.")

			if (amount2 > expectedAmount) {
				ctx.reply(
					de.adminEuroReceivedIncorrectAmountInputAmountTooMuchMessage.replace(
						"{0}",
						formattedAmountDiff
					)
				)
				break
			} else if (amount2 == expectedAmount) {
				ctx.reply(
					de.adminEuroReceivedIncorrectAmountInputAmountExpectedAmountMessage
				)
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

			tabdilYarTelegraf.telegram.sendMessage(
				user2.chatId.toString(),
				de.adminEuroReceivedIncorrectAmountPartnerMessage
					.replace("{0}", amount2.toFixed(2).replace(".", "\\."))
					.replace("{1}", formattedExpectedAmount)
					.replaceAll("{2}", formattedAmountDiff),
				{ parse_mode: "MarkdownV2" }
			)

			ctx.sendMessage(de.adminEuroReceivedIncorrectAmountSuccessMessage)

			await setContext(userState.rialTunnelBotUser, "adminStart")
			rialTunnelBotAction(ctx)
			break
	}
}

async function showExchangeRate(ctx: Context<any>) {
	let exchangeRateEur = await getRialExchangeRate()
	let exchangeRateIrr = 1 / exchangeRateEur

	ctx.replyWithMarkdownV2(
		de.exchangeRateMessage
			.replace("{0}", numberWithCommas(Math.floor(exchangeRateEur)))
			.replace(
				"{1}",
				exchangeRateIrr.toFixed(8).toString().replace(".", "\\.")
			)
	)
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

function isAdmin(username: string): boolean {
	if (username == null) return false

	let admins = process.env.TABDIL_YAR_BOT_ADMINS
	if (admins == null) return false

	let adminsList = admins.toLowerCase().split(",")

	return adminsList.includes(username.toLowerCase())
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
			url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json"
		})

		return result.data.eur.irr * 1.628291 * 10
	} catch (error) {
		console.error("Error in getting exchange rates (2)")
		console.error(error)
	}

	try {
		let result = await axios({
			method: "get",
			url: "https://latest.currency-api.pages.dev/v1/currencies/eur.min.json"
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
