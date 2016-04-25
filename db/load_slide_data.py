import pymongo, os, openslide
from utils import clean_openslide_keys, get_slide_data

client = pymongo.MongoClient('localhost',27017)
db = client.mouse
slide_dir = "/GLOBAL_SCRATCH/NeuroPathology"
dirs = [x for x in os.listdir(slide_dir)]

db.slides.drop()

for dir in dirs:
	path = os.path.join(slide_dir, dir)
	files = os.listdir(path)

	for file in files:
		file_path = os.path.join(path, file)
		slide = get_slide_data(file_path)

		if slide != None:
			slide['properties'] = clean_openslide_keys(slide['properties'])
			slide['date'] = dir
			db.slides.insert_one(slide)
