import asyncio
import os
import shutil
import sys
import edge_tts

# Ensure utf-8 encoding for stdout on Windows
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Using Microsoft Swara Neural (High-clarity Indian Hindi Female Voice)
VOICE = "hi-IN-SwaraNeural"
# Speed increased to +25% for energetic, crisp, natural dispatch tone
RATE = "+25%"
PITCH = "+2Hz"

# Punchy, natural, professional dispatch announcements (Short, clear, zero robotic filler)
CLIPS = {
    "job-alert-female.mp3": "नया काम! आपके इलाके से एक नया काम आया है। कुल कमाई ढाई सौ रुपये नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।",
    "job-alert-electrician.mp3": "नया काम! आपके पास से इलेक्ट्रीशियन के काम की बुकिंग आई है। कुल कमाई दो सौ रुपये नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।",
    "job-alert-plumber.mp3": "नया काम! आपके पास से प्लंबर के काम की बुकिंग आई है। कुल कमाई दो सौ रुपये नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।",
    "job-alert-carpenter.mp3": "नया काम! आपके पास से बढ़ई के काम की बुकिंग आई है। कुल कमाई दो सौ रुपये नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।",
    "job-alert-cook.mp3": "नया काम! आपके पास से खाना पकाने के काम की बुकिंग आई है। कुल कमाई तीन सौ रुपये नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।",
    "job-alert-cleaner.mp3": "नया काम! आपके पास से घर की साफ़ सफ़ाई की बुकिंग आई है। कुल कमाई दो सौ रुपये नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।",
    "job-alert-general.mp3": "नया काम! आपके इलाके से नया काम उपलब्ध है। कुल कमाई ढाई सौ रुपये नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।",
}

async def generate_file(filename, text):
    pub_path = os.path.join("public", "audio", filename)
    dist_path = os.path.join("dist", "audio", filename)
    os.makedirs(os.path.dirname(pub_path), exist_ok=True)
    os.makedirs(os.path.dirname(dist_path), exist_ok=True)

    print(f"Generating {filename}...")
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(pub_path)
    shutil.copy(pub_path, dist_path)
    print(f"Successfully generated {filename} ({os.path.getsize(pub_path)} bytes)")

async def main():
    for fname, text in CLIPS.items():
        await generate_file(fname, text)
    print("ALL AUDIO CLIPS GENERATED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
