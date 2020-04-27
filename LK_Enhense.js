// ==UserScript==
// @name         LK增强
// @namespace    https://www.lightnovel.cn/
// @namespace    https://www.lightnovel.us/
// @version      1.20
// @description  对LK添加一些评分按钮 页面自动刷新 上传本地/粘贴图片到图床的动能
// @require      https://greasyfork.org/scripts/28536-gm-config/code/GM_config.js
// @author       Hugo0
// @license      GPL-3.0
// @match        https://www.lightnovel.cn/*
// @match        https://www.lightnovel.us/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==


GM_config.init({
    'id': 'LK_Enhense',
    'title': 'LK增强',
    'fields': {
        'ratelist': {
            'label': '评分列表(逗号分隔)',
            'type': 'textarea',
            'default': '1,2,3'
        },
        'reason': {
            'label': '评分理由',
            'type': 'text',
            'default': 'test'
        },
        'sendreasonpm': {
            'label': '提醒作者',
            'type': 'checkbox',
            'default': true
        },
        'refreshInterval': {
            'label': '定时刷新间隔/s(0为不刷新)',
            'type': 'int',
            'default': 10
        },
        'refreshonly': {
            'label': '只刷薪水楼',
            'type': 'checkbox',
            'default': true
        }
    },
    'css': '#LK_Enhense textarea { width: 100%; height: auto; }',
    'events':
    {
        'open': function(doc, win, menuFrame) {
            let config = this;
            doc.getElementById(config.id + '_saveBtn').textContent = "保存";
            doc.getElementById(config.id + '_closeBtn').textContent = "关闭";
            doc.getElementById(config.id + '_resetLink').textContent = "默认设置";
            menuFrame.style.cssText += "width: 50%; height: 50%; left: 25%; top: 25%";
        },
        "save": function() {
            let newrefreshInterval = GM_config.get('refreshInterval')*1000;
            scores = GM_config.get('ratelist').split(',').map(s => s.trim()).filter(s => s);
            reason = GM_config.get('reason');
            sendreasonpm = GM_config.get('sendreasonpm');
            refreshonly = GM_config.get('refreshonly');
            title = document.querySelector("#thread_subject").textContent;
            refreshPage();
            if (refreshInterval != newrefreshInterval) {
                window.clearInterval(refreshId);
                refreshInterval = newrefreshInterval
                if (refreshId != 0 && (!refreshonly || title.includes("水楼"))) {
                    refreshId = window.setInterval(intervalRefresh, refreshInterval);
                }
            }
        }
    }
});

let scores = GM_config.get('ratelist').split(',').map(s => s.trim()).filter(s => s);
let reason = GM_config.get('reason');
let sendreasonpm = GM_config.get('sendreasonpm');
let refreshInterval = GM_config.get('refreshInterval')*1000;
let refreshonly = GM_config.get('refreshonly');
let refreshId = 0;

// 添加设置按钮
let z = document.querySelector("#toptb > div > div.z");
let setting = document.createElement("a");
setting.href = "javascript:;"
setting.textContent = "LK增强设置";
setting.addEventListener("click", () => {GM_config.open(); });
z.insertBefore(setting, z.children[3]);

let url = window.location.href;
let title = document.querySelector("#thread_subject").textContent;
let page = document.querySelector("#pgt > div > div > label > input").value;
let postOffset = 0;

if (refreshInterval != 0 && (!refreshonly || title.includes("水楼"))) {
    refreshId = window.setInterval(intervalRefresh, refreshInterval);
}

let formhash = document.getElementsByName("formhash")[0].value;
addButton(document);

function addButton(doc) {
    let plhin = doc.getElementsByClassName("plhin");
    for (let i of plhin) {
        let pob_cl = i.getElementsByClassName("pob cl")[0];
        let rate_list = pob_cl.children[1];
        for (let score of scores) {
            let node = doc.createElement("a");
            node.href = "javascript:;";
            node.onclick = function() {rate(this, formhash, tid, "rate", score.toString(), reason, sendreasonpm);};
            node.textContent = "评分"+score.toString()+"QB";
            rate_list.insertBefore(node, rate_list.children[0]);
        }
    }

    let scrolltop = doc.querySelector("#scrolltop");
    let span = doc.createElement("span");
    span.innerHTML = "<a class=\"fmg\" title=\"上传图床\" style=\"background: url(https://www.lightnovel.cn/static/image/editor/editor.gif) no-repeat; background-position: -43px -80px\"><b>上传图床</b></a>"
    let imgButton = span.children[0];
    imgButton.onclick = function() {showSubmitImgWindow()};
    scrolltop.insertBefore(span, scrolltop.firstChild);
}

