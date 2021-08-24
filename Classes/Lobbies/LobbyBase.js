var shortID = require('short-id');
var Connection = require('../Connection');
var ServerItem = require('../Utility/ServerItem');
var Vector3 = require('../Vector3');
// var AIBase = require('');

module.exports = class LobbyBase{
    constructor(){
        this.id = shortID.generate();
        this.connections =[];
        this.serverItems =[];
    }

    onUpdate(){
        var lobby = this;
    }

    onEnterLobby(connection = Connection){
        var lobby = this;
        var player = connection.player;
        console.log('Player ' + player.displayerPlayerInformation() + ' has entered the lobby (' + lobby.id + ')');
        lobby.connections.push(connection);

        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(_connection = Connection){
        var player = _connection.player;
        var lobby = this;
        console.log('Player ' + player.displayerPlayerInformation() + ' has left the lobby (' + lobby.id + ')');

        _connection.lobby = undefined;
        var index = lobby.connections.indexOf(_connection);
        if( index > -1){
            lobby.connections.splice(index, 1);
        }
    }

    onServerSpawn(){

    }

    obServerUnSpawn(){

    }

    deleteServerItem(){

    }
}