/*
 * This file is part of sensorTSL2561 for node.
 *
 * Copyright (C) Thomas Schneider, imwebgefunden@gmail.com
 *
 * sensorTSL2561 for node is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * sensorTSL2561 for node is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with sensorTSL2561 for node.  If not, see
 * <http://www.gnu.org/licenses/>.
 */

/* jslint node: true */
"use strict";

var async = require('async');
var i2cFakeDev = require('./fakedevice/fake_i2c_tsl2561_dev.js');
var proxyquire = require('proxyquire').noCallThru();

var TSL2561 = proxyquire('./../tsl2561', {
    'i2c': i2cFakeDev
});

var sens = new TSL2561();
var nrOfSec = 60;

sens.on('newSensorValues', function(allData) {
    console.log('received event "newSensorValues" - calculating ...');
    var ir = allData.sensValues.rawData.addr_0x0F << 8 | allData.sensValues.rawData.addr_0x0E;
    var full = allData.sensValues.rawData.addr_0x0D << 8 | allData.sensValues.rawData.addr_0x0C;
    console.log('IR      : ' + ir);
    console.log('FULL    : ' + full);
    console.log('VISIBLE : ' + (full - ir));
    console.log('LUX     : ' + allData.sensValues.devData.light.value);
    console.log(JSON.stringify(allData, null, 2));
});

function sensRead() {
    async.timesSeries(nrOfSec, function(n, next) {
        setTimeout(function() {
            sens.getAllValues(next);
            /*
            sens.getLux(function(err, val) {
            //console.log(err)
            console.log('light value is: ' + val + ' lux');	
            next (err, val);				
			})
			*/
        }, 1000);
    }, function(err, res) {
        // finished
        if (err) {
            console.log('Error occurred: ' + err);
        } else {
            console.log('finished');
        }
    });
}

console.log('sensor init ...');
sens.init(function(err, val) {
    if (err) {
        console.log('error on sensor init: ' + err);
    } else {
        console.log('sensor init completed. Read for 60 seconds on faked device ...');
        sensRead();
    }
});
