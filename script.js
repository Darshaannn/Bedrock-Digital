// Initialize Locomotive Scroll & GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true,
    multiplier: 0.6, // Balanced premium smooth scroll speed
    lerp: 0.07,
    smartphone: {
        smooth: true,
        multiplier: 0.6
    },
    tablet: {
        smooth: true,
        multiplier: 0.6
    }
});

// Sync Locomotive Scroll with GSAP ScrollTrigger
locoScroll.on("scroll", () => {
    ScrollTrigger.update();
    // One-time refresh after scroll starts to handle dynamic height adjustments from loading sections
    if (!window.scrollRefreshed) {
        ScrollTrigger.refresh();
        window.scrollRefreshed = true;
    }
});

ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
});

ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// --- Navbar Color Toggle Logic ---
ScrollTrigger.create({
    trigger: "#barter-services",
    endTrigger: "#ready",
    start: "top 5%",
    end: "bottom 5%",
    scroller: "#main",
    toggleClass: { targets: "#nav", className: "dark-nav" },
});


// --- Cursor Logic ---
function initCursor() {
    const cursor = document.querySelector("#cursor");

    // Auto-center cursor element accurately using GSAP so it handles width transitions safely
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    window.addEventListener("mousemove", (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Hover scale effect for links and buttons to show 'View'
    const interactables = document.querySelectorAll("a, button, .btn, .icon, .read-more-btn, .card-btn, .tag, .map-pin");
    interactables.forEach(item => {
        item.addEventListener("mouseenter", () => {
            const isNav = item.closest("#nav");

            if (isNav) {
                cursor.classList.add("active"); // Just a standard small expansion, no text
            } else {
                cursor.classList.add("view-active"); // Custom class for view scaling
                const textEl = cursor.querySelector(".cursor-text");
                if (textEl) textEl.textContent = "VIEW";
            }
        });

        item.addEventListener("mouseleave", () => {
            cursor.classList.remove("active", "view-active");
            const textEl = cursor.querySelector(".cursor-text");
            if (textEl) textEl.textContent = "";
        });
    });
}

// Advanced cursor and click redirection for Project Card Rows
function initProjectCards() {
    const projectImages = document.querySelectorAll(".project-card-img");
    const cursor = document.querySelector("#cursor");
    if (!cursor) return;
    const cursorText = cursor.querySelector(".cursor-text");

    projectImages.forEach(imgBox => {
        imgBox.addEventListener("mouseenter", () => {
            cursor.classList.add("view-active");
            if (cursorText) cursorText.textContent = "VIEW";
        });
        imgBox.addEventListener("mouseleave", () => {
            cursor.classList.remove("view-active");
            if (cursorText) cursorText.textContent = "";
        });

        // Make images clickable to open URL
        imgBox.addEventListener("click", () => {
            const row = imgBox.closest(".project-card-row");
            const url = row ? row.getAttribute("data-url") : null;
            if (url) {
                window.open(url, "_blank");
            }
        });
    });
}

// --- Marquee Animation ---
gsap.to(".marque-text h1", {
    x: "-100%",
    repeat: -1,
    duration: 15, // Slowed down from 5s for better readability
    ease: "none",
});

// --- Preloader Typing Effect ---
function initPreloader() {
    const typewriterElement = document.getElementById("typewriter");
    if (!typewriterElement) return;
    
    // Hide everything else initially
    gsap.set(["#nav", ".hero-description", ".hero-cta", "#hero-3d-canvas-container", "#marquee", "#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"], { opacity: 0, y: 20 });
    
    // Scale container initial state so it can animate in properly
    gsap.set("#hero-3d-canvas-container", { scale: 0 });
    
    // We want to type "Built Different." first, then "<br>", then "Built Digital."
    const parts = [
        "Built Different.",
        "<br>",
        "Built Digital."
    ];
    
    let currentPart = 0;
    let currentChar = 0;
    
    function typeWriter() {
        if (currentPart < parts.length) {
            if (parts[currentPart] === "<br>") {
                typewriterElement.innerHTML += "<br>";
                currentPart++;
                setTimeout(typeWriter, 400); // pause after first line
            } else {
                if (currentChar < parts[currentPart].length) {
                    typewriterElement.innerHTML += parts[currentPart].charAt(currentChar);
                    currentChar++;
                    // randomize typing speed slightly for realism
                    let typeSpeed = Math.random() * 50 + 30; 
                    setTimeout(typeWriter, typeSpeed); 
                } else {
                    currentPart++;
                    currentChar = 0;
                    setTimeout(typeWriter, 100);
                }
            }
        } else {
            // Finished typing, start the main animations
            setTimeout(() => {
                document.querySelector(".cursor-blink").style.display = "none";
                loaderAnimation();
            }, 800);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
}

function loaderAnimation() {
    const tl = gsap.timeline();

    // Fade in Nav
    tl.to("#nav", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    });

    // Fade in description and cta
    tl.to([".hero-description", ".hero-cta"], {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    }, "-=0.5");

    // Pop in cubes
    tl.to("#hero-3d-canvas-container", {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "back.out(1.2)"
    }, "-=0.8");

    // Fade in the rest of the page
    tl.to(["#about", "#why-barter", "#barter-services", "#projects", "#ready", "#contact", "#footer-wrapper"], {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        onComplete: () => {
            locoScroll.update();
            ScrollTrigger.refresh();
            console.log("LocoScroll & ScrollTrigger Refreshed after Preloader");
        }
    }, "-=0.5");
}

function initScrollAnimations() {
    // Reveal Project Rows sequentially
    gsap.utils.toArray(".project-card-row").forEach(row => {
        gsap.from(row, {
            scrollTrigger: {
                trigger: row,
                scroller: "#main",
                start: "top 85%",
            },
            y: 80,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Reveal Services
    gsap.from(".service-col", {
        scrollTrigger: {
            trigger: "#barter-services",
            scroller: "#main",
            start: "top 80%",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });

    // Scroll-to-reveal footer animation
    let mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
        gsap.fromTo("#footer", 
            { yPercent: -100 }, 
            {
                yPercent: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: "#footer-wrapper",
                    scroller: "#main",
                    start: "top bottom",
                    end: "bottom bottom",
                    scrub: true
                }
            }
        );

        // Pin the footer wrapper when it is fully revealed to prevent it from going above the viewport
        ScrollTrigger.create({
            trigger: "#footer-wrapper",
            scroller: "#main",
            start: "bottom bottom",
            end: "max",
            pin: true,
            pinSpacing: false
        });
    });
}

// --- Hero Slider Logic ---
function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    if (slides.length === 0) return;

    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }

    setInterval(nextSlide, 5000);
}


// --- Eye Tracking Logic ---
let eyesCached = [];

function updateEyeCoordinates() {
    if (!locoScroll || !locoScroll.scroll) return;
    eyesCached = [];
    const eyes = document.querySelectorAll(".eye");
    const scrollY = locoScroll.scroll.instance.scroll.y || 0;
    
    eyes.forEach(eye => {
        const line = eye.querySelector(".line");
        if (line) {
            const rect = eye.getBoundingClientRect();
            eyesCached.push({
                line: line,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2 + scrollY
            });
        }
    });
}

function initEyeTracking() {
    // Calculate coordinates after a short delay so preloader/layout settles
    setTimeout(updateEyeCoordinates, 800);

    // Update coordinates on resize
    window.addEventListener("resize", updateEyeCoordinates);

    // Update coordinates on ScrollTrigger refreshes (e.g. dynamic layout changes)
    ScrollTrigger.addEventListener("refresh", updateEyeCoordinates);

    window.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const scrollY = locoScroll && locoScroll.scroll ? (locoScroll.scroll.instance.scroll.y || 0) : 0;

        eyesCached.forEach(eye => {
            // Get relative viewport Y by subtracting the current scroll value from cached absolute page Y
            const eyeX = eye.x;
            const eyeY = eye.y - scrollY;

            const dX = mouseX - eyeX;
            const dY = mouseY - eyeY;
            const eyeAngle = Math.atan2(dY, dX) * (180 / Math.PI);

            gsap.to(eye.line, {
                rotate: eyeAngle - 180,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    });
}

// --- Navigation Scroll Logic ---
function initNavScroll() {
    document.querySelectorAll('#nav .links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Allow default behavior for external links or if not anchor
            if (!targetId.startsWith('#')) return;

            e.preventDefault();

            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    locoScroll.scrollTo(targetElement, {
                        offset: -50, // Slight offset for nav bar space
                        duration: 1000,
                        easing: [0.25, 0.0, 0.35, 1.0]
                    });
                }
            } else {
                // Scroll to top if href is just '#'
                locoScroll.scrollTo(0, {
                    duration: 1000,
                    easing: [0.25, 0.0, 0.35, 1.0]
                });
            }
        });
    });
}

