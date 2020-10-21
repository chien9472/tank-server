var shortID = require('short-id');
var Vector3 = require('./Vector3');

module.exports = class ServerObject{
    constructor(){
        this.id = shortID.generate();
        this.name = 'ServerObject';
        this.position = new Vector3();
    }
}