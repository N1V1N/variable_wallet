from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import parse_qs

class WaitingListHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/submit-waitlist':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = parse_qs(post_data)
            
            # Create data directory if it doesn't exist
            if not os.path.exists('data'):
                os.makedirs('data')
            
            # Save to waitlist.txt
            waitlist_file = 'data/waitlist.txt'
            waitlist_entries = []
            
            # Read existing entries
            if os.path.exists(waitlist_file):
                with open(waitlist_file, 'r') as f:
                    waitlist_entries = [line.strip() for line in f if line.strip()]
            
            # Create new entry
            name = data.get('name', [''])[0]
            email = data.get('email', [''])[0]
            message = data.get('message', [''])[0]
            new_entry = f"Name: {name} | Email: {email}"
            if message:
                new_entry += f" | Message: {message}"
            
            # Add new entry and sort
            waitlist_entries.append(new_entry)
            waitlist_entries.sort()
            
            # Write all entries
            with open(waitlist_file, 'w') as f:
                for entry in waitlist_entries:
                    f.write(entry + '\n')
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'success'}).encode())
            return
        
        return SimpleHTTPRequestHandler.do_POST(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, WaitingListHandler)
    print('Server running on port 8000...')
    httpd.serve_forever()
