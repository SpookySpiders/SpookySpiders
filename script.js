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
    imagesTaken = [];  // Reset imagesTaken at the start of the sequence
    countdownDisplay.style.display = 'block';

    // Create a div for the flash effect
    const flashDiv = document.createElement('div');
    flashDiv.classList.add('flash-active'); // Add flash class
    document.body.appendChild(flashDiv); // Append to body

    for (let i = 0; i < 3; i++) {
        for (let j = 3; j > 0; j--) {
            countdownDisplay.textContent = j;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        countdownDisplay.textContent = "";

        // Show the flash
        flashDiv.style.opacity = '1'; // Make the flash visible

        // Use requestAnimationFrame to ensure the rendering is smooth
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    flashDiv.style.opacity = '0'; // Fade it out
                    resolve();
                }, 100); // Flash duration
            });
        });

        // Capture image from video
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        imagesTaken.push(canvas.toDataURL('image/png'));
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Remove the flash effect after the sequence
    document.body.removeChild(flashDiv); // Clean up the flash div

    countdownDisplay.style.display = 'none';
    createCollage();
}


function createCollage() {
    setCanvasDimensions();

    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const targetWidth = canvas.width * 0.80;
        const padding = 20;
        const collageHeight = canvas.height * 0.80;
        const targetHeight = (collageHeight - 2 * padding) / 3;

        // Use only the first 3 images from imagesTaken, in case it has more
        const imagesForCollage = imagesTaken.slice(0, 3);

        imagesForCollage.forEach((imageSrc, index) => {
            const img = new Image();
            img.src = imageSrc;

            img.onload = () => {
                const cropY = img.height * 0.20; // Start cropping 20% down from the top
                const croppedHeight = img.height * 0.60; // Height is 60% (removing 20% from top and bottom)
                const aspectRatio = img.width / croppedHeight;

                const displayWidth = targetWidth;
                const displayHeight = displayWidth / aspectRatio;

                const offsetX = (canvas.width - displayWidth) / 2;
                const offsetY = (index * (targetHeight + padding)) + 100;

                context.drawImage(
                    img,
                    0, cropY,                     // Start cropping from (0, cropY)
                    img.width, croppedHeight,      // Crop width and height
                    offsetX, offsetY,              // Display position on canvas
                    displayWidth, targetHeight     // Display size on canvas
                );

                if (index === 2) {
                    drawOverlay();
                }
            };

            img.onerror = (e) => console.error("Image load error:", e);
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
