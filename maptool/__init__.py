import os
import json
from .display_pdpw_networks import getTestNetwork
from flask import Flask, render_template, jsonify, request

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
    
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/')
    def home():
        return render_template('home.html')

    @app.route('/network', methods=['GET', 'POST'])
    def network():
        if request.method == 'GET':
            #net = json.loads(getTestNetwork())
            net = getTestNetwork()
            return net

        if request.method == 'POST':
            print(request.get_json())
            return 'Sucess', 200

        #return render_template('network.html')

    return app


    