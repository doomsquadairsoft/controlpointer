<template>
  <div class="home">

    <h3>Upcoming Events</h3>

    <p><router-link to="green-fox-ii">Operation: Green Fox II</router-link> April 21st 2018 @ Grimmett Complex @ 9AM PDT</p>


    <h3>Past Events</h3>

    <p>We had a great time in April 2017 for <a href="http://evite.me/Xcy9BNxshj" target="_blank">Operation: Green Fox</a></p>


    <h3>Photo Gallery</h3>

    <p>We post all game photos to our <a href="http://doomsquadairsoft.imgur.com/" target="_blank">Imgur photo gallery</a></p>


    <h3>YouTube</h3>

    <p>We post all videos to our <a href="https://www.youtube.com/user/DoomSquadAirsoft" target="_blank">DoomSquadAirsoft Youtube Channel</a>


    <h3>Facebook</h3>

    <p>Check us out on <a href="https://www.facebook.com/pages/Doom-Squad-Airsoft/141967249196887" target="_blank">Facebook</a></p>

  </div>
</template>

<script>

export default {
  name: 'Welcome',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
