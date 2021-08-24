module.exports = class Connection{
    constructor(){
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }

    createEvents(){
        
        var connecion = this;
        var socket = connecion.socket;
        var sv = connecion.server;
        var player = connecion.player;

        socket.on('disconnect', function(){
            sv.onDisconnected(connecion);
        });
        /*
        socket.on('signIn', function(data){
            //console.log('username :' + data.username + 'password :' + data.password);
            sv.database.SignIn(data.username, data.password, results=>{
                console.log(results.valid + ': ' + results.reason);
                if( results.valid){
                    player.username = data.username;
                    socket.emit('signIn', {'isSignIn' : true, 'isSuccess': true});
                }
                else{
                    socket.emit('signIn', {'isSignIn' : true, 'isSuccess': false});
                }
            });
        });
        */
        /*
        socket.on('signUp', function(data){
            //console.log('username :' + data.username + 'password :' + data.password);
            sv.database.CreateAccount(data.username, data.password, results=>{
                console.log(results.valid + ': ' + results.reason);
                if( results.valid){
                    player.username = data.username;
                    socket.emit('signUp', {'isSignIn' : false, 'isSuccess': true});
                }
                else{
                    socket.emit('signUp', {'isSignIn' : false, 'isSuccess': false});
                }
            });
        });
        */

        socket.on('findgame', function(){
            sv.OnAttemptToFindGame(connecion);
            
        });

        socket.on('updatePosition', function(data){
            //console.log('data : ' + JSON.stringify(data));
             player.position.x = data.position.x;
             player.position.y = data.position.y;
             player.position.z = data.position.z;
             socket.broadcast.to(connecion.lobby.id).emit('updatePosition', player);
        });

        socket.on( 'updateRotation', function(data){
            //console.log('data : ' + JSON.stringify(data));
            player.tankRotation1.x = data.tankRotation1.x;
            player.tankRotation1.z = data.tankRotation1.z;
            player.tankRotation1.y = data.tankRotation1.y;

            player.tankRotation2.x = data.tankRotation2.x;
            player.tankRotation2.z = data.tankRotation2.z;
            player.tankRotation2.y = data.tankRotation2.y;

            player.tankRotation3.x = data.tankRotation3.x;
            player.tankRotation3.z = data.tankRotation3.z;
            player.tankRotation3.y = data.tankRotation3.y;


            player.turretRotation.x = data.turretRotation.x;
            player.turretRotation.y = data.turretRotation.y;
            player.turretRotation.z = data.turretRotation.z;

            socket.broadcast.to(connecion.lobby.id).emit('updateRotation', player);
        });

        socket.on('fireBullet', function(data){
            //console.log('data bullet posi : ' + JSON.stringify(data));
            connecion.lobby.onFireBullet(connecion, data);
        });

        socket.on('collisionDestroy', function(data) {
            //console.log('data collision : ' + JSON.stringify(data));
            connecion.lobby.onCollisionDestroy(connecion,data);
        });
        
        socket.on('updatescore', function(data){
            //connecion.lobby.onUpdateScore(data);
            //socket.broadcast.to(connecion.lobby.id).emit(data);
        });

        socket.on('gameover', function(){
            //
            console.log('game over');
            sv.onSwitchLobby(connecion, sv.generalServerID);
        });

        socket.on('quitgame', function(){
            console.log('another play quit game');
            sv.onSwitchLobby(connecion, sv.generalServerID);
        });
    }


}