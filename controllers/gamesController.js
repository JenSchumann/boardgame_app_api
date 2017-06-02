const express = require('express');
const router = express.Router();
const request = require('request');
const Game = require('../models/game');
const Session = require('../models/session');

const exampleGames = require('../data/exampleGames');

// index
router.get('/', (req, res) => {
  console.log('request for user: ', req.session.loggedInUser);
  if (!req.session.loggedInUser) {
    res.json(exampleGames);
  } else {
    console.log("Finding all games for: ", req.session.loggedInUser);
    Game.find({ userName: req.session.loggedInUser.username})
      .sort({date: 'descending'}).exec((err, games) => {
      if (err) throw err;
      res.json(games);
    });
  }
});

// show
router.get('/:id', (req, res) => {
  console.log('id param: ', req.params.id);
  Game.findById(req.params.id, (err, foundGame) => {
    if (err) throw err;

    if (foundGame.isExpansion) {
      Game.find({ 'gameId' : foundGame.expands[0].gameId }, 'name id plays', (experr, parentGames) => {
        foundGame.expansions = parentGames;
        res.json(foundGame);
      });
    } else {
      Game.find({ 'expands.gameId': foundGame.gameId}, 'name id plays', (err, expansions) => {
        console.log('expansions: ', expansions);
          foundGame.expansions = expansions;
          res.json(foundGame);
      });
    }
  });
});

// create
router.post('/', (req, res) => {
  if (!req.session.loggedInUser.username) {
    res.send({status: 401, message: "Unauthorized"});
  } else {
    req.body.userName = req.session.loggedInUser.username;
    Game.create(req.body, (err, newGame) => {
      if (err) {
        console.log('Create game Error: ', err);
        res.json(err);
      } else {
        console.log('game successfully added to database for user: ', req.session.loggedInUser.userName );
        res.json(newGame);
      }
    });
  }
});


module.exports = router;
