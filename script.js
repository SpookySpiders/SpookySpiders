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

// Create collage with the images
function createCollage() {
    setCanvasDimensions();

    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        // Draw background first
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const collageWidth = canvas.width;
        const collageHeight = canvas.height;
        const imageWidth = collageWidth * 0.85;  // Each image will be 85% of the collage width
        const imageSpacing = 20;  // Space between images
        const topPadding = 50;    // Top padding
        const bottomPadding = 50; // Bottom padding

        // Calculate available space in top 3/4 of the canvas
        const availableHeight = (collageHeight * 3 / 4) - topPadding - bottomPadding - (2 * imageSpacing);
        const positions = [];

        // Calculate height for each image to maintain aspect ratio
        const imageHeight = availableHeight / 3;

        // Calculate positions for each image
        let yPos = topPadding;
        for (let i = 0; i < 3; i++) {
            positions.push({
                x: (collageWidth - imageWidth) / 2, // Center horizontally
                y: yPos,
                width: imageWidth,
                height: imageHeight,
            });
            yPos += imageHeight + imageSpacing;
        }

        let imagesLoaded = 0;

        imagesTaken.forEach((image, index) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                const { x, y, width, height } = positions[index];
                
                // Calculate scaling to maintain aspect ratio
                const scale = Math.min(width / img.width, height / img.height);
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;

                // Center image within its slot
                const offsetX = x + (width - newWidth) / 2;
                const offsetY = y + (height - newHeight) / 2;

                context.drawImage(img, offsetX, offsetY, newWidth, newHeight);
                imagesLoaded++;

                // Draw overlay once all images are loaded
                if (imagesLoaded === imagesTaken.length) {
                    drawOverlay();
                }
            };
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
