# operation-spring-app


Airsoft Field Control Point State Manager


So you have an airsoft field, and you want to play a game using control points just like `<INSERT_VIDEOGAME_NAME_HERE>`. You can set up two flags at each of your control point, but there lies a problem, especially for large fields. When your players are shot and want to go to a control point to respawn, how do they know which control point is available for their team to respawn at?

This app solves the above problem by providing each player with a live map, indicating which team controls the various control points on the field. This way, the player simply needs to view their phone after they are shot, and they proceed to their choice of spawn points based on the live data the app displays to them.


## Running the app

Satisfy dependencies

    npm install

Build players.json, a file containing random character profiles. The numbers passed as arguments coincide with the number of players who will be playing the game. Tweak to suit.

    node players.js --blu 5 --red 6

Start the game server

    npm run start


## Feedback

    If you have used and enjoy this code base, I'd love to hear from you!

    [![Say Thanks!](https://img.shields.io/badge/Say%20Thanks-!-1EAEDB.svg)](https://saythanks.io/to/insanity54)]


## Special Thanks


The following people have helped this project in some way, and deserve a mention. Thank you all for helping this project become a reality!

  * [Duion](https://opengameart.org/users/duion) for [CC0](https://creativecommons.org/choose/zero/) graphics assets
