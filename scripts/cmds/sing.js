const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "sing",
		aliases: ["song", "music"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 0,
		description: {
			en: "Search a song and send it"
		},
		category: "media",
		guide: {
			en: "   {pn} <song name>: search and send the first matching song"
				+ "\n   {pn} <song name> -c <number>: return that many results, reply with a number to pick one"
		}
	},

	onStart: async function ({ message, event, args, api }) {
		await react(api, event, "⏳");
		try {
			const { query, count } = parseArgs(args);
			if (!query)
				throw new Error("no query");

			const { tracks } = await api.searchMusic(query, { limit: count });
			if (!tracks.length) {
				await react(api, event, "❌");
				return;
			}

			const list = tracks.map((t, i) => `${i + 1}. ${t.title} — ${t.artist} (${formatDuration(t.durationMs)})`).join("\n");
			const thumbnails = await Promise.all(tracks.filter(t => t.image).map(t => getStreamFromURL(t.image)));

			const sent = await message.reply({
				body: list,
				attachment: thumbnails
			});
			global.GoatBot.onReply.set(sent.messageID, {
				commandName: this.config.name,
				messageID: sent.messageID,
				author: event.senderID,
				result: tracks
			});
			await react(api, event, "✅");
		}
		catch (e) {
			await react(api, event, "❌");
		}
	},

	onReply: async function ({ message, event, api, Reply }) {
		const choice = parseInt(event.body);
		if (isNaN(choice) || choice < 1 || choice > Reply.result.length) {
			api.unsendMessage(Reply.messageID);
			return;
		}
		await react(api, event, "⏳");
		try {
			const track = Reply.result[choice - 1];
			api.unsendMessage(Reply.messageID);
			await message.reply({
				body: `${track.title} — ${track.artist}`,
				attachment: await getStreamFromURL(track.previewUrl, `${track.id}.m4a`)
			});
			await react(api, event, "✅");
		}
		catch (e) {
			await react(api, event, "❌");
		}
	}
};

function parseArgs(args) {
	let count = 6;
	const words = [];
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "-c" || arg === "--count") {
			const value = parseInt(args[i + 1]);
			if (value > 0) count = Math.min(value, 20);
			i++;
		}
		else if (/^-c\d+$/.test(arg)) {
			const value = parseInt(arg.slice(2));
			if (value > 0) count = Math.min(value, 20);
		}
		else
			words.push(arg);
	}
	return { query: words.join(" ").trim(), count };
}

function formatDuration(ms) {
	const total = Math.round((ms || 0) / 1000);
	const minutes = Math.floor(total / 60);
	const seconds = String(total % 60).padStart(2, "0");
	return `${minutes}:${seconds}`;
}

async function react(api, event, emoji) {
	try {
		await api.setMessageReaction(emoji, event.messageID, event.threadID);
	}
	catch (e) { }
}
