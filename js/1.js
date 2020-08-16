const containerId = 'WebGL-output'; // 页面挂在threejs的元素ID
const containerEl = document.getElementById(containerId);
const containerW = containerEl.clientWidth; // 获取挂载容器的可用尺寸
const containerH = containerEl.clientHeight;

let renderer = null;
let scene = null;
let camera = null;
let controls = null;
let clickObjects = []; // 哪些元素要被点击捕获

// create a cube
function getCube(x, y, z, name) {
  let cubeGeometry = new THREE.BoxGeometry(x, y, z);
  let cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true // 显示边线
  });
  let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.name = name;
  cube.position.x = 0;
  cube.position.y = 0;
  cube.position.z = 0;
  return cube;
}

// create a sphere
function getSphere(name) {
  let sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x7777ff,
    wireframe: true
  });
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.name = type;
  sphere.position.x = 10;
  sphere.position.y = 0;
  sphere.position.z = 0;
  return sphere;
}
// 创建一个有纹理的cube
function getCubeWithImg(x, y, z, name) {
  let geometry = new THREE.BoxGeometry(x, y, z);

  let textureLoader = new THREE.TextureLoader();
  let cube = new THREE.Mesh(
    geometry,
    [
      // 右面材质
      new THREE.MeshBasicMaterial({
        color: 0xff0000
      }),
      // 左面材质
      new THREE.MeshBasicMaterial({
        color: 0x00ffff
      }),
      // 上面材质
      new THREE.MeshBasicMaterial({
        color: 0x00ff00
      }),
      // 下面材质
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      }),
      // 前面材质
      new THREE.MeshBasicMaterial({
        map: textureLoader.load('img/arrow.png', function () {
          render();
        })
      }),
      // 后面材质
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      }),
    ]
  );
  cube.name = name;
  return cube;
}
// get a plane
function getPlane(w, h, name) {
  let planeGeometry = new THREE.PlaneGeometry(w, h);
  let planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc
  });
  let plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.name = name;
  plane.rotation.x = 0 * Math.PI;
  // plane.rotation.y = 0.2 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;
  return plane;
}

function init() {
  // create a scene, that will hold all our elements such as objects, cameras and lights.
  scene = new THREE.Scene();
  // create a camera, which defines where we're looking at.
  camera = new THREE.PerspectiveCamera(45, containerW / containerH, 0.1, 1000);
  // create a render and set the size
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0xEEEEEE));
  renderer.setSize(containerW, containerH);

  let point = new THREE.PointLight(0xffffff);
  point.position.set(0, 0, 300); //点光源位置
  scene.add(point); //点光源添加到场景中

  // 添加一个坐标轴辅助观测
  let axes = new THREE.AxesHelper(50);
  scene.add(axes);

  let textureLoader = new THREE.TextureLoader();
  // 执行load方法，加载纹理贴图成功后，返回一个纹理对象Texture
  textureLoader.load('img/rgb.png', function (texture) {
    let plane = getPlane(25, 7, 'plane0');

    plane.material.map = texture;

    // 必须在改变纹理后添加子节点，不然显示不出来
    let cube = getCube(3, 3, 3, 'cube');
    // let sphere = getSphere();
    plane.add(cube);
    // plane.add(sphere);
    let cubeWithImg = getCubeWithImg(5, 3, 3, 'imageCube');
    cubeWithImg.position.x = 7;
    plane.add(cubeWithImg);
    scene.add(plane);

    //纹理贴图加载成功后，调用渲染函数执行渲染操作
    render();
  })

  // position and point the camera to the center of the scene
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 50;
  camera.lookAt(scene.position);

  // add the output of the renderer to the html element
  containerEl.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement); //创建控件对象，依赖于 OribitControls.js
  controls.addEventListener('change', render); //监听鼠标、键盘事件

  initThreeClickEvent();
}

function addPlane() {
  let plane = scene.getObjectByName('plane0');
  let plane1 = plane.clone();
  plane1.rotation.z = 0.5 * Math.PI;
  plane1.rotation.x = 0.2 * Math.PI; // 为了观测旋转方向
  plane1.position.y = 10;
  scene.add(plane1);
  render();
}
// 渲染threejs场景
function render() {
  // 总结一下，这里必须装网格，mesh，装入组是没有效果的
  // 所以我们将所有的盒子的网格放入对象就可以了
  // 需要被监听的对象要存储在clickObjects中。
  clickObjects = [];
  scene.traverse((obj) => {
    if (obj.type === 'Mesh') {
      clickObjects.push(obj);
    }
  })
  renderer.render(scene, camera); //执行渲染操作
}

// 处理点击事件
function initThreeClickEvent() {
  //点击射线
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  containerEl.addEventListener('click', onDocumentMouseClick, false);

  function onDocumentMouseClick(e) {
    e.preventDefault();
    let renderDom = renderer.domElement;
    let rect = renderDom.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / renderDom.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / renderDom.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(clickObjects);
    // console.log(intersects, clickObjects);
    if (intersects.length > 0) { // 被射线穿过的元素
      // 在这里填写点击代码
      console.log("click ", intersects[0].object.name, intersects[0].object);
    }
  }
}

function dispose(parent, child) {
  if (child.children.length) {
    let arr = child.children.filter(x => x);
    arr.forEach(a => {
      dispose(child, a)
    })
  }
  child.traverse(item => {
    if (item instanceof THREE.Mesh) {
      // console.log(item, item.material)
      if (Array.isArray(item.material)) {
        item.material.forEach(item1 => {
          item1.dispose();
        });
      } else {
        item.material.dispose();
      }
      item.geometry.dispose();
    }
    item.remove();
  })
  parent.remove(child);
}

function disposeAll() {
  scene.traverse(item => {
    dispose(scene, item);
  });
  renderer.render(scene, camera);
}

function clearRenderer() {
  scene.remove();
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.context = null;
  renderer.domElement = null;
  renderer = null;
}

// 触发函数
window.onload = init();