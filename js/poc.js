const API_BASE_URL = "";

document.addEventListener("DOMContentLoaded", init);

/* =========================================================
   TEMPORARY TEAM MEMBERS
========================================================= */

const temporaryTeamMembers = [
    {
        firstName: "John",
        lastName: "Doe",
        pictureUrl: "assets/images/person1.jpg"
    },
    {
        firstName: "Sarah",
        lastName: "Johnson",
        pictureUrl: "assets/images/person2.jpg"
    },
    {
        firstName: "Michael",
        lastName: "Smith",
        pictureUrl: "assets/images/person3.jpg"
    },
    {
        firstName: "Emily",
        lastName: "Williams",
        pictureUrl: "assets/images/person4.avif"
    },
    {
        firstName: "David",
        lastName: "Brown",
        pictureUrl: "assets/images/person5.avif"
    }
];

/* =========================================================
   POC 1 / DELIVERABLE 7 TEAM
========================================================= */

/*
 * Put the TWO people you want displayed for PoC 1 here.
 *
 * Example:
 *
 * {
 *     firstName: "Your",
 *     lastName: "Name",
 *     pictureUrl: "assets/images/your-photo.jpg"
 * }
 */

const poc1Team = [
    {
        firstName: "Reghu",
        lastName: "Anguswamy",
        pictureUrl: "assets/images/p1-poc1.jpeg"
    },
    {
        firstName: "Christy",
        lastName: "Ann",
        pictureUrl: "assets/images/p2-poc1.jpeg"
    }
];

/* =========================================================
   GET RANDOM TEAM
========================================================= */

function getRandomDummyTeam() {
    /*
     * Make a copy so the original array is not modified.
     */
    const shuffled = [...temporaryTeamMembers];

    /*
     * Fisher-Yates shuffle.
     */
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    /*
     * Randomly select between 1 and 4 people.
     */
    const count =
        Math.floor(Math.random() * 4) + 1;

    return shuffled.slice(0, count);
}

/* =========================================================
   INITIALIZE
========================================================= */

async function init() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const pocId =
        params.get("id");

    if (!pocId) {
        showError(
            "No PoC was specified."
        );
        return;
    }

    try {

        /* -------------------------------------------------
           LOAD POC
        ------------------------------------------------- */

        const response =
            await fetch(
                `${API_BASE_URL}/api/deliverables/${encodeURIComponent(pocId)}`,
                {
                    cache: "no-cache"
                }
            );

        if (!response.ok) {

            if (response.status === 404) {
                showError(
                    "The requested PoC could not be found."
                );
                return;
            }

            throw new Error(
                `Failed to load PoC: ${response.status}`
            );
        }

        const poc =
            await response.json();

        console.log(
            "PoC detail response:",
            poc
        );

        /* -------------------------------------------------
           VIDEO LOGIC
        ------------------------------------------------- */

        /*
         * PoC 1 / Deliverable 7:
         * Use the local video manually.
         */
        if (Number(poc.id) === 7) {

            poc.demoVideoUrl =
                "/assets/video/poc1.mp4";

            console.log(
                "Using manual local video for PoC 7."
            );

        } else {

            /*
             * All other PoCs use the FastAPI
             * video proxy endpoint.
             *
             * We intentionally DO NOT perform a HEAD
             * request here.
             *
             * The browser will determine whether the
             * video actually exists.
             */
            poc.demoVideoUrl =
                `${API_BASE_URL}/api/deliverables/${encodeURIComponent(poc.id)}/demo-video`;

            console.log(
                "Using API video endpoint:",
                poc.demoVideoUrl
            );
        }

        renderPoC(poc);

        document.title =
            `${poc.title || "PoC"} | Digital Lab POC Gallery`;

    } catch (error) {

        console.error(
            "Error loading PoC:",
            error
        );

        showError(
            "Unable to load the PoC. Please try again later."
        );
    }
}

/* =========================================================
   RENDER POC
========================================================= */

