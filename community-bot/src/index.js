import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  PermissionFlagsBits,
  REST,
  Routes,
  StringSelectMenuBuilder
} from "discord.js";

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  SUPPORT_ROLE_ID,
  DATA_DIR = "./data"
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env");
}

const dataDir = path.resolve(DATA_DIR);
fs.mkdirSync(dataDir, { recursive: true });
const stateFile = path.join(dataDir, "state.json");
let bannerMap = {};
try { bannerMap = JSON.parse(process.env.BANNERS_JSON || "{}"); }
catch { console.warn("BANNERS_JSON is invalid JSON; using built-in banner settings."); }

function readState() {
  try { return JSON.parse(fs.readFileSync(stateFile, "utf8")); }
  catch { return { panels: {}, categories: {}, channels: {}, roles: {} }; }
}
const state = readState();
function saveState() {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), { mode: 0o600 });
}

const PURPLE = 0x8B5CF6;
const DARK = 0x130D1D;
const roleSpecs = [
  { key: "founder", name: "NYX | Founder", color: 0xC4A3FF, permissions: [] },
  { key: "admin", name: "NYX | Admin", color: 0xA78BFA, permissions: [
    PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ViewAuditLog
  ] },
  { key: "developer", name: "NYX | Developer", color: 0x8B5CF6, permissions: [] },
  { key: "moderator", name: "NYX | Moderator", color: 0x6D5AA8, permissions: [
    PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ViewAuditLog
  ] },
  { key: "support", name: "NYX | Support", color: 0x5B8DEF, permissions: [] },
  { key: "partner", name: "NYX | Partner", color: 0xB18AE8, permissions: [] },
  { key: "member", name: "NYX | Member", color: 0x9B8AAE, permissions: [] },
  { key: "ru", name: "Language | RU", color: 0x8B5CF6, permissions: [] },
  { key: "en", name: "Language | EN", color: 0x8B5CF6, permissions: [] }
];

const structure = [
  { key: "community", name: "NYX COMMUNITY", channels: [
    ["welcome", "WELCOME", "welcome"], ["rules", "RULES", "rules"],
    ["choose-language", "LANGUAGE", "language"], ["server-guide", "SERVER GUIDE", "guide"]
  ]},
  { key: "ecosystem", name: "NYX ECOSYSTEM", channels: [
    ["nyx-projects", "PROJECTS", "projects"], ["announcements", "ANNOUNCEMENTS", "announcements"],
    ["roadmap", "ROADMAP", "roadmap"], ["updates", "UPDATES", "updates"]
  ]},
  { key: "projects", name: "PROJECT SPACES", channels: [
    ["proxy-bridge", "PROXY BRIDGE", "proxy"], ["project-support", "PROJECT SUPPORT", "projectSupport"],
    ["project-feedback", "PROJECT FEEDBACK", "feedback"], ["project-ideas", "PROJECT IDEAS", "ideas"]
  ]},
  { key: "social", name: "COMMUNITY", channels: [
    ["general", "GENERAL", "general"], ["off-topic", "OFF TOPIC", "offtopic"],
    ["showcase", "SHOWCASE", "showcase"], ["suggestions", "SUGGESTIONS", "suggestions"],
    ["polls", "POLLS", "polls"]
  ]},
  { key: "support", name: "SUPPORT & COLLABORATION", channels: [
    ["help-desk", "HELP DESK", "helpdesk"], ["bug-reports", "BUG REPORTS", "bugs"],
    ["partners", "PARTNERS", "partners"], ["collaborations", "COLLABORATIONS", "collaborations"]
  ]}
];

