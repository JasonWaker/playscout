export const site = {
  name: 'PlayScout',
  tagline: 'Mobile games, ranked and explained',
  description: 'Independent mobile game guides, rankings, release discovery, redeem codes and player-tested video tutorials.',
  author: 'PlayScout Editorial',
  locale: 'en_US',
};

export const games = [
  { slug:'whiteout-survival', name:'Whiteout Survival', image:'whiteout.jpg', hero:'whiteout-shot.jpg', genre:'Strategy · 4X', platforms:'iOS · Android', developer:'Century Games', score:94, rank:'#5 grossing', status:'Hot this week', summary:'Build a settlement, manage heat and coordinate alliance events in a frozen survival strategy game.', store:'https://apps.apple.com/us/app/whiteout-survival/id6443575749' },
  { slug:'monopoly-go', name:'MONOPOLY GO!', image:'monopoly-go.jpg', hero:'monopoly-shot.jpg', genre:'Board · Casual', platforms:'iOS · Android', developer:'Scopely', score:92, rank:'#1 grossing', status:'Event live', summary:'Roll, collect landmarks and plan event multipliers in a fast-moving social board game.', store:'https://apps.apple.com/us/app/monopoly-go/id1621328561' },
  { slug:'pokemon-go', name:'Pokémon GO', image:'pokemon-go.jpg', hero:'pokemon-shot.png', genre:'AR · Adventure', platforms:'iOS · Android', developer:'Niantic', score:90, rank:'#3 free', status:'Season active', summary:'Explore real-world locations, build raid teams and collect Pokémon through live events.', store:'https://apps.apple.com/us/app/pok%C3%A9mon-go/id1094591345' },
  { slug:'roblox', name:'Roblox', image:'roblox.jpg', hero:'roblox.jpg', genre:'Adventure · UGC', platforms:'iOS · Android', developer:'Roblox Corporation', score:91, rank:'#1 free', status:'246 guides', summary:'A vast player-created platform with experiences spanning action, roleplay, racing and social play.', store:'https://apps.apple.com/us/app/roblox/id431946152' },
  { slug:'minecraft', name:'Minecraft', image:'minecraft.jpg', hero:'minecraft.jpg', genre:'Sandbox · Adventure', platforms:'iOS · Android', developer:'Mojang', score:89, rank:'#1 paid', status:'Editor pick', summary:'Explore, craft and build alone or with friends in the definitive block-based sandbox.', store:'https://apps.apple.com/us/app/minecraft-play-with-friends/id479516143' },
  { slug:'royal-match', name:'Royal Match', image:'royal-match.jpg', hero:'royal-shot.jpg', genre:'Puzzle · Match 3', platforms:'iOS · Android', developer:'Dream Games', score:87, rank:'#2 grossing', status:'New levels', summary:'Complete match-three levels, unlock areas and restore King Robert’s castle.', store:'https://apps.apple.com/us/app/royal-match/id1482155847' },
  { slug:'bloons-td-6', name:'Bloons TD 6', image:'bloons.jpg', hero:'bloons.jpg', genre:'Tower defense', platforms:'iOS · Android', developer:'Ninja Kiwi', score:86, rank:'#2 paid', status:'Update guide', summary:'Build layered monkey defenses and master hero synergies across intricate maps.', store:'https://apps.apple.com/us/app/bloons-td-6/id1118115766' },
  { slug:'stardew-valley', name:'Stardew Valley', image:'stardew.jpg', hero:'stardew.jpg', genre:'Farming · RPG', platforms:'iOS · Android', developer:'ConcernedApe', score:85, rank:'#3 paid', status:'64 guides', summary:'Restore a farm, form friendships and explore a character-rich rural role-playing world.', store:'https://apps.apple.com/us/app/stardew-valley/id1406710800' },
  { slug:'kingshot', name:'Kingshot', image:'kingshot.jpg', hero:'kingshot.jpg', genre:'Strategy · 4X', platforms:'iOS · Android', developer:'Century Games', score:84, rank:'Fastest riser', status:'Rising', summary:'Grow a medieval settlement and coordinate large-scale alliances in a compact strategy game.', store:'https://apps.apple.com/us/search?term=Kingshot' },
  { slug:'plague-inc', name:'Plague Inc.', image:'plague.jpg', hero:'plague.jpg', genre:'Strategy · Simulation', platforms:'iOS · Android', developer:'Ndemic Creations', score:82, rank:'#5 paid', status:'27 guides', summary:'Evolve a pathogen while reacting to a strategic global simulation.', store:'https://apps.apple.com/us/app/plague-inc/id525818839' },
  { slug:'geometry-dash', name:'Geometry Dash', image:'geometry.jpg', hero:'geometry.jpg', genre:'Rhythm · Arcade', platforms:'iOS · Android', developer:'RobTop Games', score:81, rank:'#4 paid', status:'31 guides', summary:'Time jumps to music and learn demanding platforming patterns across community levels.', store:'https://apps.apple.com/us/app/geometry-dash/id625334537' },
  { slug:'candy-crush-saga', name:'Candy Crush Saga', image:'royal-match.jpg', hero:'royal-shot.jpg', genre:'Puzzle · Match 3', platforms:'iOS · Android', developer:'King', score:79, rank:'#8 grossing', status:'Weekly events', summary:'Match candy, clear blockers and progress through a huge collection of puzzle levels.', store:'https://apps.apple.com/us/app/candy-crush-saga/id553834731' },
];