function renderPoC(poc) {

    const container =
        document.getElementById(
            "poc-details"
        );

    if (!container) {
        console.error(
            "Missing #poc-details element."
        );
        return;
    }

    /* -----------------------------------------------------
       BASIC DATA
    ----------------------------------------------------- */

    const status =
        displayDeliverableStatus(
            poc.deliverableStatus
        );

    /*
     * IMPORTANT:
     *
     * PoC 1 / ID 7 gets the specifically configured
     * two-person team.
     *
     * Every other PoC gets a random temporary team.
     */
    const team =
        Number(poc.id) === 7
            ? poc1Team
            : getRandomDummyTeam();

    const technology =
        poc.technology || "";

    /*
     * LabPortal currently provides "brief".
     * Use description as fallback.
     */
    const description =
        poc.brief ||
        poc.description ||
        "";

    const benefits =
        parseBenefits(
            poc.benefits
        );

    /* -----------------------------------------------------
       MEDIA
    ----------------------------------------------------- */

    const mediaHTML =
        poc.demoVideoUrl
            ? `
                <video
                    id="poc-video"
                    class="poc-video"
                    controls
                    playsinline
                    preload="metadata"
                >
                    <source
                        src="${escapeAttribute(
                            poc.demoVideoUrl
                        )}"
                        type="video/mp4"
                    >

                    Your browser does not support
                    the video element.
                </video>
            `
            : renderVideoPlaceholder();

    /* -----------------------------------------------------
       ACTIONS
    ----------------------------------------------------- */

    const actionsHTML = `
        <div class="poc-actions">

            ${
                poc.pocUrl
                    ? `
                        <a
                            href="${escapeAttribute(
                                poc.pocUrl
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="poc-link"
                        >
                            Open PoC
                        </a>
                    `
                    : ""
            }

            <button
                class="poc-link"
                id="share-button"
                type="button"
            >
                Share
            </button>

        </div>
    `;

    /* -----------------------------------------------------
       MAIN LAYOUT
    ----------------------------------------------------- */

    container.innerHTML = `
        <div class="poc-details-container ${statusClassFor(status)}">

            <!-- ==========================================
                 LEFT COLUMN
            =========================================== -->

            <div class="poc-left-column">

                <!-- VIDEO -->

                <div
                    class="poc-video-wrapper"
                    id="poc-video-wrapper"
                >
                    ${mediaHTML}
                </div>

                <!-- TEAM -->

                ${renderTeam(team)}

            </div>

            <!-- ==========================================
                 RIGHT COLUMN
            =========================================== -->

            <div class="poc-details-column">

                <!-- META -->

                <div class="poc-details-meta">

                    <span class="drawer-agency">
                        ${escapeHTML(
                            poc.department ||
                            "Digital Lab"
                        )}
                    </span>

                    <span
                        class="status-badge ${statusClassFor(
                            status
                        )}"
                    >
                        ${escapeHTML(status)}
                    </span>

                </div>

                <!-- TITLE -->

                <h1>
                    ${escapeHTML(
                        poc.title || ""
                    )}
                </h1>

                <!-- DESCRIPTION -->

                ${
                    description
                        ? `
                            <p class="poc-details-description">
                                ${escapeHTML(
                                    description
                                )}
                            </p>
                        `
                        : ""
                }

                <!-- ACTIONS -->

                ${actionsHTML}

                <!-- BENEFITS -->

                ${renderBenefits(benefits)}

                <!-- TECHNOLOGY -->

                ${renderTechnologies(technology)}

            </div>

        </div>
    `;

    /*
     * Set up video error handling AFTER the
     * video has been inserted into the DOM.
     */
    setupVideoErrorHandler();
    setupVideoSizing();

    setupShareButton();
}

/* =========================================================
   VIDEO PLACEHOLDER
========================================================= */

