<template>
    <v-container>
        <v-layout>
            <v-flex xs12 md9>
                <div class="about-green-fox">
                    <h1 id="operation-green-fox">Operation: Green Fox II</h1>
                    <h2 id="event-description">Event Description</h2>
                    <p>A competitive airsoft game by DooM Squad Airsoft featuring special player classes, pyrotechnics and special equipment.</p>
                    <h3 id="redfor-vs-blufor">REDFOR vs. BLUFOR</h3>
                    <p>OP: Green Fox II has two opposing forces, identified by colored arm bands.</p>
                    <h3 id="doom-device">REDFOR vs. BLUFOR</h3>
                    <p>DooM Squad has created an electronic control point solution dubbed, "DooM D3vices". The devices are small boxes with arcade buttons which wirelessly connect together and enable videogame-style gameplay, capture point stracking, statistics gathering, post-game reporting, etc. During OP: Green Fox II, each control point will have one of these doom devices which players can interact with. The device has color coded pushbuttons which players can press to capture the control point for their team, REDFOR or BLUEFOR. Players can use their smartphones to see the status of each control point by viewing the map page on this website. Players can respawn at any point controlled by their own team.</p>
                    <h3 id="class-based-combat">Class-Based Combat</h3>
                    <p>Just like many First Person Shooter (FPS) games, where players operate as a type of combatant with specific traits, there are four classes in Operation: Green Fox.
                    <h5>Grenadier</h5>
                    <p>Grenadier carries a high-output smoke grenade and a frag grenade.</p>
                    <h5>Medic</h5>
                    <p>The medic can get their teammates back in the fight without them having to walk back to a respawn.</p>
                    <h5>Sapper</h5>
                    <p>The Sapper can lay explosives anywhere on the field, and blow them up at will</p>
                    <h5>Captain</h5>
                    <p>The captain can stay in the fight longer by self-healing, but is a valuable target for the enemy. If an enemy can down the captain and subsequently tag them, the captain must surrender their self-heal ability.</p>
                    <h5>Assault</h5>
                    <p>The assault class is a rifleman with a small smoke grenade.</p>
                    <h5>Hacker</h5>
                    <p>The hacker is capable of reducing the time it takes for their team to capture a point. Much like the captain, this ability can be stolen by the enemy team.</p>
                    <h3 id="prizes">Prizes</h3>
                    <p>All participants in this event will be entered to win one of several raffle prizes! Special prizes will be awarded to most valuable players voted by each team.</p>
                    <h3 id="schedule">Schedule</h3>
                    <p>All times PDT</p>
                    <v-data-table
                        :headers="headers"
                        :items="items"
                    >
                        <template slot="items" slot-scope="props">
                            <td>{{ props.item.time }}</td>
                            <td class="text-xs-right">{{ props.item.activity }}</td>
                        </template>
                    </v-data-table>


                    <h3 id="amenities">Amenities</h3>
                    <p>Chris&#39;s house will be open for this event. Feel free to use the restroom, fill up your canteens at the kitchen sink, or just chill on the sofa :D</p>
                    <h3 id="lock-load">Lock &amp; Load</h3>
                    <p>We hope to see you on the battlefield for this fun event! This is a free event, but we do have a donation jar which funds field improvements. We are looking to have a good turnout so definately bring your friends! </p>


                    <h2 id="mission">Mission</h2>
                    <h3 id="aas-advance-and-secure-">AAS - Advance And Secure.</h3>
                    <p>Both teams start with 50 death tickets each. When a player dies, they must go to one of their team&#39;s control points and expend one death ticket to respawn. The first team to exhaust all their death tickets loses.</p>
                    <h4 id="special-classes">Special classes</h4>
                    <p>There are a number of special classes which can greatly influence the outcome of the game.</p>
                    <h5 id="medics">Medics</h5>
                    <p>A medic can revive dead players in the field, expending one death ticket in the process.</p>
                    <h5 id="captains">Captains</h5>
                    <p>Captains can self-heal after two minutes. Captains can capture downed enemy captains.</p>
                    <h5 id="grenadiers">Grenadiers</h5>
                    <p>Grenadiers carry anti-personnel explosive grenades, and concealment signal smokes.</p>
                    <h5 id="sapper">Sapper</h5>
                    <p>Sappers can sabotage enemy control points, preventing them from spawning.</p>
                    <h3 id="loss-conditions">Loss Conditions</h3>
                    <h4 id="blufor">BLUFOR</h4>
                    <p>Fulfill any of the following conditions</p>
                    <ul>
                    <li>[ ] Exhaust all death tickets</li>
                    </ul>
                    <h4 id="opfor">OPFOR</h4>
                    <p>Fulfill any of the following conditions</p>
                    <ul>
                    <li>[ ] Exhaust all death tickets</li>
                    </ul>
                    <h3 id="win-conditions">Win Conditions</h3>
                    <h4 id="blufor">BLUFOR</h4>
                    <p>Fulfill all conditions</p>
                    <ul>
                    <li>[ ] Eliminate OPFOR Spy</li>
                    <li>[ ] Capture OPFOR FOB</li>
                    </ul>
                    <h4 id="opfor">OPFOR</h4>
                    <p>Fulfill any condition</p>
                    <ul>
                    <li>[ ] Capture OPFOR FOB</li>
                    <li>[ ]</li>
                    </ul>
                    <p>Secondary objectives</p>
                    <ul>
                    <li>[ ] Sapper Sabotage (must complete all 2)<ul>
                    <li>[ ] Sabotage Control Point Alpha</li>
                    <li>[ ] Sabotage Control Point Bravo</li>
                    </ul>
                    </li>
                    </ul>
                    <h3 id="todo-list">TODO List</h3>
                    <ul>
                    <li>[-] Map<ul>
                    <li>[x] ?admin=1 on the map</li>
                    <li>[ ] streaming animations</li>
                    </ul>
                    </li>
                    <li>[x] Medic<ul>
                    <li>[x] Healability</li>
                    <li>[x] Cookie-based authentication (per round)</li>
                    </ul>
                    </li>
                    <li>[x] Identity<ul>
                    <li>[x] QR codes generated</li>
                    </ul>
                    </li>
                    <li>[x] Capture points<ul>
                    <li>[x] Sapper quick takedown</li>
                    <li>[x] Captain quick capture</li>
                    </ul>
                    </li>
                    </ul>
                    <h3 id="event-checklist">Event Checklist</h3>
                    <ul>
                    <li>[ ] cooler</li>
                    <li>[ ] ice</li>
                    <li>[x] bottled water</li>
                    <li>[x] Enola Gaye frags</li>
                    <li>[x] pen &amp; paper pad (for registration)</li>
                    <li>[-] zipties (for chrono)</li>
                    <li>[x] chrono</li>
                    <li>[x] donation jar</li>
                    <li>[-] raffle tickets</li>
                    <li>[x] airsoft --&gt; sign</li>
                    <li>[x] Tape or stickers to identify teams the players belong to</li>
                    </ul>
                    <h3 id="briefing">Briefing</h3>
                    <h4 id="introductions">Introductions</h4>
                    <h4 id="safety-rules">Safety &amp; Rules</h4>
                    <p>Our number one focus is safety, because it&#39;s all fun and games until someone gets hurt.</p>
                    <ul>
                    <li>[ ] player safety check &amp; sign-in</li>
                    <li>[ ] eye protection check</li>
                    <li>[ ] chrono &amp; ziptie</li>
                    <li>[ ] raffle ticket</li>
                    </ul>

                    <ul>
                    <li>Do not blind fire. Blind firing is any time you are shooting and are not clearly looking down your gun. There is one exception for if you are using a gun camera :)</li>
                    <li>Max FPS on all airsoft guns is 400 FPS for all players, or 550 FPS for players holding Spokane Airsoft sniper cards (or equivalent safety certification.)</li>
                    <li>Eye protection must be ANZI 87 certified and be worn at all times on the field.</li>
                    <li>Mouth guards and ear protectors are suggested.</li>
                    <li>Safe zones are the staging area and parking lot.<ul>
                    <li>This is very important for everyone&#39;s safety, since there are people without eye protection in safe zones, I will bark at you if I see live guns.</li>
                    <li>No test firing in the safe zone</li>
                    <li>Mags out, guns clear, safetys on in the safe zone.</li>
                    </ul>
                    </li>
                    <li>Minimum engagement with AEGs and Pistols is 15 feet.</li>
                    <li>Minimum engagement with all guns above 400 FPS is 50 feet.</li>
                    <li>Do not shoot full auto at close range.</li>
                    <li>Do not misrepresent your dead/down/alive status. (no playing dead)</li>
                    <li>Dead men do not talk.</li>
                    <li>Do not use dead players, referees, or spectators as human shields.</li>
                    <li>All body hits count. Gear hits count. Riccochets do not count. Gun hits only count if the BB would pass through the gun and hit your body or gear.</li>
                    <li>Do not attempt to use hopup to shoot around corners.</li>
                    <li>Avoid headshots. Aim center mass when possible.</li>
                    <li>Use safety kills. Safety kill can only be called when you have the upper hand.</li>
                    <li>No bang-bangs. Engage safely, use a safety kill, parlay, or 1 for 1.</li>
                    <li>Rubber knife kills are allowed using a gentle tap, not a stab.</li>
                    <li>Riot shields are allowed only for the assault class while wielding a pistol.</li>
                    <li>Do not call other player&#39;s hits. If you notice a player not calling their hits, please tell either Chris or Russell.</li>
                    <li>Grenades and other explosive have a 20 foot kill radius unless obstructed by a solid object. When in doubt, think, &quot;If that were a real grenade, would I have been hit by it?&quot;</li>
                    </ul>
                    <p>Airsoft relies heavily on the honor system, so please be respectful and engage safely. Remember the golden rule.</p>
                    <p>Questions? Ask Russell and I at any time if you have any questions.</p>
                    <h4 id="gameplay">Gameplay</h4>
                    <p>This is a team focused, class-based combat game which uses a computerized capture point system to keep score. Today we have two games planned, each lasting up to two ours, with no breaks. Obviously if you need to take a break, please do so by exiting the field and coming to the staging zone. Remember mags out, guns clear, safeties on in the safezone.</p>
                    <p>This game is REDFOR vs. BLUFOR. Each team has a variety of classes. One captain, one medic, one sapper, one grenadier, and any number of assaults. Each class has unique abilities which can be used to help your team, or hinder the opposing team.</p>
                    <p>There are four control points today. Goblin Fortress, King&#39;s Tower, Troll Bridge, and Swamp City. Each team starts with one control point, marked with a virtual flag in their team&#39;s color. There remain two grey flags on the map, which either team can claim. When a player dies, they can respawn at any control point owned by their team. Here&#39;s the live game map (show map.) As control points are captured, the map will update on your phone to show you the live status. You can respawn at any solid bordered control point. If a control point has a dashed border, it is contested by the opposing team and you cannot spawn at it.</p>
                    <p>Control points owned by an enemy are converted to your team&#39;s color in two stages, dismantling and capturing. The first stage is dismantling, this is where you must turn the opponent team&#39;s flag color into grey. Second stage is capturing, this is where you turn a grey flag into your own team&#39;s color.</p>
                    <p>Any player class can capture or dismantle a control point, but certain player classes can do one or the other twice as fast.</p>
                    <p>In Operation: Green Fox, the hit rules are a little different than most airsoft games. When you are hit, call &quot;HIT!&quot; three times, raise your arms, place your dead-rag on your head, and sit on the ground where you were hit. You are not dead yet, you are just [downed]. You remain [down] for thirty seconds, so start counting out loud. If you aren&#39;t [healed] within 30 seconds, you [bleed out], and are [dead], then you can walk back to a respawn. A captain can use [self-heal] to save themselves from [bleeding out], but only after being down for 30 seconds.</p>
                    <p>The Captain is an important class, focused on helping their team succeed. Their abilities are [Self-heal], which lets them heal themself instead of [bleeding out] and having to walk back to respawn. The captain&#39;s second ability is [Claim], which lets them turn grey flags into their team&#39;s color flags in half the time as other players.</p>
                    <p>The Medic is essential to a team&#39;s well being. The medic heals downed players so they don&#39;t have to walk back to a respawn. A medic cannot heal themselves.</p>
                    <p>The Sapper is well versed in destroying things. Their special ability is [Sabotage], which lets them [dismantle] an opponent&#39;s flag in half the time as other players.</p>
                    <p>The Grenadier...</p>
                    <p>The Assault...</p>
                    <p>I&#39;ll start by introducing the player ID cards. These cards will be printed out at the start of each game, and they will you about your in-game identity. This game is REDFOR vs. BLUFOR and here I have the ID card for Ronald Ronaldsen who is on team BLU. Ronald is a Medic,</p>
                    <p>For this game, you will need a phone with an internet connection, and any generic QR code scanner app. We have WiFi repeaters set up on the field, with access point name .... The password is .... </p>
                    <p>When you get your player card, scan the QR code labelled, [register], and open the scanned link in your web browser. The link will take you to a website which will save a cookie on your browser. When you scan subsequent QR codes, the cookie saved in your browser will tell the game server which player identity you are using, and allow the action as long as your player has that ability. (This prevents a medic from using bounty, for example.)</p>
                    <p>To use an ability, scan the QR code...</p>

                </div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        name: 'AboutGreenFox',
        data () {
            return {
                headers: [
                    {
                        text: 'Time',
                        align: 'left',
                        sortable: true,
                        value: 'time'
                    },
                    { text: 'Activity', value: 'activity' }
                ],
                items: [
                    {
                        time: '09:00',
                        activity: 'Arrive and get situated'
                    },
                    {
                        time: '09:30',
                        activity: 'Safety briefing, Mission briefing.'
                    },
                    {
                        time: '10:00',
                        activity: 'Morning game'
                    },
                    {
                        time: '12:15',
                        activity: 'Break'
                    },
                    {
                        time: '12:30',
                        activity: 'Afternoon game'
                    },
                    {
                        time: '15:00',
                        activity: 'Day game Endex'
                    },
                    {
                        time: '15:01',
                        activity: 'Long break'
                    },
                    {
                        time: '19:00',
                        activity: 'Night game setup'
                    },
                    {
                        time: '19:30',
                        activity: 'Safety and mission briefing'
                    },
                    {
                        time: '19:45',
                        activity: 'Night game'
                    },
                    {
                        time: '20:45',
                        activity: 'Break'
                    },
                    {
                        time: '21:00',
                        activity: 'Night game (continued as long as players are interested)'
                    },
                ]
            }
        }
    }

</script>


<style>
</style>
