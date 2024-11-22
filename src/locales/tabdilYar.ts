export const en = {
	infoMessage:
		"Hello friends,\n\nWe are a team of Iranian-German students trying to make things a bit easier for ourselves given the barriers that exist for Iranians when it comes to buying and selling currency. Since there is no online exchange that allows easy Euro transactions, and everyone sets their own rates, we decided to develop a platform in the form of a chatbot. This platform provides a secure environment where both buyers and sellers can feel assured and trust each other without fear of losing money. Transactions can happen without face-to-face meetings, which are typically required. You can even trade with someone in a different state, and we guarantee the transaction, helping you reach more people and facilitating faster exchanges.\n\nI’d like to emphasize that we are not an exchange ourselves; rather, we simply act as a link between the buyer and seller to guarantee payment. Transactions are managed through a PayPal account. In this process, the Euros are first transferred to our account, and they remain there until confirmation of the equivalent Rial payment is received. Only then are the Euros released.\n\nAt any time, you can check the currency rates through this bot. Trust is the foundation of this service, and we hope to provide a great help to the Iranian community. The transaction fee is 2.5% of the amount from each party.\n\nThank you,\nThe Tabdil-Yar Team",
	startMessage:
		"Hi {0} 👋\n\nWelcome to the Tabdil Yar Bot! This bot let's you\n- Send Rial from Iran to an european bank account\n- Send Euro to an iranian bank account\n\nWhat do you want to do?",
	startMessageOption1: "Send Rial to the EU",
	startMessageOption2: "Send Euro to Iran",
	startMessageOption3: "Check the current exchange rate",
	startMessageOption4: "Show bot info",
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
	bankAccountInvalid: "Your bank account data is invalid.",
	inputEuroUserBankAccountDetailsMessage:
		"Please enter the details of your iranian bank account, where you want to send the money to.",
	inputEuroUserBankAccountDetailsSuccessMessage:
		"Alright, we created a partner code for you\\. Please send this code to your partner, so we can connect you two\\.\n\n`{0}`\n\nYou will receive a message with the next step when your partner has connected using your code\\.",
	inputRialUserTargetBankAccountDetailsSuccessMessage:
		"Thank you! Now please enter your iranian bank account details from where you will send the money to your partner. We will show this to your partner, so he can recognize which transaction is coming from you.",
	inputRialUserOriginBankAccountDetailsSuccessMessage:
		"Thank you! You will receive a message with the next step when your partner has sent the money to us.",
	inputRialUserOriginBankAccountDetailsPartnerMessage:
		"Your partner has successfully connected using your code\\!\n\nNow, please send `{0}` € to the following PayPal account\\.\n*Important*: Make sure to send the partner code in the transaction, so that we know the money belongs to you\\.\n\nWe will send you a message of the next step when we have received the money\\.\n\n[paypal\\.me/tabdilyar](https://paypal.me/tabdilyar/{0}EUR)",
	inputPartnerCodeNoPartnerFoundMessage:
		"No partner with this code found. Please enter a different code or start again using /start",
	inputPartnerCodeSuccessMessage:
		"We successfully connected you with your partner!\n\nNow please enter the bank account details, where you want to send the money.",
	moneyReceivedConfirmSuccessMessage:
		"Thank you for the confirmation! We will now send your money to your partner.\n\nThis is the end of this transaction, you don't have to do anything more. If you want to use this bot again, type /start.",
	moneyReceivedInputAmountMessage:
		"Please enter the amount of Rial that you received.",
	moneyReceivedInputAmountConfirmationMessage:
		"Did you receive *{0}* Rial? Please make sure the amount is correct\\.\n\nIf the amount is correct, please send `confirm` in the chat\\. If not, please enter the correct different value\\.",
	moneyReceivedConfirmPartnerMessage:
		"Your partner has confirmed that he received your money\\. Your european bank account will receive *{0} €* within the next few days\\.\n\nThis is the end of the transaction\\. Thank you for using this bot\\! If you want to start a new transaction, type /start\\.",
	moneyReceivedIncorrectInputMessage: "Incorrect input, please try it again.",
	moneyReceivedSendRemainingAmountMessage:
		"Thank you for confirming the amount\\! We will notify your partner to send the remaining *{0} Rial*, please check your bank account regularly and let us know when your iranian bank has received the money by clicking the button below\\.\n\nYou will receive the money from the following bank account:\n*{1}*",
	moneyReceivedSendRemainingAmountPartnerMessage:
		"Hey there 👋 It seems you didn't send the correct amount to the bank account of your partner\\. Please send the remaining `{0}` Rial to the following bank account\\. When you have done that and your partner has confirmed that he has received the money, we will send *{1} €* to your bank account\\.\n\n`{2}`",
	adminStartMessage:
		"Available admin commands:\n/admin\n/adminEuroReceived\n/adminEuroReceivedIncorrectAmount",
	adminEuroReceivedMessage:
		"Enter the partner code for which you want to send the money received message.",
	noPartnerFoundMessage: "No partner found, please try again.",
	partnerUpdatedMessage: "The partner was successfully updated!",
	adminEuroReceivedEuroPartnerMessage:
		"Thank you, we received *{0} €*\\!\n\nNext, your partner will send *{1} Rial* to your iranian bank account\\. This is his bank account data:\n*{2}*\n\nPlease check your bank account regularly and let us know when your iranian bank has received the money by clicking the button below\\.",
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
	infoMessage:
		"سلام دوستان\nما یک تیم از دانشجویان المانی ایرانی هستیم که تلاش میکنیم با توجه به موانعی که در خرید و فروش ارز بین ما ایرانیان وجود دارد کمی شرایط را راحت تر کنیم از آنجایی که هیچ صرافی انلاینی وجود ندارد که به راحتی بتوان یورو خرید و فروش کرد  بر آن شدیم که پلتفرمی در قالب چت بات توسعه دهیم که بتواند در محیطی امن، رضایت خاطر خریدار و فروشنده ارز را فراهم کند و بدون دغدغه و ترس از دست دادن پول بتوانند به یکدیگر اعتماد کنند، همچنین این ربات قابلیت استعلام نرخ لحظه ای ارز را با استعلام از صرافی های مرجع دارا می باشد. با استفاده از این ربات می توان بدون انجام قرار ملاقات حضوری حتی با افرادی که در دیگر کشورها و ایالت ها حضور دارند، اقدام به مبادله ارز نمود. ما صحت این معامله را تضمین میکنیم که باعث دسترسی شما به افراد بیشتر و در نتیجه سرعت تبدیل بالاتر می شود.\nدر اینجا مایلیم تاکید نماییم که ما یک صرافی نیستیم و صرفا بعنوان یک رابط بین خریدار و فروشنده، دریافت پول را گارانتی میکنیم. این کار توسط حساب پی پال انجام می گردد\nدر این روش ابتدا شما می بایست از طریق گروه های جاری، فردی را که تمایل به معامله با او دارید را پیدا کنید و لینک ربات را برای او ارسال نمایید سپس یورو توسط فروشنده به یک حساب واسط واریز شده و تا مادامی که تاییدیه دریافت معادل ریالی آن از سمت فروشنده ارایه نشود یورو به حساب خریدار واریز نمی شود.\nشما می توانید در هر لحظه استعلام قیمت ارز را در این ربات انجام دهید\nاعتماد شرط اول این خدمات است و امیدواریم بتوانیم تسهیلگر معاملات جامعه ایرانی باشیم، هزینه این تراکنش ها ۲.۵ درصد از مبلغ معامله شده است که از هریک از طرفین  کسر می گردد. \nباتشکر\nتیم تبدیل یار",
	startMessage:
		"سلام {0} 👋\n\nبه ربات تبدیل یار خوش آمدید! این ربات به شما این امکان را می‌دهد تا\n- فروش یورو \n- خرید یورو انجام دهید\n\nچه عملیاتی میخواهید انجام دهید؟",
	startMessageOption1: "خرید یورو",
	startMessageOption2: "فروش یورو",
	startMessageOption3: "بررسی نرخ لحظه ای ارز",
	startMessageOption4: "درباره ما",
	exchangeRateMessage:
		"نرخ لحظه ای ارز:\n\n*۱ یورو \\= {0} ریال*\n*۱ ریال \\= {1} یورو*",
	rialToEuroSelectedMessage:
		"برای خرید ریال شما نیاز به فروشنده ای دارید.\n\nفروشنده یک کد دریافت کرده است. لطفاً کد ارسالی را از او درخواست نمایید و آن را وارد کنید تا صحت معامله تضمین شود.",
	euroToRialSelectedMessage:
		"لطفا مقدار یورویی را که تمایل به فروش دارید را در زیر بصورت عددی وارد نمایید.",
	inputAmount: {
		amountInvalid: "مقدار نامعتبر است",
		amountTooLow: "حداقل میزان برای انجام تراکنش 10 یورو می باشد."
	},
	bankAccountInvalid: "اطلاعات حساب بانکی شما نامعتبر است.",
	inputEuroUserBankAccountDetailsMessage:
		"لطفاً شماره کارت بانکی ایرانی خود را که می‌خواهید ریال به آن ارسال شود را وارد کنید.",
	inputEuroUserBankAccountDetailsSuccessMessage:
		"خوب، ما یک کد شریک برای شما ایجاد کردیم\\. لطفاً این کد را به شریک خود ارسال کنید تا بتوانیم شما را به یکدیگر متصل کنیم\\.\n\n`{0}`\n\nهنگامی که شریک شما با استفاده از کد شما ارتباط برقرار کند، پیامی با مرحله بعدی دریافت خواهید کرد\\.",
	inputRialUserTargetBankAccountDetailsSuccessMessage:
		"متشکریم! لطفاً اکنون شماره کارت حساب بانکی ایرانی خود را که با قصد واریز معادل ریالی را بحساب فروشنده دارید را جهت نمایش به فروشنده وتایید واریزی توسط او وارد کنید.",
	inputRialUserOriginBankAccountDetailsSuccessMessage:
		"با تشکر! شما پیامی دریافت خواهید کرد که پول به حساب بانکی شما ارسال می‌شود.",
	inputRialUserOriginBankAccountDetailsPartnerMessage:
		"خریدار شما با موفقیت با استفاده از کد شما به سامانه متصل شده است\\!\n\nاکنون لطفاً `{0}` یورو به حساب PayPal زیر ارسال کنید\\.\n*مهم*: حتماً کد شریک را در معامله ارسال کنید تا بدانیم پول متعلق به شماست\\.\n\nپیامی درباره مرحله بعدی پس از دریافت پول ارسال خواهیم کرد\\.\n\n[paypal\\.me/tabdilyar](https://paypal.me/tabdilyar/{0}EUR)",
	inputPartnerCodeNoPartnerFoundMessage:
		"فروشنده ای با این کد پیدا نشد. لطفاً کد دیگری وارد کنید یا دوباره با استفاده از /start شروع کنید.",
	inputPartnerCodeSuccessMessage:
		"شما با موفقیت به خریدار متصل شدید!\n\nاکنون لطفاً حساب پی پالی را که می‌خواهید پول به آن ارسال شود وارد کنید.",
	moneyReceivedConfirmSuccessMessage:
		"با تشکر از تأیید شما! اکنون معادل یورویی به خریدار ارسال خواهد گردید.\n\nتراکنش با موفقیت به پایان رسید، شما نیازی به انجام کار دیگری ندارید. اگر می‌خواهید دوباره از این ربات استفاده کنید، /start را تایپ کنید.",
	moneyReceivedInputAmountMessage:
		"لطفاً مقدار ریالی که دریافت کرده‌اید را وارد کنید.",
	moneyReceivedInputAmountConfirmationMessage:
		"آیا مبلغ *{0}* ریال دریافت کرده‌اید؟ لطفاً از صحیح بودن مبلغ اطمینان حاصل کنید\\.\n\nاگر مبلغ واریزی صحیح است، لطفاً `تایید` را در چت ارسال کنید\\. در غیر این صورت، لطفاً مبلغ واریزی توسط خریدار را وارد کنید\\.",
	moneyReceivedConfirmPartnerMessage:
		"فروشنده تأیید کرده است که معادل ریالی را دریافت کرده است\\. حساب پی پال شما طی چند روز آینده *{0} یورو* دریافت خواهد کرد\\.\n\nاین تراکنش با موفقیت به پایان رسید\\. از همراهی شما متشکریم\\! اگر می‌خواهید یک معامله جدید را شروع کنید، /start را تایپ کنید\\.",
	moneyReceivedIncorrectInputMessage:
		"ورودی نادرست است، لطفاً دوباره تلاش کنید.",
	moneyReceivedSendRemainingAmountMessage:
		"از تأیید مبلغ متشکریم\\! به خریدار اطلاع خواهیم داد که مبلغ *{0} ریال* باقیمانده را ارسال کند، لطفاً حساب بانکی خود را به‌طور منظم بررسی کنید و زمانی که بانک ایرانی شما پول را دریافت کرد، با کلیک بر روی دکمه زیر به ما اطلاع دهید\\.\n\nشما پول را از حساب بانکی زیر دریافت خواهید کرد:\n*{1}*",
	moneyReceivedSendRemainingAmountPartnerMessage:
		"سلام 👋 به نظر می‌رسد که مبلغ صحیحی را به حساب بانکی فروشنده واریز نکرده‌اید\\. لطفاً مبلغ *{0}* ریال باقیمانده را به حساب بانکی زیر واریز کنید\\. هنگامی که این کار را انجام دادید و فروشنده واریز مبلغ باقیمانده توسط شما را تأیید کرد، ما *{1} €* را به حساب پی پال شما ارسال خواهیم کرد\\.\n\n`{2}`",
	adminStartMessage:
		"دستورات مدیر موجود:\n/admin\n/adminEuroReceived\n/adminEuroReceivedIncorrectAmount",
	adminEuroReceivedMessage: "کد شریک را برای ارسال پیام دریافت پول وارد کنید.",
	noPartnerFoundMessage: "شریکی پیدا نشد، لطفاً دوباره تلاش کنید.",
	partnerUpdatedMessage: "شریک با موفقیت به‌روزرسانی شد!",
	adminEuroReceivedEuroPartnerMessage:
		"با تشکر، ما مبلغ *{0} یورو* دریافت کرده ایم\\!\n\nدر قدم بعدی، خریدار مبلغ *{1} ریال* را به حساب بانک ایرانی شما ارسال خواهد کرد\\. لطفاً حساب بانکی خود را به‌طور منظم بررسی کنید و به محض اطمینان از دریافت معادل ریالی، دکمه زیر را بفشارید\\.",
	adminEuroReceivedEuroPartnerMessageMoneyReceived: "پول دریافت شد",
	adminEuroReceivedRialPartnerMessage:
		"سلام 👋 فروشنده مبلغ موردنظر را برای ما ارسال کرده است\\. در قدم بعدی، لطفاً `{0}` ریال به حساب بانکی زیر ارسال کنید\\. هنگامی که این کار را انجام دادید و شریک شما تأیید کرد که پول را دریافت کرده است، *{1} یورو* را به حساب پی پال شما ارسال خواهیم کرد\\.\n\n`{2}`",
	unexpectedErrorMessage:
		"خطای غیرمنتظره‌ای رخ داده است، لطفاً دوباره تلاش کنید",
	adminEuroReceivedIncorrectAmountMessage: "کد شریک معامله را وارد کنید.",
	adminEuroReceivedIncorrectAmountInputPartnerCodeMessage:
		"مقدار یورویی که ارسال شده است را وارد کنید.",
	adminEuroReceivedIncorrectAmountInputAmountTooMuchMessage:
		"مقدار {0} بیشتر از مقدار موردانتظار است. لطفاً مبلغ اضافی را به کاربر بازگردانید.",
	adminEuroReceivedIncorrectAmountInputAmountExpectedAmountMessage:
		"مقدار با مقدار موردانتظار یکسان است.",
	adminEuroReceivedIncorrectAmountPartnerMessage:
		"با تشکر، ما مبلغ *{0} یورو* دریافت کردیم\\!\n\nبرای تطبیق مقدار *{1} یورو*، باید باقیمانده `{2}` یورو را ارسال کنید تا معامله ادامه یابد\\. فراموش نکنید که کد شریک را دوباره در معامله ارسال کنید\\.\n\n[paypal\\.me/tabdilyar](https://paypal.me/tabdilyar/{2}EUR)",
	adminEuroReceivedIncorrectAmountSuccessMessage:
		"پیام برای ارسال مبلغ باقی‌مانده با موفقیت ارسال شد!"
}
