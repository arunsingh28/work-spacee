const socket = io({transports : ['websocket'], upgrade : false});

var user = [];

  socket.on('online', message =>{
    user.push(message);
    console.log('online funciton',message)
    outputMessage(message);
})

console.log(user)


socket.on('offline', message =>{
  user.pop(message)
  disconnectMessage(id);
})

  function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('user-online');
    div.innerHTML = `<p class="list-group-item list-group-item-action">${message}<span class="user-active float-right"></span></p>`
    document.querySelector('.user-list').appendChild(div)
  }