function renderVideoPlaceholder() {
    return `
        <div class="poc-video-placeholder">

            <div class="rta-loader" aria-hidden="true">
                <div class="truckWrapper">

                    <div class="truckBody">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 198 93"
                            class="trucksvg"
                        >
                            <!-- Cargo body -->
                            <rect
                                stroke-width="3"
                                stroke="var(--loader-stroke)"
                                fill="var(--loader-truck-body)"
                                rx="2.5"
                                height="90"
                                width="121"
                                y="1.5"
                                x="6.5"
                            />

                            <!-- Cargo accent -->
                            <rect
                                x="17"
                                y="14"
                                width="82"
                                height="6"
                                rx="3"
                                fill="var(--status-color, var(--rta-red))"
                                opacity="0.9"
                            />

                            <!-- RTA-style side detail -->
                            <rect
                                x="17"
                                y="28"
                                width="55"
                                height="4"
                                rx="2"
                                fill="var(--loader-stroke)"
                                opacity="0.2"
                            />

                            <rect
                                x="17"
                                y="38"
                                width="38"
                                height="4"
                                rx="2"
                                fill="var(--loader-stroke)"
                                opacity="0.12"
                            />

                            <!-- Cab -->
                            <path
                                stroke-width="3"
                                stroke="var(--loader-stroke)"
                                fill="var(--status-color, var(--rta-red))"
                                d="
                                    M135 22.5H177.264
                                    C178.295 22.5 179.22 23.133 179.594 24.0939
                                    L192.33 56.8443
                                    C192.442 57.1332 192.5 57.4404 192.5 57.7504
                                    V89
                                    C192.5 90.3807 191.381 91.5 190 91.5
                                    H135
                                    C133.619 91.5 132.5 90.3807 132.5 89
                                    V25
                                    C132.5 23.6193 133.619 22.5 135 22.5Z
                                "
                            />

                            <!-- Windshield -->
                            <path
                                stroke-width="3"
                                stroke="var(--loader-stroke)"
                                fill="var(--loader-window)"
                                d="
                                    M146 33.5H181.741
                                    C182.779 33.5 183.709 34.1415 184.078 35.112
                                    L190.538 52.112
                                    C191.16 53.748 189.951 55.5 188.201 55.5
                                    H146
                                    C144.619 55.5 143.5 54.3807 143.5 53
                                    V36
                                    C143.5 34.6193 144.619 33.5 146 33.5Z
                                "
                            />

                            <!-- Door -->
                            <path
                                d="M136 58H185"
                                stroke="var(--loader-stroke)"
                                stroke-width="2"
                                opacity="0.3"
                            />

                            <!-- Headlight -->
                            <rect
                                stroke-width="2"
                                stroke="var(--loader-stroke)"
                                fill="#FFFCAB"
                                rx="1"
                                height="7"
                                width="5"
                                y="63"
                                x="187"
                            />

                            <!-- Front bumper -->
                            <rect
                                stroke-width="2"
                                stroke="var(--loader-stroke)"
                                fill="var(--loader-stroke)"
                                rx="1"
                                height="11"
                                width="4"
                                y="81"
                                x="193"
                            />

                            <!-- Rear bumper -->
                            <rect
                                stroke-width="2"
                                stroke="var(--loader-stroke)"
                                fill="var(--loader-bumper)"
                                rx="2"
                                height="4"
                                width="6"
                                y="84"
                                x="1"
                            />
                        </svg>
                    </div>

                    <!-- Wheels -->
                    <div class="truckTires">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 30 30"
                            class="tiresvg"
                        >
                            <circle
                                stroke-width="3"
                                stroke="var(--loader-stroke)"
                                fill="var(--loader-wheel)"
                                r="13.5"
                                cy="15"
                                cx="15"
                            />
                            <circle
                                fill="var(--loader-wheel-inner)"
                                r="7"
                                cy="15"
                                cx="15"
                            />
                        </svg>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 30 30"
                            class="tiresvg"
                        >
                            <circle
                                stroke-width="3"
                                stroke="var(--loader-stroke)"
                                fill="var(--loader-wheel)"
                                r="13.5"
                                cy="15"
                                cx="15"
                            />
                            <circle
                                fill="var(--loader-wheel-inner)"
                                r="7"
                                cy="15"
                                cx="15"
                            />
                        </svg>

                    </div>

                    <!-- Road -->
                    <div class="road"></div>

                </div>
            </div>

            <div class="poc-wip-status">
                <span class="poc-wip-dot"></span>
                WORK IN PROGRESS
            </div>

            <div class="poc-video-placeholder-title">
                Demo Coming Soon
            </div>

            <div class="poc-video-placeholder-text">
                This PoC is currently being developed.
                A demonstration video will be available once
                the project is ready.
            </div>

        </div>
    `;
}

/* =========================================================
   VIDEO ERROR HANDLER
========================================================= */

