import pytest
from flask import Flask

from server import init_app
from server.interface import Interface


@pytest.fixture()
def app():
    app = init_app()
    yield app


def test_interface_from_app(app: Flask):
    interface = Interface.from_app(app)
    assert interface is Interface.from_app(app)
