const Client = require('ssh2').Client;
const http = require('http');
const querystring = require('querystring');
const WebSocketServer = require('ws').Server;


//FUNC

function SSH_SHELL(ws,config) {

    let conn = new Client();

    conn.on('ready',function () {

        console.log('SSH connection');


        conn.shell(function(err, stream) {


            ws.on('message', function (message) {


                stream.write(message+"\n");


            });

            //todo 流关闭时关闭
            stream.on('close', function() {
                conn.end();
                console.log('Stream :: close');

            }).on('data', function(data) {

                ws.send(data+"");

            }).stderr.on('data', function(data) {

                console.log('STDERR: ' + data);

            });


            streamG = stream;


        });

        //todo 当客户端关闭时 关闭ssh连接
        ws.on('close', function() {
            conn.end();
            console.log('ssh2 close');
        });



    }).connect(config);

}

function SSH_EXEC(command,response,config) {
    let conn = new Client();
    conn.on('ready', function() {

        conn.exec(command, function(err, stream) {
            if (err) throw err;
            stream.on('close', function(code, signal) {
                conn.end();
            }).on('data', function(data) {
                //response 操作
            }).stderr.on('data', function(data) {
                console.log('STDERR: ' + data);
            });
        });
    }).connect(config);
}


//todo 密码可使用http协议来进行设置
let ssh_config  = {
    host: '47.92.98.69',
    port: 22,
    username: 'root',
    password: 'KspsJ9WOXnXFmcFb'
};


//WSOCKET

wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function (ws) {
    console.log('websockt client connected');

    SSH_SHELL(ws,ssh_config);


});



// HTTP

const server = http.Server();


server.on('connect',function (request,socket,head) {


});



server.on('request',(request, response) => {

    let pathInfo = querystring.parse(request.url);

    if(pathInfo.action == 'cmd'){

        SSH_EXEC(pathInfo.command,response,ssh_config);

    }

});

server.listen(8000);