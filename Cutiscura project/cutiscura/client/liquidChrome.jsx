import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useState
} from 'react';
import { createRoot } from 'react-dom/client';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { gsap } from 'gsap';

const LiquidChrome = ({
  baseColor = [0.36, 0.32, 0.9],
  speed = 0.25,
  amplitude = 0.25,
  frequencyX = 3,
  frequencyY = 3,
  interactive = true
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = new Renderer({ antialias: true });
    const { gl } = renderer;
    gl.clearColor(0, 0, 0, 0);

    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      uniform vec2 uMouse;
      varying vec2 vUv;

      vec4 renderImage(vec2 uvCoord) {
        vec2 fragCoord = uvCoord * uResolution.xy;
        vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);
        for (float i = 1.0; i < 10.0; i++){
          uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
          uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
        }
        vec2 diff = (uvCoord - uMouse);
        float dist = length(diff);
        float falloff = exp(-dist * 20.0);
        float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
        uv += (diff / (dist + 0.0001)) * ripple * falloff;
        vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
        return vec4(color, 0.9);
      }

      void main() {
        vec4 col = vec4(0.0);
        int samples = 0;
        for (int i = -1; i <= 1; i++){
          for (int j = -1; j <= 1; j++){
            vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
            col += renderImage(vUv + offset);
            samples++;
          }
        }
        gl_FragColor = col / float(samples);
      }
    `;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Float32Array([
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ])
        },
        uBaseColor: { value: new Float32Array(baseColor) },
        uAmplitude: { value: amplitude },
        uFrequencyX: { value: frequencyX },
        uFrequencyY: { value: frequencyY },
        uMouse: { value: new Float32Array([0, 0]) }
      }
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      const res = program.uniforms.uResolution.value;
      res[0] = gl.canvas.width;
      res[1] = gl.canvas.height;
      res[2] = gl.canvas.width / gl.canvas.height;
    };

    const handleMouseMove = (event) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / container.offsetWidth;
      const y = 1 - (event.clientY - rect.top) / container.offsetHeight;
      const mouseUniform = program.uniforms.uMouse.value;
      mouseUniform[0] = x;
      mouseUniform[1] = y;
    };

    const handleTouchMove = (event) => {
      if (!interactive || event.touches.length === 0) return;
      const touch = event.touches[0];
      const rect = container.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / container.offsetWidth;
      const y = 1 - (touch.clientY - rect.top) / container.offsetHeight;
      const mouseUniform = program.uniforms.uMouse.value;
      mouseUniform[0] = x;
      mouseUniform[1] = y;
    };

    window.addEventListener('resize', resize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove);

    resize();
    let animationId;

    const update = (t) => {
      animationId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001 * speed;
      renderer.render({ scene: mesh });
    };

    animationId = requestAnimationFrame(update);
    container.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      if (gl.canvas.parentElement) {
        gl.canvas.parentElement.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);

  return <div ref={containerRef} className="liquidChrome-container" />;
};

const StaggeredMenu = ({
  position = 'right',
  colors = ['#B19EEF', '#5227FF'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = '/logo.svg',
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  accentColor = '#5227FF',
  changeMenuColorOnOpen = true,
  isFixed = false,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);
  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });

    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
    const layerStates = layers.map((el) => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });
    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.08, from: 'start' }
          },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          },
          socialsStart
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback((opening) => {
    const icon = iconRef.current;
    if (!icon) return;

    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
    } else {
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }, []);

  const animateColor = useCallback(
    (opening) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;

      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    textCycleAnimRef.current?.kill();
    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;

    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }

    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  return React.createElement(
    'div',
    {
      className: (className ? className + ' ' : '') + 'staggered-menu-wrapper' + (isFixed ? ' fixed-wrapper' : ''),
      style: accentColor ? { ['--sm-accent']: accentColor } : undefined,
      'data-position': position,
      'data-open': open || undefined
    },
    React.createElement(
      'div',
      { ref: preLayersRef, className: 'sm-prelayers', 'aria-hidden': 'true' },
      (() => {
        const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
        let arr = [...raw];
        if (arr.length >= 3) {
          const mid = Math.floor(arr.length / 2);
          arr.splice(mid, 1);
        }
        return arr.map((c, i) =>
          React.createElement('div', { key: i, className: 'sm-prelayer', style: { background: c } })
        );
      })()
    ),
    React.createElement(
      'header',
      { className: 'staggered-menu-header', 'aria-label': 'Main navigation header' },
      React.createElement(
        'div',
        { className: 'sm-logo', 'aria-label': 'Logo' },
        React.createElement('img', {
          src: logoUrl || '/logo.svg',
          alt: 'Logo',
          className: 'sm-logo-img',
          draggable: false,
          width: 110,
          height: 24
        })
      ),
      React.createElement(
        'button',
        {
          ref: toggleBtnRef,
          className: 'sm-toggle',
          'aria-label': open ? 'Close menu' : 'Open menu',
          'aria-expanded': open,
          'aria-controls': 'staggered-menu-panel',
          onClick: toggleMenu,
          type: 'button'
        },
        React.createElement(
          'span',
          { ref: textWrapRef, className: 'sm-toggle-textWrap', 'aria-hidden': 'true' },
          React.createElement(
            'span',
            { ref: textInnerRef, className: 'sm-toggle-textInner' },
            textLines.map((l, i) =>
              React.createElement('span', { className: 'sm-toggle-line', key: i }, l)
            )
          )
        ),
        React.createElement(
          'span',
          { ref: iconRef, className: 'sm-icon', 'aria-hidden': 'true' },
          React.createElement('span', { ref: plusHRef, className: 'sm-icon-line' }),
          React.createElement('span', { ref: plusVRef, className: 'sm-icon-line sm-icon-line-v' })
        )
      )
    ),
    React.createElement(
      'aside',
      {
        id: 'staggered-menu-panel',
        ref: panelRef,
        className: 'staggered-menu-panel',
        'aria-hidden': !open
      },
      React.createElement(
        'div',
        { className: 'sm-panel-inner' },
        React.createElement(
          'ul',
          { className: 'sm-panel-list', role: 'list', 'data-numbering': displayItemNumbering || undefined },
          items && items.length
            ? items.map((it, idx) =>
                React.createElement(
                  'li',
                  { className: 'sm-panel-itemWrap', key: it.label + idx },
                  React.createElement(
                    it.isLogout ? 'button' : 'a',
                    {
                      className: 'sm-panel-item',
                      href: it.isLogout ? undefined : it.link,
                      onClick: it.isLogout ? (e) => {
                        e.preventDefault();
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = '/logout';
                        document.body.appendChild(form);
                        form.submit();
                      } : undefined,
                      'aria-label': it.ariaLabel,
                      'data-index': idx + 1,
                      style: it.isLogout ? { border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit' } : undefined
                    },
                    React.createElement('span', { className: 'sm-panel-itemLabel' }, it.label)
                  )
                )
              )
            : React.createElement(
                'li',
                { className: 'sm-panel-itemWrap', 'aria-hidden': 'true' },
                React.createElement(
                  'span',
                  { className: 'sm-panel-item' },
                  React.createElement('span', { className: 'sm-panel-itemLabel' }, 'No items')
                )
              )
        ),
        displaySocials &&
          socialItems &&
          socialItems.length > 0 &&
          React.createElement(
            'div',
            { className: 'sm-socials', 'aria-label': 'Social links' },
            React.createElement('h3', { className: 'sm-socials-title' }, 'Socials'),
            React.createElement(
              'ul',
              { className: 'sm-socials-list', role: 'list' },
              socialItems.map((s, i) =>
                React.createElement(
                  'li',
                  { key: s.label + i, className: 'sm-socials-item' },
                  React.createElement('a', {
                    href: s.link,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'sm-socials-link'
                  }, s.label)
                )
              )
            )
          )
      )
    )
  );
};

const mountLiquidChrome = (target, props = {}) => {
  const root = createRoot(target);
  root.render(React.createElement(LiquidChrome, props));
};

const mountStaggeredMenu = (target, props = {}) => {
  const root = createRoot(target);
  root.render(React.createElement(StaggeredMenu, props));
};

document.addEventListener('DOMContentLoaded', () => {
  const heroTarget = document.getElementById('liquid-chrome-root');
  if (heroTarget) {
    mountLiquidChrome(heroTarget);
  }

  const backgroundTarget = document.getElementById('liquid-backdrop');
  if (backgroundTarget) {
    mountLiquidChrome(backgroundTarget, {
      baseColor: [0.65, 0.45, 0.95],
      amplitude: 0.4,
      speed: 0.12,
      interactive: true
    });
  }

  const menuTarget = document.getElementById('staggered-menu-root');
  if (menuTarget) {
    const isLoggedIn = menuTarget.dataset.userLoggedIn === 'true';
    const userName = menuTarget.dataset.userName || '';
    
    const items = [
      { label: 'Dashboard', link: '/', ariaLabel: 'Go to dashboard' },
      { label: 'Products', link: '/products', ariaLabel: 'View products' },
      { label: 'Skin Quiz', link: '/quiz', ariaLabel: 'Take skin quiz' },
      { label: 'Appointments', link: '/appointments', ariaLabel: 'View appointments' }
    ];
    
    if (isLoggedIn) {
      items.push({ 
        label: 'Logout', 
        link: '#', 
        ariaLabel: 'Logout',
        isLogout: true
      });
    } else {
      items.push({ label: 'Login', link: '/login', ariaLabel: 'Login' });
    }
    
    const socialItems = [];
    mountStaggeredMenu(menuTarget, {
      position: 'right',
      colors: ['#B19EEF', '#5227FF'],
      items,
      socialItems,
      displaySocials: false,
      displayItemNumbering: true,
      accentColor: '#5227FF',
      menuButtonColor: '#fff',
      openMenuButtonColor: '#fff',
      isFixed: true,
      logoUrl: '/logo.svg'
    });
  }

  document.querySelectorAll('.tab-link').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.tab-link').forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
});