export const guides = [
  { slug:'whiteout-survival-upgrade-priority', game:'whiteout-survival', type:'Editor guide', title:'Whiteout Survival: 12 upgrades worth saving for', dek:'A player-tested route from Furnace 20 to your first major alliance event.', time:'9 min', updated:'Updated today', answer:'Keep one construction queue on Furnace prerequisites, bank speedups for scoring windows, and delay optional troop upgrades until your event schedule is clear.', sections:['The fastest upgrade route','When to save speedups','Alliance timing checklist'] },
  { slug:'whiteout-survival-bear-hunt', game:'whiteout-survival', type:'Strategy', title:'Bear Hunt rally setup: heroes, joins and timing', dek:'A repeatable setup for more rally damage without wasting your strongest heroes.', time:'8 min', updated:'Verified today', answer:'Put your strongest expedition damage hero in the lead slot, join with the correct first hero, and stagger marches so they return before the next rally opens.', sections:['Best rally leaders','Joiner hero rules','A five-minute preparation routine'] },
  { slug:'monopoly-go-dice-strategy', game:'monopoly-go', type:'Beginner guide', title:'MONOPOLY GO! dice strategy for daily events', dek:'Use multiplier windows and board position to make each dice roll work harder.', time:'7 min', updated:'Updated today', answer:'Raise your multiplier only when six, seven or eight spaces ahead contains a high-value event tile, then drop it while crossing low-value sections.', sections:['Read the board','Choose a multiplier','Stop-loss rules'] },
  { slug:'pokemon-go-returning-player', game:'pokemon-go', type:'Checklist', title:'Pokémon GO returning player checklist', dek:'Everything to check before spending Stardust or transferring older catches.', time:'10 min', updated:'Verified this week', answer:'Check legacy moves, tag old Pokémon, review current raid counters and use low-cost teams before committing Stardust.', sections:['Protect old Pokémon','Build a raid core','Catch-up priorities'] },
  { slug:'roblox-best-adventures', game:'roblox', type:'Best games', title:'12 Roblox adventures worth playing with friends', dek:'Co-op worlds with clear goals, active communities and fair onboarding.', time:'11 min', updated:'Updated this week', answer:'Start with experiences that support private servers, explain objectives quickly and keep progression readable for mixed-skill groups.', sections:['Best co-op picks','For younger groups','How we selected'] },
  { slug:'minecraft-first-night', game:'minecraft', type:'Beginner guide', title:'Minecraft first night: a calm 10-minute route', dek:'Secure food, tools and shelter before darkness without memorising recipes.', time:'6 min', updated:'Editor verified', answer:'Collect wood, make stone tools, gather food and place a small lit shelter near a visible landmark before exploring farther.', sections:['First three minutes','Food and light','What to do next'] },
  { slug:'royal-match-booster-guide', game:'royal-match', type:'Puzzle guide', title:'Royal Match boosters: when each one saves a level', dek:'A practical rule set for pre-level and in-level boosters.', time:'7 min', updated:'Player tested', answer:'Save pre-level boosters for hard boards with separated goals; use the hammer only when one move removes a final isolated blocker.', sections:['Pre-level boosters','In-level tools','When to restart'] },
  { slug:'bloons-td6-hero-guide', game:'bloons-td-6', type:'Strategy', title:'Bloons TD 6 heroes for early progression', dek:'Reliable hero choices for learning maps and economy timing.', time:'9 min', updated:'Editor verified', answer:'Choose a generalist hero while learning, place early enough to gain levels, and build your economy around the map’s safest damage zone.', sections:['Hero roles','Placement timing','Upgrade paths'] },
  { slug:'stardew-first-spring', game:'stardew-valley', type:'Season plan', title:'Stardew Valley first spring without burnout', dek:'A flexible season plan that keeps farming, mining and friendships balanced.', time:'12 min', updated:'Updated this month', answer:'Plant a manageable crop field, save rainy days for the mines and leave two weekly blocks open for town errands and exploration.', sections:['Week one setup','Energy budgeting','Spring milestones'] },
  { slug:'kingshot-early-build', game:'kingshot', type:'Starter guide', title:'Kingshot early build order and resource plan', dek:'Build momentum without draining protected resources too early.', time:'8 min', updated:'Needs live-data review', answer:'Advance required buildings evenly, keep builders active and reserve premium currency for permanent capacity gains.', sections:['First build queue','Resource protection','Alliance unlocks'] },
  { slug:'plague-inc-normal-guide', game:'plague-inc', type:'Strategy', title:'Plague Inc. normal difficulty: a consistent opening', dek:'Learn transmission and severity timing with a forgiving first strategy.', time:'8 min', updated:'Editor verified', answer:'Spread quietly across travel hubs, hold visible symptoms early and keep DNA ready for cold, heat and medicine responses.', sections:['Opening evolution','Global spread','Endgame timing'] },
  { slug:'geometry-dash-practice', game:'geometry-dash', type:'Skills', title:'Geometry Dash practice mode that builds consistency', dek:'Turn difficult sections into repeatable checkpoints and clean attempts.', time:'6 min', updated:'Player tested', answer:'Practice short sections with deliberate checkpoints, repeat each transition five times, then reduce checkpoints before returning to normal mode.', sections:['Place useful checkpoints','Train transitions','Move to full runs'] },
];

