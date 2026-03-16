import os
import requests
import time
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlencode, parse_qs

class InstagramAPI:
    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.access_token = None
        self.ig_user_id = None
        self.api_base = "https://graph.instagram.com"
        self.oauth_base = "https://api.instagram.com"

    def get_authorization_url(self):
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "instagram_business_content_publish,instagram_business_basic",
            "response_type": "code"
        }
        url = f"{self.oauth_base}/oauth/authorize?{urlencode(params)}"
        return url

    def exchange_code_for_token(self, code):
        url = f"{self.oauth_base}/oauth/access_token"
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri,
            "code": code
        }
        response = requests.post(url, data=data)
        response.raise_for_status()
        self.access_token = response.json()["access_token"]
        return self.access_token

    def get_long_lived_token(self):
        url = f"{self.api_base}/access_token"
        params = {
            "grant_type": "ig_exchange_token",
            "client_secret": self.client_secret,
            "access_token": self.access_token
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        self.access_token = response.json()["access_token"]
        return self.access_token

    def get_ig_user_id(self):
        url = f"{self.api_base}/me"
        params = {
            "fields": "id,username,account_type,media_count",
            "access_token": self.access_token
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        self.ig_user_id = data["id"]
        print(f"Instagram User ID: {self.ig_user_id}")
        print(f"Username: {data['username']}")
        return self.ig_user_id

    def create_media_container(self, image_url, caption="", alt_text=""):
        url = f"{self.api_base}/{self.ig_user_id}/media"
        params = {
            "access_token": self.access_token,
            "image_url": image_url,
            "caption": caption,
            "alt_text": alt_text
        }
        response = requests.post(url, params=params)
        response.raise_for_status()
        container_id = response.json()["id"]
        print(f"Container created: {container_id}")
        return container_id

    def create_video_container(self, video_url, caption="", title="", thumbnail_url=""):
        url = f"{self.api_base}/{self.ig_user_id}/media"
        params = {
            "access_token": self.access_token,
            "media_type": "VIDEO",
            "video_url": video_url,
            "caption": caption,
            "title": title,
            "thumbnail_url": thumbnail_url
        }
        response = requests.post(url, params=params)
        response.raise_for_status()
        container_id = response.json()["id"]
        print(f"Video container created: {container_id}")
        return container_id

    def check_container_status(self, container_id):
        url = f"{self.api_base}/{container_id}"
        params = {
            "fields": "status_code",
            "access_token": self.access_token
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()["status_code"]

    def publish_media(self, creation_id):
        url = f"{self.api_base}/{self.ig_user_id}/media_publish"
        params = {
            "access_token": self.access_token,
            "creation_id": creation_id
        }
        response = requests.post(url, params=params)
        response.raise_for_status()
        media_id = response.json()["id"]
        print(f"Published! Media ID: {media_id}")
        return media_id

    def upload_image(self, image_url, caption="", alt_text=""):
        container_id = self.create_media_container(image_url, caption, alt_text)
        return self.publish_media(container_id)

    def upload_video(self, video_url, caption="", title="", thumbnail_url=""):
        container_id = self.create_video_container(video_url, caption, title, thumbnail_url)
        
        print("Waiting for video to process...")
        while True:
            status = self.check_container_status(container_id)
            print(f"Status: {status}")
            if status == "READY":
                break
            elif status == "ERROR":
                raise Exception("Video processing failed")
            time.sleep(2)
        
        return self.publish_media(container_id)

    def get_rate_limit(self):
        url = f"{self.api_base}/{self.ig_user_id}/content_publishing_limit"
        params = {"access_token": self.access_token}
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()


class OAuthHandler(BaseHTTPRequestHandler):
    auth_code = None
    
    def do_GET(self):
        query = parse_qs(self.path.split('?')[1] if '?' in self.path else '')
        if 'code' in query:
            OAuthHandler.auth_code = query['code'][0]
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h1>Authentication successful!</h1><p>You can close this window.</p></body></html>')
        else:
            self.send_response(400)
            self.end_headers()


def start_local_server(port=8080):
    server = HTTPServer(('localhost', port), OAuthHandler)
    return server


def get_credentials():
    client_id = os.environ.get("INSTAGRAM_CLIENT_ID")
    client_secret = os.environ.get("INSTAGRAM_CLIENT_SECRET")
    redirect_uri = os.environ.get("INSTAGRAM_REDIRECT_URI", "http://localhost:8080/callback")
    return client_id, client_secret, redirect_uri


def main():
    CLIENT_ID, CLIENT_SECRET, REDIRECT_URI = get_credentials()
    
    if not CLIENT_ID or not CLIENT_SECRET:
        print("Error: INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET must be set in environment")
        print("Add to ~/.bashrc:")
        print('  export INSTAGRAM_CLIENT_ID="your_client_id"')
        print('  export INSTAGRAM_CLIENT_SECRET="your_client_secret"')
        print('  export INSTAGRAM_REDIRECT_URI="http://localhost:8080/callback"')
        print("\nThen run: source ~/.bashrc")
        return

    api = InstagramAPI(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
    
    print("=" * 50)
    print("Instagram API - Login & Upload")
    print("=" * 50)
    
    auth_url = api.get_authorization_url()
    print(f"\n1. Open this URL in your browser:\n{auth_url}")
    print(f"\n2. After login, you'll be redirected to: {REDIRECT_URI}")
    
    server = start_local_server(8080)
    print(f"\n3. Starting local server at {REDIRECT_URI}")
    print("   Waiting for authorization...")
    
    try:
        server.handle_request()
        if not OAuthHandler.auth_code:
            print("No authorization code received.")
            return
        
        print(f"\n4. Got code: {OAuthHandler.auth_code[:20]}...")
        
        print("\n5. Exchanging code for token...")
        api.exchange_code_for_token(OAuthHandler.auth_code)
        
        print("\n6. Getting long-lived token...")
        api.get_long_lived_token()
        
        print("\n7. Getting Instagram User ID...")
        api.get_ig_user_id()
        
        print("\n" + "=" * 50)
        print("Login successful!")
        print("=" * 50)
        
        # Example: Upload an image
        # Replace with your publicly accessible image URL
        IMAGE_URL = "https://example.com/your-image.jpg"
        
        print(f"\nUploading image from: {IMAGE_URL}")
        media_id = api.upload_image(
            image_url=IMAGE_URL,
            caption="Hello from Instagram API! #python #api",
            alt_text="My uploaded image"
        )
        
        print(f"\nSuccess! Media ID: {media_id}")
        
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
