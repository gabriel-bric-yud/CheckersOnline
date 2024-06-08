let selection
let gameBoard = []
const squareSize = '40px'
const pieceSize = '30px'

const darkSquare = 'indigo' //'transparent'//'black'//'darkolivegreen' //'indigo'
const lightSquare = 'lightgrey' //'transparent'//'lightgoldenrodyellow'//'lightgoldenrodyellow' //'lightgrey'

const alphabet = ['A', 'B', 'C', 'D','E','F','G','H']

let pieces = []
let boardSpots = []
let boardSpotsDark = []

let whitePieces = []
let blackPieces = []
let pieceId

let nextMove
let movedPiece
let droppedSpot

let alphabetCounter
let numberCounter

let currentPiece

let backRight = ''
let backLeft = ''
let forwardRight = ''
let forwardLeft = ''

let takenPieceForwR = ''
let takenPieceForwL = ''
let takenPieceBackR = ''
let takenPieceBackL = ''


let takenPiece1 = ''
let takenPiece2 = ''

let forceBool1 = false
let forceBool2 = false
let forceBool3 = false
let forceBool4 = false

let jumpBool = false


let playerTurn = ''
let playerColor
let single
let matchRoom

let clickSelection

const darkTexture = new Image()
darkTexture.src = '/imgs/darkwood texture.jpg'

const lightTexture = new Image()
lightTexture.src = '/imgs/lightwood texture.jpg'


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener('selectstart', (e) => {
    e.preventDefault();
    
})

/** 
window.addEventListener('touchmove', (e) => {
    e.stopPropagation();
    e.preventDefault();
    
},{passive:false});
*/

let socket
let user
let possibleFriend
let friend

const titleDiv = document.querySelector('.titleDiv')
const gameContainer = document.getElementById('gameContainer')
const boardContainer = document.getElementById('boardContainer');
const userInterfaceDiv = document.getElementById('userInterface')

const createAccountUI = document.querySelector('#createAccountUI')
const userCreate = document.querySelector('#userCreate')
const userName = document.querySelector('#nameValue')

const setUp = document.querySelector('#setUp')
const singlePlayer = document.getElementById('singlePlayer');
const multiPlayer = document.getElementById('multiPlayer');
const playerButtons = document.querySelectorAll('.playerButton')

const selectColor = document.getElementById('selectColor')
const optionsContainer = document.getElementById('optionsContainer')

const searchUI = document.getElementById('searchUI');
const searchFriendForm = document.getElementById('searchFriendForm');
const searchFriendDiv = document.getElementById('searchFriendDiv');
const friendName = document.getElementById('friend')


const winnerText = document.getElementById('winnerText')
const winnerDiv = document.querySelector('#winnerBoard')
const restartText = document.querySelector('#restart')
const acceptRematch = document.getElementById('accept');
const rejectRematch = document.getElementById('reject');


//const waitButton = document.getElementById('wait')

const playersOnline = document.getElementById('playersOnline')



acceptRematch.addEventListener('click', (e) => {
    winnerDiv.classList.add('hide');
    if (single == false) {socket.emit('accept rematch', [friend, user, playerColor])}
    playerColor == 'black' ? playerColor = 'white' : playerColor = 'black';
    startGame(playerColor)

})

rejectRematch.addEventListener('click', (e) => {
    clearBoard()
    winnerDiv.classList.add('hide');
    socket.emit("disconnect friend", [friend, user]);
    friend = ""
    
})

function createOnlinePlayersDropdown() {
    const dropDown =  document.getElementById('myDropdown');
    dropDown.classList.toggle("show");
    const dropDownBtn = document.querySelector('.dropdownBtn');
    dropDownBtn.classList.toggle("clicked");

    window.onclick = function stopShow(event) {
        if (!event.target.matches('.dropdownBtn')) {
            const dropdowns = document.querySelector('.dropdownContent');
            if (dropdowns.classList.contains('show')) {
                dropdowns.classList.remove('show')
            }
        }
    }
}


function showOnlineUsers(msg) {
    while (playersOnline.firstChild) {
        playersOnline.firstChild.remove()
    }

    let showPlayers = document.createElement('button');
    showPlayers.setAttribute('id', 'showPlayers')
    showPlayers.setAttribute('class', 'dropdownBtn')
    let playerCount = msg.length - 1
    if (playerCount <= 0) {playerCount = 0}
    showPlayers.innerHTML = `${playerCount} Players Online: &#9776`
    playersOnline.appendChild(showPlayers)


    const myDropdown = document.createElement('div')
    myDropdown.setAttribute('id', 'myDropdown')
    myDropdown.setAttribute('class', 'dropdownContent')
    

    for (const player of msg) {
        if (player != user) {
            let newPlayer = document.createElement('a')
            newPlayer.setAttribute('class', 'online')
            newPlayer.textContent = player;
            myDropdown.appendChild(newPlayer)
            newPlayer.addEventListener('mousedown', (msg) => {
                clickSelection = player
                createRequestNotification(msg, `Send match request to ${clickSelection}?`, userInterfaceDiv, 'Send &#10004', 'Cancel &#10006', 'send', 'cancel')
            }) 
        }
    }

    playersOnline.appendChild(myDropdown)

    showPlayers.addEventListener('click', (e) => {
        createOnlinePlayersDropdown()
    })
}

