const socket = io({transports : ['websocket'], upgrade : false});

var user = [];
  socket.on('online',message =>{
    // outout message to document
    outputMessage(message);
  })
console.log(user)

socket.on('offline', message =>{
  user.pop(message)
  disconnectMessage();
})



  function disconnectMessage(){
    document.querySelector('.user-online').css.display = "none"
  }

  function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('user-online');
    div.innerHTML = `<p class="list-group-item list-group-item-action">${message} - online <span class="user-active float-right"></span></p>`
    document.querySelector('.user-list').appendChild(div)
  }