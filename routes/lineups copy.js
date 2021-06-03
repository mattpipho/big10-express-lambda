var express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var router = express.Router();
router.use(awsServerlessExpressMiddleware.eventContext())

var pool = require('../database');



function setPositionPlayers(result,lineups){

  result.forEach((value,index) => {
    let lineup = lineups.find((element) =>{
      return element.username == value.username &&
            element.year == value.year && 
            element.week == value.week;
    });
    if(lineup == undefined){
      lineup = {"username": value.username,
              "year": value.year,
              "week": value.week}
      lineups.push(lineup);
    } 
    

    if(value.position == "QB" || value.position == "K") {
      if(!lineup.hasOwnProperty(value.position)){
        lineup[value.position] = {"team": value.team,
                            "last_name": value.lastname,
                            "player_id": value.playerid,
                            "espn_id": value.cbsid};
      } 
    } else {
      if(!lineup.hasOwnProperty(value.position)){
        lineup[value.position] = [];
      }
      let p = {"team": value.team,
                "last_name": value.lastname,
                "player_id": value.playerid,
                "espn_id": value.cbsid}
      lineup[value.position].push(p);
    }
  });
  return lineups;
}

/* GET users listing. */
router.get('/', function(req, res, next) {

    let lineups = [];

    //Get Player Picks
    let sql = `select username,ps.year,ps.week,ps.playerid,pi.lastname,team,position,cbsid
                from playerselection ps join playerinfo pi on ps.playerid = pi.playerid
                where ps.year = '${req.query.year}' and username = '${req.query.username}'`;
    pool.query(sql, function (err, result) {
      if (err) {
        console.log(err);
        res.end( err);
      //console.log("Result: " + JSON.stringify(result));
      } else {
        
        setPositionPlayers(result,lineups);

      }
      res.json(lineups);
    });
});

module.exports = router;