function createNewUser(userN) {
    friend = ""
    if (userN != "" && userN.length <= 14) {
        socket = io()
        user = userN.toLowerCase()
        turnOnSocket()
        socket.emit("create user", user)
    }
    else {alert('Invalid')}
    userN = ""
}

userCreate.addEventListener('submit', (e) => {
    e.preventDefault();
    createNewUser(userName.value)   
})


function searchNewFriend(friendN) {
    if (friendN != "") {
        possibleFriend = friendN.toLowerCase()
        socket.emit("search friend", [user, possibleFriend, 'black'])     
    }
}



singlePlayer.addEventListener('click', (e) => {
    socket.emit("disconnect friend", [friend, user]);
    friend = ""
    clearBoard()
    searchFriendDiv.classList.add('hide')
    optionsContainer.classList.remove('hide')
    single = true
})

multiPlayer.addEventListener('click', (e) => {
    optionsContainer.classList.add('hide')
    searchFriendDiv.classList.remove('hide')
})

searchFriendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchNewFriend(friendName.value)
    friendName.value = ""
})


function acceptMatch(msg) {
    socket.emit("disconnect friend", [friend, user]);
    friend = msg[0];
    playerColor = 'white'
    socket.emit('accept match', [friend, user, 'black'])
    matchRoom = `${friend}+${user}`
    optionsContainer.classList.add('hide');
    searchFriendDiv.classList.remove('hide') 
    single = false
    startGame(playerColor)
}

function rejectMatch(msg) {
    socket.emit('reject match', [msg[0], user, `${user} has rejected your match` ])
}

function sendInvite() {
    searchNewFriend(clickSelection)
}

/** 
function acceptRematch() {
    if (single == false) {socket.emit('accept rematch', [friend, user, playerColor])}
    startGame(playerColor)

}

function rejectRematch() {
    clearBoard()
    socket.emit("disconnect friend", [friend, user]);
    friend = ""
}

waitButton.addEventListener('click', (e) => {
    enemyDisconnected.classList.add('hide')
})

*/

function createErrorNotification(msg, parent) {
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('errorMessage')
    const messageText = document.createElement('p')
    messageText.textContent = msg
    messageText.classList.add('errorMessageText')
    messageDiv.appendChild(messageText)
    const closeBtn = document.createElement('button')
    closeBtn.classList.add('matchButton')
    closeBtn.innerHTML = 'Close &#10006'
    messageDiv.appendChild(closeBtn)
    parent.appendChild(messageDiv)

    closeBtn.addEventListener('click', (e) => { 
        messageDiv.remove()
    })
}

function createRequestNotification(msg, msgText, parent, acceptText, rejectText, acceptAction, rejectAction) {
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('requestMessage')
    const messageText = document.createElement('p')
    messageText.textContent = msgText
    messageText.classList.add('requestMessageText')
    messageDiv.appendChild(messageText)

    const btnDiv = document.createElement('div')
    btnDiv.setAttribute('class', 'btnDiv')
    //btnDiv.style.display = 'flex';
    //btnDiv.style.gridTemplateColumns = '1fr 1fr'
    const acceptBtn = document.createElement('button')
    acceptBtn.classList.add('matchButton')
    acceptBtn.innerHTML = acceptText
    const closeBtn = document.createElement('button')
    closeBtn.classList.add('matchButton')
    closeBtn.innerHTML = rejectText

    btnDiv.appendChild(acceptBtn)
    btnDiv.appendChild(closeBtn)
    
    messageDiv.appendChild(btnDiv)

    parent.appendChild(messageDiv)

    acceptBtn.addEventListener('click', (e) => {
        if (acceptAction == 'send') {
            sendInvite()
        }
        else if (acceptAction == "accept") {
            acceptMatch(msg)
        }
        messageDiv.remove()
    })

    closeBtn.addEventListener('click', (e) => {
        if (rejectAction == 'reject') {
            rejectMatch(msg)
        }
        messageDiv.remove()
    })
}


function turnOnSocket() {
    if (socket != null) {
        socket.on('valid user', (msg) => {
            createAccountUI.classList.add('hide');
            setUp.classList.remove('hide')
            searchUI.classList.remove('hide')
        })
        
        socket.on('not valid', (msg) => {
            createErrorNotification(msg, userInterfaceDiv)
            socket.emit("disconnect function", (msg))
            socket = null
        })

        socket.on('players online', (msg) => {showOnlineUsers(msg)})

        socket.on('not online', (msg) => {
            createErrorNotification(msg, userInterfaceDiv)
        })

        socket.on('friend found', (msg) => {
            console.log(msg)
        })

        socket.on('request match', (msg) => {
            createRequestNotification(msg, msg[2], userInterfaceDiv, 'Accept &#10004', 'Reject &#10006', 'accept', 'reject')
        })


        socket.on('reject match', (msg) => {
            createErrorNotification(msg, userInterfaceDiv)
        })

        socket.on('disconnect friend', (msg) => {
            friend = ""
            clearBoard()
            createErrorNotification(msg, gameContainer)
            socket.emit('disconnect accepted', (msg))
        })


        socket.on('player color', (msg) => {
            socket.emit("disconnect friend", [friend, user]);
            friend = msg[1];
            socket.emit("game start", ([friend, user]))
            playerColor = msg[0];
            matchRoom = msg[1]
            single = false
            optionsContainer.classList.add('hide');
            searchFriendDiv.classList.remove('hide') 
            startGame(playerColor)
        })

        socket.on('accept rematch', (msg) => {
            winnerDiv.classList.add('hide');
            socket.emit("game start", ([friend, user]))
            playerColor = msg[0];
            matchRoom = msg[1]
            single = false
            optionsContainer.classList.add('hide');
            searchFriendDiv.classList.remove('hide') 
            startGame(playerColor)
        })

        socket.on('new move', changeMove) 

    }
}


