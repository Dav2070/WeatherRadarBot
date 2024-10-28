export const de = {
	startMessage:
		"Hi {0} 👋\n\nWelcome to the Tabdil Yar Bot! This bot let's you\n- Send Rial from Iran to an european bank account\n- Send Euro to an iranian bank account\n\nWhat do you want to do?",
	startMessageOption1: "Send Rial to the EU",
	startMessageOption2: "Send Euro to Iran",
	startMessageOption3: "Check the current exchange rate",
	exchangeRateMessage:
		"The current exchange rate:\n\n*1 EUR \\= {0} IRR*\n*1 IRR \\= {1} EUR*",
	rialToEuroSelectedMessage:
		"To send rial to an european bank account, you need a partner who wants to send the same amount of money from the EU to Iran.\n\nYour partner will receive a code. Please enter the code, so we can connect you with your partner.",
	euroToRialSelectedMessage:
		"How many Euros do you want to transfer? Please send a value in the chat.",
	inputAmount: {
		amountInvalid: "Amount invalid",
		amountTooLow: "Amount is too low. Please input at least 10 €."
	},
	inputIranianBankAccountDetailsMessage:
		"Please enter the details of your iranian bank account, where you want to send the money to.",
	inputIranianBankAccountDetailsSuccessMessage:
		"Alright, we created a partner code for you\\. Please send this code to your partner, so we can connect you two\\.\n\n`{0}`\n\nYou will receive a message with the next step when your partner has connected using your code\\.",
	inputEuropeanBankAccountDetailsSuccessMessage:
		"Thank you! You will receive a message when the money will be sent to your bank account.",
	inputEuropeanBankAccountDetailsPartnerMessage:
		"Your partner has successfully connected using your code\\!\n\nNow, please send `{0}` € to the following PayPal account\\.\n*Important*: Make sure to send the partner code in the transaction, so that we know the money belongs to you\\.\n\nWe will send you a message of the next step when we have received the money\\.\n\n[paypal\\.me/tabdilyar](https://paypal.me/tabdilyar/{0}EUR)",
	inputPartnerCodeNoPartnerFoundMessage:
		"No partner with this code found. Please enter a different code or start again using /start",
	inputPartnerCodeSuccessMessage:
		"We successfully connected you with your partner!\n\nNow please enter the bank account details, where you want to send the money.",
	moneyReceivedMessage:
		"Are you sure? To confirm, please send `confirm` in the chat\\.",
	moneyReceivedConfirmSuccessMessage:
		"Thank you for the confirmation! We will now send your money to your partner.\n\nThis is the end of this transaction, you don't have to do anything more. If you want to use this bot again, type /start.",
	moneyReceivedConfirmPartnerMessage:
		"Your partner has confirmed that he received your money\\. Your european bank account will receive *{0} €* within the next few days\\.\n\nThis is the end of the transaction\\. Thank you for using this bot\\! If you want to start a new transaction, type /start\\.",
	moneyReceivedIncorrectInputMessage: "Incorrect input, please try it again.",
	inputAdminPasswordMessage: "Please enter the admin password.",
	inputAdminPasswordIncorrectMessage: "Password incorrect.",
	adminStartMessage:
		"Available admin commands:\n/admin\n/adminEuroReceived\n/adminEuroReceivedIncorrectAmount",
	adminEuroReceivedMessage:
		"Enter the partner code for which you want to send the money received message.",
	noPartnerFoundMessage: "No partner found, please try again.",
	partnerUpdatedMessage: "The partner was successfully updated!",
	adminEuroReceivedEuroPartnerMessage:
		"Thank you, we received *{0} €*\\!\n\nNext, your partner will send *{1} Rial* to your iranian bank account\\. Please check your bank account regularly and let us know when your iranian bank has received the money by clicking the button below\\.",
	adminEuroReceivedEuroPartnerMessageMoneyReceived: "Money received",
	adminEuroReceivedRialPartnerMessage:
		"Hey there 👋 Your partner has sent the requested amount to us\\. Next, please send `{0}` Rial to the following bank account\\. When you have done that and your partner has confirmed that he has received the money, we will send *{1} €* to your bank account\\.\n\n`{2}`",
	unexpectedErrorMessage: "An unexpected error occured, please try again",
	adminEuroReceivedIncorrectAmountMessage:
		"Enter the partner code of the transaction.",
	adminEuroReceivedIncorrectAmountInputPartnerCodeMessage:
		"Enter the amount of Euros that was sent.",
	adminEuroReceivedIncorrectAmountInputAmountTooMuchMessage:
		"Amount is {0} more than expected. Please sent the excess amount back to the user.",
	adminEuroReceivedIncorrectAmountInputAmountExpectedAmountMessage:
		"Amount is the same as the expected amount.",
	adminEuroReceivedIncorrectAmountPartnerMessage:
		"Thank you, we received *{0} €*\\!\n\nTo match the amount of *{1} €*, we need you to send the remaining `{2}` € to continue the transaction\\.\nDon't forget to send the partner code in the transaction again\\.\n\n[paypal\\.me/tabdilyar](https://paypal.me/tabdilyar/{2}EUR)",
	adminEuroReceivedIncorrectAmountSuccessMessage:
		"Message for sending the remaining amount was sent successfully!"
}

export const fa = {
	startMessage: "",
	startMessageOption1: "",
	startMessageOption2: "",
	startMessageOption3: "",
	exchangeRateMessage: "",
	rialToEuroSelectedMessage: "",
	euroToRialSelectedMessage: "",
	inputAmount: {
		amountInvalid: "",
		amountTooLow: ""
	},
	inputIranianBankAccountDetailsMessage: "",
	inputIranianBankAccountDetailsSuccessMessage: "",
	inputEuropeanBankAccountDetailsSuccessMessage: "",
	inputEuropeanBankAccountDetailsPartnerMessage: "",
	inputPartnerCodeNoPartnerFoundMessage: "",
	inputPartnerCodeSuccessMessage: "",
	moneyReceivedMessage: "",
	moneyReceivedConfirmSuccessMessage: "",
	moneyReceivedConfirmPartnerMessage: "",
	moneyReceivedIncorrectInputMessage: "",
	inputAdminPasswordMessage: "",
	inputAdminPasswordIncorrectMessage: "",
	adminStartMessage: "",
	adminEuroReceivedMessage: "",
	noPartnerFoundMessage: "",
	partnerUpdatedMessage: "",
	adminEuroReceivedEuroPartnerMessage: "",
	adminEuroReceivedEuroPartnerMessageMoneyReceived: "",
	adminEuroReceivedRialPartnerMessage: "",
	unexpectedErrorMessage: "",
	adminEuroReceivedIncorrectAmountMessage: "",
	adminEuroReceivedIncorrectAmountInputPartnerCodeMessage: "",
	adminEuroReceivedIncorrectAmountInputAmountTooMuchMessage: "",
	adminEuroReceivedIncorrectAmountInputAmountExpectedAmountMessage: "",
	adminEuroReceivedIncorrectAmountPartnerMessage: "",
	adminEuroReceivedIncorrectAmountSuccessMessage: ""
}
