const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const countdownDisplay = document.getElementById('countdown');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');
const overlay = document.getElementById('overlay');

let photoCount = 0;
let photos = [];

// Start the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;

        // Set canvas size to match video size for better quality
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
    })
    .catch(err => {
        console.error("Error accessing camera: ", err);
    });

takePhotoButton.addEventListener('click', async () => {
    // Countdown before taking a picture
    countdownDisplay.style.display = 'block'; // Show countdown
    for (let i = 3; i > 0; i--) {
        countdownDisplay.innerHTML = i;
        await sleep(1000);
    }
    countdownDisplay.innerHTML = 'Say Cheese!'; // Final message
    await sleep(1000);
    countdownDisplay.style.display = 'none'; // Hide countdown

    // Take the photo
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/png', 1.0); // Quality set to 1.0 for maximum quality
    photos.push(photoDataUrl);
    photoCount++;

    // Create collage if we have 3 photos
    if (photoCount === 3) {
        createCollage();
    }

    // Enable save button
    savePhotoButton.disabled = false;
    resetPhotoButton.disabled = false;
});

// Create collage from photos
function createCollage() {
    const collageTemplate = new Image();
    collageTemplate.src = 'images/image1.png'; // Your collage template
    collageTemplate.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(collageTemplate, 0, 0, canvas.width, canvas.height);

        // Draw the three photos in specified positions (adjust as needed)
        const positions = [
            { x: 20, y: 20, width: 150, height: 150 }, // First photo position
            { x: 200, y: 20, width: 150, height: 150 }, // Second photo position
            { x: 110, y: 200, width: 150, height: 150 }  // Third photo position
        ];

        photos.forEach((photo, index) => {
            const img = new Image();
            img.src = photo;
            img.onload = () => {
                context.drawImage(img, positions[index].x, positions[index].y, positions[index].width, positions[index].height);
            };
        });

        // Draw overlay
        context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
    };
}

// Sleep function for countdown
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Save photo function (modify according to your saving logic)
savePhotoButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1.0); // Quality set to 1.0
    link.download = 'collage.png';
    link.click();
});

// Reset photos
resetPhotoButton.addEventListener('click', () => {
    photos = [];
    photoCount = 0;
    savePhotoButton.disabled = true;
    resetPhotoButton.disabled = true;
    countdownDisplay.innerHTML = '';
});

