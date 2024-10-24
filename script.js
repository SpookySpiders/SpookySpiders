const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const countdownDisplay = document.getElementById('countdown');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');

let imagesTaken = [];

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => console.error('Error accessing webcam:', err));

takePhotoButton.addEventListener('click', async () => {
    countdownDisplay.style.display = 'block';
    for (let i = 3; i > 0; i--) {
        countdownDisplay.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Countdown delay
    }
    countdownDisplay.style.display = 'none';

    // Flash effect
    document.body.style.backgroundColor = '#fff'; // White flash
    await new Promise(resolve => setTimeout(resolve, 100)); // Flash duration
    document.body.style.backgroundColor = 'black'; // Revert back

    // Capture images
    for (let i = 0; i < 3; i++) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/png'); // High quality
        imagesTaken.push(imgData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before next capture
    }

    // Create collage
    createCollage();
    savePhotoButton.disabled = false;
    resetPhotoButton.disabled = false;
});

function createCollage() {
    const collage = new Image();
    collage.src = 'images/image1.png'; // Base image
    collage.onload = () => {
        context.drawImage(collage, 0, 0, canvas.width, canvas.height);
        imagesTaken.forEach((image, index) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                const x = (index % 3) * (canvas.width / 3); // Calculate x position
                const y = (canvas.height / 2) - (canvas.height / 3); // Center vertically
                context.drawImage(img, x, y, canvas.width / 3, canvas.height / 3); // Adjust size accordingly
            };
        });

        const overlay = new Image();
        overlay.src = 'images/image2.png'; // Decorative border
        overlay.onload = () => {
            context.drawImage(overlay, 0, 0, canvas.width, canvas.height); // Overlay on top
        };
    };
}

// Save photo functionality
savePhotoButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'collage.png';
    link.click();
});

// Reset functionality
resetPhotoButton.addEventListener('click', () => {
    imagesTaken = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
    savePhotoButton.disabled = true;
    resetPhotoButton.disabled = true;
});