function clearBoard() {
    while (boardContainer.firstChild) {
        boardContainer.firstChild.remove()
    } 
    winnerDiv.classList.remove('show')

}

function startGame(msg) {
    while (boardContainer.firstChild) {
        boardContainer.firstChild.remove()
    } 

    winnerDiv.classList.remove('show')

    if (msg == 'white') {
        createBoardWhite()
        gameBoard = document.querySelectorAll('.gridSpot')
        selectColor.value = ''  
        addCheckerPiecesWhite()
    }
    else if (msg == 'black') {
        createBoardBlack() 
        gameBoard = document.querySelectorAll('.gridSpot')
        selectColor.value = ''
        addCheckerPiecesBlack() 
        
    }
    highlight()
    dragDrop()
    newTurn()
}





function myFunction(elem) {
        elem.style.webkitAnimation = "mynewmove 3s 1"
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function reset() {
    boardSpots = []
    boardSpotsDark = []
    pieces = []
    alphabetCounter = 0
    numberCounter = 8
    whiteWins = false
    blackWins = false
    playerTurn = 'white'
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


class checker {
    originalColor;
    originalBorder;
    startingPosition;
    width;
    height;
    side;

    constructor(originalColor, startingPosition) {
        this.originalColor = originalColor;
        this.originalBorder = 'white'
        this.startingPosition = startingPosition;
        this.width = pieceSize
        this.height = pieceSize
        this.side = ''
    }

    draw() {
        let startingDiv = document.getElementById(this.startingPosition)
        let checkerPiece = document.createElement('div')

        checkerPiece.style.width = this.width
        checkerPiece.style.height = this.height
        checkerPiece.style.backgroundColor = this.originalColor;
        checkerPiece.originalColor = this.originalColor;
        checkerPiece.originalBorder = this.originalBorder
        checkerPiece.setAttribute('id', pieceId)
        checkerPiece.classList.add('checkerPiece')
        checkerPiece.classList.add('normal')
        checkerPiece.classList.add(startingDiv.id)
        checkerPiece.classList.add(startingDiv.id[0])
        checkerPiece.classList.add(startingDiv.id[1])
        checkerPiece.classList.add(this.side)
        checkerPiece.dataset.column = startingDiv.id[0]
        checkerPiece.dataset.row = startingDiv.id[1]
        checkerPiece.dataset.side = this.side
        checkerPiece.dataset.starterSpot = startingDiv.id

        checkerPiece.dataset.forceMove1 = 'false'
        checkerPiece.dataset.forceMove2 = 'false'
        checkerPiece.dataset.forceMove3 = 'false'
        checkerPiece.dataset.forceMove4 = 'false'
        checkerPiece.dataset.doubleJump = 'false'

        checkerPiece.style.zIndex = 999
        pieces.push(checkerPiece)

        if (checkerPiece.dataset.side == 'black') {
            blackPieces.push(checkerPiece)
        }
        else if (checkerPiece.dataset.side == 'white') {
            whitePieces.push(checkerPiece)
        }


        startingDiv.setAttribute('draggable','false')
        startingDiv.appendChild(checkerPiece)
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function createDarkBoardSpots(gridSpot) {
    gridSpot.style.backgroundColor = darkSquare
    gridSpot.originalColor = darkSquare
    gridSpot.classList.add('darkSquare')
    gridSpot.style.color = 'white'
    gridSpot.originalTextColor = 'white'
}

function createLightBoardSpots(gridSpot) {
    gridSpot.style.backgroundColor = lightSquare
    gridSpot.originalColor = lightSquare
    gridSpot.classList.add('lightSquare') 
    gridSpot.originalTextColor = 'black'
}


function createPattern(i, numberCounter, gridSpot) {
    if (numberCounter == 2 || numberCounter == 4 || numberCounter == 6 || numberCounter == 8) {
        if (i%2 == 0) {
            createDarkBoardSpots(gridSpot)
        }
        else {
            createLightBoardSpots(gridSpot)
        }
    }
    if (numberCounter == 1 || numberCounter == 3 || numberCounter == 5 || numberCounter == 7) {
        if ((i+1)%2 == 0) {
            createDarkBoardSpots(gridSpot)
        }
        else {
            createLightBoardSpots(gridSpot)
        }
    }
    if (gridSpot.classList.contains('darkSquare')) {
        gridSpot.style.backgroundImage = "url('/imgs/darkwood texture.jpg')"
    }
    if (gridSpot.classList.contains('lightSquare')) {
        gridSpot.style.backgroundImage = "url('/imgs/lightwood texture.jpg')"
    }

    boardSpotsDark = document.querySelectorAll('.darkSquare')
}


function createBoardWhite() {
    reset()
    for (let i = 1; i <= 64; i++) {
        const gridSpot = document.createElement('div');
        gridSpot.setAttribute('id', `${alphabet[alphabetCounter]}${numberCounter}`);
        gridSpot.classList.add(numberCounter) 
        gridSpot.classList.add('gridSpot') 
        gridSpot.setAttribute('draggable', 'false')

        createPattern(i, numberCounter, gridSpot)

        let gridLabel = document.createElement('h4');
        gridLabel.textContent = `${alphabet[alphabetCounter]}${numberCounter}`
        gridLabel.setAttribute('class', 'gridLabel')
        gridLabel.originalColor = gridSpot.originalColor
        gridLabel.originalTextColor = gridSpot.originalTextColor
        gridLabel.setAttribute('draggable', 'false')
        gridSpot.appendChild(gridLabel)

        boardSpots.push(gridSpot)
        
        boardContainer.appendChild(gridSpot)

        alphabetCounter += 1
        if (numberCounter <= 0) {
            numberCounter = 0
        }
        if (alphabetCounter > 7) {
            numberCounter -= 1
            alphabetCounter = 0;
        }
    }
}


function createBoardBlack() {
    reset()
    for (let i = 1; i <= 64; i++) {
        const gridSpot = document.createElement('div');
        gridSpot.setAttribute('id', `${alphabet[alphabetCounter]}${numberCounter}`);
        gridSpot.classList.add(numberCounter) // setAttribute('class', i)
        gridSpot.classList.add('gridSpot') // gridSpot.setAttribute('class', 'gridSpot')
        gridSpot.setAttribute('draggable', 'false')

        createPattern(i, numberCounter, gridSpot)

        let gridLabel = document.createElement('h4');
        gridLabel.textContent = `${alphabet[alphabetCounter]}${numberCounter}`
        gridLabel.setAttribute('class', 'gridLabel')
        gridLabel.originalColor = gridSpot.originalColor
        gridLabel.originalTextColor = gridSpot.originalTextColor
        gridLabel.setAttribute('draggable', 'false')
        gridSpot.appendChild(gridLabel)

        boardSpots.push(gridSpot)

        boardContainer.prepend(gridSpot)

        alphabetCounter += 1
        if (numberCounter > 8) {
            numberCounter = 1
        }
        if (alphabetCounter > 7) {
            numberCounter -= 1
            alphabetCounter = 0;
        }

    }

}

function addCheckerPiecesWhite() {
    pieceId = 0
    for (let i = 1; i <= 8; i++) {
        let startingSquares = document.getElementsByClassName(`${i}`)
        for (const square of startingSquares) {
            if (square.classList.contains('darkSquare')) {
                if (square.classList.contains('1') || square.classList.contains('2') || square.classList.contains('3')) {

                    square.classList.add('occupied')
                    let newChecker = new checker('red', square.id)
                    newChecker.side = 'white'
                    newChecker.draw()
                    pieceId++
                     
                }
                else if (square.classList.contains('6') ||square.classList.contains('7') || square.classList.contains('8')) {

                    square.classList.add('occupied')
                    let newChecker = new checker('black', square.id)
                    newChecker.side = 'black'
                    newChecker.draw()
                    pieceId++;
                } 
            }
        }
    }
}

function addCheckerPiecesBlack() {
    pieceId = 23
    for (let i = 8; i >= 1; i--) {
        let startingSquares = document.getElementsByClassName(`${i}`)
        for (const square of startingSquares) {
            if (square.classList.contains('darkSquare')) {
                if (square.classList.contains('1') || square.classList.contains('2') || square.classList.contains('3')) {

                    square.classList.add('occupied')
                    let newChecker = new checker('red', square.id)
                    newChecker.side = 'white'
                    newChecker.draw()
                    pieceId--
                     
                }
                else if (square.classList.contains('6') ||square.classList.contains('7') || square.classList.contains('8')) {

                    square.classList.add('occupied')
                    let newChecker = new checker('black', square.id)
                    newChecker.side = 'black'
                    newChecker.draw()
                    pieceId--;
                }  
            }
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function checkAllForceBool() {
    if (forceBool1 === true || forceBool2 === true || forceBool3 === true || forceBool4 === true) {
        return true
    }
    else {
        return false
    }
}

function checkAllForceData(piece) {
    let forceData
    for (let i = 1; i <= 4; i++) {
        if (piece.dataset[`forceMove${i}`] == 'true') {
            forceData = true
        }
    }
    if (forceData === true) {
        return true
    }
    else {
        return false
    }
}




function checkOccupied(element) {
    if (checkNull(element) === false) {
        if (element.classList.contains('occupied')) {
            return true
        }
        else {
            return false
        }
    }   
}

function checkNull(element) {
    if (element == null || typeof element === 'undefined') {
        return true
    }
    else {
        return false
    }
}

function checkSameSide(piece, takenPiece) {
    if (takenPiece.lastChild.dataset.side === piece.dataset.side) {
        return true
    }
    else {
        return false
    }
}


function preventNonForced(piece) {
    if (checkAllForceData(piece)) {
        if (piece.dataset.forceMove1 == 'false') {
            forwardRight = ''
            takenPieceForwR = ''
        }
        if (piece.dataset.forceMove2 == 'false') {
            forwardLeft = ''
            takenPieceForwL = ''
        }
        if (piece.dataset.forceMove3 == 'false') {
            backRight = ''
            takenPieceBackR = ''
        }
        if (piece.dataset.forceMove4 == 'false') {
            backLeft = ''
            takenPieceBackL = ''
        }
    }

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkMoveForwardRight(piece) {
    let num = 1
    let forwardR = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) + num]}${Number(piece.dataset.row) + num}`)

    if (checkNull(forwardR) === false) {
        if (checkOccupied(forwardR)) {
            num = 2
            takenPieceForwR = forwardR

            if (checkSameSide(piece, forwardR) === false) {
                forwardR = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) + num]}${Number(piece.dataset.row) + num}`)
                if (checkOccupied(forwardR) || checkNull(forwardR)) {
                    forwardR = ''
                    takenPieceForwR = ''
                }
                else {
                    forceBool1 = true
                    piece.dataset.forceMove1 = 'true'
                }
            }
        }
    }
    else {
        forwardR = ''
    }
    forwardRight = forwardR
    return {forwardRight, takenPieceForwR, forceBool1}
}


function checkMoveForwardLeft(piece) {
    let num = 1
    let forwardL = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) - num]}${Number(piece.dataset.row) + num}`)

    if (checkNull(forwardL) === false) {
        if (checkOccupied(forwardL)) {
            num = 2
            takenPieceForwL = forwardL
            if (checkSameSide(piece, forwardL) === false) {
                forwardL = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) - num]}${Number(piece.dataset.row) + num}`)
                
                if (checkOccupied(forwardL) || checkNull(forwardL)) {
                    forwardL = ''
                    takenPieceForwL = ''
                }
                else { 
                    forceBool2 = true
                    piece.dataset.forceMove2 = 'true'
                }
            }
        }
    }
    else {
        forwardL = ''
    }
    forwardLeft = forwardL
    return {forwardLeft, takenPieceForwL, forceBool2}
}


