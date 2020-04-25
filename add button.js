// ==UserScript==
// @name         添加评分按钮
// @namespace    https://www.lightnovel.cn/
// @namespace    https://www.lightnovel.us/
// @version      0.1
// @description  对LK添加一些默认的评分按钮 目前点击后要手动刷新才能看到评分 可自行修改设置
// @author       Hugo0
// @match        https://www.lightnovel.cn/*
// @match        https://www.lightnovel.us/*
// @grant        none
// ==/UserScript==

var scores = [1, 2, 3];                           //  评分QB列表
var reason = "感谢参与";                           //  评分理由
var sendreasonpm = true;                          //  是否提醒作者

function rate(obj, formhash, tid, handlekey, score2, reason, sendreasonpm) {
    var pid = obj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.replace("pid", "");
    console.log("rate"+score2+" pid="+pid);
    var referer = "https%3A%2F%2Fwww.lightnovel.cn%2Fforum.php%3Fmod%3Dviewthread%26tid%3D"+tid+"%26page%3D0%23pid"+pid;
    var data = "formhash="+formhash+"&tid="+tid+"&pid="+pid+"&referer="+referer+"&handlekey="+handlekey+"&score2="+score2+"&reason="+reason;
    if (sendreasonpm == true) {data = data + "&sendreasonpm=on";}
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('POST', 'https://www.lightnovel.cn/forum.php?mod=misc&action=rate&ratesubmit=yes&infloat=yes&inajax=1', true);
    httpRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    httpRequest.send(data);
}

var formhash = document.getElementsByName("formhash")[0].value;
var plhin = document.getElementsByClassName("plhin");
for (let i of plhin) {
    var pob_cl = i.getElementsByClassName("pob cl")[0];
    var rate_list = pob_cl.children[1];
    for (let score of scores) {
        var node = document.createElement("a");
        node.href = "javascript:;";
        node.onclick = function() {rate(this, formhash, tid, "rate", score.toString(), reason, sendreasonpm);};
        node.textContent = "评分"+score.toString()+"QB";
        rate_list.insertBefore(node, rate_list.children[0]);
    }
}
