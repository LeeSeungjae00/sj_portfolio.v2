(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수
  let prevScrollHeight = 0; // 현재 스크롤 위치보다 이전에 위치한 스크롤 섹션들의 스크롤 높이 값의 합
  let currentScene = 0; // 현재 씬
  let enterNewScene = false; // 새로운 scene 이 시작된 순간 true
  let acc = 0.1;
  let delayedYOffset = 0;
  let rafId;
  let rafState;
  const GRASS_COUNT = 5;

  const sceneInfo = [
    {
      // 0
      type: 'sticky',
      heightNum: 10, // 브라우저 높이의 5배로 scrollHeight 세팅
      scrollHeight: 0,
      objs: {

        container: document.querySelector('#scroll-section-0'),
        mainText: document.querySelector('#scroll-section-0 .title-message h1'),
        scrollText: document.querySelector('#scroll-section-0 .scroll-message'),
        checking_bg: document.querySelector('#scroll-section-0 .checking-bg'),
      },
      values: {
        scrollText_opacity_out: [1, 0, { start: 0, end: 0.1 }],
        mainText_opacity_out: [1, 0, { start: 0.1, end: 0.3 }],
        mainText_scale: [1, 0.5, { start: 0.1, end: 0.35 }],
        checking_bg_in: [100, 0, { start: 0.2, end: 0.35 }],
        checking_bg_out: [0, 100, { start: 0.38, end: 0.54 }],

      }
    }
  ];
  //scene 의 정보를 갖고 있음

  function setCanvasImages() {
    let imgElem;
    for (let i = 0; i < sceneInfo[0].values.videoImageeCount; i++) {
      imgElem = new Image();
      imgElem.src = `./image/grass.png`;
      sceneInfo[0].objs.grassImage.push(imgElem);
    }
  }

  function checkMenu() {
    if (yOffset > 44) {
      document.body.classList.add('local-nav-sticky')
    } else {
      document.body.classList.remove('local-nav-sticky')
    }
  }

  function setLayout() {
    // 각 스크롤 섹션의 높이 세팅
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === 'sticky') {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
        sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
      } else if (sceneInfo[i].type === 'normal') {
        sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight
      }
      sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
    }

    setGrass()

    yOffset = window.pageYOffset;
    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }
    document.body.setAttribute('id', `show-scene-${currentScene}`)

  }

  function setGrass() {
    //화면에 따른 풀숲 크기 지정
    // for (let i = 0; i < GRASS_COUNT; i++) {
    //   const h = 46 + Math.floor(Math.random() * 10)
    //   const w = h * 1.8
    //   sceneInfo[0].objs[`rightGrass_${i}`].style.height = `${h}vh`
    //   sceneInfo[0].objs[`rightGrass_${i}`].style.width = `${w}vh`
    //   sceneInfo[0].values[`rightGrass_${i}_in`][0] = `-${w}vh`
    // }
    //화면에 따른 풀숲 이동 조정
  }

  function calcValues(values, currentYOffset) {
    let rv;
    const { scrollHeight } = sceneInfo[currentScene]
    const scrollRatio = currentYOffset / scrollHeight;

    if (values[2]) {
      // start ~ end 사이에 애니메이션 실행
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;

      const partScrollHeight = partScrollEnd - partScrollStart
      if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
        rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0]
      } else if (currentYOffset < partScrollStart) {
        rv = values[0]
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1]
      }

    } else {
      rv = (values[1] - values[0]) * scrollRatio + values[0];
    }

    return rv
  }

  function playAnimation() {
    const objs = sceneInfo[currentScene].objs;
    const values = sceneInfo[currentScene].values;
    const currentYOffset = yOffset - prevScrollHeight;
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    switch (currentScene) {
      case 0:

        // let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
        // objs.context.drawImage(objs.videoImages[sequence], 0, 0)
        objs.scrollText.style.opacity = calcValues(values.scrollText_opacity_out, currentYOffset)
        objs.mainText.style.opacity = calcValues(values.mainText_opacity_out, currentYOffset)
        objs.mainText.style.transform = `scale(${calcValues(values.mainText_scale, currentYOffset)})`;

        if (scrollRatio <= 0.35) {
          objs.checking_bg.style.width = `${calcValues(values.checking_bg_in, currentYOffset)}vw`
        } else {
          objs.checking_bg.style.width = `${calcValues(values.checking_bg_out, currentYOffset)}vw`
        }

        break;

      case 2:

        // let sequence2 = Math.round(calcValues(values.imageSequence, currentYOffset));
        // objs.context.drawImage(objs.videoImages[sequence2], 0, 0)

        if (scrollRatio <= 0.5) {
          objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset)
        } else {
          objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset)
        }

        if (scrollRatio <= 0.25) {
          // in
          objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
          objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
          objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.57) {
          // in
          objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
          objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
          objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
        } else {
          // out
          objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
          objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
          objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
        }

        if (scrollRatio <= 0.83) {
          // in
          objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
          objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
          objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
        } else {
          // out
          objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
          objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
          objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
        }

        //currentScene 3에서 쓰는 캔버스를 미리 그려주기
        if (scrollRatio > 0.9) {
          const objs = sceneInfo[3].objs;
          const values = sceneInfo[3].values;
          const widthRatio = window.innerWidth / objs.canvas.width;
          const heightRatio = window.innerHeight / objs.canvas.height;
          let canvasScaleRatio

          if (widthRatio <= heightRatio) {
            //캔버스보다 브라우저 창이 홀쭉한 경우
            canvasScaleRatio = heightRatio
          } else {
            //캔버스보다 브라우저 창이 납작한 경우
            canvasScaleRatio = widthRatio
          }

          objs.canvas.style.transform = `scale(${canvasScaleRatio})`
          objs.context.fillStyle = 'white'
          objs.context.drawImage(objs.images[0], 0, 0)


          //캔버스 사이즈에 맞춰 가정한 innerWidth 와 innerHeight
          const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
          const recalculatedInnerHeight = document.body.offsetWidth / canvasScaleRatio


          const whiteRectWidth = recalculatedInnerWidth * 0.15;
          values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
          values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
          values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
          values.rect2X[1] = values.rect2X[0] + whiteRectWidth;


          objs.context.fillRect(values.rect1X[0], 0, parseInt(whiteRectWidth), recalculatedInnerHeight);
          objs.context.fillRect(values.rect2X[0], 0, parseInt(whiteRectWidth), recalculatedInnerHeight);

        }

        break;
      case 3:
        // console.log('3 play');
        //가로 세로 모두 꽉 차게 하기 위해 여기서 세팅(계산 필요)
        const widthRatio = window.innerWidth / objs.canvas.width;
        const heightRatio = window.innerHeight / objs.canvas.height;
        let step = 1
        let canvasScaleRatio

        if (widthRatio <= heightRatio) {
          //캔버스보다 브라우저 창이 홀쭉한 경우
          canvasScaleRatio = heightRatio
        } else {
          //캔버스보다 브라우저 창이 납작한 경우
          canvasScaleRatio = widthRatio
        }

        objs.canvas.style.transform = `scale(${canvasScaleRatio})`
        objs.context.fillStyle = 'white'
        objs.context.drawImage(objs.images[0], 0, 0)


        //캔버스 사이즈에 맞춰 가정한 innerWidth 와 innerHeight
        const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
        const recalculatedInnerHeight = document.body.offsetWidth / canvasScaleRatio

        //getBoundingClientRect() 현재 크기와 좌표값을 알 수 있음
        if (!values.rectStartY) {
          // values.rectStartY = objs.canvas.getBoundingClientRect().top
          values.rectStartY = objs.canvas.offsetTop + (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
          values.rect1X[2].start = (window.innerHeight / 2) / scrollHeight
          values.rect2X[2].start = (window.innerHeight / 2) / scrollHeight
          values.rect1X[2].end = values.rectStartY / scrollHeight
          values.rect2X[2].end = values.rectStartY / scrollHeight
        }

        const whiteRectWidth = recalculatedInnerWidth * 0.15;
        values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
        values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
        values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;


        // objs.context.fillRect(values.rect1X[0], 0, parseInt(whiteRectWidth), recalculatedInnerHeight);
        // objs.context.fillRect(values.rect2X[0], 0, parseInt(whiteRectWidth), recalculatedInnerHeight);

        objs.context.fillRect(parseInt(calcValues(values.rect1X, currentYOffset)), 0, parseInt(whiteRectWidth), recalculatedInnerHeight);
        objs.context.fillRect(parseInt(calcValues(values.rect2X, currentYOffset)), 0, parseInt(whiteRectWidth), recalculatedInnerHeight);

        if (scrollRatio < values.rect1X[2].end) {
          step = 1
          objs.canvas.classList.remove('sticky')
        } else {
          step = 2

          values.blendHeight[0] = 0;
          values.blendHeight[1] = objs.canvas.height;
          values.blendHeight[2].start = values.rect1X[2].end
          values.blendHeight[2].end = values.blendHeight[2].start + 0.2
          const blendHeight = calcValues(values.blendHeight, currentYOffset)

          objs.context.drawImage(
            objs.images[1],
            0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight,
            0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight)

          objs.canvas.classList.add('sticky')
          objs.canvas.style.top = `-${(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`

          if (scrollRatio > values.blendHeight[2].end) {
            values.canvas_scale[0] = canvasScaleRatio;
            values.canvas_scale[1] = document.body.offsetWidth / (1.5 * objs.canvas.width)

            values.canvas_scale[2].start = values.blendHeight[2].end
            values.canvas_scale[2].end = values.blendHeight[2].end + 0.2

            objs.canvas.style.transform = `scale(${calcValues(values.canvas_scale, currentYOffset)})`
            objs.canvas.style.marginTop = 0
          }


          if (scrollRatio > values.canvas_scale[2].end
            && values.canvas_scale[2].end > 0) {
            objs.canvas.classList.remove('sticky')
            objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`

            values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
            values.canvasCaption_opacity[2].end = values.canvasCaption_opacity[2].start + 0.1;
            values.canvasCaption_translateY[2].start = values.canvas_scale[2].end;
            values.canvasCaption_translateY[2].end = values.canvasCaption_opacity[2].start + 0.1;

            objs.canvasCaption.style.opacity = calcValues(values.canvasCaption_opacity, currentYOffset)
            objs.canvasCaption.style.transform = `translate3d(0,${calcValues(values.canvasCaption_translateY, currentYOffset)}%,0)`
          } else {
            objs.canvasCaption.style.opacity = values.canvasCaption_opacity[0];
          }
        }

        break;
    }
  }

  function scrollLoop() {
    enterNewScene = false;
    prevScrollHeight = 0;

    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }

    if (delayedYOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      document.body.classList.remove('scroll-effect-end');
    }

    if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      enterNewScene = true;
      if (currentScene === sceneInfo.length - 1) {
        document.body.classList.add('scroll-effect-end');
      }
      if (currentScene < sceneInfo.length - 1) {
        currentScene++;
      }
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (delayedYOffset < prevScrollHeight) {
      enterNewScene = true;
      // 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일)
      if (currentScene === 0) return;
      currentScene--;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (enterNewScene) return;

    playAnimation();
  }



  // function loop() {
  //   delayedYOffset += (yOffset - delayedYOffset) * acc

  //   if (!enterNewScene) {
  //     if (currentScene === 0 || currentScene === 2) {
  //       const currentYOffset = delayedYOffset - prevScrollHeight
  //       const objs = sceneInfo[currentScene].objs;
  //       const values = sceneInfo[currentScene].values;
  //       let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
  //       if (objs.videoImages[sequence])
  //         objs.context.drawImage(objs.videoImages[sequence], 0, 0)
  //     }
  //   }

  //   // 일부 기기에서 페이지 끝으로 고속 이동하면 body id가 제대로 인식 안되는 경우를 해결
  //   // 페이지 맨 위로 갈 경우: scrollLoop와 첫 scene의 기본 캔버스 그리기 수행
  //   if (delayedYOffset < 1) {
  //     scrollLoop();
  //     sceneInfo[0].objs.canvas.style.opacity = 1;
  //     sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);
  //   }
  //   // 페이지 맨 아래로 갈 경우: 마지막 섹션은 스크롤 계산으로 위치 및 크기를 결정해야할 요소들이 많아서 1픽셀을 움직여주는 것으로 해결
  //   if ((document.body.offsetHeight - window.innerHeight) - delayedYOffset < 1) {
  //     let tempYOffset = yOffset;
  //     scrollTo(0, tempYOffset - 1);
  //   }


  //   rafId = requestAnimationFrame(loop)

  //   if (Math.abs(yOffset - delayedYOffset) < 1) {
  //     cancelAnimationFrame(rafId)
  //     rafState = false
  //   }
  // }




  // window.addEventListener('DOMContentLoaded', setLayout);
  window.addEventListener('load', () => {
    setLayout()
    document.body.classList.remove('before-load')
    setLayout();
    // sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0)

    // let tempYOffset = yOffset;
    // let tempScrollCount = 0;

    // if (tempYOffset > 0) {
    //   let siId = setInterval(() => {
    //     window.scrollTo(0, tempYOffset)
    //     tempYOffset += 5

    //     if (tempScrollCount > 20) {
    //       clearInterval(siId)
    //     }
    //     tempScrollCount++
    //   }, 20)
    // }

    window.addEventListener('scroll', () => {
      yOffset = window.pageYOffset;
      checkMenu()
      if (enterNewScene) return
      scrollLoop();
      playAnimation();
      // if (enterNewScene) return
      // if (!rafState) {
      //   rafId = requestAnimationFrame(loop)
      //   rafState = true
      // }

    })
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        window.location.reload();
      }
    });

    window.addEventListener('orientationchange', () => {
      scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
    document.querySelector('.loading').addEventListener('transitionend', (e) => {
      document.body.removeChild(e.currentTarget)
    })

  });
  setCanvasImages()
})();
//즉시호출 함수
//전역함수를 피하기 위함이다.