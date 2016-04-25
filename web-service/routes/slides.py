from flask import request, url_for, jsonify, make_response, Blueprint, current_app as app, Response
from bson.json_util import dumps
from utils.crossdomains import crossdomain
from utils.deepzoom import _get_slide, _SlideCache
import pymongo, os, gridfs
from utils.db import connect
import json

slides = Blueprint('slides', __name__)
sdb = None
edb = None

@slides.record
def record_params(setup_state):
    app = setup_state.app
    slides.config = app.config

@slides.before_app_first_request
def _setup():
    global sdb
    global edb
    sdb, edb = connect(slides.config)

@slides.route('/api/v1/slides')
@crossdomain(origin='*')
def get_collections():
    slideset = []

    try:
        cursor = sdb[slides.config["slides_collection"]].find({}, {'_id': False, 'lastModified': False}).sort("width",-1)
        for slide in cursor:
            slideset.append(slide)
    except pymongo.errors.OperationFailure:
        print "caught error"
        return Response(None, status=404)

    return Response(json.dumps(slideset), mimetype='text/json', status=200)

@slides.route('/api/v1/slides/<string:id>')
@crossdomain(origin='*')
def get_slides( id):
    """This will return the list of slides for a given collection aka tumor type """
    return dumps( {'slide_list': sdb[slides.config["slides_collection"]].find({'pt_id':id})} ) 

@slides.route('/api/v1/slides/annotations', methods=['POST','OPTIONS'])
@crossdomain(origin='*')
def save_annotations():
    slide_id = request.form['slideId']
    annotations = json.loads(request.form['annotations'])
    update_values = {"$set": {"annotations": annotations},"$currentDate": {"lastModified": True}}
    sdb[slides.config["slides_collection"]].update_one({"filename": slide_id}, update_values)
    return Response(None, status=204)

@slides.route('/api/v1/slides/<slide_id>/annotations', methods=['GET'])
@crossdomain(origin='*')
def load_annotations(slide_id):
    slide = sdb[slides.config["slides_collection"]].find({"filename": slide_id}, {'annotations': True})
    t = slide.next()
    
    if "annotations" not in t:
        return Response(None, status=204)

    return Response(json.dumps(t["annotations"]), mimetype='text/json', status=200)

##This will process and store files that were marked as bad...
@slides.route('/api/v1/slides/<string:id>/report', methods=["POST"])
def report_bad_images():
    filename=request.form['filename']
    slide_url = request.form['slide_url']
    data_group = request.form['data_group']
    edb['cdsa_live'].insert({ 'filename':filename, 'slide_url':slide_url, 'data_group':data_group})
    return 'OK'