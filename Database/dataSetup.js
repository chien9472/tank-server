const { request } = require("express");

function datasetup(){

    // init infor database
    this.version = '0.0.1';
    var db = null;
    var mysql = require('mysql');
    var config= {
        host : '127.0.0.1',
        user : 'root',
        password : '',
        database : 'mysql'
    };

    this.connect = function(callback){
        db = mysql.createConnection(config);
        db.connect( function(err){
            if(err){
                console.error('error connecting mysql');
                return;
            }
            console.log('Connected as database ' + config.database);
            callback(err);
        } );
    };

    this.addUser = function(id, username, callback){
        db.query("INSERT INTO user ( 'id','user_name', ) VALUES (?,?)",[id,username], function (err, data) {
            if (err) { console.error(err); }
            
            callback(err, data);
        });
    };
    this.loadallUser = function(callback){
        var sql = 'select * from user';
        db.query( sql, function(err, data){
            if(err) {
               console.error(err);
            }
            callback(err, data);
        } );
    };

    this.searchUser = function (user, callback) {
        db.query('SELECT user_name FROM user WHERE user_name like ?','%' + user + '%', function(err, data) {

            if (err) { console.error(err); }

            callback(err, data);
        });

    };

    this.loadUser = function (user, callback) {

        db.query('SELECT * FROM user WHERE user_name = ?',[user], function (err, data) {

            if(err){ console.error(err);}

            callback(err, data);
        });

    };

    this.UpdatePosition = function (user, value, callback) {
        
        var dataUpdate = {

            Position : value,
        }
        
        db.query("UPDATE user set ? WHERE user_name = ? ",[dataUpdate,user], function (err, data) {
            
            if (err) { console.error(err); }
            
            callback(err, data);
        });

    };

}
module.exports = new datasetup;