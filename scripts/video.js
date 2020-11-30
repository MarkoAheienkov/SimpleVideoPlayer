const toTimeString = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds/60);
  let seconds = Math.floor(totalSeconds%60);
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

const createVideoElement = ({
  src = '',
  muted = false,
  replay = false,
} = {}) => {
  const template = `
    <video ${muted ? 'muted' : ''} ${replay ? 'loop' : ''} class="video" src="${src}"></video>
    <div class="controls">
        <button data-icon='play' class="controls__play"><i class="fas fa-play"></i></button>
        <button class="controls__stop"><i class="fas fa-stop"></i></button>
        <div class="controls__range-time-container">
          <div class="controls__range-time">
          <div class="helper">00:00</div>
            <div class="controls__range-time__current"></div>
            <div class="controls__range-time__pointer"></div>
          </div>
        </div>
        <div class="controls__timer">
          <span class="controls__timer__current">0:02</span>
          /
          <span class="controls__timer__duration">0:08</span>
        </div>
        <button data-mute="false" class="controls__volume"><i class="fas fa-volume-up"></i></button>
        <div class="controls__range-volume-container">
          <div class="controls__range-volume">
            <div class="controls__range-volume__current"></div>
          </div>
        </div>
    </div>
  `;
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');
  videoContainer.innerHTML = template;

  const video = videoContainer.querySelector('video');
  const playButton = videoContainer.querySelector('.controls__play');
  const stopButton = videoContainer.querySelector('.controls__stop');
  const timerCurrent = videoContainer.querySelector('.controls__timer__current');
  const timerDuration = videoContainer.querySelector('.controls__timer__duration');
  const rangeTimeContainer = videoContainer.querySelector('.controls__range-time-container');
  const rangeTimeCurrent = videoContainer.querySelector('.controls__range-time__current');
  const rangeTimePointer = videoContainer.querySelector('.controls__range-time__pointer');
  const helper = videoContainer.querySelector('.helper');
  const volumeButton = videoContainer.querySelector('.controls__volume');
  const rangeVolume = videoContainer.querySelector('.controls__range-volume-container');
  const rangeVolumeCurrent = videoContainer.querySelector('.controls__range-volume__current');

  const changeVolumeButton = (current) => {
    if (current > 0.5) {
      volumeButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else if (current <=0.5 && current > 0) {
      volumeButton.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
      volumeButton.innerHTML = '<i class="fas fa-volume-off"></i>';
    }
  }

  const playMovie = () => {
    video.play();
    playButton.dataset.icon = 'pause';
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
  };

  const pauseMovie = () => {
    video.pause();
    playButton.dataset.icon = 'play';
    playButton.innerHTML = '<i class="fas fa-play"></i>';
  }

  const reset = () => {
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.dataset.icon = 'play';
    if (isNaN(video.duration)) {
      timerDuration.innerHTML = '00:00';
    } else {
      timerDuration.innerHTML = toTimeString(video.duration);
    }
    timerCurrent.innerHTML = '00:00'; 
    rangeTimeCurrent.style.width = '0px';
    rangeTimePointer.style.left = '0px';
    if (video.muted) {
      volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    video.pause();
  };

  const playPauseMovie = () => {
    const data = playButton.dataset;
    if (data.icon === 'play') {
      playMovie();
    } else if (data.icon === 'pause') {
      pauseMovie();
    }
  };

  const stopMovie = () => {
    video.currentTime = 0;
    reset();
  };
  
  const videoContainerPressing = (event) => {
    if (event.keyCode === 32) { 
      playPauseMovie();
    }
  };

  const timeRangeClick = (event) => {
    const rangeRect = rangeTimeContainer.getBoundingClientRect();
    const clientX = event.clientX;
    const xCoord = clientX - rangeRect.x;
    const percent = xCoord/rangeRect.width;
    const currentTime = percent*video.duration;
    video.currentTime = currentTime;
  };

  const timeRangeMouseMove = (event) => {
    const rangeRect = rangeTimeContainer.getBoundingClientRect();
    const helperWidth = helper.getBoundingClientRect().width;
    const clientX = event.clientX;
    const xCoord = clientX - rangeRect.x;
    helper.style.left = `${xCoord-helperWidth/2}px`;
    const percent = xCoord/rangeRect.width;
    const currentTime = percent*video.duration;
    helper.innerHTML = toTimeString(currentTime);
  };

  const volumeMute = () => {
    if (!video.muted) {
      volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
      video.muted = true;
    } else {
      changeVolumeButton(video.volume);
      video.muted = false;
    }
  } 

  const volumeRangeClick = (event) => {
    const rangeRect = rangeVolume.getBoundingClientRect();
    const clientX = event.clientX;
    const coordX = clientX - rangeRect.x;
    const current = coordX/rangeRect.width;
    video.volume = current;
    rangeVolumeCurrent.style.width = `${current*100}%`;
    if (!muted) {
      changeVolumeButton(current);
    }
  };

  const volumeRangeScrolling = (event) => {
    const rangeRect = rangeVolume.getBoundingClientRect();
    const rangeCurrentRect = rangeVolumeCurrent.getBoundingClientRect();
    const step = 1;
    let current = 100*rangeCurrentRect.width/rangeRect.width;
    if (event.deltaY > 0 && current > 0) {
      current -= step;
    } else if (event.deltaY < 0 && current < 100){
      current += step;
    }
    if (current > 100) {
      current = 100;
    } else if (current < 0) {
      current = 0;
    }
    if (!muted) {
      changeVolumeButton(current);
    }
    video.volume = current/100;
    rangeVolumeCurrent.style.width = `${current}%`;
  };

  const timeRangeMouseover = (event) => {
    helper.style.display = 'flex';
    rangeTimeContainer.addEventListener('mousemove', timeRangeMouseMove);
  };

  const timeRangeMouseleave = (event) => {
    helper.style.display = 'none';
    rangeTimeContainer.removeEventListener('mousemove', timeRangeMouseMove);
  };

  const timeRangeUpdate = (event) => {
    timerCurrent.innerHTML = toTimeString(video.currentTime);
    timerDuration.innerHTML = toTimeString(video.duration);
    const percent = (100*video.currentTime)/video.duration;
    rangeTimeCurrent.style.width = `${percent}%`;
    if (Math.floor(percent) === 0 ) {
      rangeTimePointer.style.left = `${percent}%`;
    } else {
      rangeTimePointer.style.left = `${percent-1}%`;
    }
  };

  reset();

  playButton.addEventListener('click', playPauseMovie);
  stopButton.addEventListener('click', stopMovie);
  video.addEventListener('timeupdate', timeRangeUpdate);
  video.addEventListener('click', playPauseMovie);
  rangeTimeContainer.addEventListener('mouseover', timeRangeMouseover);
  rangeTimeContainer.addEventListener('mouseleave', timeRangeMouseleave);
  rangeTimeContainer.addEventListener('click', timeRangeClick);
  videoContainer.addEventListener('keypress', videoContainerPressing);
  videoContainer.addEventListener('wheel', volumeRangeScrolling);
  rangeVolume.addEventListener('click', volumeRangeClick);
  volumeButton.addEventListener('click', volumeMute);

  return videoContainer;
};
