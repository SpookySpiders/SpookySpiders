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
    // Set canvas dimensions for Instagram Story
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Load base template
    const collage = new Image();
    collage.src = 'IMG_2043.PNG';
    collage.onload = () => {
        // Draw the base template
        context.drawImage(collage, 0, 0, canvas.width, canvas.height);
        
        // Define the dimensions and positions for each photo to fit behind the white spaces
        const photoWidth = 880;   // Adjust width to fit within each white section
        const photoHeight = 470;  // Adjust height based on each white section
        
        const positions = [
            { x: 100, y: 230 },   // Position for first image
            { x: 100, y: 740 },   // Position for second image
            { x: 100, y: 1250 }   // Position for third image
        ];

        // Draw each captured image in the specified positions
        imagesTaken.forEach((image, index) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                context.drawImage(img, positions[index].x, positions[index].y, photoWidth, photoHeight);
            };
        });

        // Load and overlay the decorative border
        const overlay = new Image();
        overlay.src = 'IMG_2042.PNG';
        overlay.onload = () => {
            context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
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
