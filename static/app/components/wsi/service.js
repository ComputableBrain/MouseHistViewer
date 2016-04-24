app.factory("wsiui", function(api){

 	var gallery = {
        view: "dataview",
        id: "slice_gallery",
        template: "<img src='"+api.url+":"+api.port+"/thumbnail/#date#/#filename#' width='120' height='80' style='border:1px solid gray'/>",
        url: api.url+":"+api.port+"/api/v1/slides",
        datatype: "json",
        xCount: 2,
        yCount: 2,
        type: {height: 80, width: 120, css: "slice_gallery_cell"}
    };

    var viewerinfo = {
        view: "datatable",
        id: "viewerinfo",
        header:false,
        scroll: "y",
        height: 165,
        columns:[
            {id: "title", header: "", width: 200},
            {id: "content", header: "", width: "100%"}
        ],
        data:[
            {id: "position_pixels", title: "Mouse position (pixels)", content: "NA"},
            {id: "position_points", title: "Mouse position (points)", content: "NA"},
            {id: "viewport_dim", title: "Viewport dimensions", content: "NA"},
            {id: "image_dim", title: "Image dimensions", content: "NA"},
            {id: "image_zoom", title: "Zoom level", content: "NA"}
        ]
    };

    var boxctrl = {
    	view: "fieldset", label: "Group/Ungroup boxes",
    	body:{
       		cols:[
            	{ id: "groupbtn", view:"button", label: "Group", type:"form"},
                { id: "ungroupbtn", view:"button", label: "Ungroup", type:"form"}
            ]
        }
    };

    var topset = {
    	view: "fieldset", label: "Top Set", 
    	body:{
       		rows:[
            	{cols:[
                	{ view:"button", label: "Sickle Brain 2"},
                    { view:"button", label: "Sickle Brain 3", type:"danger"},
                    { view:"button", label: "Ctrl 1", type:"form"}
                ]},
                {cols:[
                    { view:"button", label:"Ctrl 3", type:"form"},
                    { view:"button", label:"Ctrl 4", type:"danger"},
                    { view:"button", label:"Red Necrosis 1"}
                ]}
            ]
        }
    };

    var bottomset = {
    	view: "fieldset", label: "Bottom Set", 
    	body:{
        	rows:[
                {cols:[
                    { view:"button", label:"Tumor Brain 1"},
                    { view:"button", label:"Tuor Brain 2", type:"danger"},
                    { view:"button", label:"Tumor Brain 3", type:"form"}
                ]},
                {cols:[
                    { view:"button", label:"Tuor Brain 5", type:"form"},
                    { view:"button", label:"HF 2008", type:"danger"},
                    { view:"button", label:"HF 2003"}
                ]}
            ]
        }
    };

    return {
    	gallery: gallery,
    	viewerinfo: viewerinfo,
    	topset: topset,
    	bottomset: bottomset,
    	boxctrl: boxctrl
    }
});