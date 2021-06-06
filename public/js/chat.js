const socket = io();
// elements
const       formSubmit          =   document.querySelector('#form'),
            sendLocationButton  =   document.querySelector('#sendLocation'),
            messageForm         =   document.querySelector('#input'),
            subtmitButton       =   document.querySelector('#subtmitButton'),
            messages            =   document.querySelector('#messages'),
            sidebar            =   document.querySelector('#sidebar');
// templates
const       messageTemplate     =   document.querySelector('#message-template').innerHTML,
            locationTemplate    =   document.querySelector('#location-template').innerHTML,
            sidebarTemplate    =   document.querySelector('#sidebar-template').innerHTML;
//Options
 const  {username, room}  = Qs.parse(location.search, {ignoreQueryPrefix: true});
const autoscroll =() => {
    const newMessage = messages.lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin  =   parseInt(newMessageStyles.marginBottom);
    const newMessageHeight  =   newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight;

    const scrollOffSet = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet){
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html  =   Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    });
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})
socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location,
        createdAt: moment(location.createdAt).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html;
})
///////////////////////////// send message event///////////////////////////////
formSubmit.addEventListener('submit', (e) => {
    e.preventDefault();
    subtmitButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, () => {
        //actknowledgement callback
        messageForm.value = ''
        messageForm.focus();
        subtmitButton.removeAttribute('disabled')

        console.log('the message was delivered');
    });
})
///////////////////////////////send location event ///////////////////////////////
sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('geolocation its not suported by your browser');
    }
    sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('delivered location');
            sendLocationButton.removeAttribute('disabled');
        });
    })
})
socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});