// --- Contact Form Submission via EmailJS ---
function initContactForm() {
    // Initialize EmailJS with your Public Key
    emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

    const form = document.querySelector("#contact-form");
    const submitBtn = document.querySelector("#contact-submit");
    if (!form || !submitBtn) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Show loading state on button
        const btnText = submitBtn.querySelector(".btn-text");
        const originalText = btnText.textContent;
        btnText.textContent = "SENDING...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        // Send via EmailJS — replace with your actual Service ID and Template ID
        emailjs.sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", form)
            .then(() => {
                // SUCCESS — show success toast
                showToast(true);
                form.reset();
            })
            .catch((error) => {
                // FAILURE — show error toast
                console.error("EmailJS error:", error);
                showToast(false);
            })
            .finally(() => {
                // Restore button state
                btnText.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            });
    });

    function showToast(success) {
        const toast = document.createElement("div");
        toast.className = "contact-success-toast";
        toast.innerHTML = success
            ? `<div class="toast-content">
                <i class="ri-checkbox-circle-fill" style="color:#5c8a00"></i>
                <div class="toast-text">
                    <h4>Message Sent!</h4>
                    <p>We'll get back to you within 24 hours.</p>
                </div>
               </div>`
            : `<div class="toast-content">
                <i class="ri-error-warning-fill" style="color:#e53935"></i>
                <div class="toast-text">
                    <h4>Sending Failed</h4>
                    <p>Please try again or email us directly.</p>
                </div>
               </div>`;
        document.body.appendChild(toast);

        gsap.fromTo(toast,
            { opacity: 0, y: 50, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );

        setTimeout(() => {
            gsap.to(toast, {
                opacity: 0, y: -20, scale: 0.95,
                duration: 0.4, ease: "power3.in",
                onComplete: () => toast.remove()
            });
        }, 5000);
    }
}

