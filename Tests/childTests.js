const tap = require('tap');
const childModule = require('../main.js');
const testEnv = require('child-development-kit');


// run test env

// create X copies of course obj (or the course)


function runTest() {
    //testEnv()

    childModule(courseObj1, (result)=>{
        if (result === '?') return true;
        else return false;
    });
}

var t1 = tap.pass(childModule(param1));
var t2 = tap.pass(childModule(param2));
var t3 = tap.pass(childModule(param3));
var t4 = tap.pass(childModule(param4));
var t5 = tap.pass(childModule(param5));

module.exports = [t1, t2, t3, t4, t5];