const panelSpecs = {
  welcome: {
    title: "WELCOME TO NYX COMMUNITY",
    description: "🇬🇧 A home for the entire NYX ecosystem: projects, tools, development, ideas and people. Explore, connect and help shape what comes next.\n\n🇷🇺 Добро пожаловать в экосистему NYX: проекты, инструменты, разработка, идеи и люди. Знакомьтесь, общайтесь и помогайте создавать новое.",
    footer: "CONNECT. BUILD. EVOLVE.",
    banner: process.env.BANNER_WELCOME
  },
  rules: {
    title: "COMMUNITY RULES / ПРАВИЛА СООБЩЕСТВА",
    description: "**🇬🇧 English**\n1. Treat everyone with respect.\n2. No spam, scams, harassment or malicious links.\n3. Use channels for their intended topics.\n4. Never publish passwords, tokens or private information.\n5. Do not impersonate NYX staff or distribute fake downloads.\n6. Follow Discord's Terms of Service.\n\n**🇷🇺 Русский**\n1. Уважайте других участников.\n2. Запрещены спам, мошенничество, травля и вредоносные ссылки.\n3. Используйте каналы по назначению.\n4. Не публикуйте пароли, токены и личные данные.\n5. Не выдавайте себя за команду NYX и не распространяйте поддельные загрузки.\n6. Соблюдайте правила Discord.\n\nBy participating, you agree to follow these rules. / Участвуя в сообществе, вы соглашаетесь соблюдать эти правила.",
    footer: "SAFE SPACE · RESPECT EVERYONE",
    banner: process.env.BANNER_RULES,
    buttons: true
  },
  language: {
    title: "CHOOSE YOUR LANGUAGE / ВЫБЕРИТЕ ЯЗЫК",
    description: "Select your preferred language below. You can change it anytime.\nВыберите предпочитаемый язык. Его можно изменить в любой момент.",
    footer: "NYX COMMUNITY · RU / EN",
    select: true
  },
  guide: {
    title: "SERVER GUIDE / НАВИГАЦИЯ",
    description: "**🇬🇧** Start at #welcome, read #rules, choose a language, then explore NYX projects. Use #help-desk for private support.\n\n**🇷🇺** Начните с #welcome, прочитайте #rules, выберите язык и изучайте проекты NYX. Для личной помощи используйте #help-desk.",
    footer: "FIND YOUR WAY AROUND NYX"
  },
  projects: {
    title: "THE NYX ECOSYSTEM",
    description: "**🇬🇧** Discover projects built under the NYX name. Each project has its own space for updates, support and feedback.\n\n**🇷🇺** Здесь собраны проекты экосистемы NYX. Для каждого проекта предусмотрены обновления, поддержка и обратная связь.\n\n**Current project / Текущий проект**\n• **NYX Proxy Bridge** — Windows proxy client.\n\nMore projects will be listed here as they are officially announced. / Новые проекты появятся здесь после официального анонса.",
    footer: "ONE ECOSYSTEM · MANY PROJECTS",
    banner: process.env.BANNER_PROJECTS
  },
  announcements: {
    title: "OFFICIAL ANNOUNCEMENTS",
    description: "🇬🇧 Official news from across the NYX ecosystem will appear here.\n🇷🇺 Здесь публикуются официальные новости всей экосистемы NYX.",
    footer: "ONLY OFFICIAL NYX NEWS",
    banner: process.env.BANNER_ANNOUNCEMENTS
  },
  roadmap: {
    title: "NYX ROADMAP",
    description: "🇬🇧 Follow planned milestones and the direction of the ecosystem. Roadmap items may change as projects evolve.\n🇷🇺 Следите за планами и развитием экосистемы. Этапы могут меняться по мере развития проектов.",
    footer: "PLAN · BUILD · IMPROVE"
  },
  updates: {
    title: "PROJECT UPDATES",
    description: "🇬🇧 Release notes, version updates and important changes from NYX projects.\n🇷🇺 Здесь публикуются релизы, обновления версий и важные изменения проектов NYX.",
    footer: "WHAT'S NEW IN NYX",
    banner: process.env.BANNER_UPDATES
  },
  proxy: {
    title: "NYX PROXY BRIDGE",
    description: "🇬🇧 Discuss NYX Proxy Bridge, a Windows proxy client. For troubleshooting use #project-support; report reproducible issues in #bug-reports.\n🇷🇺 Обсуждайте NYX Proxy Bridge — Windows-клиент для работы с прокси. За помощью обращайтесь в #project-support, ошибки отправляйте в #bug-reports.",
    footer: "A NYX ECOSYSTEM PROJECT"
  },
  projectSupport: {
    title: "PROJECT SUPPORT",
    description: "🇬🇧 Tell us which NYX project you use, what you expected and what happened. Never post passwords, proxy credentials, API keys or other secrets.\n🇷🇺 Напишите, каким проектом NYX пользуетесь, что ожидали и что произошло. Не публикуйте пароли, данные прокси, API-ключи и другие секреты.",
    footer: "HELP THE TEAM HELP YOU"
  },
  feedback: {
    title: "SHARE YOUR FEEDBACK",
    description: "🇬🇧 Tell us what works, what feels confusing and what could be improved. Include the project name and version when relevant.\n🇷🇺 Расскажите, что работает хорошо, что непонятно и что можно улучшить. По возможности укажите проект и его версию.",
    footer: "YOUR FEEDBACK MATTERS"
  },
  ideas: {
    title: "PROJECT IDEAS",
    description: "🇬🇧 Describe the problem first, then explain your proposed solution and who it would help.\n🇷🇺 Сначала опишите проблему, затем предложите решение и объясните, кому оно поможет.",
    footer: "TURN IDEAS INTO IMPROVEMENTS"
  },
  general: {
    title: "GENERAL COMMUNITY CHAT",
    description: "🇬🇧 Meet the community, talk about NYX projects and technology, and help keep the conversation welcoming.\n🇷🇺 Знакомьтесь, обсуждайте проекты NYX и технологии, поддерживайте дружелюбную атмосферу.",
    footer: "CONNECT. BUILD. EVOLVE."
  },
  offtopic: {
    title: "OFF TOPIC",
    description: "🇬🇧 A place for conversations beyond NYX. Keep it friendly and follow the community rules.\n🇷🇺 Здесь можно общаться не только о NYX. Соблюдайте правила и уважайте других.",
    footer: "A LITTLE SPACE FOR EVERYTHING"
  },
  showcase: {
    title: "COMMUNITY SHOWCASE",
    description: "🇬🇧 Share your projects, experiments, setups and things you've built. Credit other creators when appropriate.\n🇷🇺 Показывайте свои проекты, эксперименты, настройки и разработки. Не забывайте указывать авторов чужих материалов.",
    footer: "SHOW WHAT YOU CREATE"
  },
  suggestions: {
    title: "SUGGESTIONS",
    description: "🇬🇧 One suggestion per message. Explain the benefit and the problem it solves.\n🇷🇺 Одна идея в одном сообщении. Объясните её пользу и какую проблему она решает.",
    footer: "MAKE THE ECOSYSTEM BETTER"
  },
  polls: {
    title: "COMMUNITY POLLS",
    description: "🇬🇧 Vote in community polls and share constructive reasoning. Poll results help guide priorities but do not guarantee implementation.\n🇷🇺 Участвуйте в голосованиях и объясняйте свою позицию. Результаты помогают определять приоритеты, но не гарантируют реализацию.",
    footer: "YOUR VOICE · OUR DIRECTION"
  },
  helpdesk: {
    title: "NEED HELP?",
    description: "🇬🇧 Open a private support ticket. Include the project, version, operating system and a clear description. Do not include secrets.\n🇷🇺 Создайте приватное обращение. Укажите проект, версию, ОС и подробности проблемы. Не отправляйте секретные данные.",
    footer: "PRIVATE SUPPORT · NYX CORE",
    ticket: true,
    banner: process.env.BANNER_SUPPORT
  },
  bugs: {
    title: "BUG REPORTS",
    description: "🇬🇧 Include steps to reproduce, expected behavior, actual behavior, project version and OS. Remove personal data and secrets from logs.\n🇷🇺 Укажите шаги воспроизведения, ожидаемое и фактическое поведение, версию проекта и ОС. Удалите личные данные и секреты из логов.",
    footer: "CLEAR REPORTS HELP FIX BUGS"
  },
  partners: {
    title: "NYX PARTNERS",
    description: "🇬🇧 Interested in working with the NYX ecosystem? Share your organization, audience, proposal and preferred contact method. Sponsored content and referral relationships will be disclosed.\n🇷🇺 Хотите сотрудничать с экосистемой NYX? Расскажите о своей организации, аудитории и предложении. Реклама и реферальные отношения будут обозначаться открыто.",
    footer: "BUILD TOGETHER",
    banner: process.env.BANNER_PARTNERS
  },
  collaborations: {
    title: "COLLABORATIONS",
    description: "🇬🇧 Propose a technical, creative or community collaboration. Explain the goal, contribution from each side and expected outcome.\n🇷🇺 Предложите техническое, творческое или общественное сотрудничество. Опишите цель, вклад каждой стороны и ожидаемый результат.",
    footer: "GOOD THINGS ARE BUILT TOGETHER"
  }
};

