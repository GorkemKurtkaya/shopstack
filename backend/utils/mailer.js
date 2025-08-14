import nodemailer from 'nodemailer';

const createTransport = () => {
	if (process.env.EMAIL && process.env.PASSWORD) {
		// Basit e-posta/şifre (ör. Gmail uygulama şifresi) ile gönderim
		return nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASSWORD,
			},
		});
	}
	// EMAIL/PASSWORD yoksa: Development console transport
	return {
		sendMail: async (options) => {
			const { to, subject, text, html } = options;
			console.log("[MAIL] Dev Console Transport etkin");
			console.log("[MAIL] To:", to);
			console.log("[MAIL] Subject:", subject);
			if (text) console.log("[MAIL] Text:", text);
			if (html) console.log("[MAIL] HTML:", html);
			return { messageId: `dev-${Date.now()}` };
		},
	};
};

const transporter = createTransport();

export const sendEmail = async ({ to, subject, text, html }) => {
	return transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.EMAIL || 'no-reply@shopstack.local',
		to,
		subject,
		text,
		html,
	});
};
