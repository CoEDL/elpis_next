from http import HTTPStatus

from flask import Blueprint, Response
from flask import current_app as app

from server.interface import Interface

reset_bp = Blueprint("reset_bp", __name__, url_prefix="/reset")


@reset_bp.route("/", methods=["GET"])
def reset():
    interface = Interface.from_app(app)
    interface.reset()
    return Response(status=HTTPStatus.NO_CONTENT)
