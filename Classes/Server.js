
var Player = require('./Player.js');
var Connection = require('./Connection.js');
var Database = require('../Database/Database.js');
var GameLobby = require('./Lobbies/GameLobby.js');
var GameLobbySetting = require('./Lobbies/GameLobbySettings.js');
// Lobby
var LobbyBase = require('./Lobbies/LobbyBase');
// Level
var levelData1 = require('../Files/LevelData/Level1.json');

module.exports = class Server {
    constructor(isLocal = false) {
        var server = this;
        this.database = new Database(isLocal);
        this.connections = [];
        this.lobbys = [];

        
        this.generalServerID = 'General Server';
        this.startLobby = new LobbyBase();
        this.startLobby.id = this.generalServerID;
        this.lobbys[this.generalServerID] = this.startLobby;
    }

    onUpdate() {
        var server = this;
        // Update each lobby
        for( var id in server.lobbys ){
            server.lobbys[id].onUpdate();
        }
    }

    OnConnected(socket) {
        var server = this;
        var connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.player.lobby = server.startLobby.id;
        connection.server = server;

        var player = connection.player;
        var lobbys = server.lobbys;

        //console.log('Added new player to the server ' + player.id);
        server.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        // add lobby General Server when correct to server
        connection.lobby.onEnterLobby(connection);

        console.log(' ' + server.lobbys.length);

        //console.log('id : ' + connection.player.id);

        return connection;
    }

    onDisconnected(connection = Connection) {
        var sv = this;
        var id = connection.player.id;
    
        delete sv.connections[id];
        console.log('Player ' + connection.player.displayerPlayerInformation() + ' has disconnected');
        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected',{
            id: id
        });
        var currentLoobyIndex = connection.player.lobby;
        sv.lobbys[currentLoobyIndex].onLeaveLobby(connection);
        if( currentLoobyIndex != sv.generalServerID && sv.lobbys[
            currentLoobyIndex] != undefined && sv.lobbys[currentLoobyIndex].connections.length == 0
        )
        {
            sv.closeDownLobby(currentLoobyIndex);
        }

    }

    closeDownLobby(index){
        var server = this;
        console.log('closing down lobby (' + index + ') ');
        delete server.lobbys[index];
    }

    OnAttemptToFindGame(connection = Connection){
        //Look through lobbies for a gamelobby
        //check if joinable
        //if not make a new game

        //console.log('id player : ' + connection.player.id);

        var server = this;
        var lobbyFound = false;

        var gamelobbies = [];

        for( var id in server.lobbys ){
            if( server.lobbys[id] instanceof GameLobby ){
                gamelobbies.push(server.lobbys[id]);
                console.log('game lobby  : ' + server.lobbys[id]);
            }
        }

        console.log('Found (' + gamelobbies.length + ') lobbies on the server');
        
        gamelobbies.forEach( lobby =>{
            if( !lobbyFound){

                var canJoin = lobby.canEnterLobby(connection);
                
                //console.log('can join  : ' + canJoin);

                if(canJoin ){
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });
        //All game lobbies full or we have never created one
        if( !lobbyFound ){
            console.log('Making a new game lobby');
            var gamelobby = new GameLobby(new GameLobbySetting('FFA',2, 2, levelData1));   
            gamelobby.endGameLobby = function() {server.closeDownLobby(gamelobby.id)};        
            server.lobbys[gamelobby.id] = gamelobby;
            server.onSwitchLobby(connection, gamelobby.id);
        }
    }
    onSwitchLobby(connection = Connection, lobbyID){
        var server = this;
        var lobbys = server.lobbys;

        connection.socket.join(lobbyID);// Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyID];// assign reference to the new lobby (gan lobby chinh la id client)

        lobbys[connection.player.lobby].onLeaveLobby(connection);// leave lobby genneral
        lobbys[lobbyID].onEnterLobby(connection);// add lobby current player create when correct to server
    }
}
