#!/usr/bin/python
# Serve static pages
# Serve pages from path specified in the app configutation 
# file
# The path should relative to the location of this blueprint

from flask import Blueprint
from utils.crossdomains import crossdomain
from utils.config import get_app_configurations

#get app configurations
config = get_app_configurations()
static = Blueprint('static', __name__, static_folder = config['static_dir'])

@static.route('/')
def serve_index():
	"""
	The default request will serve index.html page
	"""
	return static.send_static_file('index.html')

@static.route('/<path:path>')
def serve_static_page(path):
	"""
	Serve the page specified in the path
	"""
	return static.send_static_file(path)
