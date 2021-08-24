var shortID = require('short-id');
var Vec3 = require('../Vector3');
const Vector3 = require('../Vector3');

module.exports = class ServerItem{
    constructor(){
        this.username = "ServerItem";
        this.shortID = shortID;
        this.position = new Vector3();
    }
}