const video = document.getElementById('camera'); 
const canvas = document.getElementById('canvas');
const collageCanvas = document.getElementById('collageCanvas');
const context = canvas.getContext('2d');
const collageContext = collageCanvas.getContext('2d');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');
const countdownDisplay = document.getElementById('countdown');
const collageDisplay = document.getElementById('collageDisplay');
let imagesTaken = [];

// Create flash overlay dynamically
const flashOverlay = document.createElement('div');
flashOverlay.classList.add('flash-effect');
document.body.appendChild(flashOverlay);

// Set canvas dimensions
function setCanvasDimensions() {
    canvas.width = 1080;
    canvas.height = 1920;
}

function setCollageDimensions() {
    collageCanvas.width = 1080;
    collageCanvas.height = 1920;
}

// Initialize camera
function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Flash effect function
function triggerFlash() {
    flashOverlay.style.opacity = '1';
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
    }, 100); // Flash duration (100ms for a quick effect)
}

// Updated createCollage function
function createCollage() {
    setCollageDimensions();
    const background = new Image();
    background.src = 'IMG_2043.PNG';
    
    background.onload = () => {
        collageContext.drawImage(background, 0, 0, collageCanvas.width, collageCanvas.height);

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
                collageContext.drawImage(img, sx, sy, sw, sh, x, y, width, height);
            };
        });

        const overlay = new Image();
        overlay.src = 'IMG_2042.PNG';
        overlay.onload = () => {
            collageContext.drawImage(overlay, 0, 0, collageCanvas.width, collageCanvas.height);
            collageDisplay.style.display = 'block';
        };
    };
}

// Event listeners and photo-taking logic
document.addEventListener('DOMContentLoaded', () => {
    initializeCamera();

    takePhotoButton.addEventListener('click', async () => {
        imagesTaken = [];
        for (let i = 0; i < 3; i++) {
            // Countdown before each photo
            for (let j = 3; j > 0; j--) {
                countdownDisplay.style.display = 'block';
                countdownDisplay.textContent = j;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            countdownDisplay.style.display = 'none';

            // Flash effect and capture image
            triggerFlash();
            await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay for the flash effect
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/png');
            imagesTaken.push(imgData);

            // Short delay before next countdown
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        createCollage();
        savePhotoButton.disabled = false;
        resetPhotoButton.disabled = false;
    });

    savePhotoButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = collageCanvas.toDataURL('image/jpeg');
        link.download = 'collage.jpg';
        link.click();
        alert('Hold down on the image and choose "Add to Photos" to save directly.');
    });

    resetPhotoButton.addEventListener('click', () => {
        imagesTaken = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        collageContext.clearRect(0, 0, collageCanvas.width, collageCanvas.height);
        savePhotoButton.disabled = true;
        resetPhotoButton.disabled = true;
        collageDisplay.style.display = 'none';
    });
});
