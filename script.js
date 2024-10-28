const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const startPhotoboothButton = document.getElementById('start-photobooth');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');
const countdownDisplay = document.getElementById('countdown');
const collageImage = document.getElementById('collage');
let imagesTaken = [];

// Set canvas dimensions based on the collage size
function setCanvasDimensions() {
    canvas.width = 1080;
    canvas.height = 1920;
}

// Initialize camera
function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Function to handle the countdown, flash, and taking pictures
async function startPhotoSequence() {
    imagesTaken = [];
    countdownDisplay.style.display = 'block';

    for (let i = 0; i < 3; i++) {
        for (let j = 3; j > 0; j--) {
            countdownDisplay.textContent = j;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        countdownDisplay.textContent = "";
        document.body.style.backgroundColor = '#fff';
        await new Promise(resolve => setTimeout(resolve, 100));
        document.body.style.backgroundColor = 'black';

        // Capture image from video
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        imagesTaken.push(canvas.toDataURL('image/png'));
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    countdownDisplay.style.display = 'none';
    createCollage();
}

// Create collage function
function createCollage() {
    setCanvasDimensions();

    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

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
                context.drawImage(img, 0, 0, canvas.width, canvas.height, x, y, width, height);
            };
        });

        const overlay = new Image();
        overlay.src = 'IMG_2042.PNG';
        overlay.onload = () => {
            context.drawImage(overlay, 0, 0, canvas.width, canvas.height);

            const finalImage = canvas.toDataURL('image/jpeg');
            collageImage.src = finalImage;
            collageImage.style.display = 'block';

            // Hide camera and show options
            video.style.display = 'none';
            startPhotoboothButton.style.display = 'none';
            savePhotoButton.style.display = 'inline';
            resetPhotoButton.style.display = 'inline';
        };
    };
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCamera();

    startPhotoboothButton.addEventListener('click', () => {
        startPhotoSequence();
    });

    savePhotoButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = collageImage.src;
        link.download = 'collage.jpg';
        link.click();
        alert('Hold down on the image and choose "Add to Photos" to save directly.');
    });

    resetPhotoButton.addEventListener('click', () => {
        collageImage.style.display = 'none';
        video.style.display = 'block';
        savePhotoButton.style.display = 'none';
        resetPhotoButton.style.display = 'none';
        startPhotoboothButton.style.display = 'inline';
        initializeCamera();
    });
});
