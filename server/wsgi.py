import os

from server import init_app

app = init_app()


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=PORT, debug=True)