function makeEmbed(spec) {
  const embed = new EmbedBuilder()
    .setColor(PURPLE)
    .setTitle(spec.title)
    .setDescription(spec.description)
    .setFooter({ text: spec.footer || "NYX COMMUNITY · CONNECT. BUILD. EVOLVE." })
    .setTimestamp();
  if (spec.banner && /^https:\/\//i.test(spec.banner)) embed.setImage(spec.banner);
  return embed;
}

function panelComponents(spec) {
  const rows = [];
  if (spec.buttons) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("nyx:accept-rules").setLabel("I agree / Согласен").setStyle(ButtonStyle.Primary)
    ));
  }
  if (spec.select) {
    rows.push(new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("nyx:language").setPlaceholder("Choose language / Выберите язык")
        .addOptions(
          { label: "Русский", value: "ru", emoji: "🇷🇺" },
          { label: "English", value: "en", emoji: "🇬🇧" }
        )
    ));
  }
  if (spec.ticket) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("nyx:create-ticket").setLabel("Create ticket / Создать обращение").setStyle(ButtonStyle.Primary).setEmoji("🎫")
    ));
  }
  return rows;
}

async function ensureRole(guild, spec) {
  let role = guild.roles.cache.find(item => item.name === spec.name);
  if (!role) role = await guild.roles.create({
    name: spec.name, color: spec.color, permissions: spec.permissions,
    reason: "NYX Core initial server setup"
  });
  state.roles[spec.key] = role.id;
  return role;
}

