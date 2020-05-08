const router = require("express").Router();
const passport = require("passport");
let Game = require("../models/game.model");
let User = require("../models/user.model");

router.route("/:urlObject").get((req, res) => {
  //allow cookies
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  console.log("sse route invoked");
  const isRed = JSON.parse(req.params.urlObject).isRed === true;
  console.log("isRed and gameId after parsing:");
  console.log(isRed);
  const gameId = JSON.parse(req.params.urlObject).gameId;
  console.log(gameId);

  //set up response object
  const responseObject = {
    success: false,
    gameObject: {},
    send: false,
  }

  //set up a counter to keep track of how many times the setInterval function iterates:
  let counter = 0;
  //set up the timer function that will attempt to send an update game every second
  const timer = setInterval(() => {
    counter++;
    if (responseObject.send || counter >= 600) {
      clearInterval(timer);
    } else {
      console.log("timer is iterating, with counter equal to " + counter);
      attemptSend();
    }
  }, 1000);

  function attemptSend() {
    //locate the game from the database
    Game.findById(gameId, (err, currentGame) => {
      if (err) {
        console.log("problem finding game");
      }
      if (!currentGame) { //confirms that game exists
        console.log("couldn't find game");
        responseObject.send = true;
        res.send(responseObject);
      } else {

        //determine user authentication status, update the user object, and determine whether or not user has access based on authentication status
        let username = "guest user";
        let userId = "0";

        if (req.isAuthenticated()) {
          username = req.user.username;
          userId = req.user._id;
        }


        if (userId === "0" && currentGame.registered) {
          console.log("user not logged in");
          responseObject.send = true;
          res.send(responseObject);
        } else {

          //determine if the user is one of the game players
          const gameUser1 = currentGame.user1;
          const gameUser2 = currentGame.user2;
          console.log("userId:");
          console.log(userId);
          console.log("gameUsers:");
          console.log(gameUser1);
          console.log(gameUser2);
          if (userId != gameUser1 && userId != gameUser2) {
            console.log("determined to not be a player");
            responseObject.send = true;
            res.send(responseObject);
          } else {
            responseObject.gameObject = currentGame;
            const movesModTwo = currentGame.numberOfMoves % 2;
            if (((movesModTwo === (isRed ? 1 : 0)) && currentGame.gameStatus == "active") || currentGame.gameStatus == "completed") {
              responseObject.success = true;
              responseObject.send = true;
              console.log("successfully sending updated game");
              //set response type:
              res.set('Content-Type', 'text/event-stream');
              res.set('Cache-Control', 'no-cache');
              res.set('Connection', 'keep-alive');
              res.status(200).write("event: message\n");
              res.status(200).write("data:" + JSON.stringify(responseObject) + "\n\n");
            } else {
              console.log("current game in database has wrong number of moves");
            }
          }
        }
      }
    });
  }
});

module.exports = router;