export const news = [
  { slug:'weekly-mobile-roundup', game:'pokemon-go', type:'News roundup', title:'This week in mobile games: events, updates and five releases', dek:'The useful changes and launch dates to keep on your calendar.', date:'September 9, 2026' },
  { slug:'whiteout-alliance-matchmaking', game:'whiteout-survival', type:'Update explained', title:'Whiteout Survival alliance matchmaking: what players should check', dek:'How roster power and registration timing can affect the next event.', date:'September 9, 2026' },
  { slug:'monopoly-go-event-calendar', game:'monopoly-go', type:'Event tracker', title:'MONOPOLY GO! event calendar and reward milestones', dek:'A readable schedule for overlapping solo and partner events.', date:'September 9, 2026' },
  { slug:'pokemon-go-season-checklist', game:'pokemon-go', type:'Season update', title:'Pokémon GO season changes for returning trainers', dek:'Raids, bonuses and storage decisions to review before playing.', date:'September 8, 2026' },
  { slug:'roblox-discovery-update', game:'roblox', type:'Platform news', title:'Roblox discovery changes: what players will notice', dek:'New signals that may alter which experiences appear first.', date:'September 8, 2026' },
  { slug:'minecraft-mobile-patch', game:'minecraft', type:'Patch notes', title:'Minecraft mobile patch: the player-facing changes', dek:'A concise translation of fixes that affect worlds and multiplayer.', date:'September 7, 2026' },
  { slug:'royal-match-level-drop', game:'royal-match', type:'Content update', title:'Royal Match adds a fresh level set and team event', dek:'What is new and which boosters may help with the hardest boards.', date:'September 7, 2026' },
  { slug:'bloons-balance-watch', game:'bloons-td-6', type:'Balance watch', title:'Bloons TD 6 balance changes worth rebuilding around', dek:'The towers and heroes that deserve another test after the update.', date:'September 6, 2026' },
  { slug:'stardew-mobile-tips', game:'stardew-valley', type:'Community', title:'Stardew Valley mobile players share their best control setups', dek:'Small touch-control changes that make long sessions more comfortable.', date:'September 5, 2026' },
  { slug:'kingshot-chart-climb', game:'kingshot', type:'Chart watch', title:'Why Kingshot is climbing mobile strategy charts', dek:'The release pattern and early community signals behind the rise.', date:'September 5, 2026' },
];

