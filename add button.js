// ==UserScript==
// @name         添加评分按钮
// @namespace    https://www.lightnovel.cn/
// @namespace    https://www.lightnovel.us/
// @version      0.2
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
    score2 = -1;
    console.log("rate="+score2+" pid="+pid);
    var data;
    if (sendreasonpm == true) {data = `formhash=${formhash}&tid=${tid}&pid=${pid}&score2=${score2}&reason=${encodeURIComponent(reason)}&sendreasonpm=on`;}
    else {data = data = `formhash=${formhash}&tid=${tid}&pid=${pid}&score2=${score2}&reason=${encodeURIComponent(reason)}`;}
    fetch("forum.php?mod=misc&action=rate&ratesubmit=yes&infloat=yes&inajax=1", {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: data
    }).then(res => res.text()).then(res => {
        var text = res.split("<![CDATA[")[1].split("<script")[0];
        console.log(text);
        if (text == "") {text = "评分成功"}
        showPrompt(null, null, text, 2000);
    });
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
