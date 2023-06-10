from maptool.urbs_editor import bp
from flask import Flask, render_template, request, session

@bp.route('/urbs_results', methods=['GET', 'POST'])
def urbs_results_setup():
    return render_template('urbs_results/index.html')