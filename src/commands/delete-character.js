'use babel';
'use strict';

import database from '../database/characters';
import sendDisambiguationMessage from '../util/disambiguation';

export default class DeleteCharacterCommand {
	static get information() {
		return {
			label: 'deletecharacter',
			aliases: ['removecharacter', 'delchar', 'rmchar'],
			description: 'Deletes a character from the database.',
			usage: '!deletecharacter <name>',
			details: 'The name can be the whole name of the character, or just a part of it. Only the owner of the character and users with the "manage messages" permission may delete it.',
			examples: ['!deletecharacter Billy McBillface', '!deletecharacter bill']
		};
	}

	static get triggers() {
		return [
			/^!(?:deletecharacter|removecharacter|delchar|rmchar)\s+"?(.+?)"?\s*$/i,
		];
	}

	static isRunnable(message) {
		return !!message.server;
	}

	static run(message, matches) {
		const characters = database.findCharactersInServer(message.server, matches[1]);
		if(characters.length === 1) {
			const permissionOverride = database.userCanModerateInServer(message.server, message.author);
			if(database.deleteCharacter(characters[0], permissionOverride)) {
				message.client.reply(message, 'Deleted character "' + characters[0].name + '".');
			} else {
				message.client.reply(message, 'Unable to delete character "' + characters[0].name + '". You are not the owner.');
			}
		} else if(characters.length > 1) {
			sendDisambiguationMessage(message, 'characters', characters);
		} else {
			message.client.reply(message, 'Unable to find character "' + matches[1] + '". Use !characters to see the list of characters.');
		}
	}
}
