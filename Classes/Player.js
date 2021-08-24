var shortid = require('short-id');
var Vector3 = require('./Vector3.js');
//var Vector2 = require('./Vector2.js');

module.exports = class Player {
    constructor() {
        this.username = 'Default_Player';
        this.id = shortid.generate();
        this.lobby = 0;
        this.position = new Vector3(0,0,0);
        this.tankRotation1 = new Vector3(0,0,0);
        this.tankRotation2 = new Vector3(0,0,0);
        this.tankRotation3 = new Vector3(0,0,0);
        this.turretRotation = new Vector3(0,0,0);
        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
        this.numberStart = 0;
    }

    displayerPlayerInformation() {
        var player = this;
        return '(' + player.username + ' : ' + player.id + ')';
    }

    respawnCounter() {
        this.respawnTicker = this.respawnTicker + 1;

        if (this.respawnTicker >= 10) {

            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            // three second respond time 
            if (this.respawnTime >= 3) {
                //console.log(' Respawning player id: ' + this.id);
                this.isDead = false;
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                this.poition = new Vector3(0 , 0 ,0 );
                return true;
            }
        }
    }

    dealDamage(amount = Number) {
        this.health = this.health - amount;
        // 
        if (this.health <= 0) {
            this.isDead = true;
            this.respawnTicker = new Number(0);
            this.respawnTime = new Number(0);
            console.log('died');
        }
        return this.isDead;
    }

}

