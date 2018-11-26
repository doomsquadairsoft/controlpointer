<template>
      <v-container class="about-doom-squad">
        <v-layout>
          <v-flex lg6>
        <h1>About DooM Squad Airsoft</h1>

        <v-layout align-center>
            <v-flex lg2>
                <img style="width: 25vw" :src="doomsquadPeople"></img>
            </v-flex>
        </v-layout>
        <p>Doom Squad Airsoft is an airsoft clan located in the Pacific Northwest, USA. We enjoy running around in the woods and shooting each other with plastic BBs in fast paced, semi-competitive war gaming. We often take ideas from video games such as Counter-Strike, Battlefield, Call of Duty, and apply them to custom airsoft games.</p>
        <p class="mb40">Our games incorporate pyrotechnics, realistic props, special airsoft weapons, and computerized point tracking systems. We love this action pursuit sport and we are always looking for innovative game experiences. Come out to play sometime, we'd love to have you!</p>

        <h1>About Controlpointer</h1>
        <v-layout align-center>
            <v-flex lg2>
                <img style="width: 25vw" :src="controlpointerExample"></img>
            </v-flex>
        </v-layout>
        <p>Controlpointer solves the problem of players not knowing where to respawn. Created by airsoft field admins for airsoft field admins, Controlpointer is server software which renders a <span class="cRed">LIVE</span> game map that represents the active state of the game.<span class="superscript">*</span></p>
        <p>Controlpointer makes the airsoft field admin's life easier. Timers, capture states, point tracking, pyrotechnics inventory, and more are handled by Controlpointer.</p>
        <p>Controlpointer features game modes found in video games such as Counter-Strike Bomb Diffusal, Call-of-Duty Domination, and Battlefield Sector Control.</p>

        <p>Players visit this webpage on their phone, and instantly they can tell by the color of the displayed flags which control points are available for them to respawn at.</p>
        <p>Administrators visit the same webpage and are able to select game type, designate hardware or virtual D3VICES placed on the field, start/stop/pause the game, remotely operate controlpoints, trigger sound effects on remote PA systems, launch pyrotechnics, and more.</p>

        <p>Finally, rich airsoft experiences for your players all with minimal effort!</p>
        <v-divider></v-divider>

        <p class="footnote"><span class="superscript">*</span>Controlpointer is a pre-alpha work-in-progress. Alpha status is slated for Q1 2019. Check back for updates!</p>

        <h3>Contact Info</h3>
        <ul>
            <li>E-Mail <a href="mailto:info@doomsquadairsoft.com">info@doomsquadairsoft.com</a></li>
            <li>Twitter <a href="https://twitter.com/DoomAirsoft">@DoomAirsoft</a></li>
        </ul>
      </v-flex>
      </v-layout>
    </v-container>
</template>

<script>
    import doomsquadPeople from '@/assets/doomsquad_0.jpg';
    import controlpointerExample from '@/assets/controlpointer_example.png';
    export default {
        name: 'About',
        computed: {
            doomsquadPeople: () => doomsquadPeople,
            controlpointerExample: () => controlpointerExample
        }
    }
</script>


<style>
.cRed {
    color: red;
}
.superscript {
    position: relative;
    top: -0.5em;
    font-size: 80%;
}
.footnote {
    color: DarkGray;
    margin-top: 1em;
}
li {
    margin-left: 2em;
}
</style>