export const videos = [
  { id:'yXdHGoSfZmE', game:'whiteout-survival', title:'Whiteout Survival Beginner Guide from NOOB to PRO In 2025', channel:'KaidGames2', duration:'10:12', summary:'A creator walkthrough of early progression, resource priorities and common beginner mistakes.' },
  { id:'KN5PxzQQBMs', game:'monopoly-go', title:'Top 10 Tips & Tricks (Monopoly Go!)', channel:'Yooosin', duration:'15:17', summary:'Ten practical player tips covering dice use, board timing and reward planning.' },
  { id:'HcWIsOQygIQ', game:'pokemon-go', title:"POKÉMON GO'S ULTIMATE BEGINNERS GUIDE!", channel:'Poké Daxi', duration:'16:16', summary:'A broad beginner guide to catching, progression, resources and daily routines.' },
  { id:'RM79zJc6_Q4', game:'royal-match', title:'Royal Match - Basic Fundamentals, Tips and Tricks', channel:'ATrain64', duration:'14:40', summary:'A player guide to board reading, booster timing and level fundamentals.' },
  { id:'MmB9b5njVbA', game:'minecraft', title:'Official Minecraft Trailer', channel:'Minecraft', duration:'01:00', summary:'The official trailer introduces exploration, crafting, survival and creative building.' },
  { id:'gBeI4md2ixE', game:'bloons-td-6', title:'BEST BTD6 Beginner Guide! From Noob To PRO', channel:'SJB', duration:'39:14', summary:'A long-form beginner guide to towers, heroes, placement and economy.' },
  { id:'ot7uXNQskhs', game:'stardew-valley', title:'Stardew Valley Trailer', channel:'ConcernedApe', duration:'03:09', summary:'The official trailer shows farming, relationships, exploration and seasonal life.' },
];

export const codes = [
  { game:'whiteout-survival', code:'WOS0910', reward:'Starter resources and speedups', status:'Sample — verify in game' },
  { game:'whiteout-survival', code:'FROSTGIFT', reward:'Resource bundle', status:'Sample — verify in game' },
  { game:'monopoly-go', code:'ROLLSMART', reward:'Event reward link reference', status:'Sample — verify source' },
  { game:'pokemon-go', code:'TRAINERBOX', reward:'Promotional item bundle', status:'Sample — verify in shop' },
  { game:'roblox', code:'PLAYSCOUT', reward:'Experience-specific item', status:'Sample — game dependent' },
  { game:'kingshot', code:'KINGSTART', reward:'Early settlement supplies', status:'Sample — verify in game' },
  { game:'bloons-td-6', code:'MONKEYTIME', reward:'Community challenge reference', status:'Sample — verify source' },
  { game:'geometry-dash', code:'RHYTHM', reward:'Vault reward reference', status:'Sample — verify in game' },
];

export const releases = [
  { game:'kingshot', date:'Sep 10', label:'Global rollout', note:'Strategy · Free' },
  { game:'pokemon-go', date:'Sep 12', label:'Season event', note:'AR · Live event' },
  { game:'minecraft', date:'Sep 14', label:'Content update', note:'Sandbox · Paid' },
  { game:'royal-match', date:'Sep 15', label:'New levels', note:'Puzzle · Free' },
  { game:'bloons-td-6', date:'Sep 18', label:'Update window', note:'Strategy · Paid' },
  { game:'stardew-valley', date:'Sep 20', label:'Community event', note:'RPG · Paid' },
  { game:'plague-inc', date:'Sep 22', label:'Challenge week', note:'Simulation · Paid' },
  { game:'roblox', date:'Sep 24', label:'Creator showcase', note:'UGC · Free' },
];

export const gameBySlug = slug => games.find(game => game.slug === slug);
