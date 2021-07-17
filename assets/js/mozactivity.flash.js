////////////////////
////UTILITY////////////
///////////////////
const flashlight = (() => {
    function setupCamera(next) {
        if (!navigator.mozCameras) {
          return next('No camera');
        }
    
        function found(camera) {
          if (count <= 0) {
            return;
          }
          count--;
          if (camera) {
            var flashModes = camera.capabilities.flashModes;
            console.log('flashModes: ' + flashModes);
            if (flashModes && flashModes.indexOf('torch') >= 0) {
              count = -1;
              next(null, camera);
            }
          }
          if (!count) {
            next('No flash');
          }
        }
    
        function getCameraPromise(id) {
          var promise = navigator.mozCameras.getCamera({
            camera: cameras[i]
          }, {mode: 'unspecified'}).then(function(result) {
            found(result.camera);
          });
        }
    
        function getCameraCallback(id) {
          navigator.mozCameras.getCamera({
            camera: id
          }, null, found, function(err) {
            throw new Error(err);
          });
        }
    
        var oldStyle = navigator.mozCameras.getCamera.length == 3;
        console.log('oldStyle', oldStyle);
        var getCamera = oldStyle ? getCameraCallback : getCameraPromise;
    
        var cameras = navigator.mozCameras.getListOfCameras();
        var count = cameras.length;
        console.log('getListOfCameras: ' + count);
        for (var i = 0; i < count; i++) {
          console.log('getCamera:', cameras[i]);
          getCamera(cameras[i]);
        }
        if (!count) {
          next('No camera');
        }
      }
    
      var torching = false;
      var currentCamera = null;
    
      function trigger(to, release) {
        torching = (to != null) ? to : (!torching);
    
    
        if (currentCamera) {
          currentCamera.flashMode = (torching) ? 'torch' : 'auto';
          console.log('Set flashMode:', currentCamera.flashMode);
          return;
        }
    
        console.log('Calling setupCamera');
        setupCamera(function(err, camera) {
          if (!camera) {
            console.warn(err);
            document.body.classList.add('unsupported');
            return;
          }
          document.body.classList.add('supported');
          currentCamera = camera;
          console.log('Setting flashMode');
          camera.flashMode = (torching) ? 'torch' : 'auto';
        });
      }
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          trigger(false);
          if (currentCamera) {
            currentCamera.release(function() {
              console.log('Camera released');
            });
            currentCamera = null;
          }
        }
      }, false);
  
    return {
     trigger
    };
  })();
  
