const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');
const countdownDisplay = document.getElementById('countdown');
let imagesTaken = [];

// Set canvas dimensions based on IMG_2043 background template size
function setCanvasDimensions() {
    canvas.width = 1080;  // Set to the width of IMG_2043.PNG
    canvas.height = 1920; // Set to the height of IMG_2043.PNG
}

// Initialize camera
function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Updated createCollage function to handle layering, cropping, and alignment
function createCollage() {
    setCanvasDimensions(); // Adjust canvas size

    // Load background image (IMG_2043.PNG)
    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        // Draw the background on the canvas
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Define positions and sizes for images to match white spaces in IMG_2043.PNG
        const positions = [
            { x: 120, y: 200, width: 840, height: 500 },  // Position for the first image
            { x: 120, y: 750, width: 840, height: 500 },  // Position for the second image
            { x: 120, y: 1300, width: 840, height: 500 }  // Position for the third image
        ];

        // Draw each captured image with cropping to maintain aspect ratio
        imagesTaken.forEach((image, index) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                const { x, y, width, height } = positions[index];
                
                // Calculate scaling to maintain aspect ratio
                const scale = Math.min(width / img.width, height / img.height); 
                const sw = img.width * scale; 
                const sh = img.height * scale; 
                const sx = (img.width - sw) / 2; 
                const sy = (img.height - sh) / 2; 

                // Draw the image at the specified position on the canvas
                context.drawImage(img, sx, sy, sw, sh, x, y, width, height);
            };
        });

        // Load and overlay the decorative border (IMG_2042.PNG)
        const overlay = new Image();
        overlay.src = 'IMG_2042.PNG';
        overlay.onload = () => {
            context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        };
    };
}

// Initialize camera and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCamera();

    takePhotoButton.addEventListener('click', async () => {
        countdownDisplay.style.display = 'block';

        // Capture images with countdown
        for (let i = 0; i < 3; i++) {
            // Countdown before taking the picture
            for (let count = 3; count > 0; count--) {
                countdownDisplay.textContent = count;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Capture image
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/png');
            imagesTaken.push(imgData);

            // Hide countdown for a brief moment before the next one
            countdownDisplay.style.display = 'none';
            await new Promise(resolve => setTimeout(resolve, 500)); // Short pause before next countdown
            countdownDisplay.style.display = 'block'; // Show countdown again
        }

        countdownDisplay.style.display = 'none'; // Hide countdown after all captures
        createCollage(); // Create the collage after capturing all images
        savePhotoButton.disabled = false; // Enable save button
        resetPhotoButton.disabled = false; // Enable reset button
    });

    savePhotoButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'collage.png';
        link.click();
        alert('Hold down on the image and choose "Add to Photos" to save directly.');
    });

    resetPhotoButton.addEventListener('click', () => {
        imagesTaken = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        savePhotoButton.disabled = true;
        resetPhotoButton.disabled = true;
    });
});
