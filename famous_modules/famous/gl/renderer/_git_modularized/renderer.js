var FamousEngine = require('famous/engine'); 
var FM = require('famous/matrix');   
var ShaderMaker = require('famous/gl/shader-maker');   
var Utils = require('famous/utils/utils'); 
    
function Renderer(options)
{                     
    this.options = {
        context: undefined             
    }; 
    this.setOptions(options);         
    this.gl = this.options.context; 

    this.callbacks = {};                 

    this.pMatrix = FM.identity; 
    this.mMatrix = FM.identity; 
    this.vMatrix = FM.identity; 

    this.nMatrix = [1, 0, 0,
                    0, 1, 0, 
                    0, 0, 1]; 

    this.lineWidth = 1.0; 
    this.pointSize = 1.0;        

    this.nearPlane = 0.0125; 
    this.farPlane = 1000.0;        
    this.fov = 60.0; 
    this.ortho = false;         

    this.clear = true; 
    this.bgColor = [0.0, 0.0, 0.0, 1.0]; 
    
    this.currentMaterial = undefined; 
    this.depthTesting = true; 
    this.width = this.gl.viewportWidth; 
    this.height = this.gl.viewportHeight; 
    this.aspect = this.width / this.height;
    this.aspectLock = false; 
    this.viewport = [0, 0, this.width, this.height]; 
    this.blendMode = Renderer.ALPHA; 

    this.setViewPort(0, 0, this.width, this.height); 
    this.setPerspective(this.fov, this.nearPlane, this.farPlane); 
    this.setSize([this.gl.viewportWidth, this.gl.viewportHeight]);         
    this.setBlendMode(Renderer.ALPHA); 
    this.setLineWidth(this.lineWidth); 
    this.setPointSize(this.pointSize); 
    this.setDepthTesting(this.depthTesting); 

    this.bindEvents();                 
}      

Renderer.prototype.setOptions = function(options) 
{ 
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            this.options[key] = options[key];    
        }
    }
};

Renderer.prototype.bindEvents = function()
{
    this.callbacks['resize'] = this._resize.bind(this); 
    
    var keys = Object.keys(this.callbacks); 

    for(var i = 0; i < keys.length; i++)
    {
        FamousEngine.on(keys[i], this.callbacks[keys[i]]);                     
    }
};

Renderer.prototype.unbindEvents = function()
{
    var keys = Object.keys(this.callbacks); 

    for(var i = 0; i < keys.length; i++)
    {
        FamousEngine.unbind(keys[i], this.callbacks[keys[i]]);                     
    }
};

Renderer.prototype._resize = function()
{
    this.setSize([this.gl.viewportWidth, this.gl.viewportHeight]);
    if(this.ortho)
    {
        this.setOrthographic(); 
    }
    else
    {
        this.setPerspective(this.fov); 
    }
}; 

Renderer.prototype.render = function(object)
{
    var gl = this.gl; 

    var meshes = object.scene.getMeshes(); 
    var lights = object.scene.getLights();    

    var framebuffer = object.framebuffer;        
    var useFrameBuffer = framebuffer ? true : false; 
    
    var viewport = object.viewport; 
    var projection = object.projection; 
    var camera = object.camera; 
    var view = object.view; 
    var depthTesting = object.depthTesting; 
    var blendMode = object.blendMode; 
    var backgroundColor = object.backgroundColor; 
    var clear = object.clear; 

    if(blendMode !== undefined)
    {
        this.setBlendMode(blendMode); 
    }

    if(depthTesting !== undefined)
    {
        this.setDepthTesting(depthTesting); 
    }
    
    this.currentMaterial = undefined;            

    if(useFrameBuffer)            
    {
        framebuffer.setContext(gl); 
        framebuffer.bind();    
    }                         

    if(viewport)
    {
        this.setViewPort(viewport[0], viewport[1], viewport[2], viewport[3]); 
    }
    else
    {
        this.applyViewPort(); 
    }
    
    if(projection)
    {
        this.setProjectionMatrix(projection); 
    }   
        
    if(clear !== undefined)
    {
        this.setClearBackground(clear);             
    }

    if(backgroundColor)
    {
        this.setBackgroundColor(backgroundColor);     
    }    
    else if(this.clear)
    {
        this.clearBackground(); 
    }

    if(camera)
    {
        this.setViewMatrix(camera.getMatrix());
    }
    else if(view)
    {
        this.setViewMatrix(view);             
    }

    if(this.depthTesting)
    {
        gl.enable(gl.DEPTH_TEST);
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }

    for(var i = 0; i < meshes.length; i++)
    {
        this._render(meshes[i], lights); 
    }
    
    if(useFrameBuffer)
    {
        framebuffer.unbind();    
    }                
};

