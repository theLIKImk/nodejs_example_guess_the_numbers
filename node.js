var http = require('http');
var fs = require('fs');
var url = require('url');
var formidable = require('formidable'); 

//设定
const htmldir = "/www";
const port = 80;
const chat_page_msg_item=51;

//初始化变量
netreq=0;

chat_page_item_num=0;
chat_page_num=0;
chat_list=new Array();
chat_page_item=new Array();
let single_msg={};

rm_num="";
let user_ramdonnum={};
put_str="NULL";

// 创建服务器
http.createServer( function (request, response) {  
	var dypage=false;
	
	netreq = netreq + 1;
	
	// 解析请求，包括文件名
	// var pathname = url.parse(request.url).pathname;
	var pathname = url.parse(request.url,true).pathname;
	var pathpart = url.parse(request.url,true).query;
	var pathval = url.parse(request.url,true).search;
   
	if (pathname == "/" ) {
		//无附加默认重定向index
		var pathname="/index.html";
		console.log("["+netreq+"]index.html");
	} else if ( pathname == "/f" ){
		//表单
		console.log("["+netreq+" FORM] "+pathval);
		var dypage=true;
	} else if ( pathname == "/chatlist" ){
	
		//获取聊天列表
		//console.log("["+netreq+" CHATLIST] ");
		response.writeHead(200, {'Content-Type': 'application/json'});
		
		if (pathpart.page==undefined || pathpart.page==null || pathpart.page=="" ){
			response.write(JSON.stringify(chat_page_item));
		} else {
			if (chat_list[pathpart.page]==undefined) {
				response.write("[]");
			}else{
				response.write(JSON.stringify(chat_list[pathpart.page]));
			}
		}
		response.end();
		return;
	} else {
		//输出信息
		console.log("["+netreq+"]"+htmldir + pathname);
	}


	//http服务器和表单处理
	if (dypage == false) {
		//如果是http请求

		//设定html目录
		var pathname= htmldir + pathname;
	   
		//获取文件类型
		var pathname_f = '.' + pathname;
		var headType = pathname_f.substr(pathname_f.lastIndexOf(".") + 1, pathname_f.length);
		var fileName = pathname_f.substr(pathname_f.lastIndexOf("/") + 1, pathname_f.length);
	   
		// 从文件系统中读取请求的文件内容
		fs.readFile(pathname.substr(1), function (err, data) {
			if (err) {
				console.log(err + "\n" );
				// HTTP 状态码: 404 : NOT FOUND
				// Content Type: text/html 
				response.writeHead(404, {'Content-Type': 'text/html'});
				response.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>.center {padding: 70px 0;text-align: center;}</style></head><body><h2><p class="center">Notfound</p></h2><p>' + err + '</p></body></html>'); 
			}else{
				// HTTP 状态码: 200 : OK
				// Content Type: 根据文件类型更改头部
				if (headType=="gif" || headType=="png" || headType=="jpg") {
				} else if (headType=="svg") {
					//矢量图像
					response.writeHead(200, {'Content-Type': 'image/svg+xml'});
				} else if (headType=="js") {
					//脚本
					response.writeHead(200, {'Content-Type': 'application/javascript'});
				} else if (headType=="mp4") {
					//视频
					response.writeHead(200, {'Content-Type': 'video/' + headType});
				} else {
					//Html以及其他
					//PS:虽然按道理是要的说..但浏览器能识别欸....摆~
					response.writeHead(200, {'Content-Type': 'text/' + headType});   
				}
				// 响应文件内容
				response.write(data);
			}
			//  发送响应数据
			response.end();
		});
	} else {
		//否则处理表单
		
		response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		if (pathpart.type == "num" ) {
			
			//数字
			if (pathpart.id == "" || pathpart.id == null || pathpart.id === undefined) {
				//uuid为空就报错
				response.write("-2")
				console.log("--> -2");
			} else {
				//未找到此用户的随机数为空就随机一个
				if (user_ramdonnum[pathpart.id] == "" || user_ramdonnum[pathpart.id] == null){
					user_ramdonnum[pathpart.id] = rm_num = Math.floor(Math.random()*101);
					console.log("create object" + pathpart.id);
				}
				
				//校验数字并返回值：-1/0/1
				if (pathpart.num > user_ramdonnum[pathpart.id]) {response.write("1");console.log("--> 1");}
				if (pathpart.num < user_ramdonnum[pathpart.id]) {response.write("-1");console.log("--> -1");}
				if (pathpart.num == user_ramdonnum[pathpart.id]) {
					response.write("0");
					user_ramdonnum[pathpart.id] = rm_num = Math.floor(Math.random()*101);
					console.log("--> 0");
				}
			}
		} else if (pathpart.type == "chat" ) {
			
			//聊天
			let single_msg={};
			single_msg["name"]=pathpart.chatname;
			single_msg["msg"]=pathpart.chatmsg;
			
			chat_page_item[chat_page_item_num] = single_msg;
			chat_list[chat_page_num] = chat_page_item;
			chat_page_item_num = chat_page_item_num + 1;
			
			//自动分页
			if (chat_page_item_num == chat_page_msg_item) {
				chat_page_num = chat_page_num + 1;
				chat_page_item_num = 1;
				chat_page_item=[];
				
				//最后一条写入新页面第一条
				chat_page_item[0] = single_msg;
				chat_list[chat_page_num] =chat_page_item[0];
			}
			response.write("0");
			console.log("--> Chat Add[" + chat_page_num + "][" + chat_page_item_num + "[");
			
		} else {
			response.write("-3");
			console.log("--> -3");
		}
		
		//  发送响应数据
		response.end();
	}
}).listen(port);



// 控制台会输出以下信息
console.log('OK! Server running at http://127.0.0.1:' + port + '/');
console.log('____________________________________________\n');
console.log('');