// --- Nav Hide/Show on Scroll Direction ---
function initNavScrollDirection() {
    const nav = document.querySelector("#nav");
    let lastScrollY = 0;
    let isNavHidden = false;

    locoScroll.on("scroll", (instance) => {
        const currentScrollY = instance.scroll.y;

        // Toggle 'scrolled' class to enable premium frosted glass transition
        if (currentScrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }

        if (currentScrollY > 150) {
            if (currentScrollY > lastScrollY) {
                // Scrolling down -> hide navbar
                if (!isNavHidden) {
                    isNavHidden = true;
                    gsap.to(nav, { y: "-120%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
                }
            } else {
                // Scrolling up -> show navbar
                if (isNavHidden) {
                    isNavHidden = false;
                    gsap.to(nav, { y: "0%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
                }
            }
        } else {
            // Near the top -> always show navbar
            if (isNavHidden) {
                isNavHidden = false;
                gsap.to(nav, { y: "0%", duration: 0.3, ease: "power2.out", overwrite: "auto" });
            }
        }

        lastScrollY = currentScrollY;
    });
}

// --- Mobile Reveal on Scroll (Intersection Observer — Mobile Only) ---
function initMobileReveal() {
    // Only run on mobile/tablet viewports — desktop is completely unaffected
    if (window.innerWidth > 768) return;

    const revealTargets = document.querySelectorAll(
        ".mob-reveal, .mob-reveal-left, .mob-reveal-stagger"
    );

    if (revealTargets.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    // Unobserve after reveal so it only fires once
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,      // Trigger when 12% of element is visible
            rootMargin: "0px 0px -40px 0px"  // Slight bottom offset for natural feel
        }
    );

    revealTargets.forEach((el) => observer.observe(el));

    // Re-check on resize (in case user rotates device)
    window.addEventListener("resize", () => {
        if (window.innerWidth <= 768) {
            revealTargets.forEach((el) => {
                if (!el.classList.contains("is-visible")) {
                    observer.observe(el);
                }
            });
        }
    });
}

// --- View All Work Reveal Logic ---
function initViewAllWork() {
    const viewAllBtn = document.querySelector(".view-all-btn");
    const hiddenProjects = document.querySelectorAll(".project-card-row.hidden-project");

    if (viewAllBtn && hiddenProjects.length > 0) {
        viewAllBtn.addEventListener("click", () => {
            const isExpanded = viewAllBtn.classList.toggle("expanded");

            hiddenProjects.forEach(project => {
                if (isExpanded) {
                    // Remove class and make visible so it animates in smoothly with GSAP
                    project.classList.remove("hidden-project");
                    project.style.display = "flex";
                    gsap.fromTo(project,
                        { opacity: 0, y: 50 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
                    );
                } else {
                    project.classList.add("hidden-project");
                    project.style.display = "none";
                }
            });

            // Update button text and dot state
            const dot = '<div class="dot"></div>';
            if (isExpanded) {
                viewAllBtn.innerHTML = 'SHOW LESS ' + dot;
            } else {
                viewAllBtn.innerHTML = 'VIEW ALL WORK ' + dot;
                // Scroll back to the top of the projects section so user isn't disoriented
                locoScroll.scrollTo(document.querySelector("#projects"), {
                    offset: -50,
                    duration: 800
                });
            }

            // Sync heights with Locomotive Scroll and ScrollTrigger
            setTimeout(() => {
                locoScroll.update();
                ScrollTrigger.refresh();
            }, 300);
        });
    }
}

// --- Premium 3D Three.js Animation for Hero Graphic ---
function initHero3DAnimation() {
    const container = document.getElementById("hero-3d-canvas-container");
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- Lighting Design (Premium Studio Feel) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Main Key Light casting premium shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(6, 9, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    // Soft Purple Rim Accent Light to make edges pop spectacularly!
    const rimLight = new THREE.PointLight(0x7c3aed, 3.5, 15); // Brand Purple
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Soft Fill Light from bottom-left
    const fillLight = new THREE.DirectionalLight(0xbabccf, 0.5);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    // --- Procedural Canvas Texture Generators ---
    
    // Premium Translucent Glass Texture with bold, crisp black border outlines (exactly like the user's design)
    function createGlassCubeTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // Clear canvas to ensure perfect transparency
        ctx.clearRect(0, 0, 512, 512);

        // Fill inner with translucent white matching brand #f4f3f4 (38% opacity for elite see-through depth)
        ctx.fillStyle = "rgba(244, 243, 244, 0.38)";
        ctx.fillRect(0, 0, 512, 512);

        // Crisp solid black border (bold thick outlines exactly like the attached image!)
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 36; // Thick crisp border outlines
        ctx.strokeRect(0, 0, 512, 512);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
    }

    // Initialize Texture
    const glassTex = createGlassCubeTexture();

    // 1. Premium Purple Brand Core Texture (#5d33b0) with bold black border outlines
    function createCorePurpleTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        // Solid Bedrock Purple core color (#5d33b0)
        ctx.fillStyle = "#5d33b0";
        ctx.fillRect(0, 0, 512, 512);

        // Soft radial glowing center highlights
        const radGrad = ctx.createRadialGradient(256, 256, 0, 256, 256, 300);
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.28)");
        radGrad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 512, 512);

        // Crisp solid black border (matches the outer glass-white cubes outlines!)
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 36; // Thick outlines
        ctx.strokeRect(0, 0, 512, 512);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
    }

    // Initialize Core Texture
    const corePurpleTex = createCorePurpleTexture();

    // --- Physical Materials ---
    const materialGlass = new THREE.MeshPhysicalMaterial({
        map: glassTex,
        transparent: true,
        roughness: 0.15,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false // Prevents alpha sorting clipping artifacts completely!
    });

    const materialCorePurple = new THREE.MeshPhysicalMaterial({
        map: corePurpleTex,
        roughness: 0.25,
        metalness: 0.35,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        reflectivity: 0.6,
        side: THREE.DoubleSide
    });

    // --- Master Group ---
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // --- 27 Cubes Creation ---
    const cubes = [];
    const size = 0.74;       // Cube size (reduced from 0.85 for prominent gaps)
    const step = 0.94;       // Target position step (leaves a beautiful architectural 0.20 gap)
    const geometry = new THREE.BoxGeometry(size, size, size);

    // Shuffle helper to make flying entry random and gorgeous
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let coreCube = null;

    // Outer boundary material checking
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const isCore = (x === 0 && y === 0 && z === 0);

                let materials;
                
                if (isCore) {
                    // Central core cube has Bedrock Brand Purple material (#5d33b0) with black borders!
                    materials = [
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple,
                        materialCorePurple
                    ];
                } else {
                    // Outer modules use the translucent glass material!
                    materials = [
                        materialGlass,
                        materialGlass,
                        materialGlass,
                        materialGlass,
                        materialGlass,
                        materialGlass
                    ];
                }

                const mesh = new THREE.Mesh(geometry, materials);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                cubeGroup.add(mesh);

                const cubeData = {
                    mesh: mesh,
                    gridX: x,
                    gridY: y,
                    gridZ: z,
                    targetX: x * step,
                    targetY: y * step,
                    targetZ: z * step,
                    isCore: isCore
                };

                if (isCore) {
                    coreCube = cubeData;
                    // Position at center
                    mesh.position.set(0, 0, 0);
                    mesh.scale.set(1, 1, 1);
                } else {
                    // Position randomly far away on a sphere of radius 15-18
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const radius = 14 + Math.random() * 4;

                    mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
                    mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
                    mesh.position.z = radius * Math.cos(phi);

                    // Random initial rotation
                    mesh.rotation.set(
                        (Math.random() - 0.5) * Math.PI * 3,
                        (Math.random() - 0.5) * Math.PI * 3,
                        (Math.random() - 0.5) * Math.PI * 3
                    );

                    // Scale to 0 initially
                    mesh.scale.set(0, 0, 0);
                    cubes.push(cubeData);
                }
            }
        }
    }

    // --- Animation Timeline Variables ---
    let isAssembled = false;
    let isRotatingLoop = false;
    let clock = new THREE.Clock();
    let lastTime = 0; // For frame-by-frame deltaTime calculation

    // Smooth rotational angles starting exactly at 0 to prevent sudden jumps
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    // Subtle floating state parameters for the core
    let coreFloatY = 0;
    let coreFloatRotX = 0;
    let coreFloatRotY = 0;

    // --- Magnetic Attraction Animation Trigger ---
    function triggerMagneticAssembly() {
        const tl = gsap.timeline({
            delay: 1.5, // Floating core calm float for 1.5s after loader before magnetism activates
            onComplete: () => {
                // All cubes snapped. Pause majestically for 1.0s (deliberate and clean), then smoothly align and start loop
                gsap.delayedCall(1.0, () => {
                    isAssembled = true;
                    
                    // Smoothly transition all cube rotations and positions to absolute perfection
                    cubes.forEach(c => {
                        gsap.to(c.mesh.position, { x: c.targetX, y: c.targetY, z: c.targetZ, duration: 0.6, ease: "power3.out" });
                        gsap.to(c.mesh.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power3.out" });
                    });
                    
                    gsap.to(coreCube.mesh.position, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power3.out" });
                    gsap.to(coreCube.mesh.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power3.out" });

                    // Slowly activate infinite rotation loop
                    gsap.delayedCall(0.6, () => {
                        isRotatingLoop = true;
                    });
                });
            }
        });

        // Shuffle external cubes for organic and scattered entry flow
        shuffle(cubes);

        cubes.forEach((cube, index) => {
            // Elegant, slow, deliberate stagger delay so they snap in a gorgeous structured sequence
            const staggerDelay = index * 0.12;

            // 1. Set scale in
            tl.to(cube.mesh.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.6,
                ease: "power2.out"
            }, staggerDelay);

            // 2. Chained bezier movement path (accelerates in, snaps slow and clean)
            const startPos = cube.mesh.position.clone();
            const endPos = new THREE.Vector3(cube.targetX, cube.targetY, cube.targetZ);

            // Control point for a beautiful curved arc entry
            const controlPoint = new THREE.Vector3()
                .addVectors(startPos, endPos)
                .multiplyScalar(0.5)
                .add(new THREE.Vector3(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6
                ));

            // Curved GSAP animation (duration set to a slow, majestic 2.0s!)
            const pathObj = { t: 0 };
            const pathTl = gsap.timeline();
            pathTl.to(pathObj, {
                t: 1,
                duration: 2.0,
                ease: "power3.inOut",
                onUpdate: () => {
                    const t = pathObj.t;
                    // Quadratic Bezier Curve formula
                    cube.mesh.position.x = (1 - t) * (1 - t) * startPos.x + 2 * (1 - t) * t * controlPoint.x + t * t * endPos.x;
                    cube.mesh.position.y = (1 - t) * (1 - t) * startPos.y + 2 * (1 - t) * t * controlPoint.y + t * t * endPos.y;
                    cube.mesh.position.z = (1 - t) * (1 - t) * startPos.z + 2 * (1 - t) * t * controlPoint.z + t * t * endPos.z;
                },
                onComplete: () => {
                    // Click overshoot & snapping bounce (slow, premium, and clean lock!)
                    gsap.timeline()
                        .to(cube.mesh.scale, { x: 1.10, y: 1.10, z: 1.10, duration: 0.15, ease: "power2.out" })
                        .to(cube.mesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.35, ease: "back.out(1.2)" });
                }
            });

            // Smooth rotation alignment during flight (slowed down to 1.8s for clean rotation)
            pathTl.to(cube.mesh.rotation, {
                x: 0, y: 0, z: 0,
                duration: 1.8,
                ease: "power2.out"
            }, 0.05);

            // Append to main timeline
            tl.add(pathTl, staggerDelay);
        });
    }

    // Trigger the magnetic magnetism assembly after loader animation finishes
    // Triggered at 3.0s to sync beautifully as the header typing settles cleanly
    setTimeout(triggerMagneticAssembly, 3000);

    // --- Render Loop ---
    let frameId;
    let isActive = true; // For optimization

    function animate() {
        if (!isActive) return;
        frameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - lastTime;
        lastTime = elapsedTime;

        if (!isAssembled) {
            // Scene 1: Floating core animation (slightly faster core floating)
            coreFloatY = Math.sin(elapsedTime * 2.2) * 0.14;
            coreFloatRotX = elapsedTime * 0.35;
            coreFloatRotY = elapsedTime * 0.45;

            if (coreCube) {
                coreCube.mesh.position.y = coreFloatY;
                coreCube.mesh.rotation.x = coreFloatRotX;
                coreCube.mesh.rotation.y = coreFloatRotY;
            }
            
            // Subtly rotate the main camera view to make entry look alive
            camera.position.x = Math.sin(elapsedTime * 0.45) * 0.5;
            camera.position.y = Math.cos(elapsedTime * 0.45) * 0.3;
            camera.lookAt(0, 0, 0);
        } else if (isRotatingLoop) {
            // Scene 6: Infinite rotation loop of the final assembled structure (360 degrees tumbling - starts seamlessly from the snapped position!)
            rotY += deltaTime * 0.42; // Continuous spin left-to-right
            rotX += deltaTime * 0.32; // Continuous spin up-and-down
            rotZ += deltaTime * 0.14; // Continuous twist

            cubeGroup.rotation.y = rotY;
            cubeGroup.rotation.x = rotX;
            cubeGroup.rotation.z = rotZ;
            
            // Subtly adjust point light to create rich moving reflections
            rimLight.position.x = -4 + Math.sin(elapsedTime * 0.8) * 3;
            rimLight.position.z = -3 + Math.cos(elapsedTime * 0.8) * 3;
        }

        renderer.render(scene, camera);
    }

    // --- Mouse Move Micro Interaction (Subtle depth tilt based on cursor) ---
    window.addEventListener("mousemove", (e) => {
        if (!isAssembled) return;
        
        // Normalize mouse positions from -0.5 to 0.5
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        // Micro-tilt parent group toward mouse position for stunning 3D parallax depth!
        gsap.to(cubeGroup.position, {
            x: mouseX * 0.6,
            y: -mouseY * 0.6,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Start Loop
    animate();

    // --- Responsive Dynamic Sizing ---
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    // --- Performance Optimization: Viewport Observer ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isActive = entry.isIntersecting;
            if (isActive) {
                clock.getDelta(); // reset clock delta to avoid jumps
                animate();
            } else {
                cancelAnimationFrame(frameId);
            }
        });
    }, { threshold: 0.05 });
    
    observer.observe(container);
}

