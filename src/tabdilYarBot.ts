import {
	PrismaClient,
	User,
	RialTunnelBotPartner,
	RialTunnelBotUser
} from "@prisma/client"
import { Telegraf, Markup, Context } from "telegraf"
import axios from "axios"
import { JSDOM } from "jsdom"
import { en, fa } from "./locales/tabdilYar.js"

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
	lang: typeof en
	inputs: {
		adminEuroReceivedIncorrectAmountPartner: RialTunnelBotPartner
	}
}

let userStates: { [chatId: number]: UserState } = {}

if (tabdilYarBot != null) {
	tabdilYarTelegraf.start(async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		let userState = userStates[ctx.chat.id]

		ctx.reply(
			userState.lang.startMessage.replace("{0}", ctx.chat.first_name),
			Markup.inlineKeyboard([
				[
					Markup.button.callback(userState.lang.startMessageOption1, "rialToEuro"),
					Markup.button.callback(userState.lang.startMessageOption2, "euroToRial")
				],
				[Markup.button.callback(userState.lang.startMessageOption3, "exchangeRate")],
				[Markup.button.callback(userState.lang.startMessageOption4, "info")]
			])
		)
	})

	tabdilYarTelegraf.command("info", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		ctx.reply(userStates[ctx.chat.id].lang.infoMessage)
	})

	tabdilYarTelegraf.command("exchangerate", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await showExchangeRate(ctx)
	})

	tabdilYarTelegraf.command("lang", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		ctx.reply("Select your preferred language", {
			reply_markup: {
				inline_keyboard: [
					[
						Markup.button.callback("English", "en"),
						Markup.button.callback("فارسی", "fa")
					]
				]
			}
		})
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

	tabdilYarTelegraf.action("info", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		ctx.reply(userStates[ctx.chat.id].lang.infoMessage)
	})

	tabdilYarTelegraf.action("en", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setLang(userStates[ctx.chat.id], "en")

		ctx.reply("Language was set to English")
	})

	tabdilYarTelegraf.action("fa", async ctx => {
		if (ctx.chat.type != "private") return

		await init(ctx)

		await setLang(userStates[ctx.chat.id], "fa")

		ctx.reply("زبان به فارسی تنظیم شد")
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
		lang: rialTunnelBotUser.lang == "en" ? en : fa,
		inputs: {
			adminEuroReceivedIncorrectAmountPartner: null
		}
	}
}

