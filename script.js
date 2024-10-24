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
    })
    .catch(err => {
        console.error("Error accessing camera: ", err);
    });

takePhotoButton.addEventListener('click', async () => {
    countdownDisplay.innerHTML = '3...';
    await sleep(1000);
    countdownDisplay.innerHTML = '2...';
    await sleep(1000);
    countdownDisplay.innerHTML = '1...';
    await sleep(1000);
    countdownDisplay.innerHTML = 'Say Cheese!';
    
    // Flash effect
    canvas.style.display = 'none';
    setTimeout(() => {
        canvas.style.display = 'block';
    }, 100);

    // Take the photo
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/png');
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

        // Draw the three photos in specified positions (you'll need to adjust these positions)
        for (let i = 0; i < 3; i++) {
            const img = new Image();
            img.src = photos[i];
            img.onload = () => {
                const x = /* Define x position for photo i */;
                const y = /* Define y position for photo i */;
                const width = /* Define width for photo i */;
                const height = /* Define height for photo i */;
                context.drawImage(img, x, y, width, height);
            };
        }
        
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
    link.href = canvas.toDataURL('image/png');
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

