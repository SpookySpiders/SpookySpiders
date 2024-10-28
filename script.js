const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const countdownDisplay = document.getElementById('countdown');
const startButton = document.getElementById('start-photobooth');
const collageContainer = document.getElementById('collage-container');
const collageImage = document.getElementById('collage-image');
const savePhotoButton = document.getElementById('save-photo');
const restartPhotoButton = document.getElementById('restart-photo');
let imagesTaken = [];

// Set canvas size for collage layout (adjust for iPhone view).
canvas.width = 1080;
canvas.height = 1920;

function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Starts countdown, takes photos, and triggers collage generation
async function startPhotoBooth() {
    imagesTaken = [];
    for (let i = 3; i > 0; i--) {
        countdownDisplay.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    countdownDisplay.style.display = 'none';

    // Capture photo
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    imagesTaken.push(canvas.toDataURL('image/jpeg'));
    
    if (imagesTaken.length < 3) {
        startPhotoBooth();  // Continue countdown and photo capture if less than 3
    } else {
        generateCollage();
    }
}

function generateCollage() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const background = new Image();
    background.src = 'IMG_2043.PNG';
    background.onload = () => {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Positions in Instagram Story layout format
        const positions = [
            { x: 120, y: 200, width: 840, height: 500 },
            { x: 120, y: 750, width: 840, height: 500 },
            { x: 120, y: 1300, width: 840, height: 500 }
        ];

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

        const overlay = new Image();
        overlay.src = 'IMG_2042.PNG';
        overlay.onload = () => {
            context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
            collageImage.src = canvas.toDataURL('image/jpeg');  // Show collage as JPEG
            collageContainer.style.display = 'block';
            video.style.display = 'none';
            startButton.style.display = 'none';
        };
    };
}

startButton.addEventListener('click', () => {
    initializeCamera();
    startPhotoBooth();
});

savePhotoButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = collageImage.src;
    link.download = 'collage.jpg';
    link.click();
});

restartPhotoButton.addEventListener('click', () => {
    collageContainer.style.display = 'none';
    video.style.display = 'block';
    startButton.style.display = 'block';
    initializeCamera();
});
