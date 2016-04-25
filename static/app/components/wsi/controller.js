app.controller("wsictrl", function($scope, $http, api, wsiui){

    $scope.boxcolors = ["#3498DB", "#CE5545", "#27AE60", "#27AE60", "#CE5545", "#3498DB"];
    $scope.boxpos = [[500,500],[20000,500],[40000,500],[500,20000],[20000,20000],[40000,20000]]

    $scope.config = {
        cols:[
            {header: "Slide Controls", 
             scroll: "y",
             body: {
                view: "form", 
                elements: [wsiui.gallery, wsiui.viewerinfo, wsiui.boxctrl, wsiui.topset, wsiui.bottomset]
            }, 
            width: 420, height:1000},
            { view: "resizer" },
            { view: "template", content: "slice_viewer", height: "100%"}
        ]
    };

    $scope.init = function(root){
        $$('slice_gallery').attachEvent("onItemClick", function(id, e, node){
            $scope.saveboxes();

            $$('slice_gallery').clearCss("selected_thumbnail");
            this.addCss(id, "selected_thumbnail");
            filename = this.getItem(id).filename;
            $scope.prevfilename = filename;
            

            date = this.getItem(id).date;
            url = api.url+":"+api.port+"/DZIMS/"+date+"/"+filename+".dzi";
            $scope.viewer.open(url);
            $scope.loadboxes(filename);
            $scope.updatedimensions(this.getItem(id));
        });

        $$('groupbtn').attachEvent("onItemClick", function(){
            $scope.groupboxes();
        });

        $$('ungroupbtn').attachEvent("onItemClick", function(){
            $scope.ungroupboxes();
        });

        $scope.viewer = OpenSeadragon({
            id: 'slice_viewer',
            prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",
            navigatorPosition: "TOP_RIGHT",
            showNavigator: true,
            tileSources: "http://node15.cci.emory.edu/cgi-bin/iipsrv.fcgi?DeepZoom=/PYRAMIDS/PYRAMIDS/CDSA/GBM_Frozen/intgen.org_GBM.tissue_images.3.0.0/TCGA-06-0137-01A-01-BS1.svs.dzi.tif.dzi"
        });

        $scope.viewer.addHandler('open', function() {
            var tracker = new OpenSeadragon.MouseTracker({
                element: $scope.viewer.container,
                moveHandler: function(event) {
                    var webPoint = event.position;
                    var viewportPoint = $scope.viewer.viewport.pointFromPixel(webPoint);
                    var imagePoint = $scope.viewer.viewport.viewportToImageCoordinates(viewportPoint);
                    $$("viewerinfo").updateItem("position_pixels", { content : imagePoint }, true);
                    $$("viewerinfo").updateItem("position_points", { content : viewportPoint }, true);
                    $scope.updatezoom();
                }
            });  

            tracker.setTracking(true);  
        });

        $scope.drawboxes();
    };

    $scope.drawboxes = function(annotations){
        //if the database is empty draw 6 random boxes
        this.overlay = $scope.viewer.fabricjsOverlay();  
        this.canvas = this.overlay.fabricCanvas(); 
        this.canvas.clear();

        if(annotations == null){
            for(var i=0; i < $scope.boxcolors.length; i++){                 
                var rect = new fabric.Rect({
                    left: $scope.boxpos[i][0],
                    top: $scope.boxpos[i][1],
                    fill: 'transparent',
                    stroke: $scope.boxcolors[i],
                    strokeWidth: 300,
                    width: 10000,
                    height: 10000
                }); 
                            
                this.canvas.add(rect);
            }
        }
        else{
            console.log(annotations);
            for(var i=0; i < annotations.length; i++){  
                var box = annotations[i];               
                var rect = new fabric.Rect({
                    left: box.left,
                    top: box.top,
                    width: box.width + 10000,
                    height: box.height  + 10000,
                    stroke: box.color,
                    fill: 'transparent',
                    strokeWidth: 300
                }); 
                            
                this.canvas.add(rect);
            }

        }

        this.canvas.renderAll();
    };
    
    $scope.groupboxes = function(){
        //https://gist.github.com/msievers/6069778
        if(this.canvas.getObjects().length == 1)
            return;

        this.group = new fabric.Group([
            this.canvas.item(0).clone(),
            this.canvas.item(1).clone(),
            this.canvas.item(2).clone(),
            this.canvas.item(3).clone(),
            this.canvas.item(4).clone(),
            this.canvas.item(5).clone()
        ]);

        this.canvas.clear().renderAll();
        this.canvas.add(this.group);
    };

    $scope.ungroupboxes = function(){
        if(this.canvas.getObjects().length == 6 || this.group == null)
            return;

        var boxes = this.group._objects;
        this.group._restoreObjectsState();
        this.canvas.remove(this.group);

        for(var i = 0; i < boxes.length; i++) {
            this.canvas.add(boxes[i]);
        }

        this.canvas.renderAll();
    };

    $scope.saveboxes = function(){
        var boxes = [];
        var tmp = null;
        $scope.ungroupboxes();

        this.canvas.calcOffset();

        for(var i = 0; i < 6; i++) {
            this.canvas.item(i).setCoords();
            var rect = this.canvas.item(i).getBoundingRect();
            rect.color = $scope.boxcolors[i];
            console.log("save rect");
            console.log(rect);
            boxes.push(rect);
        }

        console.log("saving " + $scope.prevfilename);
        $.ajax({
            url: api.url + ':' + api.port + '/api/v1/slides/annotations',
            type: 'POST',
            data: {"slideId": $scope.prevfilename, "annotations": JSON.stringify(boxes)}
        })
    };

    $scope.loadboxes = function(slideid){
        $.ajax({
            url: api.url + ':' + api.port + '/api/v1/slides/'+ slideid +'/annotations',
            type: 'GET',
            success: function(annotations, textStatus, xhr){
                if(xhr.status == 200){
                    console.log("loading " + slideid);
                    $scope.drawboxes(annotations);
                }
                else{
                    console.log(xhr.status);
                    $scope.drawboxes(null);
                }
            }
        })
    };

    $scope.updatedimensions = function(img){
        var viewport = $scope.viewer.viewport.getContainerSize();
        $$("viewerinfo").updateItem("viewport_dim", { content : viewport.x +" x "+ viewport.y }, true);
        $$("viewerinfo").updateItem("image_dim", { content : img.width +" x "+ img.height }, true);
    };

     $scope.updatezoom = function(event) {
        var zoom = $scope.viewer.viewport.getZoom(true);
        $$("viewerinfo").updateItem("image_zoom", { content : zoom.toFixed(2)}, true);
    }
});
