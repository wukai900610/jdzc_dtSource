var express = require('express');
var proxyMiddleWare = require("http-proxy-middleware");

// var proxyPath = "http://221.226.147.58:84/";//测试地址
var proxyPath = "http://10.10.136.71:8080";//本地地址
var proxyOption ={target:proxyPath,changeOrigoin:true};
var app = express();
// app.use(express.static("./public"));
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/',proxyMiddleWare(proxyOption));
app.listen(3333);
