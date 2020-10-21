module.exports = class LobbyState{
    constructor(){
        this.GAME = 'Game';
        this.LOBBY = 'Lobby';
        this.ENDGAME = 'EndGame';
        // current stae of the lobby
        this.currentState = this.LOBBY;
    }
}