function setupVideoErrorHandler() {

    const video =
        document.getElementById(
            "poc-video"
        );

    if (!video) {
        return;
    }

    /*
     * If the video cannot be loaded,
     * replace it with the placeholder.
     */
    video.addEventListener(
        "error",
        () => {

            console.warn(
                "Demo video could not be loaded. Showing placeholder."
            );

            showVideoPlaceholder();
        }
    );

    /*
     * Some browsers report the error
     * on the <source> element.
     */
    const source =
        video.querySelector(
            "source"
        );

    if (source) {

        source.addEventListener(
            "error",
            () => {

                console.warn(
                    "Demo video source could not be loaded."
                );

                showVideoPlaceholder();
            }
        );
    }
}

/* =========================================================
   VIDEO SIZING
========================================================= */

function setupVideoSizing() {

    const video =
        document.getElementById(
            "poc-video"
        );

    const wrapper =
        document.getElementById(
            "poc-video-wrapper"
        );

    if (!video || !wrapper) {
        return;
    }

    function applySize() {

        const vw = video.videoWidth;
        const vh = video.videoHeight;

        if (!vw || !vh) {
            return;
        }

        const isPortrait =
            vh > vw;

        const maxHeight =
            Math.min(
                window.innerHeight *
                    (isPortrait ? 0.7 : 0.65),
                650
            );

        /*
         * Measure the column, not the wrapper itself,
         * to avoid a resize feedback loop.
         */
        const availableWidth =
            wrapper.parentElement.clientWidth;

        const ratio = vw / vh;

        let width = maxHeight * ratio;
        let height = maxHeight;

        if (width > availableWidth) {
            width = availableWidth;
            height = width / ratio;
        }

        wrapper.style.width =
            `${Math.round(width)}px`;

        wrapper.style.height =
            `${Math.round(height)}px`;

        wrapper.classList.add(
            "is-sized"
        );

        wrapper.classList.toggle(
            "is-portrait",
            isPortrait
        );
    }

    if (video.readyState >= 1) {
        applySize();
    } else {
        video.addEventListener(
            "loadedmetadata",
            applySize,
            { once: true }
        );
    }

    window.addEventListener(
        "resize",
        applySize
    );
}

/* =========================================================
   SHOW VIDEO PLACEHOLDER
========================================================= */

function showVideoPlaceholder() {

    const wrapper =
        document.getElementById(
            "poc-video-wrapper"
        );

    if (!wrapper) {
        return;
    }

    wrapper.style.width = "";
    wrapper.style.height = "";

    wrapper.classList.remove(
        "is-sized",
        "is-portrait"
    );

    wrapper.innerHTML =
        renderVideoPlaceholder();
}

/* =========================================================
   BENEFITS
========================================================= */

function parseBenefits(benefits) {

    if (!benefits) {
        return [];
    }

    /*
     * Array:
     *
     * [
     *     "Benefit 1",
     *     "Benefit 2"
     * ]
     */
    if (Array.isArray(benefits)) {

        return benefits
            .map(
                item =>
                    String(item).trim()
            )
            .filter(Boolean);
    }

    /*
     * String:
     *
     * - Benefit 1
     * - Benefit 2
     * - Benefit 3
     */

    return String(benefits)
        .split(/\r?\n/)
        .map(
            benefit =>
                benefit
                    .replace(/^\s*-\s*/, "")
                    .trim()
        )
        .filter(Boolean);
}

function renderBenefits(benefits) {

    if (
        !benefits ||
        benefits.length === 0
    ) {
        return "";
    }

    return `
        <section class="poc-benefits-section">

            <div class="poc-section-title">Key Benefits</div>

            <div class="poc-benefits-grid">

                ${benefits
                    .map(
                        benefit => `
                            <div class="poc-benefit-item">
                                <div class="poc-benefit-icon">✓</div>
                                <span>${escapeHTML(benefit)}</span>
                            </div>
                        `
                    )
                    .join("")}

            </div>

        </section>
    `;
}

/* =========================================================
   TECHNOLOGIES
========================================================= */

