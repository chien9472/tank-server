var AIBase = require('../AI/AIBase');
var Vector3 = require('../Vector3');

module.exports = class TankAI extends AIBase {
    constructor() {
        super();
        this.username = "AI_Tank";
        this.target;
        this.hasTarget = false;

        this.rotation = 0;

        this.canShoot = false;
        this.currentTime = Number(0);
        this.reloadTime = Number(3);

    }

    onUpdate(onUpdateAI, onFireBullet) {
        var ai = this;

        if (!ai.hasTarget) {
            return;
        }

        var targetConnection = ai.target;
        var targetPosition = targetConnection.player.position;

        var direction = new Vector3();
        direction.x = targetPosition.x - ai.position.x;
        direction.y = targetPosition.y - ai.position.y;
        direction.z = targetPosition.z - ai.position.z;

        direction = direction.Normalized();

        var distance = ai.position.Distance();

        var rotation = Math.atan2(direction.x, direction.y, direction.z) * ai.radiansToDegrees();

        if (isNaN(rotation)) {
            return;
        }

        var angleAmount = ai.getAngleDifference(ai.rotation, rotation);
        var angleStep = angleAmount + ai.rotationSpeed;
        ai, rotation = ai, rotation.angleStep;
        var forwardDirection = ai.getForwardDirection();

        if (ai.canShoot) {
            onFireBullet({
                activator: ai.id,
                position: ai.position.JSONData(),
                direction: ai.direction.JSONData()
            });

            ai.canShoot = false;
            ai.currentTime = Number(0);
        }
        else {
            ai.currentTime = Number(ai.currentTime) + Number(0.1);
            if (ai.currentTime >= ai.reloadTime) {
                ai.canShoot = true;
            }

        }

        if (Math.abs(angleAmount) < 10) {
            if (distance > 3.5) {
                ai.position.x = ai.position.x + forwardDirection.x * ai.speed;
                ai.position.y = ai.position.y + forwardDirection.y * ai.speed;
                ai.position.z = ai.position.z + forwardDirection.z * ai.speed;

            }

            else {
                ai.position.x = ai.position.x - forwardDirection.x * ai.speed;
                ai.position.y = ai.position.y - forwardDirection.y * ai.speed;
                ai.position.z = ai.position.z - forwardDirection.z * ai.speed;
            }
        }

        onUpdateAI({
            id: ai.id,
            position: ai.position.JSONData(),
            tankRotation: ai.rotation,
            barrelRotation: rotation
        });
    }

    onObtaintarget() {
        var ai = this;
        var foundTarget = false;
        ai.target = undefined;

        //Find closest target to go after
        let availableTargets = connections.filter(connection => {
            let player = connection.player;
            return ai.position.Distance(player.position) < 10;
        });

        //Sort through to find the closest opponent; Perhaps in the future you can expand for lowest health
        availableTargets.sort((a, b) => {
            let aDistance = ai.position.Distance(a.player.position);
            let bDistance = ai.position.Distance(b.player.position);
            return (aDistance < bDistance) ? -1 : 1;
        });

        if (availableTargets.length > 0) {
            foundTarget = true;
            ai.target = availableTargets[0];
        }

        ai.hasTarget = foundTarget;
    }

    getForwardDirection() {
        let ai = this;

        let radiansRotation = (ai.rotation + 90) * ai.degreesToRadians(); //We need the 90 degree art offset to get the correct vector
        let sin = Math.sin(radiansRotation);
        let cos = Math.cos(radiansRotation);

        let worldUpVector = ai.worldUpVector();
        let tx = worldUpVector.x;
        let ty = worldUpVector.y;

        return new Vector2((cos * tx) - (sin * ty), (sin * tx) + (cos * ty));
    }

}