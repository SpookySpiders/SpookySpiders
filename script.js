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

// Set canvas for collage layout dimensions (adjusted for Safari iPhone view)
canvas.width = 1080;
canvas.height = 1920;

// Initialize the camera
function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Start the photobooth process
startButton.addEventListener('click', async () => {
    imagesTaken = []; // Reset any previous photos

    for (let i = 1; i <= 3; i++) {
        await countdownAndCapturePhoto(i);
    }

    // Create and display the collage after all images are captured
    createCollage();
});

// Countdown and photo capture function
async function countdownAndCapturePhoto(photoNumber) {
    countdownDisplay.style.display = 'block';
    for (let i = 3; i > 0; i--) {
        countdownDisplay.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    countdownDisplay.style.display = 'none';

    // Bright flash effect
    document.body.style.backgroundColor = '#fff';
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.style.backgroundColor = 'black';

    // Capture and store the photo
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    imagesTaken.push(imgData);
}

// Generate and display the collage
function createCollage() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Load the background template
    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Positions for images to align with template
        const positions = [
            { x: 120, y: 200, width: 840, height: 500 },
            { x: 120, y: 750, width: 840, height: 500 },
            { x: 120, y: 1300, width: 840, height: 500 }
        ];

        imagesTaken.forEach((imgData, index) => {
            const img = new Image();
            img.src = imgData;
            img.onload = () => {
                const { x, y, width, height } = positions[index];
                context.drawImage(img, x, y, width, height);
            };
        });

        setTimeout(displayCollage, 500); // Slight delay for Safari rendering
    };
}

// Display the final collage and hide the live camera view
function displayCollage() {
    // Convert canvas to a JPG
    const finalImage = canvas.toDataURL('image/jpeg', 0.8);
    collageImage.src = finalImage;

    // Hide camera view and show collage
    video.style.display = 'none';
    countdownDisplay.style.display = 'none';
    collageContainer.style.display = 'block';
}

// Save collage image
savePhotoButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = collageImage.src;
    link.download = 'Halloween_Collage.jpg';
    link.click();
    alert('Hold down on the image and choose "Add to Photos" to save directly.');
});

// Restart photobooth
restartPhotoButton.addEventListener('click', () => {
    collageContainer.style.display = 'none';
    video.style.display = 'block';
    imagesTaken = [];
});
document.addEventListener('DOMContentLoaded', initializeCamera);