function renderTechnologies(technology) {

    if (!technology) {
        return "";
    }

    /*
     * Support both:
     *
     * "Predictive AI"
     *
     * and:
     *
     * ["Python", "OpenAI", "FastAPI"]
     */

    const technologies =
        Array.isArray(technology)
            ? technology
            : [technology];

    return `
        <section class="poc-technologies-section">

            <div class="poc-section-title">Technology Stack</div>

            <div class="poc-tech-tags">

                ${technologies
                    .map(
                        tech => `
                            <span class="poc-tech-tag">
                                ${escapeHTML(tech)}
                            </span>
                        `
                    )
                    .join("")}

            </div>

        </section>
    `;
}

/* =========================================================
   TEAM
========================================================= */

function renderTeam(team) {

    /*
     * If somehow no team was provided,
     * generate a random team.
     */
    if (
        !Array.isArray(team) ||
        team.length === 0
    ) {
        team =
            getRandomDummyTeam();
    }

    return `
        <section class="poc-team-section">

            <div class="poc-team-header">
                Team
            </div>

            <div class="poc-team-grid">

                ${team
                    .map(member => {

                        const fullName =
                            `${member.firstName || ""} ${member.lastName || ""}`
                                .trim();

                        const name =
                            fullName ||
                            member.name ||
                            member.fullName ||
                            member.displayName ||
                            "Team Member";

                        const picture =
                            member.pictureUrl ||
                            member.avatar ||
                            member.avatarUrl ||
                            member.photo ||
                            member.photoUrl ||
                            "assets/images/person1.jpg";

                        return `
                            <div class="poc-team-member-card">

                                <img
                                    class="poc-team-avatar"
                                    src="${escapeAttribute(picture)}"
                                    alt="${escapeAttribute(name)}"
                                    loading="lazy"
                                    onerror="
                                        this.onerror=null;
                                        this.src='assets/images/person1.jpg';
                                    "
                                >

                                <div class="poc-team-info">
                                    <div class="poc-team-name">
                                        ${escapeHTML(name)}
                                    </div>
                                </div>

                            </div>
                        `;
                    })
                    .join("")}

            </div>

        </section>
    `;
}

/* =========================================================
   SHARE
========================================================= */

function setupShareButton() {

    const button =
        document.getElementById(
            "share-button"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                const originalText =
                    button.textContent;

                button.textContent =
                    "Link Copied!";

                setTimeout(
                    () => {

                        button.textContent =
                            originalText;

                    },
                    2000
                );

            } catch (error) {

                console.error(
                    "Unable to copy link:",
                    error
                );

            }

        }
    );
}

/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const container =
        document.getElementById(
            "poc-details"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="poc-error">

            <h1>
                PoC Not Available
            </h1>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            <a
                href="index.html"
                class="poc-link"
            >
                Back to Gallery
            </a>

        </div>
    `;
}

/* =========================================================
   STATUS
========================================================= */

function displayDeliverableStatus(status) {

    const statuses = {

        0: "Not Started",

        1: "Planning",

        2: "In Progress",

        3: "Review",

        4: "Completed",

        5: "On Hold"

    };

    return (
        statuses[status] ||
        "Unknown"
    );
}

function statusClassFor(status) {

    return String(status || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name = "") {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word => word[0]
        )
        .join("")
        .toUpperCase();
}

function escapeHTML(value = "") {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function escapeAttribute(value = "") {

    return escapeHTML(value);
}

/* =========================================================
   THEME CONTROLLER (LIGHT / DARK MODE)
========================================================= */

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function updateThemeLogo(theme) {
    const logos = document.querySelectorAll("#app-logo, .logo");
    logos.forEach(logo => {
        if (logo && logo.tagName === "IMG") {
            logo.src = theme === "light"
                ? "assets/rta-logo-color.png"
                : "assets/rta-logo-white.png";
        }
    });
}

function setTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (themeIcon) {
        themeIcon.textContent = isDark ? "☀" : "☾";
    }

    if (themeToggle) {
        const nextMode = isDark ? "light" : "dark";
        themeToggle.setAttribute("aria-label", `Switch to ${nextMode} mode`);
        themeToggle.setAttribute("title", `Switch to ${nextMode} mode`);
    }

    updateThemeLogo(theme);
}

// Restore saved theme or fallback to system preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
} else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
}

// Listen for system theme changes if user hasn't explicitly set preference
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
    }
});

// Toggle button click handler
themeToggle?.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(currentTheme === "dark" ? "light" : "dark");
});