import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registro único dos plugins; importe gsap/ScrollTrigger sempre daqui.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
