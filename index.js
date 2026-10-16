require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ChannelType, 
    PermissionsBitField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags,
    AttachmentBuilder,
    ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// ==========================================
// CONFIGURATION À MODIFIER SELON TON SERVEUR
// ==========================================
const STAFF_ROLE_ID = '1555953788249186437'; 
const MEMBER_ROLE_ID = '1555965378965012490'; 
const TICKET_CATEGORY_ID = '1559370830033719317';
const LOGS_CHANNEL_ID = '1559381144540020767';
const SUSPECT_PING_ROLE_ID = '1555953788249186437'; 
const GAME_SERVER_ID = 'bf3f06f5-6f4f-4b06-8cac-70bb1a558103'; 

client.once('clientReady', () => {
    console.log("✅ Le bot est en ligne ! Connecté en tant que : " + client.user.tag);

    client.user.setPresence({
        activities: [{
            name: 'Joue à Wardogs', 
            type: ActivityType.Playing, 
        }],
        status: 'online', 
    });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // ==========================================
    // 1. MODULE D'EMBEDS PERSONNALISÉS (!embed)
    // ==========================================
    if (message.content.startsWith('!embed')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: "❌ Tu n'as pas les permissions pour utiliser cette commande." });
        }

        const args = message.content.slice(6).trim().split('|');
        
        if (args.length < 2) {
            return message.reply({ 
                content: '❌ Utilisation incorrecte !\nFormat attendu : `!embed Titre de l\'annonce | Description de l\'annonce | #HEXCOLOR (optionnel)`'
            });
        }

        const title = args[0].trim();
        const description = args[1].trim();
        const colorInput = args[2] ? args[2].trim() : '#5865F2';

        const colorNumber = parseInt(colorInput.replace('#', ''), 16);

        const customEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description.replace(/\\n/g, '\n'))
            .setColor(isNaN(colorNumber) ? 0x5865F2 : colorNumber)
            .setTimestamp()
            .setFooter({ text: 'Annonce postée par ' + message.author.tag, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [customEmbed] });
        message.delete().catch(() => {});
    }

    // ==========================================
    // 2. COMMANDE SETUP DU RÈGLEMENT (!setup-rules)
    // ==========================================
    if (message.content === '!setup-rules') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: "❌ Tu n'as pas les permissions pour envoyer le règlement." });
        }

        const imageEmbed = new EmbedBuilder()
            .setImage('https://image.noelshack.com/fichiers/2026/42/3/1791980704-wdf-regles.jpg')
            .setColor(0x2F3136);

        const welcomeEmbed = new EmbedBuilder()
            .setTitle('👋 Règlement du Discord')
            .setDescription(
                "Bienvenue sur notre serveur Discord ! Merci de respecter les règles de communauté suivantes :\n\n" +
                "**1. Respect & Courtoisie**\n" +
                "Le respect mutuel est obligatoire. Aucune insulte, propos haineux, raciste, sexiste ou discriminatoire ne sera toléré.\n\n" +
                "**2. Pas de Spam ni de Publicité**\n" +
                "Le spam, le flood et la publicité non autorisée (en MP ou dans les salons) sont strictement interdits.\n\n" +
                "**3. Pseudo & Photo de profil**\n" +
                "Merci d'avoir un pseudo et une photo de profil appropriés et lisibles.\n\n" +
                "**4. Respect des salons**\n" +
                "Merci d'utiliser les salons textuels et vocaux appropriés selon votre besoin.\n\n" +
                "**5. Support via tickets**\n" +
                "Un système de ticket est présent sur le discord."
            )
            .setColor("#02ba0b");

        const rulesEmbed = new EmbedBuilder()
            .setTitle('📜 Règlement du Serveur')
            .setDescription(
                "Voici les règles spécifiques à la communauté / team Wardogs :\n\n" +
                "**1. Fair-play & Esprit d'équipe**\n" +
                "Le respect des coéquipiers et des adversaires est primordial lors de toutes vos sessions de jeu.\n\n" +
                "**2. Présence & Engagement**\n" +
                "Honorez vos engagements lors des événements ou matchs planifiés.\n\n" +
                "**3. Représentation**\n" +
                "Gardez une attitude irréprochable en jeu lorsque vous portez nos couleurs.\n\n" +
                "**4. Ci-dessous, les actions INTERDITES sur le serveur**\n" +
                "✗ Team Kill volontaire INTERDIT\n\n " +
                "✗ Vol alliés INTERDIT (Sauf kit de réanimation)\n\n" +
                "✗ Revive d'un ennemi INTERDIT (Freekill gratuit)\n\n" +
                "✗ Foncer volontairement dans un hélicoptère ennemie INTERDIT (Suicide)\n\n" +
                "✗ Lance grenade en hélicoptère INTERDIT\n\n" +
                "✗ Utilisation des véhicules armés Kodiak, Humvee, Ural Defender INTERDIT\n\n" +
                "✗ Cheat, optimisations supplémentaire, use glith INTERDIT\n\n" +
                "─────────────\n\n" +
                "En cliquant sur le bouton ci-dessous, vous acceptez l'intégralité du règlement (Discord & Wardogs) et débloquez l'accès au serveur."
            )
            .setColor("#02ba0b")
            .setTimestamp();

        const acceptBtn = new ButtonBuilder()
            .setCustomId('accept_rules')
            .setLabel('Accepter le règlement')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(acceptBtn);

        await message.channel.send({ embeds: [imageEmbed, welcomeEmbed, rulesEmbed], components: [row] });
        message.delete().catch(() => {});
    }

    // ==========================================
    // 3. COMMANDE SETUP DES TICKETS (!setup-ticket)
    // ==========================================
    if (message.content === '!setup-ticket') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: "❌ Tu n'as pas les permissions pour configurer les tickets." });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 Centre de Support')
            .setDescription('Sélectionnez la catégorie qui correspond à votre demande dans le menu ci-dessous pour ouvrir un ticket.')
            .setColor(0x5865F2)
            .setImage('https://image.noelshack.com/fichiers/2026/42/3/1791980704-wdf-regles.jpg');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Choisissez la raison de votre ticket...')
            .addOptions([
                {
                    label: 'Support Technique',
                    description: 'Un problème technique ou un bug',
                    value: 'tech',
                    emoji: '🔧',
                },
                {
                    label: 'Question / Information',
                    description: 'Une question générale',
                    value: 'info',
                    emoji: '❓',
                },
                {
                    label: 'Signalement',
                    description: 'Signaler un comportement ou un problème',
                    value: 'report',
                    emoji: '🛡️',
                },
                {
                    label: 'Demande de déban',
                    description: 'Faire une demande de débannissement du serveur',
                    value: 'unban',
                    emoji: '❗',
                },
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }

    // ==========================================
    // 4. COMMANDE SETUP DES SANCTIONS (!setup-sanction)
    // ==========================================
    if (message.content === '!setup-sanction') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: "❌ Tu n'as pas les permissions pour configurer les sanctions." });
        }

        const embed = new EmbedBuilder()
            .setTitle('⚖️ Panel des Sanctions Administratives')
            .setDescription('Cliquez sur le bouton ci-dessous pour enregistrer une nouvelle sanction administrative.')
            .setColor(0xED4245)
            .setTimestamp();

        const sanctionBtn = new ButtonBuilder()
            .setCustomId('open_sanction_modal')
            .setLabel('Ajouter une sanction')
            .setEmoji('➕')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(sanctionBtn);

        await message.channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }

    // ==========================================
    // 5. COMMANDE SETUP DU SUIVI DES SUSPECTS (!setup-suspect)
    // ==========================================
    if (message.content === '!setup-suspect') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: "❌ Tu n'as pas les permissions pour configurer le panneau de surveillance des suspects." });
        }

        const embed = new EmbedBuilder()
            .setTitle('🚨 Panel de Surveillance - Joueurs Suspects')
            .setDescription('Cliquez sur le bouton ci-dessous pour signaler et enregistrer un nouveau joueur suspect.')
            .setColor(0xF1C40F)
            .setTimestamp();

        const suspectBtn = new ButtonBuilder()
            .setCustomId('open_suspect_modal')
            .setLabel('Signaler un suspect')
            .setEmoji('🚨')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(suspectBtn);

        await message.channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }

    // ==========================================
    // 6. COMMANDE ID DU SERVEUR DE JEU (!status-jeu)
    // ==========================================
    if (message.content === '!status-jeu') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: "❌ Tu n'as pas les permissions pour utiliser cette commande." });
        }

        const serverEmbed = new EmbedBuilder()
            .setTitle('🖥️ Serveur de Jeu - Wardogs')
            .setColor(0x5865F2)
            .setDescription("Voici l'ID de notre serveur de jeu. Tu peux le copier-coller pour le retrouver facilement :")
            .addFields(
                { name: '🆔 ID du Serveur', value: '```' + GAME_SERVER_ID + '```', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Demandé par ' + message.author.tag, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [serverEmbed] });
        message.delete().catch(() => {});
    }

    // ==========================================
    // 7. COMMANDE ÉTAT DU SERVEUR DE JEU (!etat-serveur / !état-serveur)
    // ==========================================
    const lowerContent = message.content.toLowerCase().trim();
    if (lowerContent.startsWith('!etat-serveur') || lowerContent.startsWith('!état-serveur')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: "❌ Tu n'as pas les permissions pour utiliser cette commande." });
        }

        const parts = lowerContent.split(/\s+/);
        const statusArg = parts[1];

        if (statusArg !== 'ouvert' && statusArg !== 'ferme' && statusArg !== 'fermé') {
            return message.reply({ 
                content: '❌ Utilisation incorrecte !\nFormat attendu : `!etat-serveur ouvert` ou `!etat-serveur ferme`'
            });
        }

        const isOpen = statusArg === 'ouvert';

        const etatEmbed = new EmbedBuilder()
            .setTitle('🖥️ Statut du Serveur de Jeu - Wardogs')
            .setColor(isOpen ? 0x57F287 : 0xED4245)
            .setDescription(isOpen 
                ? "🟢 **Le serveur de jeu est actuellement OUVERT ! Vous pouvez rejoindre la session.**" 
                : "🔴 **Le serveur de jeu est actuellement FERMÉ / MAINTENANCE.**"
            )
            .addFields(
                { name: '🆔 ID du Serveur', value: '```' + GAME_SERVER_ID + '```', inline: false },
                { name: '📌 État', value: isOpen ? '🟢 **OUVERT**' : '🔴 **FERMÉ**', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Mis à jour par ' + message.author.tag, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [etatEmbed] });
        message.delete().catch(() => {});
    }
});