async function rialTunnelBotAction(ctx: Context<any>) {
	let userState = userStates[ctx.chat.id]

	switch (userState.rialTunnelBotUser.context) {
		case "rialToEuroSelected":
			ctx.reply(userState.lang.rialToEuroSelectedMessage)

			await setContext(userState.rialTunnelBotUser, "inputPartnerCode")
			break
		case "euroToRialSelected":
			ctx.reply(userState.lang.euroToRialSelectedMessage)

			await setContext(userState.rialTunnelBotUser, "inputAmount")
			break
		case "inputAmount":
			const chars = {
				"€": "",
				"۰": "0",
				"۱": "1",
				"۲": "2",
				"۳": "3",
				"۴": "4",
				"۵": "5",
				"۶": "6",
				"۷": "7",
				"۸": "8",
				"۹": "9"
			}

			let amount = Number(
				(ctx.message.text as string)
					.replace(/[€۰۱۲۳۴۵۶۷۸۹]/g, m => chars[m])
					.trim()
			)

			if (isNaN(amount) || amount <= 0) {
				ctx.reply(userState.lang.inputAmount.amountInvalid)
				break
			} else if (amount < 10) {
				ctx.reply(userState.lang.inputAmount.amountTooLow)
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

			ctx.reply(userState.lang.inputIranianBankAccountDetailsMessage)

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
				userState.lang.inputIranianBankAccountDetailsSuccessMessage.replace(
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

			ctx.reply(userState.lang.inputEuropeanBankAccountDetailsSuccessMessage)

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
				userState.lang.inputEuropeanBankAccountDetailsPartnerMessage.replaceAll(
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
				ctx.reply(userState.lang.inputPartnerCodeNoPartnerFoundMessage)
			} else {
				// Update partner in database with the user id
				userState.partner = await prisma.rialTunnelBotPartner.update({
					where: { id: partner.id },
					data: { userRialId: userState.user.id }
				})

				ctx.reply(userState.lang.inputPartnerCodeSuccessMessage)

				await setContext(
					userState.rialTunnelBotUser,
					"inputEuropeanBankAccountDetails"
				)
			}
			break
		case "moneyReceived":
			ctx.reply(userState.lang.moneyReceivedMessage, { parse_mode: "MarkdownV2" })

			await setContext(userState.rialTunnelBotUser, "moneyReceivedConfirm")
			break
		case "moneyReceivedConfirm":
			let moneyReceivedCheckInput = (ctx.message.text as string)
				.toLowerCase()
				.trim()

			if (
				moneyReceivedCheckInput == "confirm" ||
				moneyReceivedCheckInput == "تایید"
			) {
				ctx.reply(userState.lang.moneyReceivedConfirmSuccessMessage)

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
					userState.lang.moneyReceivedConfirmPartnerMessage.replace(
						"{0}",
						((userState.partner.amountEUR / 100) * (1 - commission))
							.toFixed(2)
							.replace(".", "\\.")
					),
					{ parse_mode: "MarkdownV2" }
				)
			} else {
				ctx.reply(userState.lang.moneyReceivedIncorrectInputMessage)
			}

			break
		case "adminStart":
			ctx.reply(userState.lang.adminStartMessage)
			break
		case "adminEuroReceived":
			ctx.reply(userState.lang.adminEuroReceivedMessage)

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
				ctx.reply(userState.lang.noPartnerFoundMessage)
			} else {
				// Update the partner to set euroReceived to true
				try {
					userState.partner = await prisma.rialTunnelBotPartner.update({
						where: { id: adminPartner.id },
						data: { euroReceived: true }
					})

					ctx.sendMessage(userState.lang.partnerUpdatedMessage)

					// Send next message to the user in EU
					let euUser = await prisma.user.findFirst({
						where: { id: adminPartner.userEuroId }
					})

					tabdilYarTelegraf.telegram.sendMessage(
						euUser.chatId.toString(),
						userState.lang.adminEuroReceivedEuroPartnerMessage
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
											userState.lang.adminEuroReceivedEuroPartnerMessageMoneyReceived,
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
						userState.lang.adminEuroReceivedRialPartnerMessage
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
					ctx.sendMessage(userState.lang.unexpectedErrorMessage)
				}

				await setContext(userState.rialTunnelBotUser, "adminStart")
				rialTunnelBotAction(ctx)
			}
			break
		case "adminEuroReceivedIncorrectAmount":
			ctx.reply(userState.lang.adminEuroReceivedIncorrectAmountMessage)

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
				ctx.reply(userState.lang.noPartnerFoundMessage)
				break
			}

			userState.inputs.adminEuroReceivedIncorrectAmountPartner =
				adminPartner2

			ctx.reply(userState.lang.adminEuroReceivedIncorrectAmountInputPartnerCodeMessage)

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
				ctx.reply(userState.lang.inputAmount.amountInvalid)
				break
			}

			let amountDiff = Math.abs(amount2 - expectedAmount)
			let formattedAmountDiff = amountDiff.toFixed(2).replace(".", "\\.")

			if (amount2 > expectedAmount) {
				ctx.reply(
					userState.lang.adminEuroReceivedIncorrectAmountInputAmountTooMuchMessage.replace(
						"{0}",
						formattedAmountDiff
					)
				)
				break
			} else if (amount2 == expectedAmount) {
				ctx.reply(
					userState.lang.adminEuroReceivedIncorrectAmountInputAmountExpectedAmountMessage
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
				userState.lang.adminEuroReceivedIncorrectAmountPartnerMessage
					.replace("{0}", amount2.toFixed(2).replace(".", "\\."))
					.replace("{1}", formattedExpectedAmount)
					.replaceAll("{2}", formattedAmountDiff),
				{ parse_mode: "MarkdownV2" }
			)

			ctx.sendMessage(userState.lang.adminEuroReceivedIncorrectAmountSuccessMessage)

			await setContext(userState.rialTunnelBotUser, "adminStart")
			rialTunnelBotAction(ctx)
			break
	}
}

async function showExchangeRate(ctx: Context<any>) {
	await init(ctx)

	let exchangeRateEur = await getRialExchangeRate()
	let exchangeRateIrr = 1 / exchangeRateEur

	ctx.replyWithMarkdownV2(
		userStates[ctx.chat.id].lang.exchangeRateMessage
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

async function setLang(userState: UserState, lang: string) {
	userState.rialTunnelBotUser.lang = lang

	await prisma.rialTunnelBotUser.update({
		where: {
			id: userState.rialTunnelBotUser.id
		},
		data: {
			lang
		}
	})

	userState.lang = getLang(userState.rialTunnelBotUser)
}

function getLang(rialTunnelBotUser: RialTunnelBotUser) {
	if (rialTunnelBotUser.lang == "en") {
		return en
	}

	return fa
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
