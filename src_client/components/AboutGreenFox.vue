<template>
    <v-container>
        <v-layout>
            <v-flex xs12 md9>
                <div class="about-green-fox">
                    <h1 id="operation-green-fox">Operation: Green Fox III</h1>
                    <h2 id="event-description">Event Description</h2>
                    <p>A competitive airsoft game by DooM Squad Airsoft featuring special player classes, pyrotechnics and special equipment.</p>
                    <h3 id="redfor-vs-blufor">REDFOR vs. BLUFOR</h3>
                    <p>OP: Green Fox III has two opposing forces, identified by colored arm bands.</p>
                    <h3 id="doom-device">REDFOR vs. BLUFOR</h3>
                    <p>DooM Squad has created an electronic control point solution dubbed, "DooM D3vices". The devices are small boxes with arcade buttons which wirelessly connect together and enable videogame-style gameplay, capture point stracking, statistics gathering, post-game reporting, etc. During OP: Green Fox III, each control point will have one of these doom devices which players can interact with. The device has color coded pushbuttons which players can press to capture the control point for their team, REDFOR or BLUEFOR. Players can use their smartphones to see the status of each control point by viewing the map page on this website. Players can respawn at any point controlled by their own team.</p>
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
                    <h3 id="prizes">Prizes</h3>
                    <p>All participants in this event will be entered to win one of several raffle prizes! Special prizes will be awarded to most valuable players voted by each team.</p>
                    <h3 id="schedule">Schedule</h3>
                    <p>All times PDT</p>
                    <v-data-table
                        :headers="headers"
                        :items="items"
                        hide-actions
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


                    <h2 id="mission">Mission: AAS - Advance And Secure.</h2>
                    <p>The mission is field domination. Capture all four control points for your team to win the round. (5 points)</p>

                    <h3 id="death-tickets">Death Tickets</h3>
                    <p>Both teams start with 50 death tickets. When a player dies, they must go to one of their team&#39;s control points and expend one death ticket to respawn. If a team exhausts all their death tickets, that team loses.</p>
                    <p>Death ticket deduction only applies when players respawn at a control point. (Medics and Captain abilities do not deduct death tickets.)


                    <h3>Secondary objectives</h3>
                    <p>Winning the round isn't the only way to gain points for your team. Each player class has secondary objectives which grant their team one additional point if completed.</p>

                    <h4>Grenadier</h4>
                    <p>(1 point) Use a grenade to aid in the capture of a control point</p>

                    <h4>Medic</h4>
                    <p>(1 point) Heal 5 teammates</p>

                    <h4>Sapper</h4>
                    <p>(1 point) Use satchel charge to prevent the opposing team from capturing a control point</p>

                    <h4>Captain</h4>
                    <p>(1 point) Posess a self-heal token card at the end of the round</p>

                    <h4>Assault</h4>
                    <p>(1 point) Get 5 confirmed kills</p>

                    <h2>Rules</h2>
                    <p>Player safety is of utmost importance. Please follow these rules for everyone's safety.</p>




                    <ul>
                    <li>All guns must chrono at or below 400 Feet per second with 0.20g BBs. (1.49 Joules max)</li>
                    <li>Sniper rifles allowed under special conditions only (Ask Russell or Chris)</li>
                    <li>Do not blind fire. Blind firing is any time you are shooting and are not clearly looking down your gun. There is one exception for if you are using a gun camera :)</li>
                    <li>Eye protection must be ANZI 87 certified and be worn at all times on the field.</li>
                    <li>Mouth guards and ear protectors are suggested.</li>
                    <li>Safe zones are the staging area and parking lot. This is very important for everyone&#39;s safety, since there are people without eye protection in safe zones, Chris will bark at you if he sees live guns in these areas.</li>
                    <li>No test firing in the safe zone</li>
                    <li>Mags out, guns clear, safeties on in the safe zone.</li>
                    </ul>
                    </li>
                    <li>Minimum engagement with AEGs and Pistols is 15 feet.</li>
                    <li>Minimum engagement with all guns above 400 FPS is 50 feet.</li>
                    <li>Do not shoot full auto at close range.</li>
                    <li>Do not misrepresent your dead/down/alive status. (no playing dead)</li>
                    <li>Dead men do not talk.</li>
                    <li>Do not use dead players, referees, or spectators as human shields.</li>
                    <li>All body hits count. Gear hits count. Riccochets do not count. Gun hits only count if the BB would pass through the gun and hit your body or gear.</li>
                    <li>Do not use hopup to shoot around corners.</li>
                    <li>Avoid headshots. Aim center mass when possible.</li>
                    <li>Safety kill can only be called when you have the upper hand.</li>
                    <li>No "bang-bangs". Engage safely, use a safety kill, parlay, or 1 for 1.</li>
                    <li>Rubber knife kills are allowed using a gentle tap, not a stab.</li>
                    <li>Riot shields are allowed only for the assault class while wielding a pistol.</li>
                    <li>Do not call other player&#39;s hits. If you notice a player not calling their hits, please tell either Chris or Russell.</li>
                    <li>Grenades and other explosive have a 20 foot kill radius unless obstructed by a solid object. When in doubt, think, &quot;If that were a real grenade, would I have been hit by it?&quot;</li>
                    </ul>
                    <p>Airsoft relies heavily on the honor system, so please be respectful and engage safely. Remember the golden rule.</p>
                    <p>Questions? Ask Russell or Chris at any time if you have any questions.</p>


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
                        sortable: false,
                        value: 'time'
                    },
                    {
                        text: 'Activity',
                        value: 'activity',
                        align: 'right',
                        sortable: false
                    }
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
