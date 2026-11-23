# NYX Core

Official Discord bot foundation for the wider NYX ecosystem (not only NYX Proxy Bridge).

## Included in v0.1

- Discord.js v14 bot
- `/setup`: creates the initial bilingual NYX Community channel structure and roles
- `/refresh`: edits the bot's existing pinned information panels rather than intentionally reposting them
- RU / EN language role selector
- Rules acceptance button that grants the NYX Member role
- Private support ticket creation and close button
- Optional per-channel banner URLs
- Local JSON state file for panel, role, category and channel IDs

## Requirements

- Node.js 20.11+
- A Discord application and bot
- A Discord server where you can manage roles and channels

## Installation

1. Create an application at https://discord.com/developers/applications.
2. Add a bot user and copy its token.
3. Enable the **Server Members Intent** only if you later add member-join events. The current MVP uses guild interactions and does not require it.
4. Invite the bot with the `bot` and `applications.commands` scopes. Required bot permissions: Manage Channels, Manage Roles, Manage Messages, View Channels, Send Messages, Embed Links, Read Message History, and Pin Messages.
5. Put the bot's role above the roles it must assign (NYX Member, Language RU and Language EN) in Server Settings → Roles.
6. Copy `.env.example` to `.env` and fill in:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_GUILD_ID`
   - optionally `SUPPORT_ROLE_ID` and banner URLs
7. Install and register commands:

```bash
npm install
npm run deploy:commands
npm start
```

8. In your server, run `/setup` once. Later use `/refresh` to update the bot's pinned panels.

## Banner images

Set direct HTTPS image URLs in the matching `BANNER_*` variables. If unset, the panel still renders cleanly without an image. Use a consistent black / violet NYX visual system, with a distinct title and symbol for each channel.

## Important notes

- Never commit `.env`, bot tokens or private credentials.
- Keep the `DATA_DIR` directory on persistent storage. If it is ephemeral, panel IDs are lost after redeployment.
- The bot intentionally does not request Discord's Administrator permission.
- Review role hierarchy and channel permissions before using this on a live community.
- This is an initial MVP, not yet a production-hardened moderation or ticket platform.
- The initial structure is intentionally ecosystem-wide. NYX Proxy Bridge is listed as one project only.
