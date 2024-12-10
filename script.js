const videoElement = document.getElementById('liveVideo');
const toggleButton = document.getElementById('toggleButton');
let isVideoOn = true;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        videoElement.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing media devices.', error);
    });

toggleButton.addEventListener('click', () => {
    isVideoOn = !isVideoOn;
    videoElement.style.display = isVideoOn ? 'block' : 'none';
});

// Optional: Move video with arrow keys
document.addEventListener('keydown', (event) => {
    const rect = videoElement.getBoundingClientRect();
    let top = rect.top;
    let left = rect.left;

    switch (event.key) {
        case 'ArrowUp':
            top -= 10;
            break;
        case 'ArrowDown':
            top += 10;
            break;
        case 'ArrowLeft':
            left -= 10;
            break;
        case 'ArrowRight':
            left += 10;
            break;
    }

    videoElement.style.transform = `translate(${left}px, ${top}px)`;
});