function checkMoveBackRight(piece) {
    let num = 1
    let backR = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) + num]}${Number(piece.dataset.row) - num}`)

    if (checkNull(backR) === false) {
        if (checkOccupied(backR)) {
            
            num = 2
            takenPieceBackR = backR
            if (checkSameSide(piece, backR) === false) { 
                backR = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) + num]}${Number(piece.dataset.row) - num}`)
                if (checkOccupied(backR) || checkNull(backR)) {
                    backR = ''
                    takenPieceBackR = ''
                }
                else {
                    forceBool3 = true
                    piece.dataset.forceMove3 = 'true'
                }
           }
        }
    }
    else {
        backR = ''
    }
    backRight = backR
    return {backRight, takenPieceBackR, forceBool3}
}

function checkMoveBackLeft(piece) {
    let num = 1
    let backL = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) - num]}${Number(piece.dataset.row) - num}`)
    
    if (checkNull(backL) === false) {
        if (checkOccupied(backL)) {
            num = 2
            takenPieceBackL = backL
            if (checkSameSide(piece, backL) === false) {
                backL = document.querySelector(`#${alphabet[alphabet.indexOf(piece.dataset.column) - num]}${Number(piece.dataset.row) - num}`)
                if (checkOccupied(backL) || checkNull(backL)) {
                    backL = ''
                    takenPieceBackL = ''
                }
                else {
                    forceBool4 = true
                    piece.dataset.forceMove4 = 'true'
                }
            }
        }
    }
    else {
        backL = ''
    }
    backLeft = backL
    return {backLeft, takenPieceBackL, forceBool4}
}



