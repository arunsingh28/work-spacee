const socket = io({transports : ['websocket'], upgrade : false});


  socket.on('online', message =>{
    outputMessage(message);
  })
  
  socket.on('user', user =>{
    document.querySelector('.online-person').innerHTML = user;
  })

  socket.on('useroff', user =>{
    document.querySelector('.online-person').innerHTML = user;
  })

socket.on('offline', message =>{
  disconnectMessage(id);
})

  function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('user-online');
    div.innerHTML = `<p class="list-group-item list-group-item-action">${message}<span class="user-active float-right"></span></p>`
    document.querySelector('.user-list').appendChild(div)
  }


  