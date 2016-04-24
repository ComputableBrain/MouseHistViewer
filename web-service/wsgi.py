# run: gunicorn --bind 0.0.0.0:8000 wsgi

from app import app as application
from utils.config import get_app_configurations
\
config = get_app_configurations()

if __name__ == "__main__":
    application.run(host=config['ws_host'], port=config['ws_port'], debug=True)