// --- Premium 3D Floating Ornaments for Subpage Headers ---
function initSubpage3DOrnaments() {
    const container = document.getElementById("subpage-canvas-container");
    if (!container) return;

    const shapeType = container.getAttribute("data-shape"); // "cube" or "torus"

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5.0);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x7c3aed, 2.5, 10);
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);

    // --- Texture Generator (Bold black outlines with 38% glass transparency) ---
    function createGlassTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 256, 256);
        ctx.fillStyle = "rgba(244, 243, 244, 0.38)";
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 18;
        ctx.strokeRect(0, 0, 256, 256);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
    }

    const glassTex = createGlassTexture();

    // --- Materials ---
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        map: glassTex,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
        transmission: 0.6,
        ior: 1.5,
        thickness: 1.5,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0x5d33b0, // Bedrock brand purple
        roughness: 0.1,
        metalness: 0.9
    });

    // --- Group ---
    const group = new THREE.Group();
    scene.add(group);

    // --- Geometries ---
    let outerMesh;
    if (shapeType === "cube") {
        // Outer Translucent Glass Cube
        const geom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        outerMesh = new THREE.Mesh(geom, glassMaterial);
    } else {
        // Outer Translucent Glass Torus
        const geom = new THREE.TorusGeometry(0.85, 0.3, 16, 100);
        outerMesh = new THREE.Mesh(geom, glassMaterial);
    }
    group.add(outerMesh);

    // Inner Brand Purple Core Sphere floating in center
    const coreGeom = new THREE.SphereGeometry(0.35, 32, 32);
    const coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
    group.add(coreMesh);

    // --- Animation State ---
    const clock = new THREE.Clock();
    let frameId;
    let isActive = true;

    function animate() {
        if (!isActive) return;
        frameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Calm floating physics
        group.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
        
        // Tumbling rotations
        outerMesh.rotation.y = elapsedTime * 0.38;
        outerMesh.rotation.x = elapsedTime * 0.28;
        
        coreMesh.rotation.y = -elapsedTime * 0.4;
        coreMesh.position.y = Math.sin(elapsedTime * 2.2) * 0.08;

        renderer.render(scene, camera);
    }

    // --- Mouse Move Parallax ---
    window.addEventListener("mousemove", (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        gsap.to(group.rotation, {
            y: mouseX * 0.8,
            x: mouseY * 0.8,
            duration: 0.8,
            overwrite: "auto",
            ease: "power2.out"
        });
    });

    // --- Resize ---
    function handleResize() {
        if (!container.clientWidth || !container.clientHeight) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", handleResize);

    // --- Viewport Intersection Observer for high performance ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isActive = entry.isIntersecting;
            if (isActive) {
                clock.getDelta();
                animate();
            } else {
                cancelAnimationFrame(frameId);
            }
        });
    }, { threshold: 0.05 });

    observer.observe(container);
}

// --- Global Initialize ---
window.addEventListener("load", function () {
    // Refresh Locomotive and ScrollTrigger first
    setTimeout(() => {
        locoScroll.update();
        ScrollTrigger.refresh();
        console.log("LocoScroll & ScrollTrigger Refreshed");
    }, 500);

    initPreloader();
    initCursor();
    initProjectCards();
    initEyeTracking();
    initHero3DAnimation(); // Initialize the premium Three.js WebGL graphic
    initSubpage3DOrnaments(); // Initialize premium floating WebGL assets
    initHeroSlider();
    initNavScroll();
    initNavScrollDirection();
    initScrollAnimations();
    initContactForm();
    initViewAllWork();
    initMobileReveal(); // Mobile-only reveal on scroll

    // Logo Click -> Scroll to top
    document.querySelector(".clay-logo").addEventListener("click", () => {
        locoScroll.scrollTo(0, {
            duration: 1000,
            easing: [0.25, 0.0, 0.35, 1.0]
        });
    });
});
