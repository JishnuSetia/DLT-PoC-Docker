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
        <div class="poc-details-container">

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

            <div class="poc-video-placeholder-icon">
                ▶
            </div>

            <div class="poc-video-placeholder-title">
                PoC Video
            </div>

            <div class="poc-video-placeholder-text">
                Video demonstration coming soon.
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
        <section class="details-section">

            <h2>
                Benefits
            </h2>

            <ul class="benefits-list">

                ${benefits
                    .map(
                        benefit => `
                            <li>
                                ${escapeHTML(
                                    benefit
                                )}
                            </li>
                        `
                    )
                    .join("")}

            </ul>

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
        <section class="details-section">

            <h2>
                Technology Stack
            </h2>

            <div class="tech-stack">

                ${technologies
                    .map(
                        tech => `
                            <span class="tech-badge">
                                ${escapeHTML(
                                    tech
                                )}
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
        <section class="details-section">

            <h2>
                Team
            </h2>

            <div class="team-grid">

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
                            <div class="team-member">

                                <div class="team-avatar">

                                    <img
                                        src="${escapeAttribute(
                                            picture
                                        )}"
                                        alt="${escapeAttribute(
                                            name
                                        )}"
                                        loading="lazy"
                                        onerror="
                                            this.onerror=null;
                                            this.src='assets/images/person1.jpg';
                                        "
                                    >

                                </div>

                                <div class="team-member-info">

                                    <strong>
                                        ${escapeHTML(
                                            name
                                        )}
                                    </strong>

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