Renderer.prototype._render = function(mesh, lights)
{
    var gl = this.gl;            

    var material = mesh.getMaterial(); 
    var geometry = mesh.getGeometry();         

    geometry.setContext(gl); 
    material.setContext(gl, geometry, lights);                 

    if(this.currentMaterial === undefined)
    {
        this.currentMaterial = material;             
        this.currentMaterial.apply();      
    }
    else if(this.currentMaterial.getShader() !== material.getShader())                //Because its expensive to change shaders when not needed
    {                
        this.currentMaterial = material;             
        this.currentMaterial.apply();         
    }                        

    if(geometry.hasPositions)
    {            
        gl.enableVertexAttribArray(material.getAttribPointer('a_position'));      
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.getPositionBuffer());        
        gl.vertexAttribPointer(material.getAttribPointer('a_position'), geometry.getPositionBuffer().itemSize, gl.FLOAT, false, 0, 0);            
    }
    
    if(geometry.hasNormals)
    {
        gl.enableVertexAttribArray(material.getAttribPointer('a_normal'));         
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.getNormalBuffer());    
        gl.vertexAttribPointer(material.getAttribPointer('a_normal'), geometry.getNormalBuffer().itemSize, gl.FLOAT, false, 0, 0);        
    }
    
    if(geometry.hasTexcoords)
    {
        gl.enableVertexAttribArray(material.getAttribPointer('a_texcoord')); 
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.getTextureCoordBuffer());
        gl.vertexAttribPointer(material.getAttribPointer('a_texcoord'), geometry.getTextureCoordBuffer().itemSize, gl.FLOAT, false, 0, 0);    
    }

    if(geometry.hasColors)
    {
        gl.enableVertexAttribArray(material.getAttribPointer('a_color'));         
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.getColorBuffer());                
        gl.vertexAttribPointer(material.getAttribPointer('a_color'), geometry.getColorBuffer().itemSize, gl.FLOAT, false, 0, 0);        
    }

    var modelMatrix = mesh.getTransform(); 

    gl.uniformMatrix4fv(material.getUniformLocation('u_pMatrix'), false, this.pMatrix);                 
    gl.uniformMatrix4fv(material.getUniformLocation('u_mMatrix'), false, modelMatrix);
    gl.uniformMatrix4fv(material.getUniformLocation('u_vMatrix'), false, this.vMatrix);

    gl.uniform3fv(material.getUniformLocation('u_translate'), mesh.getPosition().toArray()); 
    gl.uniform3f(material.getUniformLocation('u_resolution'), this.width, this.height, this.height); 
    gl.uniform1f(material.getUniformLocation('u_aspect'), this.aspect); 
    gl.uniform1f(material.getUniformLocation('u_pointSize'), this.pointSize);     

    var texture = material.getTexture();            
    if(texture)
    {            
        texture.setContext(gl);         
        texture.bind(); 
        gl.uniform1i(material.getUniformLocation('u_texture'), texture.getID());                        
    }

    if(lights.length)
    {            
        Utils.normalFromFM(this.nMatrix, modelMatrix);
        gl.uniformMatrix3fv(material.getUniformLocation('u_nMatrix'), false, this.nMatrix);                             
        
        for(var i = 0; i < lights.length; i++)
        {
            var light = lights[i]; 
            var lightLocation = light.getPosition();                 
            var lightColor = light.getColor().toNormalizeColorArray(); 
            var lightAmbient = light.getAmbientColor().toNormalizeColorArray();                 

            gl.uniform3fv(material.getUniformLocation('u_pointLightingLocation'+i), lightLocation.toArray()); 
            gl.uniform4fv(material.getUniformLocation('u_ambientLightColor'+i), lightAmbient); 
            gl.uniform4fv(material.getUniformLocation('u_pointLightingColor'+i), lightColor); 

        }
    }
    var colorArray = material.getColor().toNormalizeColorArray();                 
    gl.uniform4fv(material.getUniformLocation('u_color'), colorArray);
    gl.uniform1f(material.getUniformLocation('u_opacity'), mesh.getOpacity());
    
    material.applyCustomUniforms(); 

    gl.drawArrays(geometry.getDrawMode(), 0, geometry.getPositionBuffer().numItems);         

    if(texture)
    {
        texture.unbind(); 
    }
}; 

