'use strict';
$(function () {

    var settings = getSettings();
    var messageArea = document.getElementById('message-area');
    var iconsCache = {};
    var sky = new Skylink();

    if (/*!settings.user.name*/ true) {
        $('#user-enter').fadeIn(200);
        var nameForm = document.forms.nameForm;
        document.querySelector('#inputName').addEventListener('input', showInputName);

        nameForm.addEventListener('submit', function (e) {
            settings.user.name = nameForm.userName.value;
            settings.save();
            $('#user-enter').fadeOut(200, ()=> {
                document.querySelector('#chat-user-avatar').src = getCachedIcon(settings.user.name);
                runChat();
            });
            e.preventDefault();
        });
    } else {
        runChat();
    }

    function runChat() {
        $('#chat').fadeIn(200);

        messageArea.addEventListener('keydown', checkKey);
        document.forms.messageForm.addEventListener('submit', sendMessage);
        document.querySelector('#file-input').onchange = sendFile;

        // Skylink initialization

        sky.on('peerJoined', function (peerId, peerInfo, isSelf) {
            displayMessage('joined the room', peerInfo.userData.name, 'action');
        });
        sky.on('peerLeft', function (peerId, peerInfo, isSelf) {
            displayMessage('left the room', peerInfo.userData.name, 'action');
        });
        sky.on('incomingMessage', function (message, peerId, peerInfo, isSelf) {
            displayMessage(message.content, peerInfo.userData.name);
        });

        sky.on('incomingDataRequest', function (transferId, peerId, transferInfo) {
            sky.acceptDataTransfer(peerId, transferId, true);
        });
        sky.on('incomingData', function (data, transferId, peerId, transferInfo, isSelf) {
            let file = {};
            file.dataUrl = URL.createObjectURL(data);
            file.name = transferInfo.name;
            let sender = settings.user.name;
            if(!isSelf){
                sender = sky.getPeerInfo(peerId).userData.name;
            }

            displayMessage(file, sender, 'file');
        });

        sky.init('06183e36-5a49-4694-81fb-f353a3bef410');
        sky.setUserData({name: settings.user.name});
        sky.joinRoom();

        renderAvatars();
    }

    function sendFile(e) {
        let file = this.files[0];
        sky.sendBlobData(file);
    }

    function checkKey(e) {
        if (e.keyCode == 13) {
            sendMessage(e);
        }
    }

    function sendMessage(e) {
        sky.sendP2PMessage(messageArea.value);
        messageArea.value = '';
        e.preventDefault();
    }

    function getTime() {
        let now = new Date();
        let hour = addZero(now.getHours());
        let min = addZero(now.getMinutes());
        let sec = addZero(now.getSeconds());

        return hour + ":" + min + ":" + sec;

        function addZero(number) {
            if (number < 10) number = '0' + number;
            return number;
        }
    }

    function displayMessage(message, sender, type) {
        if (type === 'action') {
            $('#messages').append(`<div class="message-panel">
    <div class="user">
        <div class="name">${sender}</div>
        <div class="message"><i>${message}</i></div>
    </div>
    <div class="time">${getTime()}</div>
</div>`);
        } else if (type === 'file') {
            $('#messages').append(`<div class="message-panel">
    <img class="avatar" src="${getCachedIcon(sender)}" data-username="${sender}"/>
    <div class="user">
        <div class="name">${sender}</div>
        <div class="message">File: <a href="${message.dataUrl}" download="${message.name}">${message.name}</a></div>
    </div>
    <div class="time">${getTime()}</div>
</div>`);
        } else {
            $('#messages').append(`<div class="message-panel">
    <img class="avatar" src="${getCachedIcon(sender)}" data-username="${sender}"/>
    <div class="user">
        <div class="name">${sender}</div>
        <div class="message">${message}</div>
    </div>
    <div class="time">${getTime()}</div>
</div>`);
        }
    }

    function getCachedIcon(name) {
        if (iconsCache[name]) {
            return iconsCache[name];
        }
        return cacheIcon(name)
    }

    function cacheIcon(name) {
        var render = document.createElement('canvas');
        render.id = 'render-avatar';
        render.width = '100';
        render.height = '100';
        render.style.display = 'none';
        document.body.appendChild(render);

        jdenticon.update('#render-avatar', md5(name));
        iconsCache[name] = render.toDataURL();

        document.body.removeChild(render);
        return iconsCache[name];
    }

    function renderAvatars() {
        var avatars = document.querySelectorAll('img[data-username]');
        avatars = [].slice.call(avatars);
        for (let av of avatars) {
            av.src = getCachedIcon(av.dataset.username);
        }
    }

    function showInputName(e) {
        var val = document.querySelector('#inputName').value;
        if (val) {
            jdenticon.update('#user-avatar', md5(val));
            document.querySelector('.user-name-main').textContent = val;
        } else {
            var canvas = document.querySelector('#user-avatar');
            var ctx = canvas.getContext('2d');
            document.querySelector('.user-name-main').textContent = 'Your name';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

});