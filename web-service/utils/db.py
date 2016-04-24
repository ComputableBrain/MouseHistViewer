#!/usr/bin/python
# MongoDB connection utils

import pymongo

def connect(config):
	"""
	Connect to mongodb database given the application
	configurations
	"""
	client = pymongo.MongoClient(config['db_host'], int(config['db_port']))
	db = client[config['db_name']]
	err = client['ADRC_LoadErrors']
	return db, err