Renderer.prototype.setLineWidth = function(w)
{
    this.lineWidth = w; 
    this.gl.lineWidth(this.lineWidth); 
};

Renderer.prototype.setPointSize = function(s)
{
    this.pointSize = s;         
};

Renderer.prototype.setViewMatrix = function(v)
{
    this.vMatrix = v; 
};

Renderer.prototype.setProjectionMatrix = function(p)
{
    this.pMatrix = p; 
};

Renderer.prototype.setViewPort = function(x, y, w, h)
{        
    this.viewport[0] = x; 
    this.viewport[1] = y; 
    this.viewport[2] = w; 
    this.viewport[3] = h; 
    this.applyViewPort(); 
}; 

Renderer.prototype.applyViewPort = function()
{
    var v = this.viewport; 
    this.gl.viewport(v[0], v[1], v[2], v[3]);  
}; 

Renderer.prototype.getBackgroundColor = function()
{
    return this.bgColor; 
}; 

Renderer.prototype.setBackgroundColor = function(r, g, b, a)
{
    if(r instanceof Array)
    {
        if(r.length > 2)
        {
            this.bgColor = r;                          
        }
        else
        {
            this.bgColor[0] = r[0]; 
            this.bgColor[1] = r[0]; 
            this.bgColor[2] = r[0]; 
            this.bgColor[3] = r[1]; 
        }
    }
    else if(b === undefined)
    {
        this.bgColor[0] = r; 
        this.bgColor[1] = r; 
        this.bgColor[2] = r; 
        this.bgColor[3] = g; 
    }
    else if(a === undefined)            
    {
        this.bgColor[0] = r; 
        this.bgColor[1] = g; 
        this.bgColor[2] = b; 
        this.bgColor[3] = 1.0;             
    }        
    else
    {
        this.bgColor[0] = r; 
        this.bgColor[1] = g; 
        this.bgColor[2] = b; 
        this.bgColor[3] = a;             
    }
    this.clearBackground(); 
};

Renderer.prototype.setClearBackground = function(clear)
{
    this.clear = clear;
}; 

Renderer.prototype.clearBackground = function()
{
    var gl = this.gl; 
    var bg = this.bgColor; 
    gl.clearColor(bg[0], bg[1], bg[2], bg[3]); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);        
}; 

Renderer.prototype.setSize = function(size)
{        
    this.width = size[0]; 
    this.height = size[1]; 
    if(this.aspectLock === false)
    {
        this.aspect = this.width / this.height; 
    }    
    this.setViewPort(0, 0, this.width, this.height); 
};

Renderer.prototype.disableBlending = function()
{
    this.blendMode = Renderer.DISABLE; 
    var gl = this.gl;         
    gl.disable(gl.BLEND); 
};

Renderer.prototype.enableAlphaBlending = function()
{
    this.blendMode = Renderer.ALPHA; 
    var gl = this.gl;         
    gl.enable(gl.BLEND); 
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);                
};

