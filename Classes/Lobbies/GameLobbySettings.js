module.exports = class GameLobbySetting{
    constructor(gameMode, _maxplayers, _minPlayers, _levelData){
        this.gameMode ='No game Definde';
        this.minPlayers = _minPlayers;
        this.maxPlayers = _maxplayers;
        this.levelData =_levelData;

    }
}