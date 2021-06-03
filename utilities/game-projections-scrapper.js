//https://blog.bitsrc.io/https-blog-bitsrc-io-how-to-perform-web-scraping-using-node-js-5a96203cb7cb

const axios = require('axios');
const cheerio = require('cheerio');


//const url = 'https://corkeycreations.com'

function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
      // We don’t escape the key '__proto__'
      // which can cause problems on older engines
      obj[k] = v;
    }
    return obj;
  }


async function getGames(year,week) {
    const base_url = 'https://www.espn.com/college-football/scoreboard/_/group/5/';
    const url = base_url + 'year/' + year + '/seasonType/2/week/' + week;
    console.log(url);
    let res = await axios.get(url).catch((err) => console.log(err + '  -  ERROR getting ' + url));

    let predictedScores = new Map();

    if(res.status === 200) {
        const html = res.data;
        const $ = cheerio.load(html); 


        let scripts = $('script');

        let scoreboardData = scripts[13];

        let scriptText = scoreboardData.children[0].nodeValue;
        let startChar = scriptText.indexOf('=');
        let endChar = scriptText.indexOf('};');

        let scoreboardText = scriptText.substring(startChar +2, endChar+1);
        let scoreboard = JSON.parse(scoreboardText);

        for(let i=0; i<scoreboard.events.length; i++){

            let shortName = scoreboard.events[i].shortName;
            //console.log('Game: ' + scoreboard.events[i].shortName);
            if(scoreboard.events[i].competitions[0].hasOwnProperty('odds') &&
                scoreboard.events[i].competitions[0].odds[0].hasOwnProperty('details') &&
                scoreboard.events[i].competitions[0].odds[0].hasOwnProperty('overUnder')){



                let odds = scoreboard.events[i].competitions[0].odds[0].details.split(' ');
                let overUnder = scoreboard.events[i].competitions[0].odds[0].overUnder;
                //console.log('  Odds: ' + odds[0] + ' ' + odds[1]);
                //console.log('  Over/Under: ' + overUnder);


                let teams = scoreboard.events[i].shortName.split("@");
                teams.forEach((val,index,arr) => {
                    arr[index] =  val.trim();
                });
                let winningScore = overUnder/2 - odds[1]/2;
                let losingScore = overUnder/2 + odds[1]/2;


                if(teams[0] === odds[0]){
                    predictedScores.set(teams[0],
                        {"score":winningScore,
                         "opponent_score":losingScore,
                         "opponent":teams[1],
                         "outcome":"WIN"});
                    predictedScores.set(teams[1],
                        {"score":losingScore,
                         "opponent_score":winningScore,
                         "opponent":teams[0],
                         "outcome":"LOSS"});
                } else {
                    predictedScores.set(teams[1],
                        {"score":winningScore,
                         "opponent_score":losingScore,
                         "opponent":teams[0],
                         "outcome":"WIN"});
                    predictedScores.set(teams[0],
                        {"score":losingScore,
                         "opponent_score":winningScore,
                         "opponent":teams[1],
                         "outcome":"LOSS"});
                }



            } else {
                console.log(shortName + ': NO ODDS AVAILABLE');
            }

            

        }

        //console.log(data);
    
        

    }

    let jsonPredictedScores = strMapToObj(predictedScores)
    return jsonPredictedScores;

}

module.exports.games = getGames;


