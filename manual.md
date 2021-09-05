# Commands

## Accessible by everyone:

### `!ping`
Check the bot is working by receiving `pong!` in answer.

### `!help`
Showing the list of available (for the user) commands with descriptions.

### `!list_tracks`
Showing the current list of tracks in the game (Retro Stadium excluded).

### `!generate_table`
Generate score table template for a team wars.
Usage example:
```
!generate_table NUM_OF_RACES
Team1: p1,p2,p3
Team2: p1,p2,p3
...
```

### `!rng`
Picks random track from the list of all tracks (`!list_tracks`).

### `!clans`
Show clan members: `!clan CTR`

### `!clan_member`
Edit clan members (Accessible for _@Captain_ only).
```
!clan_member add @user
!clan_member remove @user
```

### `!draft`
Generate draft links
```
!draft
Team A: @CaptainA
Team B: @CaptainB
```

## Accessible by Staff:

### `!clans`
Show clan members: `!clan CTR`  
Edit clans:
```
!clan add CTR Crash Team Racing
!clan delete CTR
```

### `!clan_member`
Edit clan members.  
```
!clan_member add CTR @user
!clan_member remove CTR @user
```

### `!commands`
List of _dynamic_ commands.

#### `!commands add command_name`
Add a new dynamic command. You should specify bot's response to it in the following message.  
`command_name` must be unique, shouldn't repeat static commands.

#### `!commands edit command_name`
Edit existing dynamic command. You should specify new bot's response to it in the following message.

#### `!commands delete command_name`
Delete existing dynamic command. You should confirm this action in the following message.

---

### `!schedule`
List of scheduled messages.

#### `!schedule add #channel YYYY-MM-DD H:MM AM/PM TZ`
Add scheduled message. You should specify a message text in the following message.  
Example: `!schedule add #announcements 2020-01-18 7:00 PM CET`

#### `!schedule edit schedule_id`
Edit scheduled message text. You should specify a new text in the following message.  
Example: `!schedule edit 5e22ff38f6c7d64cc3e73bb1`

#### `!schedule show schedule_id`
Show scheduled message.  
Example: `!schedule show 5e22ff38f6c7d64cc3e73bb1`

#### `!schedule delete schedule_id`
Delete scheduled message.  
Example: `!schedule delete 5e22ff38f6c7d64cc3e73bb1`

---

### `!signups_schedule`
Show signups schedule

#### `!signups_schedule open YYYY-MM-DD H:MM AM/PM TZ`
Open signups at a specified time.  
Example: `!signups_schedule open 2020-01-18 7:00 PM CET`

#### `!signups_schedule close YYYY-MM-DD H:MM AM/PM TZ`
Close signups at a specified time.  
Example: `!signups_schedule close 2020-01-18 7:00 PM CET`

---

### `!config`
Shows available config variables.

#### `!config show var_name`
Show variable current value.

#### `!config edit var_name`
Edit variable value. You should specify new value in the following message.

---

**Post commands structure will be changed in the future!**  
`[N]` is the number of message by bot from bottom of the channel. If `[N]` is not specified it will be assumed as `1` (last message by a bot).
Search limit is 100 messages, so if people sent more than 100 messages after bot's last message, it will not be found.

### `!post`
Post a message in channels.  
Example:
```
!post 1a 1b 1c
@everyone Tournament starts now!
```

### `!post_edit`
Edit message in channels.  
Example:
```
!post_edit [N] 1a 1b 1c
@everyone Tournament starts in 10 minutes!
```

### `!post_delete`
Delete message in channels.  
Example:
```
!post_delete [N] 1a 1b 1c
```

### `!post_pin`
Pins message in channels.  
Example:
```
!post_pin [N] 1a 1b 1c
```

---

### `!create_tournament_channels`
Create channels in `Tournament Lobbies` category and roles with the same names.  
Example: `!create_tournament_channels 1a 1b 1c`

### `!role`
Add role to members.  
Example:
```
!role 1a
CTR Tourney Bot#1287
...
```

### `!role remove`
Remove role from members.  
Example:
```
!role remove 1a
CTR Tourney Bot#1287
...
```

### `!find`
Find members of the server by `username#tag`. For testing purposes.  
Example:
```
!find
CTR Tourney Bot#1287
...
```

### `!find_id`
Find members of the server by ids. For testing purposes.  
Example:
```
!find
635410532786110464
...
```

### `!members`
Get the list of all members in a CSV file.

### `!parse_signups`
Get the list of signups in a CSV file.

### `!signups_count`
Get signups count.


## Accessible by Admins:

### `!stop`
Kill switch for every commands and fun responses.  
Bot will not perform any commands until restart.  
Signups reactions and status countdown will continue to work.

### `!delete_tournament_channels`
Deletes all channels in the `Tournament Lobbies` category and roles with the same names!  

### `!purge_signups`
Delete last 500 messages in `#signups` channel.
