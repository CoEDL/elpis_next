__version__ = "0.1.0"

from flask import Flask
from flask_cors import CORS


def init_app():
    """Initialize the core application"""

    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object("config.DevConfig")
    CORS(
        app,
        origins="http://localhost:3000",
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Access-Control-Allow-Credentials",
        ],
        supports_credentials=True,
    )

    # TODO setup tensorboard

    with app.app_context():
        # import routes and blueprints
        from server.api import api_bp

        # register blueprints
        app.register_blueprint(api_bp)

        return app
