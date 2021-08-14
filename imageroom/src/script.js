var camera, scene, renderer, renderer2, windowHalfX, windowHalfY;
var mouseX = 0, mouseY = 0;
var controls;
var sphere;
var light;
var lookAt = new THREE.Vector3(0, 0, 0);
var lightMovementAmplitude = 200

init();
animate(performance.now());

function init() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera = new THREE.PerspectiveCamera(
        45, window.innerWidth / window.innerHeight, 1, 2000
    );
    camera.position.set( 0, 0, 500 );

    scene = new THREE.Scene();

    for ( var i = 0; i < 50; i ++ ) {

        var elementObj = makeElementObject( 'div', 100, 100 );
        elementObj.css3dObject.element.textContent = "I am a <div> element! Edit me!"
        elementObj.css3dObject.element.setAttribute('contenteditable', '')

        elementObj.position.x = Math.random() * 600 - 300;
        elementObj.position.y = Math.random() * 600 - 300;
        elementObj.position.z = Math.random() * 800 - 600;
        elementObj.rotation.x = Math.random();
        elementObj.rotation.y = Math.random();
        elementObj.rotation.z = Math.random();
        scene.add( elementObj );
    }

    // make a geometry to see if we can clip it with the DOM elememt.
    ~function() {
        var material = new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x000000,
            specular: 0x111111,
            //side: THREE.DoubleSide,
            flatShading: false,
            shininess: 30,
        })
        var geometry = new THREE.SphereGeometry( 70, 32, 32 );
        sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 50;
        sphere.castShadow = true;
        sphere.receiveShadow = false;
        scene.add( sphere );
    }()

    // light
    ~function() {
        var ambientLight = new THREE.AmbientLight( 0x999999 );
        scene.add( ambientLight );

        light = new THREE.PointLight( 0xffffff, 1, 0 );
        light.castShadow = true;
        light.position.z = 150;
        light.shadow.mapSize.width = 512;  // default
        light.shadow.mapSize.height = 512; // default
        light.shadow.camera.near = 1;       // default
        light.shadow.camera.far = 10000;      // default
        light.shadow.bias = 0 // default
      
        scene.add( new THREE.PointLightHelper( light, 5 ) )

        scene.add( light );
    }()

    renderer2 = new THREE.CSS3DRenderer();
    renderer2.setSize( window.innerWidth, window.innerHeight );
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    document.querySelector('#css').appendChild( renderer2.domElement );

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor( 0x000000, 0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.querySelector('#webgl').appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function animate(time) {

    sphere.position.x += ( mouseX - sphere.position.x ) * .02;
    sphere.position.y += ( -mouseY - sphere.position.y ) * 0.02;
    
    light.position.x = 30 * Math.sin(time * 0.003);
    light.position.y = 30 * Math.cos(time * 0.002);

    scene.updateMatrixWorld()

    lookAt.setFromMatrixPosition(sphere.matrixWorld)
    camera.lookAt(lookAt);

    renderer.render( scene, camera );
    renderer2.render( scene, camera );

    requestAnimationFrame( animate );
}

function makeElementObject(type, width, height) {
    const obj = new THREE.Object3D
    const color = new THREE.Color(
        Math.random() * 0.21568627451 + 0.462745098039,
        Math.random() * 0.21568627451 + 0.462745098039,
        Math.random() * 0.21568627451 + 0.462745098039,
    )

    const element = document.createElement( type );
    element.style.width = width+'px';
    element.style.height = height+'px';
    element.style.opacity = 0.999;
    element.style.background = color.getStyle();


    var css3dObject = new THREE.CSS3DObject( element );
    obj.css3dObject = css3dObject
    obj.add(css3dObject)

    // make an invisible plane for the DOM element to chop
    // clip a WebGL geometry with it.
    var material = new THREE.MeshPhongMaterial({
        opacity	: 0.15,
        color	: new THREE.Color( /*color*/ 0x111111 ),
        blending: THREE.NoBlending,
        side	: THREE.DoubleSide,
    });
    var geometry = new THREE.BoxGeometry( width, height, 1 );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    obj.lightShadowMesh = mesh
    obj.add( mesh );

    return obj
}