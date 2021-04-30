const socket = io();





// socket.on('online', (user) =>{
//   onlineUser.push(user.user)
//   let div = document.createElement('div')
//   onlineUser.map((user)=>{
//     div.innerHTML = `<p class="list-group-item list-group-item-action">${user}<span class="user-active float-right"></span></p>`
//     document.querySelector('.user-list').appendChild(div)
//   })
// })



socket.on('online', user => {
  outputMessage(user)
})


socket.on('offline', user => {
  var findDiv = document.querySelectorAll('.user-online' + user)
  findDiv.forEach(el => el.classList.add('hide'))
})





function outputMessage(username) {
    let div = document.createElement('div');
    div.classList.add('user-online');
    div.innerHTML = `<p class="list-group-item list-group-item-action">${username.onLine}<span class="user-active float-right"></span></p>`
    document.querySelector('.user-list').appendChild(div)
}


