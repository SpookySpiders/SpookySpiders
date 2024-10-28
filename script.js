const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');
const countdownDisplay = document.getElementById('countdown');
let imagesTaken = [];

// Set up canvas dimensions dynamically based on viewport width
function setCanvasDimensions() {
    const storyWidth = Math.min(window.innerWidth, 1080); // max width 1080
    const storyHeight = Math.round(storyWidth * (1920 / 1080)); // maintain aspect ratio
    canvas.width = storyWidth;
    canvas.height = storyHeight;
}

// Initialize camera
function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Updated createCollage function with delays and dimensions adjustments
function createCollage() {
    setCanvasDimensions(); // Adjust canvas size

    // Load base template
    const collage = new Image();
    collage.src = 'IMG_2043.PNG';

    collage.onload = () => {
        context.drawImage(collage, 0, 0, canvas.width, canvas.height);

        // Define positions and sizes for images
        const photoWidth = canvas.width * 0.8; // slightly smaller than canvas width
        const photoHeight = canvas.height * 0.25; // adjust height for each section
        const positions = [
            { x: canvas.width * 0.1, y: canvas.height * 0.12 },
            { x: canvas.width * 0.1, y: canvas.height * 0.4 },
            { x: canvas.width * 0.1, y: canvas.height * 0.7 }
        ];

        // Draw each captured image in the specified positions
        imagesTaken.forEach((image, index) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                context.drawImage(img, positions[index].x, positions[index].y, photoWidth, photoHeight);
                alert(`Image ${index + 1} loaded and drawn`);
            };
        });

        // Load and overlay the decorative border
        const overlay = new Image();
        overlay.src = 'IMG_2042.PNG';
        overlay.onload = () => {
            context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
            alert('Overlay applied');
        };
    };

    collage.onerror = () => alert('Failed to load base template');
}

// Set up camera and event listeners
initializeCamera();

takePhotoButton.addEventListener('click', async () => {
    countdownDisplay.style.display = 'block';
    for (let i = 3; i > 0; i--) {
        countdownDisplay.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    countdownDisplay.style.display = 'none';

    document.body.style.backgroundColor = '#fff';
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.style.backgroundColor = 'black';

    // Capture images
    imagesTaken = []; // Reset imagesTaken array
    for (let i = 0; i < 3; i++) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/png');
        imagesTaken.push(imgData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Captured image ${i + 1}`);
    }

    createCollage();
    savePhotoButton.disabled = false;
    resetPhotoButton.disabled = false;
});

savePhotoButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'collage.png';
    link.click();
});

resetPhotoButton.addEventListener('click', () => {
    imagesTaken = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
    savePhotoButton.disabled = true;
    resetPhotoButton.disabled = true;
});