Renderer.prototype.enableAdditiveBlending = function()
{
    this.blendMode = Renderer.ADDITIVE; 
    var gl = this.gl;         
    gl.enable(gl.BLEND); 
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);                     
};

Renderer.prototype.enableSubtractBlending = function()
{
    this.blendMode = Renderer.SUBTRACT; 
    var gl = this.gl;         
    gl.enable(gl.BLEND); 
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); 
};

Renderer.prototype.enableMultiplyBlending = function()
{
    this.blendMode = Renderer.MULTIPLY; 
    var gl = this.gl;         
    gl.enable(gl.BLEND); 
    gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA); 
};

Renderer.prototype.enableScreenBlending = function()
{
    this.blendMode = Renderer.SCREEN; 
    var gl = this.gl;         
    gl.enable(gl.BLEND); 
    gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ONE); 
};

Renderer.prototype.setBlendMode = function(mode)
{        
    switch(mode)
    {
        case Renderer.DISABLE: 
            this.disableBlending(); 
        break; 

        case Renderer.ALPHA: 
            this.enableAlphaBlending(); 
        break;

        case Renderer.ADDITIVE: 
            this.enableAdditiveBlending(); 
        break;

        case Renderer.SUBTRACT: 
            this.enableSubtractBlending(); 
        break; 

        case Renderer.MULTIPLY: 
            this.enableMultiplyBlending(); 
        break; 

        case Renderer.SCREEN: 
            this.enableScreenBlending(); 
        break; 
    }
};

Renderer.prototype.setDepthTesting = function(v)
{
    this.depthTesting = v;              
};

Renderer.prototype.setSmoothing = function(s)
{        
    //Not Sure if these functions work in webgl 
    var gl = this.gl;
    if(s === true)
    {
        gl.enable(gl.POINT_SMOOTH);
        gl.hint(gl.POINT_SMOOTH_HINT, gl.NICEST);    
        gl.hint(gl.LINE_SMOOTH_HINT, gl.NICEST);    
    }
    else
    {
        gl.disable(gl.POINT_SMOOTH);
        gl.hint(gl.POINT_SMOOTH_HINT, gl.FASTEST);   
        gl.hint(gl.LINE_SMOOTH_HINT, gl.FASTEST);    
    }
};

Renderer.prototype.setPerspective = function(fov, nearPlane, farPlane)
{
    var gl = this.gl; 
    this.fov = fov ? fov : this.fov; 
    this.nearPlane = nearPlane ? nearPlane : this.nearPlane; 
    this.farPlane = farPlane ? farPlane : this.farPlane; 
    this.setProjectionMatrix(Utils.perspective(Utils.deg2rad(this.fov), (gl.viewportWidth/gl.viewportHeight), this.nearPlane, this.farPlane));                                      
    this.ortho = false;         
};

Renderer.prototype.setOrthographic = function(size, left, right, bottom, top, near, far)
{                            
    var s = (typeof size !== 'undefined')   ? size      : 0.25; 
    var l = (typeof left !== 'undefined')   ? left      : -s*this.aspect; 
    var r = (typeof right !== 'undefined')  ? right     : s*this.aspect; 
    var b = (typeof bottom !== 'undefined') ? bottom    : -s; 
    var t = (typeof top !== 'undefined')    ? top       : s;
    var n = (typeof near !== 'undefined')   ? near      : -s; 
    var f = (typeof far !== 'undefined')    ? far       : s;  
    this.setProjectionMatrix(Utils.ortho(l, r, b, t, n, f));    
    this.ortho = true; 
}; 

Renderer.prototype.setAspectRatio = function(aspect)
{
    this.aspect = aspect; 
};

Renderer.prototype.lockAspectRatio = function(value)
{
    this.aspectLock = value; 
};


Renderer.DISABLE  = 0;
Renderer.ALPHA    = 1;
Renderer.ADDITIVE = 2;
Renderer.SUBTRACT = 3;
Renderer.MULTIPLY = 4;
Renderer.SCREEN   = 5;

module.exports = Renderer;
