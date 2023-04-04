from flask import Blueprint

bp = Blueprint('demand_editor', __name__)

from maptool.demand_editor import routes