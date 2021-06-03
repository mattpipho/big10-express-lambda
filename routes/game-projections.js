var express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var router = express.Router();
router.use(awsServerlessExpressMiddleware.eventContext())
const games_projections = require('../utilities/game-projections-scrapper');


/* GET users listing. */
router.get('/', function(req, res, next) {
  let year = req.query.year;
  let week = req.query.week;
  (async () => {
    let games = await games_projections.games(year,week);
    res.json(games);
  })(); 

});
router.get("/:id", function(req,res,next) {
  console.log('individual game' + req.params.id)
  console.log('week: ' + req.query.week);
  res.json({"id":12345,"homeTeam":"RUTG","visTeam":"IA"});
})

module.exports = router;