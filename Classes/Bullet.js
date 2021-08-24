var Vector3 = require('./Vector3');
var ServerObject = require('./ServerObject');

module.exports = class Bullet extends ServerObject {
    constructor() {
        super();
        this.direction = new Vector3(0,0,0);
        this.speed = 10;
        this.isDestroyed = false;
        this.activator = '';
    }

    onUpdate(){
        this.position.x += this.direction.x * this.speed;
        this.position.y += this.direction.y * this.speed;
        this.position.z += this.direction.z * this.speed;

        return this.isDestroyed;
    }
}
