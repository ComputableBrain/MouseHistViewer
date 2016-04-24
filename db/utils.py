from openslide.lowlevel import OpenSlideError
import sys,os
import openslide

def clean_openslide_keys (properties):
    """Openslide returns dictionaries that have . in the keys which mongo does not like, I need to change this to _"""
    return {k.replace(".","_"):v for k,v in properties.iteritems()}
        
def get_slide_data(filename):
    """This will use the openslide bindings to get the width, height and filesize for an image or return an Error otherwise"""
    try:
        slide = openslide.OpenSlide(filename)

        slide_data = {
            "filename": os.path.basename(filename),
            "width": slide.dimensions[0],
            "height": slide.dimensions[1],
            "size": os.path.getsize(filename),
            "properties": slide.properties}

        return slide_data

    except OpenSlideError, e:
        print "Openslide returned an error",filename
        print >>sys.stderr, "Verify failed with:", repr(e.args)
        print "Openslide returned an error",filename

        return None

    except StandardError, e:            
        #file name likely not valid
        print >>sys.stderr, "Verify failed with:", repr(e.args)
        print "Openslide returned an error om tje StandardError block",filename
        
        return None

    except:
        print "failed even earlier on",filename
        """will log this to a file"""
        
        return None