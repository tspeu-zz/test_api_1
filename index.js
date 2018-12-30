// docker build -t test/test1:1.0 .
// docker run -p 8080:8080 test/test1:1.0
const express = require('express');
const fs = require('fs');
const JSONStream = require('JSONStream');
const bodyParser = require('body-parser');
const _ = require('lodash');
const ctrlMain = require('./mainController.js');

const app = express();

//use middleware
app.use(bodyParser.urlencoded( {extended:true}));
app.use(bodyParser.json());

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);


app.get('/', (req, res) => {
    var readable = fs.createReadStream('example_1.json');
        // './users/' + username + '.json');
    readable
    //.pipe(JSONStream.stringify('[\n  ', ',\n  ', '\n]\n'))
    .pipe(res);

    //res.send('hello world -())!') //send html
    //send JSON 
    // res.send({name:"something"});
});

app.post('/matching',(req , res ) =>{
    res.send('POST sent to /matching')

    });


app.post('/api/matching',(req, res) => {
    try {
        //console.log('req es:' + JSON.stringify(req))
        const data =  _.pick(req.body, ['workers','shifts']);
        // let workerList =[];
        // let shiftsList = [];
        // workerList = JSON.stringify(data.workers);
        // shiftsList = JSON.stringify(data.shifts);
        ////////////////////////////
        let msmOut = "";
        let msmErr = "";

        console.log('reciving from view post data...'); 
        //console.log('req es:' + JSON.stringify(req.body));

        //TODO WORKERS
        const workerList = req.body.workers;
        //console.log('---->'+ workerList +'-------------');
        // console.log('---->'+ workerList.length +'-------------');
        // console.log('---->'+ _.isArray(workerList) +'-------------');
        // console.log('---->'+ _.isEmpty(workerList) +'-------------');
        
        //TODO SHIFT
        const shiftsList = req.body.shifts;
        //console.log('---->'+ shiftsList +'-------------');
        // console.log('---->'+ shiftsList.length +'-------------');
        // console.log('---->'+ _.isArray(shiftsList) +'-------------');
        // console.log('---->'+ _.isEmpty(shiftsList) +'-------------');


        //TODO MATCHLIST
        let matchList = [];

        

        /**TODO*/
        //       * check for shifts 
        if( checkList(_.isArray(shiftsList), _.isEmpty(shiftsList)) ) {
            console.log('hay SHIFTS->TODO: Hay que iterar en los turnos');

        //check for workerArray    
            if(checkList(_.isArray(workerList), _.isEmpty(workerList))) {

                console.log('HAY WORKER  EMPEZAMOS A EMPAREJAR');

                //verificar cantidad de SHIFTs y WORKERs para poder repartir los turnos
                let resLenght = checkLength(shiftsList.length, workerList.length);
                console.log('examinar caso:> '+ resLenght);

                switch (resLenght) {
                    case 1:
                        console.log('mismos SHIFTS y WORKERS');
                        msmOut = 'mismos SHIFTS y WORKERS';
                        //TODO workinDays
                        let workerListMap = _.map(workerList );
                        let worDays = _.map(workerList,'availability' );
                        console.log( worDays);
                        //console.log(workerListMap);

                        for(let s of shiftsList) {
                            let shifToday = s.day;
                            console.log('*************SHIFT DEL DIA: '+ shifToday+'**************');

//TODO PREPARAR EL ARRAY Y QUITAR LOS REPETIDDOS-> DEJANDO SOLO LA PRIMERA COICIDENCIA
                            for (let i=0; i < workerListMap.length; i++ ) {

                                for (let wd=0; wd < workerListMap[i].availability.length; wd++) {

                                    if (shifToday == workerListMap[i].availability[wd]) {
                                        console.log('id '+ workerListMap[i].id+' aki-> '+workerListMap[i].availability[wd]);
                                    }
                                }
                            }


/*
                            
                            for (let j=0; j < workerListMap.length ; j++) {
                                
                            // console.log('worker Working id'+ workerListMap[j].id);
                                let worker = workerListMap[j];
                                let wDays =  workerListMap[j].availability;
                                // console.log('----worker : ' + JSON.stringify(worker) );                 
                                //console.log('----wDays : ' + wDays );                 
                                console.log('worker ID: '+workerListMap[j].id +' availability:' + wDays);                 
                                

                            /*
                                for (let wd=0; wd < wDays.length; wd++) {
                                    //console.log('working days: '+ wDays[wd]);
                            
                                    if (shifToday ==  wDays[wd]) {
                                        console.log('%%%% MATCHING ID WORKER :' +workerListMap[j].id +'SHIFT: '+  wDays[wd]);
                                        
                                        workerListMap = _.without(workerListMap,shifToday );
                                        console.log('sin '+shifToday + ' - '+workerListMap);
                                        //_.filter(workerListMap.availability,shifToday );
                                        //_.remove(workerListMap,shifToday );
                                    }
                            
                                }
                            */    

                            console.log('---------------------------------END WORK');
                                
                            //}

            
                        }



                    break;
                    
                    case 2:
                        console.log('MAS SHIFTS y WORKERS');
                        msmOut = 'MAS SHIFTS > WORKERS';
                    break;

                    case 3:
                        console.log('MENOS SHIFTS y WORKERS');
                        msmOut = 'MENOS SHIFTS < WORKERS';
                    break;

                    default:
                    console.log('ERROR SHIFTS y WORKERS');
                    msmOut = 'ERROR SHIFTS - WORKERS';
                    break;
                }


            }else {
                console.log('NO HAY WORKER --SALIMOS');
                msmOut = 'NO HAY WORKER --SALIMOS';
            } 


        }
        else {

            console.log('NO hay SHIFTS');
            msmOut = 'NO HAY SHIFTS --SALIMOS';
        }


        res.send({'res': msmOut})

    } 
    catch (e) {
        res.status(400).send(e);
    }
});

/************************************************************************************************** */
/**CHECK FOR LIST TODO crear utilitys o common.js para poner esto
 * OJO SIEMPRE HAY QUE ENVIAR UN ARRAY aunque sea []
 */
function checkList( isArray, isEmpty) {

    return (isArray === true && isEmpty === false) ? true : false;
}

//TODO refactorizar FIX
function checkLength(listShifts, listWorkers ) {
    let length = 0;

    if (listShifts == listWorkers) {
        length = 1;
    }
    else if (listShifts > listWorkers) {
        length = 2;
    }
    else if (listShifts < listWorkers) {
        length = 3;
    }
    else {
        length = 0;
    }

    return length;
}
/************************************************************************************************** */

var server = app.listen(3003, function() {
    console.log('server running at port :' + server.address().port);
});