async function ensureCategory(guild, key, name, overwrites = []) {
  let channel = guild.channels.cache.find(item => item.type === ChannelType.GuildCategory && item.name === name);
  if (!channel) channel = await guild.channels.create({ name, type: ChannelType.GuildCategory, permissionOverwrites: overwrites });
  state.categories[key] = channel.id;
  return channel;
}

async function ensureTextChannel(guild, key, name, parent, overwrites = []) {
  let channel = guild.channels.cache.find(item => item.type === ChannelType.GuildText && item.name === name);
  if (!channel) channel = await guild.channels.create({
    name, type: ChannelType.GuildText, parent: parent.id,
    topic: "Official NYX Community channel · RU / EN",
    permissionOverwrites: overwrites
  });
  else if (channel.parentId !== parent.id) await channel.setParent(parent.id);
  state.channels[key] = channel.id;
  return channel;
}

async function upsertPanel(channel, key) {
  const spec = panelSpecs[key];
  if (!spec) return;
  const banner = bannerMap[key] || spec.banner;
  const payload = { embeds: [makeEmbed({ ...spec, banner })], components: panelComponents(spec) };
  const oldId = state.panels[key];
  let message = null;
  if (oldId) {
    try { message = await channel.messages.fetch(oldId); } catch { /* message was deleted */ }
  }
  if (message) await message.edit(payload);
  else {
    message = await channel.send(payload);
    state.panels[key] = message.id;
  }
  try { await message.pin(); } catch (error) {
    console.warn(`Could not pin panel in #${channel.name}: ${error.message}`);
  }
  saveState();
}

async function setupGuild(guild) {
  await guild.roles.fetch();
  for (const spec of roleSpecs) await ensureRole(guild, spec);

  const everyone = guild.roles.everyone;
  const verified = guild.roles.cache.get(state.roles.member);
  const support = guild.roles.cache.get(state.roles.support);
  const privateOverwrites = [
    { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    ...(verified ? [{ id: verified.id, deny: [PermissionFlagsBits.ViewChannel] }] : []),
    ...(support ? [{ id: support.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : [])
  ];

  for (const group of structure) {
    const isPrivate = group.key === "staff";
    const category = await ensureCategory(guild, group.key, group.name, isPrivate ? privateOverwrites : []);
    for (const [channelName, , panelKey] of group.channels) {
      const channel = await ensureTextChannel(guild, channelName, channelName, category);
      if (panelSpecs[panelKey]) await upsertPanel(channel, panelKey);
    }
  }

  const staffRoles = ["founder", "admin", "developer", "moderator", "support"]
    .map(key => state.roles[key]).filter(Boolean);
  const staffOverwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    ...staffRoles.map(id => ({ id, allow: [
      PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory
    ]}))
  ];
  const staffCategory = await ensureCategory(guild, "staff", "NYX STAFF", staffOverwrites);
  for (const name of ["staff-chat", "mod-logs", "staff-announcements", "bot-logs"]) {
    await ensureTextChannel(guild, name, name, staffCategory, staffOverwrites);
  }

  const ticketCategory = await ensureCategory(guild, "tickets", "NYX SUPPORT TICKETS");
  state.categories.tickets = ticketCategory.id;
  saveState();
}

async function refreshPanels(guild) {
  for (const [key, spec] of Object.entries(panelSpecs)) {
    const channelId = state.channels[key];
    if (!channelId) continue;
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (channel?.isTextBased()) await upsertPanel(channel, key);
  }
}

async function createTicket(interaction) {
  const guild = interaction.guild;
  const existing = guild.channels.cache.find(channel =>
    channel.type === ChannelType.GuildText &&
    channel.topic === `NYX ticket for user ${interaction.user.id}`
  );
  if (existing) {
    await interaction.reply({ content: `You already have an open ticket: ${existing}`, ephemeral: true });
    return;
  }

  const categoryId = state.categories.tickets;
  const supportRoleId = SUPPORT_ROLE_ID || state.roles.support || state.roles.admin;
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: client.user.id, allow: [
      PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels
    ]},
    { id: interaction.user.id, allow: [
      PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles
    ]},
    ...(supportRoleId ? [{ id: supportRoleId, allow: [
      PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages
    ]}] : [])
  ];

  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 90),
    type: ChannelType.GuildText,
    parent: categoryId || undefined,
    topic: `NYX ticket for user ${interaction.user.id}`,
    permissionOverwrites: overwrites
  });
  const embed = new EmbedBuilder().setColor(PURPLE).setTitle("NYX SUPPORT TICKET")
    .setDescription(`🇬🇧 Hello ${interaction.user}. Describe your issue and the NYX project involved. Never share passwords, tokens or proxy credentials.\n\n🇷🇺 Здравствуйте, ${interaction.user}. Опишите проблему и проект NYX. Не отправляйте пароли, токены и данные прокси.`)
    .setFooter({ text: "NYX CORE · PRIVATE SUPPORT" });
  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("nyx:close-ticket").setLabel("Close ticket / Закрыть").setStyle(ButtonStyle.Danger)
  );
  await channel.send({ content: `${interaction.user} <@&${supportRoleId}>`, embeds: [embed], components: [closeRow] });
  await interaction.reply({ content: `Your private ticket is ready: ${channel} / Ваше обращение создано: ${channel}`, ephemeral: true });
}