function rate(obj, formhash, tid, handlekey, score2, reason, sendreasonpm) {
    let pid = obj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.replace("pid", "");
    console.log("rate="+score2+" pid="+pid);
    let data;
    if (sendreasonpm == true) {data = `formhash=${formhash}&tid=${tid}&pid=${pid}&score2=${score2}&reason=${encodeURIComponent(reason)}&sendreasonpm=on`;}
    else {data = data = `formhash=${formhash}&tid=${tid}&pid=${pid}&score2=${score2}&reason=${encodeURIComponent(reason)}`;}
    fetch("forum.php?mod=misc&action=rate&ratesubmit=yes&infloat=yes&inajax=1", {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: data
    }).then(res => res.text()).then(res => {
        let text = res.split("<![CDATA[")[1].split("<script")[0];
        if (text == "") {text = "评分成功"}
        showPrompt(null, null, text, 2000);
        if (text == "评分成功") {
            fetch(window.location.href).then(res => res.text()).then(res => {
                let domparser = new DOMParser();
                let doc = domparser.parseFromString(res, "text/html");
                let content = obj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.children[0].children[1];
                let newContent = doc.getElementById("pid"+pid).children[0].children[0].children[1];
                content.innerHTML = newContent.innerHTML;
            });
        }
    });
}

function intervalRefresh() {
    fetch(url).then(res => res.text()).then(res => {
        let domparser = new DOMParser();
        let doc = domparser.parseFromString(res, "text/html");
        addButton(doc);
        let postList = document.querySelector("#postlist");
        let newPostList = doc.querySelector("#postlist").children;
        var newPostArray = new Array();
        for (let newPost of newPostList) {
            if (newPost.id.includes("post_")) {newPostArray.push(newPost)}
        }
        for (let newPost of newPostArray) {
            let post = document.getElementById(newPost.id);
            if (post == null) {
                postList.appendChild(newPost);
            } else {
                
            }
        }
        if (document.querySelector("#ct > div.pgbtn") == null && doc.querySelector("#ct > div.pgbtn") != null) {
            let nextPage = doc.querySelector("#ct > div.pgbtn");
            let pages = document.querySelector("#ct > div.pgs.mtm.mbm.cl");
            pages.parentElement.insertBefore(nextPage, pages);
        }
        if (doc.querySelector("#ct > div.pgbtn") != null) {
            url = doc.querySelector("#ct > div.pgbtn > a").href;
            postOffset += 20;
            let pages = document.querySelector("#ct > div.pgs.mtm.mbm.cl");
            pages.removeChild(pages.firstElementChild);
            pages.insertBefore(doc.querySelector("#ct > div.pgs.mtm.mbm.cl").firstElementChild, pages.firstElementChild);
        }
    });
}

function refreshPage() {
    fetch(window.location.href).then(res => res.text()).then(res => {
        let domparser = new DOMParser();
        let doc = domparser.parseFromString(res, "text/html");
        addButton(doc);
        document.getElementById("postlist").innerHTML = doc.getElementById("postlist").innerHTML;
    });
}

function showSubmitImgWindow() {
    let append_parent = document.querySelector("#append_parent")
    let menu = document.createElement("div");
    menu.innerHTML = "<div id=\"postimg_menu\" class=\"p_pof upf\" style=\"width: 240px; position: fixed; z-index: 301; cursor: move; left: 40%; top: 40%;\" initialized=\"true\">\
    <span class=\"y\"><a class=\"flbc\" href=\"javascript:;\">关闭</a></span>\
    <div class=\"p_opt cl\"><div>请选择图片或者Ctrl+V粘贴图片:<br><input type=\"file\" id=\"imgfile\"></div>\
    <div class=\"pns mtn\">\
    <button type=\"submit\" id=\"postimg_submit\" class=\"pn pnc\"><strong>提交</strong></button>\
    <button type=\"button\" class=\"pn\"><em>取消</em></button></div></div></div>";
    menu = menu.children[0];
    menu.onpaste = function(a) {pasteImg(a)};
    menu.children[1].children[1].children[0].onclick = function() {subimtImg()};
    menu.children[0].children[0].onclick = function() {removeWindow()};
    menu.children[1].children[1].children[1].onclick = function() {removeWindow()};
    append_parent.appendChild(menu);
}

function pasteImg(a) {
    let b=a.clipboardData;
    if(b.files.length>0) {
        document.getElementById('imgfile').files=b.files;
        document.getElementById('postimg_submit').onclick();
    }
}

function subimtImg() {
    let imgfile = document.querySelector("#imgfile").files[0];
    var fd = new FormData();
    fd.append("file", imgfile);
    GM_xmlhttpRequest({
        method: 'POST',
        url: `https://img.vim-cn.com/`,
        data: fd,
        onload: response => {
            text = "[img]"+response.response.replace("\n", "")+"[/img]";
            navigator.clipboard.writeText(text);
            showPrompt(null, null, "上传成功， 代码已复制到剪贴板中", 2000);
            let menu = document.querySelector("#postimg_menu");
            menu.parentElement.removeChild(menu);
        }
    });
}

function removeWindow() {
    let menu = document.querySelector("#postimg_menu");
    menu.parentElement.removeChild(menu);
}
