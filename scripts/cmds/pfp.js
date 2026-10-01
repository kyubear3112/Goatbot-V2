const { findUid, getStreamFromURL } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
	config: {
		name: "pfp",
		aliases: ["profile", "pp", "cover"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 0,
		description: {
			en: "View the HD profile picture and cover photo of a user"
		},
		category: "info",
		guide: {
			en: "   {pn}: view your own profile picture and cover photo"
				+ "\n   {pn} @tag: view the tagged user's profile picture and cover photo"
				+ "\n   {pn} <profile link>: view from a profile link"
				+ "\n   {pn} <uid>: view by user id"
				+ "\n   Reply to someone's message with the command to view theirs"
		}
	},

	onStart: async function ({ message, event, args, api }) {
		await react(api, event, "⏳");
		try {
			let uid = event.senderID;
			if (event.messageReply)
				uid = event.messageReply.senderID;
			else if (args[0] && regExCheckURL.test(args[0]))
				uid = await findUid(args[0]);
			else if (Object.keys(event.mentions || {}).length)
				uid = Object.keys(event.mentions)[0];
			else if (args[0] && /^\d+$/.test(args[0]))
				uid = args[0];

			const info = await api.getUserInfo(uid);
			const user = info[uid];
			if (!user || !user.profilePictureHd)
				throw new Error("no profile picture found");

			const attachment = [await getStreamFromURL(user.profilePictureHd)];
			if (user.coverPhoto)
				attachment.push(await getStreamFromURL(user.coverPhoto));

			await message.reply({
				body: user.name || uid,
				attachment
			});
			await react(api, event, "✅");
		}
		catch (e) {
			await react(api, event, "❌");
		}
	}
};

async function react(api, event, emoji) {
	try {
		await api.setMessageReaction(emoji, event.messageID, event.threadID);
	}
	catch (e) { }
}
