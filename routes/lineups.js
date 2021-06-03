var express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var router = express.Router();
router.use(awsServerlessExpressMiddleware.eventContext())

var pool = require('../database');
const asyncHandler = require('express-async-handler');



const getPlayerPicks = async(req) => {


  let sql = `select username,ps.year,ps.week,ps.playerid,pi.lastname,team,position,cbsid
  from playerselection ps join playerinfo pi on ps.playerid = pi.playerid
  where ps.year = '${req.query.year}' `
  if(req.query.username != undefined) sql += ` and username = '${req.query.username}'`;

  const result = await pool.query(sql); 
  if (result.length < 1) {
    throw new Error('No Lineups found');
  }
  return result;

}

const getDefensePicks = async(req) => {

  let sql = `select username,year,week,team,"DEF" as position
  from defenseselection
  where year = '${req.query.year}' `
  if(req.query.username != undefined) sql += ` and username = '${req.query.username}'`;

  const result = await pool.query(sql); 
  if (result.length < 1) {
    throw new Error('No Lineups found');
  }
  return result;

}

const getWinPicks = async(req) => {

  let sql = `select username,year,week,team,"WIN" as position
  from winselection
  where year = '${req.query.year}' `
  if(req.query.username != undefined) sql += ` and username = '${req.query.username}'`;

  const result = await pool.query(sql); 
  if (result.length < 1) {
    throw new Error('No Lineups found');
  }
  return result;

}

function addToLineup(value,combined) {

  let pick = combined.find((element) =>{
    return element.username == value.username &&
          element.year == value.year && 
          element.week == value.week;
  });
  if(pick == undefined){
    pick = {"username": value.username,
            "year": value.year,
            "week": value.week}
    combined.push(pick);
  }   
  
  if(value.position == "QB" || value.position == "K") {
    if(!pick.hasOwnProperty(value.position)){
      pick[value.position] = {"team": value.team,
                          "last_name": value.lastname,
                          "player_id": value.playerid,
                          "espn_id": value.cbsid};
    } 
  } else {
    if(!pick.hasOwnProperty(value.position)){
      pick[value.position] = [];
    }
    let p = {"team": value.team,
              "last_name": value.lastname,
              "player_id": value.playerid,
              "espn_id": value.cbsid
            }
    pick[value.position].push(p);
  }
 
}

const mergePicks = (playerPicks,defensePicks,winPicks) => {
  let combined = [];
  
  playerPicks.forEach((value) => {
    addToLineup(value,combined);
  })
  defensePicks.forEach((value) => {
    addToLineup(value,combined);
  })
  winPicks.forEach((value) => {
    addToLineup(value,combined);
  })

  return combined;

}

/* GET users listing. */
router.get('/', asyncHandler(async (req, res, next) => {

  
  const playerPicks =  getPlayerPicks(req);
  const defensePicks =  getDefensePicks(req);
  const winPicks =  getWinPicks(req);

  const allPicks = await Promise.all([playerPicks,defensePicks,winPicks]);
  
  let lineups = mergePicks(...allPicks);

  res.send(lineups);

}));

module.exports = router;