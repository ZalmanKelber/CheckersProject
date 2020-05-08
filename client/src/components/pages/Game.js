import React from "react";
import {Redirect} from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import Header from "../sections/Header";
import Main from "./Main";

function Game(props) {

  //before rendering, determine if user has access to game, and if not, redirect
  const [redirectRoute, setRedirectRoute] = React.useState("");
  const [gameObject, setGameObject] = React.useState({});
  const [userObject, setUserObject] = React.useState({
    authenticated: false,
    userId: "0",
    username: "guest user"
  });

  //define the variable that will change upon rendering, which we can use tu call useEffect only once
  const [changed, setChanged] = React.useState(false);

  //keep track of potential error messages to be rendered on redirect
  const [errorMessage, setErrorMessage] = React.useState("Error: you must be logged in to access this game");

  //this component will also need its own need its own local version of the isRed variable in order to listen to the correct
  //server side event
  const [isRed, setIsRed] = React.useState(false);

  //set up a subsequent redirect route for after a user is redirected to the login page
  const [nextRedirectRoute] = React.useState("/game/" + props.match.params.gameurl)


  React.useEffect(() => {
    getGameObject();
  },[]);

  //function either retrieves the game object or else redirects to another page
  function getGameObject(){
    //initialize axios call
    const transport = axios.create({
      withCredentials: true
    });

    //send the post request, including the user input data, and depending on the response, either
    //redirect (home is the default redirect if there is no redirect given in props) or
    //render the error message by calling handleError
    transport.get("http://localhost:5000/game/" + props.match.params.gameurl).catch(err => {
      setRedirectRoute("/error");
    }).then(response => {
      console.log("response from axios:");
      console.log(response);
      if (response && response.data.gameObject) {
        const gameObjectCopy = response.data.gameObject;
        setGameObject(gameObjectCopy);
        const userObjectCopy = response.data.userObject;
        setUserObject(userObjectCopy);
        //we will need to define the isRed variable locally
        setIsRed(response.data.gameObject.user2 == response.data.userObject.userId);
        if (changed === false) {
          setChanged(true);
        }
          if (response.data.gameObject.user2) {
            setUpSSE(response.data.gameObject.user2 == response.data.userObject.userId);
          }
          else {
            setUpSSE(true);
          }
      }
      else {
        if (response && response.data.gameFound && !response.data.authenticationStatus) {
          const message = "Error: you must be logged in to access this game".split(" ").join("%20");
          setRedirectRoute("/login/" + message);
        }
        else if (response && response.data.gameFound === false) {
          const message = "Error: couldn't locate game".split(" ").join("%20");
          setRedirectRoute("/error/" + message);
        }
        else {
          const message = "Error: you don't have access to this game".split(" ").join("%20");
          setRedirectRoute("/error/" + message);
        }
      }
    });
  }

  //next, define the function that will send a completed game move back to the database.
  //this function will be passed down in props to the BoardArea component where it will be called once a turn is complete
  function sendMove(move) {
    console.log("PATH TO SEND: ");
    console.log(move);

    //initialize axios call
    const transport = axios.create({
      withCredentials: true
    });

    const params = {move: move};
    //send the post request, including the move, and print the response
    transport.post("http://localhost:5000/move/" + props.match.params.gameurl, queryString.stringify(params)).catch(err => {
    console.log(err);
    }).then(response => {
      console.log("response from API call:");
      console.log(response);
      setUpSSE(isRed);

    });
  }

  //define the function that sets up the server side event
  function setUpSSE(isRedReference) {
    //once we receive a response from the API call, we need to set up an event listener to listen for a server side event
    //for when the game updates within the new opponent move

    console.log("setting up SSE with following value for isRedReference");
    console.log(isRedReference);
    const urlObject = {
      isRed: isRedReference,
      gameId: props.match.params.gameurl
    }

    const sseUrl = "http://localhost:5000/sse/" + JSON.stringify(urlObject);
    let evtSource = new EventSource(sseUrl, {
      withCredentials: true
    });

    evtSource.addEventListener("message", function (event) {
      try {
        console.log("RECEIVING UPDATE FROM SERVER");
         const receivedResponseObject = JSON.parse(event.data);
         const newGameObject = receivedResponseObject.gameObject;
         console.log(receivedResponseObject);
         setGameObject(newGameObject);
         evtSource.close();
      }
      catch (err) {
        console.log("error caught: " + err);
        evtSource.close();
      }
    });
  }



  //finally, define the function that will mark a completed game as complete:
  //initialize axios call
  function completeGame() {
    console.log("completeGame function called from within Game component");
    //initialize axios call
    const transport = axios.create({
      withCredentials: true
    });
    //send the post request, including the move, and print the response
    transport.post("http://localhost:5000/complete/" + props.match.params.gameurl).catch(err => {
    console.log(err);
  }).then(response => {
    console.log("response from axios call to complete game:");
    console.log(response.data);
  })
  }


  return (
    <div className="home-container">
      {
        redirectRoute &&
        <Redirect to={{
          pathname: redirectRoute,
          state: {redirectRoute: nextRedirectRoute}
        }} />
      }
      <Header />
      <Main
        completeGame={completeGame}
        game={true}
        gameurl={props.match.params.gameurl}
        userObject={userObject}
        gameObject={gameObject}
        sendMove={sendMove}
      />
    </div>
  );
}

export default Game;
