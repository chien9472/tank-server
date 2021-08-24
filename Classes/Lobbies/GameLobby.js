var LobbyBase = require('./LobbyBase')
var GameLobbySetting = require('./GameLobbySettings');
var Connection = require('../Connection');
var LobbyState = require('../Utility/LobbyState');
var ServerItem = require('../Utility/ServerItem');
var Vector3 = require('../Vector3');
var Bullet = require('../Bullet');
var numberPlayer = 0;

module.exports = class GameLobby extends LobbyBase {
    constructor(_settings = GameLobbySetting) {
        super();
        this.settings = _settings;
        this.lobbyState = new LobbyState();
        this.bullets = [];
        this.endGameLobby = function(){};
    }

    onUpdate() {
        super.onUpdate();
        var lobby = this;
        lobby.updateBullets();
        lobby.updateDeadPlayers();

        // close lobby because game over or no one is here
        if(lobby.connections.length == 0){
            lobby.endGameLobby();
        }
    }

    canEnterLobby(_connection = Connection) {
        var lobby = this;
        var maxPlayerCount = lobby.settings.maxPlayers;
        var currentPlayerCount = lobby.connections.length;

        if (currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }
        return true;
    }

    onEnterLobby(_connection = Connection) {
        var lobby = this;
        var socket = _connection.socket;

        //console.log('id : ' +_connection.player.id);

        super.onEnterLobby(_connection);

        if (lobby.connections.length == lobby.settings.maxPlayers) {
            numberPlayer = lobby.connections.length;
            console.log('We have enough players we can start the game');
            lobby.lobbyState.currentState = lobby.lobbyState.GAME;
            lobby.onSpawnAllPlayersIntoGame();

        }
        var returnData = {
            state: lobby.lobbyState.currentState,
            numberReady: lobby.connections.length
        };
        //console.log('ssss');
        socket.emit('waitplayer');
        socket.emit('lobbyUpdate', returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnData);
    }

    onLeaveLobby(_connection = Connection) {
        var lobby = this;
        super.onLeaveLobby(_connection);
        lobby.onRemovePlayer(_connection);

        if( lobby.connections.length < lobby.settings.minPlayers){
            lobby.connections.forEach(connection =>{
                if(connection != undefined){
                    //console.log('here');
                    //connection.socket.emit('unloadGame');
                    connection.server.onSwitchLobby(connection, connection.server.generalServerID);
                }
            });
        }
    }

    onSpawnAllPlayersIntoGame() {
        var lobby = this;
        var connections = lobby.connections;
        connections.forEach(connection => {

            lobby.addPlayer(connection);

        });
    }


    addPlayer(_connection = Connection) {

        var lobby = this;
        var connections = lobby.connections;
        var socket = _connection.socket;

        var radomPosition = lobby.getRandomSpawn();
        //console.log('Posi : ' + radomPosition.x + ' ' + radomPosition.y + ' ' + radomPosition.z + ' ');
        _connection.player.numberStart = numberPlayer;
        _connection.player.position = new Vector3(radomPosition.x, radomPosition.y, radomPosition.z);
        var returnData = {
            //username: _connection.player.username,
            username: _connection.player.id,
            numberstart: _connection.player.numberStart,
            id: _connection.player.id,
            position: _connection.player.position,
            health: _connection.player.health
        }
        //console.log('return Data1 : ' + JSON.stringify(returnData));
        //socket.emit('startgame');
        var dataStart = {
            id: _connection.player.id
        }
        //socket.emit('startgame');
        socket.broadcast.to(lobby.id).emit('startgame');

        socket.emit('spawn', returnData);//tell myself I have spawned
        socket.broadcast.to(lobby.id).emit('spawn', returnData);// Tell others
        // 
        numberPlayer--;
        if (numberPlayer < 0) {
            numberPlayer = 0;
        }
    }

    onRemovePlayer(_connection = Connection) {
        var lobby = this;
        _connection.socket.broadcast.to(lobby.id).emit('disconnected',{
            id: _connection.player.id
        });
    }

    updateBullets() {
        var lobby = this;
        var bullets = lobby.bullets;
        //console.log(' update bullet dead');
        bullets.forEach(
            bullet => {
                var isDestroyed = bullet.onUpdate();
                if (isDestroyed) {
                    lobby.despawnBullet(bullet);
                }
            }
        );
    }

    onFireBullet(_connection = Connection, data, isAI = false) {
        var lobby = this;
        var bullet = new Bullet();
        bullet.name = 'Bullet';
        bullet.activator = data.activator;

        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.position.z = data.position.z;

        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;
        bullet.direction.z = data.direction.x;

        lobby.bullets.push(bullet);

        var returnData = {
            name: bullet.name,
            id: bullet.id,
            activator: bullet.activator,
            position: {
                x: bullet.position.x,
                y: bullet.position.y,
                z: bullet.position.z,
            },
            direction: {
                x: bullet.direction.x,
                y: bullet.direction.y,
                z: bullet.direction.z,
            },
            speed: bullet.speed

        }

        if (!isAI) {
            _connection.socket.emit('serverSpawn', returnData);
            _connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
        }
        else if (lobby.connections.length > 0) {
            console.log('infor bullet : ' + JSON.stringify(returnData));
            //lobby.connections[0].emit('serverSpawn', returnData);
            lobby.connections[0].socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
        }

    }

    onCollisionDestroy(_connection = Connection, data) {
        var lobby = this;
        // return object bullet
        var returnBullets = lobby.bullets.filter(
            bullet => {
                return bullet.id = data.id;
            }
        );

        returnBullets.forEach(
            bullet => {
                var playerHit = false;
                lobby.connections.forEach(
                    c => {

                        var player = c.player;
                        if (bullet.activator != player.id) {
                            var distance = lobby.distanceVector(data.position, player.position);

                            if (distance < 2) {
                                var isDead = player.dealDamage(20);
                                console.log('isDead : ' + isDead);
                                if (isDead) {
                                    console.log('Player with id: ' + player.id + ' has died');
                                    var returnData = {
                                        id: player.id,
                                        numberStart: player.numberStart
                                    }
                                    c.socket.emit('playerDied', returnData);
                                    c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                                    
                                }
                                else {
                                    console.log('Player with id: ' + player.id + ' has (' + player.health + ') health left');
                                    // send to client
                                    var returnData ={
                                        id: player.id,
                                        health: player.health
                                    }
                                    c.socket.emit('healthchange', returnData);
                                    c.socket.broadcast.to(lobby.id).emit('healthchange', returnData);
                            
                                }

                            }
                            playerHit = true;
                            lobby.despawnBullet(bullet);
                        }

                    }
                );
                if (!playerHit) {

                }
                if (!playerHit) {
                    bullet.isDestroyed = true;
                }
            }
        );

    }

    despawnBullet(bullet = Bullet) {
        var lobby = this;
        var bullets = lobby.bullets;
        var connections = lobby.connections;

        //console.log('Destroy bullet (' + bullet.id + ')');

        var index = bullets.indexOf(bullet);
        if (index > -1) {
            bullets.splice(index, 1);

            var returnData = {
                id: bullet.id
            }

            connections.forEach(
                connection => {
                    connection.socket.emit('serverUnspawn', returnData);
                    //console.log('data return :' + JSON.stringify(returnData));
                }
            );
        }
    }

    updateDeadPlayers() {
        var lobby = this;
        var connections = lobby.connections;
        //console.log(' update player dead');
        connections.forEach(
            connection => {
                var player = connection.player;
                if (player.isDead) {
                    var isRespawn = player.respawnCounter();
                    if (isRespawn) {
                        var socket = connection.socket;
                        numberPlayer = player.numberStart;
                        player.health = new Number(100);
                        //console.log(' numberStart ', player.numberStart);
                        var returnData = {
                            numberstart: player.numberStart,
                            id: player.id,
                            position: lobby.getRandomSpawn(),
                            health: player.health
                        }
                        socket.emit('playerRespawn', returnData);
                        socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);

                    }

                }

            }
        );
    }

    

    distanceVector(v1 = Vector3, v2 = Vector3) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getRandomSpawn() {
        var lobby = this;

        return {
            x: lobby.settings.levelData.freeForAllSpawn[numberPlayer - 1].position.x,
            y: lobby.settings.levelData.freeForAllSpawn[numberPlayer - 1].position.y,
            z: lobby.settings.levelData.freeForAllSpawn[numberPlayer - 1].position.z
        }

    }

    getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    getIndex() {
        var lobby = this;
        var connection = lobby.connections;
        var l = connection.length;
        return l;
    }
}