// ==========================================
// 8. GESTION DES INTERACTIONS
// ==========================================
client.on('interactionCreate', async (interaction) => {

    // A. Clic sur le bouton "Signaler un suspect" -> Ouverture du Modal
    if (interaction.isButton() && interaction.customId === 'open_suspect_modal') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ 
                content: "❌ Seuls les administrateurs peuvent signaler des suspects.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_suspect_submit')
            .setTitle('Dossier de Surveillance - Suspect');

        const playerInput = new TextInputBuilder()
            .setCustomId('suspect_player_name')
            .setLabel('Nom / Pseudo du joueur :')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: PseudoEnJeu')
            .setRequired(true);

        const steamInput = new TextInputBuilder()
            .setCustomId('suspect_steam_id')
            .setLabel('ID Steam :')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 76561198xxxxxxxxx')
            .setRequired(true);

        const reasonInput = new TextInputBuilder()
            .setCustomId('suspect_reason')
            .setLabel('Raison / Détails du comportement :')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: Beaucoup de kills suspects, déplacements étranges...')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(playerInput),
            new ActionRowBuilder().addComponents(steamInput),
            new ActionRowBuilder().addComponents(reasonInput)
        );

        await interaction.showModal(modal);
    }

    // B. Soumission du Modal Suspect -> Envoi du dossier récapitulatif avec ping du rôle
    if (interaction.isModalSubmit() && interaction.customId === 'modal_suspect_submit') {
        const playerName = interaction.fields.getTextInputValue('suspect_player_name');
        const steamId = interaction.fields.getTextInputValue('suspect_steam_id');
        const reason = interaction.fields.getTextInputValue('suspect_reason');

        const suspectEmbed = new EmbedBuilder()
            .setTitle('🚨 Dossier de Surveillance - Suspect')
            .setColor(0xF1C40F)
            .addFields(
                { name: '👤 Joueur', value: '`' + playerName + '`', inline: true },
                { name: '🆔 ID Steam', value: '`' + steamId + '`', inline: true },
                { name: '📝 Raison / Détails', value: '```\n' + reason + '\n```', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Signalé par ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        const rolePing = SUSPECT_PING_ROLE_ID ? '<@&' + SUSPECT_PING_ROLE_ID + '>' : '';
        const messageContentText = rolePing + ' - Nouveau joueur suspect signalé par <@' + interaction.user.id + '> :';

        await interaction.channel.send({ 
            content: messageContentText, 
            embeds: [suspectEmbed],
            allowedMentions: { roles: [SUSPECT_PING_ROLE_ID] }
        });

        await interaction.reply({
            content: '✅ Joueur enregistré en dossier de surveillance avec succès !',
            flags: MessageFlags.Ephemeral
        });
    }

    // C. Clic sur le bouton "Ajouter une sanction" -> Ouverture du Modal
    if (interaction.isButton() && interaction.customId === 'open_sanction_modal') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ 
                content: "❌ Seuls les administrateurs peuvent ajouter des sanctions.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_sanction_submit')
            .setTitle('Enregistrer une sanction');

        const playerInput = new TextInputBuilder()
            .setCustomId('sanction_player_name')
            .setLabel('Nom / Pseudo du joueur :')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: NomEnJeu')
            .setRequired(true);

        const steamInput = new TextInputBuilder()
            .setCustomId('sanction_steam_id')
            .setLabel('ID Steam :')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 76561198xxxxxxxxx')
            .setRequired(true);

        const bannedInput = new TextInputBuilder()
            .setCustomId('sanction_is_banned')
            .setLabel('Banni du serveur (Oui / Non) :')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Indiquez Oui ou Non')
            .setRequired(true);

        const reasonInput = new TextInputBuilder()
            .setCustomId('sanction_reason')
            .setLabel('Raison de la sanction :')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Détaillez le motif de la sanction...')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(playerInput),
            new ActionRowBuilder().addComponents(steamInput),
            new ActionRowBuilder().addComponents(bannedInput),
            new ActionRowBuilder().addComponents(reasonInput)
        );

        await interaction.showModal(modal);
    }

    // D. Soumission du Modal Sanction -> Envoi du récapitulatif avec notification des admins (PING)
    if (interaction.isModalSubmit() && interaction.customId === 'modal_sanction_submit') {
        const playerName = interaction.fields.getTextInputValue('sanction_player_name');
        const steamId = interaction.fields.getTextInputValue('sanction_steam_id');
        const isBanned = interaction.fields.getTextInputValue('sanction_is_banned');
        const reason = interaction.fields.getTextInputValue('sanction_reason');

        const sanctionEmbed = new EmbedBuilder()
            .setTitle('⚖️ Registre des Sanctions - Wardogs')
            .setColor(0xED4245)
            .addFields(
                { name: '👤 Joueur', value: '`' + playerName + '`', inline: true },
                { name: '🆔 ID Steam', value: '`' + steamId + '`', inline: true },
                { name: '🚫 Banni du Serveur', value: '`' + isBanned + '`', inline: false },
                { name: '📝 Raison de la Sanction', value: '```\n' + reason + '\n```', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Sanction enregistrée par ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        const staffPing = STAFF_ROLE_ID ? '<@&' + STAFF_ROLE_ID + '>' : '';
        const messageContentText = staffPing + ' - Nouvelle sanction enregistrée par <@' + interaction.user.id + '> :';

        await interaction.channel.send({ 
            content: messageContentText, 
            embeds: [sanctionEmbed],
            allowedMentions: { roles: [STAFF_ROLE_ID] }
        });

        await interaction.reply({
            content: '✅ Sanction enregistrée avec succès !',
            flags: MessageFlags.Ephemeral
        });
    }

    // E. Validation du règlement via bouton (Auto-rôle + MP)
    if (interaction.isButton() && interaction.customId === 'accept_rules') {
        const role = interaction.guild.roles.cache.get(MEMBER_ROLE_ID);
        if (!role) {
            return interaction.reply({ 
                content: "❌ Impossible de trouver le rôle spécifié sur le serveur.", 
                flags: MessageFlags.Ephemeral 
            });
        }

        if (interaction.member.roles.cache.has(MEMBER_ROLE_ID)) {
            return interaction.reply({ 
                content: "ℹ️ Tu as déjà accepté le règlement !", 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            await interaction.member.roles.add(role);

            await interaction.reply({ 
                content: "✅ Merci d'avoir accepté le règlement ! Tu as désormais accès au serveur.", 
                flags: MessageFlags.Ephemeral 
            });

            try {
                await interaction.user.send(
                    '🎉 **Bienvenue sur ' + interaction.guild.name + ' !**\n\n' +
                    'Ton rôle **' + role.name + '** t\'a été attribué avec succès suite à la validation du règlement.\n' +
                    'Tu as désormais accès à l\'intégralité des salons textuels et vocaux du serveur. Bon jeu à toi !'
                );
            } catch (dmError) {
                console.log("⚠️ Impossible d'envoyer un MP à " + interaction.user.tag + " (MP désactivés).");
            }

        } catch (error) {
            console.error("Erreur lors de l'ajout du rôle :", error);
            await interaction.reply({ 
                content: "❌ Une erreur est survenue lors de l'attribution du rôle. Vérifie que le rôle du Bot est au-dessus du rôle à attribuer dans la hiérarchie Discord.", 
                flags: MessageFlags.Ephemeral 
            });
        }
    }

    // F. Sélection dans le menu déroulant des tickets -> Ouverture du Modal
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        const category = interaction.values[0];

        if (category === 'report') {
            const modal = new ModalBuilder()
                .setCustomId('ticket_modal_report')
                .setTitle('Formulaire de Signalement');

            const accusedInput = new TextInputBuilder()
                .setCustomId('accused_user')
                .setLabel('Pseudo de la personne accusée :')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ex: PseudoDiscord#0000')
                .setRequired(true);

            const reasonInput = new TextInputBuilder()
                .setCustomId('ticket_reason')
                .setLabel('Détails du signalement :')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Expliquez ce qui s\'est passé...')
                .setRequired(true);

            const proofInput = new TextInputBuilder()
                .setCustomId('proof_video')
                .setLabel('Preuve vidéo (Oui / Non / Lien) :')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Indiquez Oui, Non ou collez un lien vidéo')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(accusedInput),
                new ActionRowBuilder().addComponents(reasonInput),
                new ActionRowBuilder().addComponents(proofInput)
            );

            await interaction.showModal(modal);
        } else if (category === 'unban') {
            const modal = new ModalBuilder()
                .setCustomId('ticket_modal_unban')
                .setTitle('Formulaire de Demande de Déban');

            const pseudoIgInput = new TextInputBuilder()
                .setCustomId('pseudo_ig')
                .setLabel('Pseudo IG (En jeu) :')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Votre pseudo exact dans le jeu')
                .setRequired(true);

            const steamIdInput = new TextInputBuilder()
                .setCustomId('steam_id')
                .setLabel('ID Steam :')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ex: 76561198xxxxxxxxx')
                .setRequired(true);

            const reasonInput = new TextInputBuilder()
                .setCustomId('ticket_reason')
                .setLabel('Raison / Explications :')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Pourquoi souhaitez-vous être débanni ? Expliquez votre situation...')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(pseudoIgInput),
                new ActionRowBuilder().addComponents(steamIdInput),
                new ActionRowBuilder().addComponents(reasonInput)
            );

            await interaction.showModal(modal);
        } else {
            const modal = new ModalBuilder()
                .setCustomId('ticket_modal_' + category)
                .setTitle('Ouverture d\'un ticket');

            const reasonInput = new TextInputBuilder()
                .setCustomId('ticket_reason')
                .setLabel('Expliquez votre demande en détail :')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Écrivez votre message ici...')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

            await interaction.showModal(modal);
        }
    }

    // G. Soumission du Modal -> Création effective du salon privé
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
        const category = interaction.customId.replace('ticket_modal_', '');
        const reason = interaction.fields.getTextInputValue('ticket_reason');
        
        let accused = null;
        let proofVideo = null;
        let pseudoIg = null;
        let steamId = null;

        if (category === 'report') {
            try {
                accused = interaction.fields.getTextInputValue('accused_user');
                proofVideo = interaction.fields.getTextInputValue('proof_video');
            } catch (e) {
                accused = 'Non renseigné';
                proofVideo = 'Non renseigné';
            }
        } else if (category === 'unban') {
            try {
                pseudoIg = interaction.fields.getTextInputValue('pseudo_ig');
                steamId = interaction.fields.getTextInputValue('steam_id');
            } catch (e) {
                pseudoIg = 'Non renseigné';
                steamId = 'Non renseigné';
            }
        }

        const guild = interaction.guild;
        const user = interaction.user;
        const channelName = ('ticket-' + category + '-' + user.username).toLowerCase();

        const existingChannel = guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) {
            return interaction.reply({ 
                content: '⚠️ Tu as déjà un ticket ouvert : ' + existingChannel, 
                flags: MessageFlags.Ephemeral 
            });
        }

        const permissionOverwrites = [
            {
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                ],
            },
        ];

        if (STAFF_ROLE_ID && STAFF_ROLE_ID.trim() !== '') {
            const staffRoleObj = guild.roles.cache.get(STAFF_ROLE_ID.trim());
            if (staffRoleObj) {
                permissionOverwrites.push({
                    id: staffRoleObj.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                });
            }
        }

        const channelOptions = {
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: permissionOverwrites,
        };

        if (TICKET_CATEGORY_ID && TICKET_CATEGORY_ID.trim() !== '') {
            const categoryObj = guild.channels.cache.get(TICKET_CATEGORY_ID.trim());
            if (categoryObj) {
                channelOptions.parent = categoryObj.id;
            }
        }

        const ticketChannel = await guild.channels.create(channelOptions);

        const ticketEmbed = new EmbedBuilder()
            .setTitle('Ticket : ' + category.toUpperCase())
            .setColor(category === 'report' || category === 'unban' ? 0xED4245 : 0x57F287)
            .setTimestamp();

        if (category === 'report') {
            ticketEmbed.setDescription('Bonjour <@' + user.id + '>, signalement pris en compte.\n\n👤 **Personne signalée :** `' + accused + '`\n📹 **Preuve vidéo :** `' + proofVideo + '`\n\n📝 **Détails :**\n```\n' + reason + '\n```');
        } else if (category === 'unban') {
            ticketEmbed.setDescription('Bonjour <@' + user.id + '>, votre demande de déban a été transmise au staff.\n\n🎮 **Pseudo IG :** `' + pseudoIg + '`\n🆔 **ID Steam :** `' + steamId + '`\n\n📝 **Raison / Explications :**\n```\n' + reason + '\n```');
        } else {
            ticketEmbed.setDescription('Bonjour <@' + user.id + '>, bienvenue dans ton ticket !\n\n**Raison / Message :**\n```\n' + reason + '\n```');
        }

        const closeBtn = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Fermer le ticket')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(closeBtn);
        const staffPing = (STAFF_ROLE_ID && STAFF_ROLE_ID.trim() !== '') ? '<@&' + STAFF_ROLE_ID.trim() + '>' : '';
        
        await ticketChannel.send({ 
            content: '<@' + user.id + '> ' + staffPing, 
            embeds: [ticketEmbed], 
            components: [row] 
        });

        await interaction.reply({
            content: '✅ Ton ticket a été créé avec succès : ' + ticketChannel,
            flags: MessageFlags.Ephemeral
        });
    }

    // H. Fermeture du ticket, génération du transcript, envoi en MP et logs
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 Génération du transcript et fermeture du salon dans 5 secondes...');

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const sortedMessages = Array.from(messages.values()).reverse();

            const firstMessage = sortedMessages.find(m => m.author.bot && m.mentions.users.size > 0);
            const ticketOwner = firstMessage ? firstMessage.mentions.users.first() : null;

            let transcriptText = "=========================================\n";
            transcriptText += "TRANSCRIPTION DE TICKET : " + interaction.channel.name + "\n";
            transcriptText += "Fermé par : " + interaction.user.tag + " (" + interaction.user.id + ")\n";
            transcriptText += "Date de fermeture : " + new Date().toLocaleString("fr-FR") + "\n";
            transcriptText += "=========================================\n\n";

            sortedMessages.forEach(msg => {
                const date = new Date(msg.createdTimestamp).toLocaleString("fr-FR");
                transcriptText += "[" + date + "] " + msg.author.tag + " : " + msg.content + "\n";
            });

            const buffer = Buffer.from(transcriptText, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: 'transcript-' + interaction.channel.name + '.txt' });

            if (ticketOwner) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setTitle("📜 Fermeture de votre ticket")
                        .setDescription("Votre ticket `" + interaction.channel.name + "` sur **" + interaction.guild.name + "** a été fermé.\nVous trouverez ci-joint l'historique complet de vos échanges.")
                        .setColor(0x5865F2)
                        .setTimestamp();

                    await ticketOwner.send({ embeds: [dmEmbed], files: [attachment] });
                } catch (dmErr) {
                    console.log("⚠️ Impossible d'envoyer la transcription en MP à " + ticketOwner.tag + " (MP désactivés).");
                }
            }

            if (LOGS_CHANNEL_ID && LOGS_CHANNEL_ID.trim() !== '') {
                const logsChannel = interaction.guild.channels.cache.get(LOGS_CHANNEL_ID.trim());
                if (logsChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle("📜 Ticket Fermé - Transcript")
                        .setColor(0xED4245)
                        .addFields(
                            { name: "Salon", value: interaction.channel.name, inline: true },
                            { name: "Fermé par", value: "<@" + interaction.user.id + ">", inline: true }
                        )
                        .setTimestamp();

                    await logsChannel.send({ embeds: [logEmbed], files: [attachment] });
                }
            }
        } catch (error) {
            console.error("Erreur lors de la création du transcript :", error);
        }

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    }
});

client.login(process.env.DISCORD_TOKEN);
