from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import hashlib

app = Flask(__name__)
CORS(app)

# Have I Been Pwned API URL
HIBP_API_URL = "https://api.pwnedpasswords.com/range/"

def check_password_strength(password):
    strength = 0
    if len(password) >= 8:
        strength += 1
    if any(char.isdigit() for char in password):
        strength += 1
    if any(char.isupper() for char in password):
        strength += 1
    if any(char.islower() for char in password):
        strength += 1
    if any(char in "!@#$%^&*()" for char in password):
        strength += 1
    return strength

def check_password_breach(password):
    sha1_password = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1_password[:5], sha1_password[5:]

    response = requests.get(f"{HIBP_API_URL}{prefix}")
    if response.status_code == 200:
        for line in response.text.splitlines():
            if suffix in line:
                return int(line.split(":")[1])
    return 0

@app.route("/check-password", methods=["POST"])
def check_password():
    data = request.json
    password = data.get("password")

    if not password:
        return jsonify({"error": "Password is required"}), 400

    strength = check_password_strength(password)
    breach_count = check_password_breach(password)

    return jsonify({
        "strength": strength,
        "breach_count": breach_count
    })

if __name__ == "__main__":
    app.run(debug=True)