from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    q = request.args.get('q', '')
    if not q:
        return jsonify({"results": []})
    
    url = f"https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query={q}"
    r = requests.get(url)
    data = r.json()
    results = []
    for song in data['data']['results']:
        audio_url = None
        for dl in song.get('downloadUrl', []):
            if dl.get('quality') == "160kbps":
                audio_url = dl.get('link')
                break
        results.append({
            "id": song['id'],
            "name": song['name'],
            "primaryArtists": song['primaryArtists'],
            "image": song['image'][1]['link'] if len(song['image']) > 1 else '',
            "audio_url": audio_url
        })
    return jsonify({"results": results})

@app.route('/download')
def download():
    song_id = request.args.get('id')
    song_name = request.args.get('name')
    if not song_id or not song_name:
        return jsonify({"status": "erro", "message": "ID ou nome não fornecidos"})
    
    url = f"https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query={song_name}"
    r = requests.get(url)
    data = r.json()
    download_url = None
    for song in data['data']['results']:
        if song['id'] == song_id:
            for dl in song.get('downloadUrl', []):
                if dl.get('quality') == "160kbps":
                    download_url = dl.get('link')
                    break
            break
    if not download_url:
        return jsonify({"status": "erro", "message": "Download URL não encontrado"})

    os.makedirs('downloads', exist_ok=True)
    safe_name = "".join(c for c in song_name if c.isalnum() or c in " ._-").rstrip()
    filename = os.path.join('downloads', f"{safe_name}.mp4")
    try:
        with requests.get(download_url, stream=True) as r:
            r.raise_for_status()
            with open(filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        return jsonify({"ficheiro": filename, "musica": song_name, "status": "sucesso"})
    except Exception as e:
        return jsonify({"status": "erro", "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True)

