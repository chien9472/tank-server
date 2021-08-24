var io = require('socket.io')(process.env.PORT || 3000);
var SV = require('./Classes/Server');

var clients=[];

if( process.env.PORT == undefined ){
    console.log('Local Server');
}
else{
    console.log('Hosted Server');
}

var server = new SV(process.env.PORT == undefined);

setInterval(() => {
    server.onUpdate();
}, 1,0);

io.on('connection', function(socket){
    var connection = server.OnConnected(socket);
    connection.createEvents();
    connection.socket.emit('idclient', {
        'id' : connection.player.id
    });
});

// server xu ly connection, lobby 
// database xu ly query den database
// connection xu ly event gui tu client toi
// lobby xu ly event trong lobby gui ve client