function checkMovesBlack(piece) {
    if ((!piece.classList.contains('king'))) {
        resetMoveVariables()
        resetForcedData(piece)
        checkMoveBackRight(piece)
        checkMoveBackLeft(piece) 
        preventNonForced(piece)
    }
    
    else {
        checkKingMove(piece)
    }  

}
        

function checkMovesWhite(piece) {
    if ((!piece.classList.contains('king'))) {
        resetMoveVariables()
        resetForcedData(piece)
        checkMoveForwardRight(piece)
        checkMoveForwardLeft(piece)
        preventNonForced(piece)
    }
    else {
        checkKingMove(piece)
    }
}

function checkKingMove(piece) {
    resetMoveVariables()
    resetForcedData(piece)
    checkMoveBackRight(piece)
    checkMoveBackLeft(piece) 
    checkMoveForwardRight(piece)
    checkMoveForwardLeft(piece)
    preventNonForced(piece)
}


function createKing(piece, dropTarget) {
    if (piece.dataset.side == 'white') {
        if (dropTarget.classList.contains('8')) {
            piece.dataset.king = 'true'
            piece.classList.remove('normal')
            piece.classList.add('king')
            piece.dataset.doubleJump = 'false'
        } 
    }
    if (piece.dataset.side == 'black') {
        if (dropTarget.classList.contains('1')) {
            piece.dataset.king = 'true'
            piece.classList.remove('normal')
            piece.classList.add('king')
            piece.dataset.doubleJump = 'false'
        }   
    }
    
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        
function resetMoveVariables() {
    backRight = ''
    backLeft = ''
    forwardRight = ''
    forwardLeft = ''
    takenPieceBackL = ''
    takenPieceBackR = ''
    takenPieceForwL = ''
    takenPieceForwR = ''
}


function resetPieceForceMoves(array) {
    array.forEach(item => {
        item.dataset.forceMove1 = 'false'
        item.dataset.forceMove2 = 'false'
        item.dataset.forceMove3 = 'false'
        item.dataset.forceMove4 = 'false'

    })

    resetMoveVariables()

    forceBool1 = false
    forceBool2 = false
    forceBool3 = false
    forceBool4 = false
}

function resetForcedData(piece) {
    piece.dataset.forceMove1 == 'false'
    piece.dataset.forceMove2 == 'false' 
    piece.dataset.forceMove3 == 'false'
    piece.dataset.forceMove4 == 'false'
    piece.dataset.doubleJump = 'false'
}



function setDraggable(piece) {
    if (checkAllForceBool() === false){
        if (playerColor == playerTurn) {
        piece.setAttribute('draggable', 'true')
        }
    }
    else if (checkAllForceBool()) {
        if (checkAllForceData(piece)) {
            piece.style.boxShadow = '0px 0px 4px 5px rgba(225, 245, 3, 0.75)'
            if (playerColor == playerTurn) {piece.setAttribute('draggable', 'true')}
        }
        else {
            piece.setAttribute('draggable', 'false')
        } 
    }

}

function forceMove() {
    pieces.forEach(piece => {
            if (piece.dataset.side == playerTurn) {
                if (playerTurn == 'black') {
                    checkMovesBlack(piece)
                    setDraggable(piece)
                
                }
                else if (playerTurn == 'white') {
                    checkMovesWhite(piece)
                    setDraggable(piece)
                }
            }
        else {
            piece.setAttribute('draggable', 'false')
        }
    })
}


function checkDoubleJump() {
    if (jumpBool === true) {
        pieces.forEach(piece => {
            if (playerTurn == 'black') {
                if (piece.dataset.doubleJump == 'true') {
                    checkMovesBlack(piece)
                    setDraggable(piece)
                }
                else {
                    piece.style.boxShadow = '3px 8px 10px 5px rgba(0,0,0,0.75)';
                    piece.setAttribute('draggable', 'false')
                }
            }
            else if (playerTurn == 'white') {
                if (piece.dataset.doubleJump == 'true') {
                    checkMovesWhite(piece)
                    setDraggable(piece)
                }
                else{
                    piece.style.boxShadow = '3px 8px 10px 5px rgba(0,0,0,0.75)';
                    piece.setAttribute('draggable', 'false')
                }
            }
            else {
                piece.setAttribute('draggable', 'false')
                piece.style.boxShadow = '3px 8px 10px 5px rgba(0,0,0,0.75)';
            }
        })
    }

}


function newTurn() {
    resetPieceForceMoves(pieces)
    removePossibleMoves(pieces)


    checkDoubleJump()

    if (checkAllForceBool() === false) {
        playerTurn == 'black' ? playerTurn = 'white' : playerTurn = 'black';
        if (single == true) {playerColor = playerTurn}
        resetPieceForceMoves(pieces)
        jumpBool = false
        
        pieces.forEach(piece => {
            piece.style.boxShadow = '3px 8px 10px 5px rgba(0,0,0,0.75)';
            forceMove()
        }) 
    }
    winCondition()
    finishGame() 
    selection = ""
    return jumpBool
}


function createPossibleMove(move) {
    const possibleMove = document.createElement('div')
    possibleMove.classList.add('possibleMove')
    if (checkNull(move) === false && move != '') {
        if (!(move.classList.contains('occupied'))) {
            move.appendChild(possibleMove) 
        }
    }

}

function removePossibleMoves() {
    const possibleMoves = document.querySelectorAll('.possibleMove')
    possibleMoves.forEach(move => {
        move.parentNode.removeChild(move)
    })
        
}



function resetPieceColor(selection) {
    selection.style.backgroundColor = selection.originalColor;
    selection.style.color = selection.originalTextColor;
    selection.style.borderColor = selection.originalBorder
}

function highlightPiece(selection) {
    selection.style.backgroundColor = 'yellow';
    selection.style.color = 'black';
    selection.style.borderColor = 'black';

}

function takePiece(dropTarget, spot, takenPiece, dragTarget) {
    if (dropTarget === spot) {
        if (takenPiece != '') {
            pieces.splice(pieces.indexOf(takenPiece.lastChild),1)
            takenPiece.removeChild(takenPiece.lastChild)
            takenPiece.classList.remove('occupied')
            jumpBool = true
            dragTarget.dataset.doubleJump = 'true'
            return jumpBool
        }
    }
}

function dropPiece(dragTarget, dropTarget, spot, takenPiece) {
    originalSquare = dragTarget.parentNode
    if (dropTarget === spot) {
        dragTarget.parentNode.removeChild(dragTarget)
        
        originalSquare.classList.remove('occupied')
        dragTarget.dataset.column = dropTarget.id[0]
        dragTarget.dataset.row = dropTarget.id[1]
        dropTarget.appendChild(dragTarget)
        dropTarget.classList.add('occupied')

        takePiece(dropTarget, spot, takenPiece, dragTarget)

        dragTarget.style.boxShadow = '3px 8px 8px 5px rgba(0,0,0,0.75)'
        resetPieceColor(dragTarget)
        createKing(dragTarget, dropTarget)
        movedPiece = dragTarget.dataset.starterSpot //`${dragTarget.dataset.column}${dragTarget.dataset.row}`
        droppedSpot = dropTarget.id

        removePossibleMoves()

        
        moveData = {
            dragItem: dragTarget.id,
            originalSpot: originalSquare.id,
            drop: dropTarget.id,
            spot: spot.id,
            taken: takenPiece.id,
            dropped: droppedSpot,
            enemy: friend
            //match: matchRoom
        }

        socket.emit('new move', moveData)    

        newTurn()
    }
}


function dropEnemyPiece(dragTarget, dropTarget, spot, takenPiece) {
    originalSquare = dragTarget.parentNode
    if (dropTarget === spot) {
        removePossibleMoves()

        dragTarget.parentNode.removeChild(dragTarget)
        
        originalSquare.classList.remove('occupied')
        dragTarget.dataset.column = dropTarget.id[0]
        dragTarget.dataset.row = dropTarget.id[1]
        dropTarget.appendChild(dragTarget)
        dropTarget.classList.add('occupied')

        if (takenPiece != null) {
            takePiece(dropTarget, spot, takenPiece, dragTarget);
        }

        dragTarget.style.boxShadow = '3px 8px 8px 5px rgba(0,0,0,0.75)'
        resetPieceColor(dragTarget)
        createKing(dragTarget, dropTarget)
        movedPiece = dragTarget.dataset.starterSpot //`${dragTarget.dataset.column}${dragTarget.dataset.row}`
        droppedSpot = dropTarget.id

        newTurn()
    }
}

function changeMove(message) {
    let dragTarget1 = document.getElementById(message.dragItem);
    let dropTarget1 = document.getElementById(message.drop);
    let spot1 = document.getElementById(message.spot);
    let takenPiece1 = document.getElementById(message.taken)
    dropEnemyPiece(dragTarget1, dropTarget1, spot1, takenPiece1)
}


function createClickablePossibleMoves(selection) {
    const possibleMoves1 = document.querySelectorAll('.possibleMove')
    possibleMoves1.forEach(move => {
        move.addEventListener('mousedown', (e) => { 
            dropPiece(selection, e.target.parentNode, forwardRight, takenPieceForwR)
            dropPiece(selection, e.target.parentNode, forwardLeft, takenPieceForwL)
            dropPiece(selection, e.target.parentNode, backRight, takenPieceBackR)
            dropPiece(selection, e.target.parentNode, backLeft, takenPieceBackL)
        })
    })      
}

function possibleMovesPointers(foo) {
    const possibleMoves2 = document.querySelectorAll('.possibleMove')
    possibleMoves2.forEach(move => {
        move.style.pointerEvents = foo
    })
    
}


function highlight() {
    pieces.forEach(element => {
        let clicked
        element.setAttribute('tabindex', '0')

        element.addEventListener('blur', (e) => {
            //e.stopPropagation()
            if (element.dataset.side == playerTurn) {
                resetPieceColor(element)
                clicked = false
            }
        })

        element.addEventListener('mousedown', (e) => {

            if (element.dataset.side == playerTurn && playerColor == playerTurn ) {
                if (checkAllForceBool() === false) {
                    clicked = true
                    selection = e.target
                    highlightPiece(selection)
                    currentPiece = selection
                    removePossibleMoves()
                    
                    
                    
                    if (selection.dataset.side == 'black') {
                        checkMovesBlack(selection)
                        if (selection.classList.contains('king')) {
                            createPossibleMove(forwardLeft)
                            createPossibleMove(forwardRight)
                            createPossibleMove(backLeft)
                            createPossibleMove(backRight)
                        }
                        else {
                        createPossibleMove(backLeft)
                        createPossibleMove(backRight)
                        }
                    }
                    else if (selection.dataset.side == 'white') {
                        checkMovesWhite(selection)
                        if (selection.classList.contains('king')) {
                            createPossibleMove(backLeft)
                            createPossibleMove(backRight)
                            createPossibleMove(forwardLeft)
                            createPossibleMove(forwardRight)
                        }
                        else {
                        createPossibleMove(forwardLeft)
                        createPossibleMove(forwardRight)
                        }
                    }
                    createClickablePossibleMoves(selection)
                    
                }
                else if (checkAllForceBool()) {
                    if (checkAllForceData(e.target)) {
                        clicked = true
                        selection = e.target
                        highlightPiece(selection)
                        currentPiece = selection
                        removePossibleMoves()

                        if (selection.dataset.side == 'black') {
                            checkMovesBlack(selection)
                            if (selection.classList.contains('king')) {
                                createPossibleMove(forwardLeft)
                                createPossibleMove(forwardRight)
                                createPossibleMove(backLeft)
                                createPossibleMove(backRight)
                            }
                            else {
                                createPossibleMove(backLeft)
                                createPossibleMove(backRight)
                            }
    
                        }
                        else if (selection.dataset.side == 'white') {
                            checkMovesWhite(selection)
                            if (selection.classList.contains('king')) {
                                createPossibleMove(backLeft)
                                createPossibleMove(backRight)
                                createPossibleMove(forwardLeft)
                                createPossibleMove(forwardRight)
                            }
                            else {
                                createPossibleMove(forwardLeft)
                                createPossibleMove(forwardRight)
                            }
    
                        }
                        createClickablePossibleMoves(selection)
                        
                    }
                }
                
            }
        })
    
        
        gameBoard.forEach(spot => {
            spot.addEventListener('mousedown', (e) => {
                if (!(spot.classList.contains('occupied')) && !(spot.classList.contains('checkerPiece'))) { 
                    dropPiece(selection, spot, forwardRight, takenPieceForwR)
                    dropPiece(selection, spot, forwardLeft, takenPieceForwL)
                    dropPiece(selection, spot, backRight, takenPieceBackR )
                    dropPiece(selection, spot, backLeft, takenPieceBackL)
                    removePossibleMoves()  
                }
                else if (e.target != currentPiece) {
                    removePossibleMoves()
                }
            })
        })
        
    })
}




function dragDrop() {
    let dragTarget
    let dropTarget1
    let originalSquare


    pieces.forEach(piece => {

        piece.addEventListener('dragstart', (e) => {
            dragTarget = e.target
            originalSquare = dragTarget.parentNode
            if (piece.dataset.side == playerTurn) {
                if (checkAllForceBool() === false) {
                    dragTarget.style.boxShadow = 'none'
                    dragTarget.classList.add('dragging')
                    dragTarget.style.boxShadow = 'none'
                    if (dragTarget.dataset.side == 'black') {checkMovesBlack(dragTarget)}
                    else if (dragTarget.dataset.side == 'white') {checkMovesWhite(dragTarget)}
                }
                else if (checkAllForceBool()) {
                    if (checkAllForceData(piece)) {
                        dragTarget.style.boxShadow = 'none'
                        dragTarget.classList.add('dragging')
                        dragTarget.style.boxShadow = 'none'
                        if (dragTarget.dataset.side == 'black') {checkMovesBlack(dragTarget)}
                        else if (dragTarget.dataset.side == 'white') {checkMovesWhite(dragTarget)}
                    }
                }
            }
            possibleMovesPointers('none')    
        })
   
        piece.addEventListener('dragend', (e) => {
            dragTarget = e.target
            dragTarget.classList.remove('dragging')
            dragTarget.style.boxShadow = '3px 8px 8px 5px rgba(0,0,0,0.75)'
            

            if (checkAllForceData(dragTarget)) {
                dragTarget.style.boxShadow = '0px 0px 4px 5px rgba(225, 245, 3, 0.75)'
            }
            possibleMovesPointers('auto')

        })

    })


    boardSpotsDark.forEach(element => {
        element.addEventListener('dragenter', (e) => {
            dropTarget1 = e.target
        })

        element.addEventListener('dragover', (e) => {
            e.preventDefault()
        })

        element.addEventListener('drop', (e) => {

            if (!(dropTarget1.classList.contains('occupied')) && !(dropTarget1.classList.contains('checkerPiece')) && playerTurn == dragTarget.dataset.side) { 
                dropPiece(dragTarget, dropTarget1, forwardRight, takenPieceForwR)
                dropPiece(dragTarget, dropTarget1, forwardLeft, takenPieceForwL)
                dropPiece(dragTarget, dropTarget1, backRight, takenPieceBackR )
                dropPiece(dragTarget, dropTarget1, backLeft, takenPieceBackL)  
                console.log(playerTurn)
            }

            else if (playerTurn != dragTarget.dataset.side) {
                alert(`It's not your turn. This is ${playerTurn}s move!`)
                removePossibleMoves()
            }
        })
    })
}

selectColor.addEventListener('change', (e) => {
    while (boardContainer.firstChild) {
        boardContainer.firstChild.remove()
    }
    

    winnerDiv.classList.remove('show')

    if (selectColor.value == 'white') {
        createBoardWhite()
        gameBoard = document.querySelectorAll('.gridSpot')
        selectColor.value = ''  
        addCheckerPiecesWhite()
    }
    else if (selectColor.value == 'black') {
        createBoardBlack() 
        gameBoard = document.querySelectorAll('.gridSpot')
        selectColor.value = ''
        addCheckerPiecesBlack() 
        
    }

    highlight()
    dragDrop()
    newTurn()

})


function winCondition() {
    let whiteCount = 0
    let blackCount = 0
    pieces.forEach(element => {
        if (element.classList.contains('white')) {whiteCount += 1;} //counter -= 1}
        if (element.classList.contains('black')) {blackCount += 1;}// counter -= 1}  
    })

        if (whiteCount == 0) {
            blackWins = true
            playerTurn = ''
            winnerText.textContent = 'The winner is Black!'
            return blackWins
        }
        else if (blackCount == 0) {
            whiteWins = true
            playerTurn = ''
            winnerText.textContent = 'The winner is White!'
            return whiteWins
        } 

}

function finishGame() {
    if (blackWins || whiteWins) {
        playerTurn = 'none'
        winnerDiv.classList.remove('hide')
        forceMove()
    }
}

/** 
Online Chat Page

Built with Node.js, Express, Socket.IO and MongoDB Atlas 

Try here: https://chatv2.azurewebsites.net/ */
