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




function createCollage() {
    setCanvasDimensions();

    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const targetWidth = canvas.width * 0.80; // Target width for each image in the collage
        const padding = 20; // Padding between images
        const collageHeight = canvas.height * 0.80; // Top 80% of the canvas
        const targetHeight = (collageHeight - 2 * padding) / 3; // Calculate height for each image with padding included

        imagesTaken.slice(0, 3).forEach((imageSrc, index) => { // Ensure exactly 3 images are used
            const img = new Image();
            img.src = imageSrc;

            img.onload = () => {
                const cropY = img.height * 0.40; // Start 40% down from the top
                const croppedHeight = img.height - cropY; // Bottom 60% of the image
                const aspectRatio = img.width / croppedHeight;

                // Maintain the target width, adjust display height to preserve aspect ratio
                const displayWidth = targetWidth;
                const displayHeight = displayWidth / aspectRatio;

                // Position images within the top 80% of the canvas, spaced with padding
                const offsetX = (canvas.width - displayWidth) / 2;
                const offsetY = (index * (targetHeight + padding)) + 100; // Starting at 100px with spacing

                context.drawImage(img, 0, cropY, img.width, croppedHeight, offsetX, offsetY, displayWidth, targetHeight);
                
                // Draw overlay after the last image
                if (index === 2) {
                    drawOverlay();
                }
            };

            img.onerror = (e) => console.error("Image load error:", e); // Error handler for troubleshooting
        });
    };
}







// Function to draw the overlay
function drawOverlay() {
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
        initializeCamera(); // Re-initialize the camera
    });
});