const client = new Client({
  intents: ["Guilds", "GuildMembers"],
  presence: { activities: [{ name: "the NYX ecosystem", type: 3 }] }
});

client.once(Events.ClientReady, ready => {
  console.log(`NYX Core online as ${ready.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (!interaction.guild) return interaction.reply({ content: "This command is only available in a server.", ephemeral: true });
      if (interaction.commandName === "setup") {
        await interaction.deferReply({ ephemeral: true });
        await setupGuild(interaction.guild);
        await interaction.editReply("NYX Community structure and bilingual panels are ready. / Структура и двуязычные карточки NYX готовы.");
      }
      if (interaction.commandName === "refresh") {
        await interaction.deferReply({ ephemeral: true });
        await refreshPanels(interaction.guild);
        await interaction.editReply("NYX panels refreshed without intentional duplicates. / Карточки NYX обновлены.");
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === "nyx:accept-rules") {
        const memberRole = interaction.guild.roles.cache.get(state.roles.member);
        if (!memberRole) return interaction.reply({ content: "Run /setup first. / Сначала выполните /setup.", ephemeral: true });
        await interaction.member.roles.add(memberRole);
        return interaction.reply({ content: "Welcome to NYX Community! / Добро пожаловать в NYX Community!", ephemeral: true });
      }
      if (interaction.customId === "nyx:create-ticket") return createTicket(interaction);
      if (interaction.customId === "nyx:close-ticket") {
        if (!interaction.channel.topic?.startsWith("NYX ticket for user ")) {
          return interaction.reply({ content: "This is not a NYX ticket.", ephemeral: true });
        }
        const ownerId = interaction.channel.topic.replace("NYX ticket for user ", "");
        const isOwner = interaction.user.id === ownerId;
        const isSupport = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
          || interaction.member.roles?.cache?.has(SUPPORT_ROLE_ID || state.roles.support);
        if (!isOwner && !isSupport) return interaction.reply({ content: "Only the ticket creator or support team can close this ticket.", ephemeral: true });
        await interaction.reply({ content: "Ticket will be deleted in 5 seconds. / Обращение будет удалено через 5 секунд." });
        setTimeout(() => interaction.channel.delete("NYX ticket closed").catch(() => {}), 5000);
        return;
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "nyx:language") {
      const selected = interaction.values[0];
      const chosenId = state.roles[selected];
      const otherId = state.roles[selected === "ru" ? "en" : "ru"];
      if (otherId) await interaction.member.roles.remove(otherId).catch(() => {});
      if (chosenId) await interaction.member.roles.add(chosenId);
      return interaction.reply({
        content: selected === "ru" ? "Язык установлен: русский 🇷🇺" : "Language set to English 🇬🇧",
        ephemeral: true
      });
    }
  } catch (error) {
    console.error("Interaction error:", error);
    const message = "Something went wrong. Please contact the NYX team. / Произошла ошибка. Обратитесь к команде NYX.";
    if (interaction.deferred || interaction.replied) await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    else await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
  }
});

client.login(DISCORD_TOKEN);
