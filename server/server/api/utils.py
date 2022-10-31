from http import HTTPStatus

from flask import Response
from loguru import logger


def bad_request(error_message: str) -> Response:
    logger.error(error_message)
    return Response(error_message, status=HTTPStatus.BAD_REQUEST)
