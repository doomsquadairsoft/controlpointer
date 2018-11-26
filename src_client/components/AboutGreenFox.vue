<template>
    <v-container>
        <v-layout row>
            <v-flex lg6 md9 sm12>
                <h1>Operation: Green Fox III</h1>
                <img :src="greenFoxLogo" width="50%"></img>
                <p>The year is <span style="font-family: 'DSEG7-Modern';">2020</span>. The scientific community is baffled as a rare, exotic material dubbed <span class="orange-main">DooM</span><span class="orange-sub">ium</span> has mysteriously appeared throughout <span style="color: cyan;">Bluunia</span>. Enticed by the idea of weaponizing the material and becoming a global superpower, the country of <span style="color: red;">Reddskad</span> sends an invasion force to occupy <span style="color: cyan;">Bluunia</span> and collect the rare material.</p>
                <p>Will <span style="color: red;">Reddskad</span> launch a successful invation? Or will <span class="orange-main">DooM</span><span class="orange-sub">ium</span> remain under control of it's origin country <span style="color: cyan;">Bluunia</span>? Join us for Operation: Green Fox III at the Grimmett Complex in spring 2019. The fate of <span class="orange-main">DooM</span><span class="orange-sub">ium</span> and <span style="color: cyan;">Bluunia</span> rests in your hands...</p>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import greenFoxLogo from '@/assets/greenfox.png'
    export default {
        name: 'AboutGreenFox',
        computed: {
          greenFoxLogo: () => greenFoxLogo
        },
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
.orange-main {
    color: #cc6600;
    font-weight: bold;

}
.orange-sub {
    color: #cc6600;
}
</style>
