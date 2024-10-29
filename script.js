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

        const targetWidth = canvas.width * 0.80; // Reduced width to 80% to account for slight squeeze
        const padding = 30; // Padding between images
        const collageHeight = canvas.height * 0.80; // Top 80% of the collage height
        const startY = 100; // Starting y position for the first image

        let currentY = startY;

        imagesTaken.forEach((imageSrc, index) => {
            const img = new Image();
            img.src = imageSrc;

            img.onload = () => {
                // Calculate aspect ratio from the original video feed
                const aspectRatio = img.width / img.height;

                // Adjust width and height without squeezing
                const displayWidth = targetWidth;
                const originalHeight = img.height;
                const croppedHeight = originalHeight * 0.60; // Keep the lower 60%
                
                // Calculate display height based on aspect ratio
                const displayHeight = displayWidth / aspectRatio;

                // Calculate the x position to center the image horizontally within canvas
                const offsetX = (canvas.width - displayWidth) / 2;

                // Draw the image starting from the calculated y position to crop top 40%
                const cropY = originalHeight * 0.40; // Start drawing from 40% down
                context.drawImage(img, 0, cropY, img.width, originalHeight - cropY, offsetX, currentY, displayWidth, displayHeight);

                // Update currentY for the next image, adding padding
                currentY += displayHeight + padding;

                // Ensure images do not exceed the collage height
                if (currentY > startY + collageHeight) {
                    console.warn("Images exceed the top 80% of the collage height.");
                }

                // Draw overlay after the last image is loaded
                if (index === imagesTaken.length - 1) {
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
