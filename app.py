from flask import Flask, render_template, send_from_directory, jsonify, request

"""
Simple Flask application for tracking work hours.

The application serves a single page that lists recent dates and allows
users to log multiple time slots for each date. Entries consist of a
start time, end time and a description. Data is persisted client‑side
using the browser's localStorage; the server simply serves static
assets. While a full back‑end would normally save data to a database,
localStorage is adequate for a lightweight demonstration.

Run the application with:
    python app.py

Then navigate to http://localhost:5000 in your browser.
"""

app = Flask(__name__, template_folder="templates", static_folder="static")


@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")


if __name__ == "__main__":
    # Enable development mode for easier debugging during this demonstration.
    app.run(host="0.0.0.0", port=5000, debug=True)