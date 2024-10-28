const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startPhotoboothButton = document.getElementById('start-photobooth');
const savePhotoButton = document.getElementById('save-photo');
const restartPhotoboothButton = document.getElementById('restart-photobooth');
const countdownDisplay = document.getElementById('countdown');
let imagesTaken = [];

// Set canvas size to fit the collage template
function setCanvasDimensions() {
    canvas.width = 1080;
    canvas.height = 1920;
}

// Initialize camera for live video feed
function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Bright flash effect between photos
function flashEffect() {
    document.body.style.backgroundColor = '#fff';
    setTimeout(() => { document.body.style.backgroundColor = 'black'; }, 100);
}

// Countdown display function
async function countdown() {
    for (let i = 3; i > 0; i--) {
        countdownDisplay.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    countdownDisplay.style.display = 'none';
    flashEffect();
}

// Capture photos with countdown and live feed reset
async function takePhotos() {
    imagesTaken = [];
    for (let i = 0; i < 3; i++) {
        countdownDisplay.style.display = 'block';
        await countdown();

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/jpeg');  // Use JPEG format for iOS Photos app compatibility
        imagesTaken.push(imgData);
        await new Promise(resolve => setTimeout(resolve, 300));  // Brief delay after each photo
    }

    displayCollage();
}

// Display the final collage
function displayCollage() {
    setCanvasDimensions();
    const positions = [
        { x: 120, y: 200, width: 840, height: 500 },
        { x: 120, y: 750, width: 840, height: 500 },
        { x: 120, y: 1300, width: 840, height: 500 }
    ];

    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        imagesTaken.forEach((image, index) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                const { x, y, width, height } = positions[index];
                const scale = Math.max(width / img.width, height / img.height);
                const sw = width / scale;
                const sh = height / scale;
                const sx = (img.width - sw) / 2;
                const sy = (img.height - sh) / 2;
                context.drawImage(img, sx, sy, sw, sh, x, y, width, height);
            };
        });

        // Display the collage with save and restart options
        document.getElementById('camera-view').style.display = 'none';
        canvas.style.display = 'block';
        startPhotoboothButton.style.display = 'none';
        savePhotoButton.style.display = 'inline';
        restartPhotoboothButton.style.display = 'inline';
    };
}

// Button events
startPhotoboothButton.addEventListener('click', () => {
    initializeCamera();
    takePhotos();
});

savePhotoButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpeg');  // Saving as JPEG
    link.download = 'collage.jpg';
    link.click();
});

restartPhotoboothButton.addEventListener('click', () => {
    location.reload();
});
