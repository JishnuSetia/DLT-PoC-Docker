/* =========================================================
   POC DATA
========================================================= */

let pocData = [];
let selectedTechnologies = [];


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
   POC-SPECIFIC TEAMS
========================================================= */

/*
    IMPORTANT:

    Your PoC 1 has API ID = 7.

    Therefore the key MUST be 7, not 1.

    This PoC will ALWAYS show exactly these 2 people.

    Replace the names and photo paths with the real values.
*/

const pocSpecificTeams = {

    7: [

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

    ]

};


/* =========================================================
   RANDOM TEMPORARY TEAM
========================================================= */

function getRandomDummyTeam() {

    /*
        Create a copy so the original list
        is never modified.
    */

    const shuffled = [...temporaryTeamMembers];


    /*
        Fisher-Yates shuffle.
    */

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];

    }


    /*
        Randomly choose between 1 and 4 people.
    */

    const count =
        Math.floor(Math.random() * 4) + 1;

    return shuffled.slice(0, count);
}


/* =========================================================
   GET TEAM FOR POC
========================================================= */

function getTeamForPoC(poc) {

    /*
        Get the actual API ID.

        Example:
        PoC 1 -> API ID 7
    */

    const pocId = Number(poc?.id);


    /*
        -----------------------------------------------------
        1. CHECK POC-SPECIFIC TEAM FIRST
        -----------------------------------------------------

        If this PoC has a manually configured team,
        ALWAYS use it.

        This takes priority over:
        - API team members
        - random temporary team members
    */

    const specificTeam = pocSpecificTeams[pocId];

    if (
        Array.isArray(specificTeam) &&
        specificTeam.length > 0
    ) {

        console.log(
            `Using specific team for PoC ID ${pocId}:`,
            specificTeam
        );

        return specificTeam;
    }


    /*
        -----------------------------------------------------
        2. CHECK API TEAM MEMBERS
        -----------------------------------------------------
    */

    const team = poc?.team;

    if (
        Array.isArray(team) &&
        team.length > 0
    ) {

        const usableMembers = team.filter(
            member => {

                if (
                    !member ||
                    typeof member !== "object"
                ) {
                    return false;
                }

                const hasName =
                    member.firstName ||
                    member.lastName ||
                    member.name ||
                    member.fullName ||
                    member.displayName;

                const hasPicture =
                    member.pictureUrl ||
                    member.avatar ||
                    member.avatarUrl ||
                    member.photo ||
                    member.photoUrl;

                return hasName || hasPicture;
            }
        );

        if (usableMembers.length > 0) {

            console.log(
                `Using API team for PoC ID ${pocId}:`,
                usableMembers
            );

            return usableMembers;
        }
    }


    /*
        -----------------------------------------------------
        3. FALLBACK TO RANDOM TEMPORARY TEAM
        -----------------------------------------------------
    */

    console.log(
        `Using random temporary team for PoC ID ${pocId}.`
    );

    return getRandomDummyTeam();
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const pocGrid =
    document.getElementById("poc-grid");

const pocCount =
    document.getElementById("poc-count");

const emptyState =
    document.getElementById("empty-state");

const searchInput =
    document.getElementById("search-input");

const agencyFilter =
    document.getElementById("agency-filter");

const technologyMultiSelect =
    document.getElementById("technology-multi-select");

const technologyTrigger =
    document.getElementById("technology-trigger");

const technologyMenu =
    document.getElementById("technology-menu");

const technologySelectedText =
    document.getElementById("technology-selected-text");

const statusFilter =
    document.getElementById("status-filter");

const refreshButton =
    document.getElementById("refresh-button");


/* =========================================================
   BASIC DOM VALIDATION
========================================================= */

if (!pocGrid) {

    console.error(
        "Missing #poc-grid element."
    );

}


/* =========================================================
   TECHNOLOGY DROPDOWN
========================================================= */

if (
    technologyTrigger &&
    technologyMenu
) {

    technologyTrigger.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isOpen =
                !technologyMenu.hidden;

            technologyMenu.hidden =
                isOpen;

            if (technologyMultiSelect) {

                technologyMultiSelect.classList.toggle(
                    "open",
                    !isOpen
                );

            }

        }
    );

}


/* =========================================================
   CLOSE TECHNOLOGY DROPDOWN
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            technologyMultiSelect &&
            !technologyMultiSelect.contains(
                event.target
            )
        ) {

            if (technologyMenu) {

                technologyMenu.hidden = true;

            }

            technologyMultiSelect.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   DELIVERABLE STATUS MAPPING
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

    return statuses[status] || "Unknown";
}


/* =========================================================
   LOAD POC DATA
========================================================= */

async function loadPoCData() {

    try {

        const response = await fetch(
            "/api/deliverables",
            {
                cache: "no-cache"
            }
        );


        if (!response.ok) {

            throw new Error(
                `Failed to load deliverables: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !Array.isArray(data.items)
        ) {

            throw new Error(
                "Invalid deliverables API response. Expected an items array."
            );

        }


        /*
            Convert LabPortal API data into
            the format expected by the UI.
        */

        pocData =
            data.items.map(
                deliverable => ({

                    id:
                        deliverable.id,

                    code:
                        deliverable.code || "",

                    title:
                        deliverable.title || "",

                    description:
                        deliverable.description || "",

                    status:
                        displayDeliverableStatus(
                            deliverable.deliverableStatus
                        ),

                    agency:
                        deliverable.department ||
                        "Digital Lab",

                    technologies:
                        deliverable.technology
                            ? [deliverable.technology]
                            : [],

                    team:
                        Array.isArray(
                            deliverable.teamMembers
                        )
                            ? deliverable.teamMembers
                            : [],

                    imageUrl:
                        deliverable.imageUrl || "",

                    demoVideoUrl:
                        deliverable.demoVideoUrl || "",

                    pocUrl:
                        deliverable.pocUrl || "",

                    benefits:
                        deliverable.benefits || "",

                    stages:
                        deliverable.stages || [],

                    isMilestone:
                        deliverable.isMilestone || false,

                    startDateTime:
                        deliverable.startDateTime,

                    endDateTime:
                        deliverable.endDateTime,

                    expectedDate:
                        deliverable.expectedDate,

                    ownerName:
                        deliverable.ownerName || "",

                    ownerEmail:
                        deliverable.ownerEmail || "",

                    deliverableEvent:
                        deliverable.deliverableEvent,

                    isOwner:
                        deliverable.isOwner

                })
            );


        console.log(
            `Loaded ${pocData.length} deliverables from LabPortal.`
        );

        console.log(
            "LabPortal response:",
            data
        );


    } catch (error) {

        console.error(
            "Error loading deliverables:",
            error
        );

        pocData = [];

    }

}


/* =========================================================
   HELPERS
========================================================= */


/*
    Convert status text into a CSS-safe class.
*/

function statusClassFor(status) {

    const normalized =
        String(status || "")
            .trim()
            .toLowerCase();

    switch (normalized) {

        case "completed":
        case "complete":
            return "complete";

        case "in progress":
        case "progress":
        case "in-progress":
            return "progress";

        case "on hold":
        case "on-hold":
            return "blocked";

        case "review":
            return "review";

        case "not started":
        case "planning":
        default:
            return "planning";

    }

}


/*
    Get display-friendly status text.
*/

function displayStatus(status) {

    if (!status) {

        return "Planning";

    }

    return String(status);

}


/*
    Escape HTML.
*/

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/*
    Escape attribute values.
*/

function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   SHARED POC URL
========================================================= */

/*
    Supports old shared URLs like:

    index.html?poc=123

    Redirects them to:

    poc.html?id=123
*/

function openSharedPoC() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const pocId =
        params.get("poc");


    if (!pocId) {

        return;

    }


    window.location.href =
        `poc.html?id=${encodeURIComponent(pocId)}`;

}


/* =========================================================
   RENDER POC CARDS
========================================================= */

function renderPoCs(data) {

    if (!pocGrid) {

        return;

    }


    /*
        Clear existing cards.
    */

    pocGrid.innerHTML = "";


    /*
        Update count.
    */

    if (pocCount) {

        pocCount.textContent =
            `${data.length} ${
                data.length === 1
                    ? "PoC"
                    : "PoCs"
            }`;

    }


    /*
        Empty state.
    */

    if (data.length === 0) {

        if (emptyState) {

            emptyState.hidden = false;

        }

        return;

    }


    if (emptyState) {

        emptyState.hidden = true;

    }


    /*
        Create cards.
    */

    data.forEach(poc => {

        const card =
            document.createElement("article");


        const status =
            displayStatus(poc.status);

        const statusClass =
            statusClassFor(status);


        card.className =
            `poc-card status-${statusClass}`;


        /*
            Make entire card clickable.
        */

        card.setAttribute(
            "role",
            "link"
        );

        card.setAttribute(
            "tabindex",
            "0"
        );


        card.addEventListener(
            "click",
            () => {

                window.location.href =
                    `poc.html?id=${encodeURIComponent(poc.id)}`;

            }
        );


        /*
            Keyboard accessibility.
        */

        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    window.location.href =
                        `poc.html?id=${encodeURIComponent(poc.id)}`;

                }

            }
        );


        /* =================================================
           TECHNOLOGIES
        ================================================= */

        const technologies =
            Array.isArray(poc.technologies)
                ? poc.technologies
                : [];


        const technologyHTML =
            technologies
                .map(
                    technology => {

                        return `
                            <span class="tech-badge">
                                ${escapeHTML(technology)}
                            </span>
                        `;

                    }
                )
                .join("");


        /* =================================================
           TEAM MEMBERS
        ================================================= */

        /*
            Get:

            1. Specific team for PoC if configured
            2. API team members
            3. Random temporary team

            IMPORTANT:
            PoC ID 7 has a specific team,
            so it will ALWAYS get exactly 2 people.
        */

        const team =
            getTeamForPoC(poc);


        const maxVisibleMembers = 4;


        const visibleTeam =
            team.slice(
                0,
                maxVisibleMembers
            );


        const remainingMembers =
            Math.max(
                team.length -
                maxVisibleMembers,
                0
            );


        /*
            Render team avatars.
        */

        const teamHTML =
            visibleTeam
                .map(
                    member => {

                        const fullName =
                            `${member.firstName || ""} ${member.lastName || ""}`
                                .trim();


                        const name =
                            fullName ||
                            member.name ||
                            member.fullName ||
                            member.displayName ||
                            "Team Member";


                        const avatar =
                            member.pictureUrl ||
                            member.avatar ||
                            member.avatarUrl ||
                            member.photo ||
                            member.photoUrl ||
                            "assets/tmp-avatar.jpg";


                        return `
                            <div
                                class="team-avatar"
                                title="${escapeAttribute(name)}"
                            >

                                <img
                                    src="${escapeAttribute(avatar)}"
                                    alt="${escapeAttribute(name)}"
                                    loading="lazy"
                                    onerror="
                                        this.onerror=null;
                                        this.src='assets/tmp-avatar.jpg';
                                    "
                                >

                            </div>
                        `;

                    }
                )
                .join("");


        /*
            +N indicator for additional members.
        */

        const remainingHTML =
            remainingMembers > 0
                ? `
                    <div
                        class="team-avatar team-avatar-more"
                        title="${remainingMembers} more ${
                            remainingMembers === 1
                                ? "member"
                                : "members"
                        }"
                    >
                        +${remainingMembers}
                    </div>
                `
                : "";


        /* =================================================
           AGENCY
        ================================================= */

        const agency =
            poc.agency ||
            "Digital Lab";


        /* =================================================
           CARD HTML
        ================================================= */

        card.innerHTML = `

            <div class="poc-status-line"></div>

            <div class="poc-card-content">

                <div class="poc-card-top">

                    <span class="poc-agency">
                        ${escapeHTML(agency)}
                    </span>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${escapeHTML(status)}
                    </span>

                </div>


                <h3>
                    ${escapeHTML(poc.title)}
                </h3>


                <p class="poc-card-description">
                    ${escapeHTML(
                        poc.description || ""
                    )}
                </p>


                <div class="poc-technologies">
                    ${technologyHTML}
                </div>

            </div>


            <div class="poc-card-footer">

                <div class="team-avatars">

                    ${teamHTML}
                    ${remainingHTML}

                </div>


                <span class="view-details-button">
                    View Details →
                </span>

            </div>

        `;


        pocGrid.appendChild(card);

    });

}


/* =========================================================
   POPULATE FILTERS
========================================================= */

function populateFilters() {

    const agencies =
        new Set();

    const technologies =
        new Set();


    pocData.forEach(
        poc => {

            if (poc.agency) {

                agencies.add(
                    poc.agency
                );

            }


            if (
                Array.isArray(
                    poc.technologies
                )
            ) {

                poc.technologies.forEach(
                    technology => {

                        technologies.add(
                            technology
                        );

                    }
                );

            }

        }
    );


    /* =====================================================
       AGENCIES
    ===================================================== */

    if (agencyFilter) {

        agencyFilter.innerHTML = `

            <option value="all">
                All Agencies
            </option>

        `;


        [...agencies]
            .sort()
            .forEach(
                agency => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        agency;

                    option.textContent =
                        agency;

                    agencyFilter.appendChild(
                        option
                    );

                }
            );

    }


    /* =====================================================
       TECHNOLOGIES
    ===================================================== */

    if (!technologyMenu) {

        return;

    }


    technologyMenu.innerHTML = "";


    [...technologies]
        .sort()
        .forEach(
            technology => {

                const label =
                    document.createElement(
                        "label"
                    );

                label.className =
                    "multi-select-option";


                label.innerHTML = `

                    <input
                        type="checkbox"
                        value="${escapeAttribute(
                            technology
                        )}"
                    >

                    <span>
                        ${escapeHTML(
                            technology
                        )}
                    </span>

                `;


                technologyMenu.appendChild(
                    label
                );

            }
        );


    /* =====================================================
       CHECKBOX LISTENERS
    ===================================================== */

    const checkboxes =
        technologyMenu.querySelectorAll(
            'input[type="checkbox"]'
        );


    checkboxes.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    updateSelectedTechnologies();
                    filterPoCs();

                }
            );

        }
    );

}


/* =========================================================
   UPDATE TECHNOLOGY SELECTION
========================================================= */

function updateSelectedTechnologies() {

    if (!technologyMenu) {

        return;

    }


    const checkboxes =
        technologyMenu.querySelectorAll(
            'input[type="checkbox"]:checked'
        );


    selectedTechnologies =
        Array.from(checkboxes)
            .map(
                checkbox =>
                    checkbox.value
            );


    if (!technologySelectedText) {

        return;

    }


    /*
        Nothing selected.
    */

    if (
        selectedTechnologies.length === 0
    ) {

        technologySelectedText.textContent =
            "All Technologies";

        return;

    }


    /*
        One selected.
    */

    if (
        selectedTechnologies.length === 1
    ) {

        technologySelectedText.textContent =
            selectedTechnologies[0];

        return;

    }


    /*
        Multiple selected.
    */

    technologySelectedText.textContent =
        `${selectedTechnologies.length} technologies selected`;

}


/* =========================================================
   FILTER POCS
========================================================= */

function filterPoCs() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const agency =
        agencyFilter
            ? agencyFilter.value
            : "all";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    const technologies =
        selectedTechnologies;


    const filteredPoCs =
        pocData.filter(
            poc => {

                const title =
                    String(
                        poc.title || ""
                    )
                        .toLowerCase();


                const description =
                    String(
                        poc.description || ""
                    )
                        .toLowerCase();


                const pocAgency =
                    String(
                        poc.agency || ""
                    )
                        .toLowerCase();


                /* =========================================
                   SEARCH
                ========================================= */

                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    description.includes(search) ||
                    pocAgency.includes(search);


                /* =========================================
                   AGENCY
                ========================================= */

                const matchesAgency =
                    agency === "all" ||
                    poc.agency === agency;


                /* =========================================
                   TECHNOLOGY
                   Matches ANY selected technology.
                ========================================= */

                const matchesTechnology =
                    technologies.length === 0 ||
                    (
                        Array.isArray(
                            poc.technologies
                        ) &&
                        technologies.some(
                            technology =>
                                poc.technologies.includes(
                                    technology
                                )
                        )
                    );


                /* =========================================
                   STATUS
                ========================================= */

                const matchesStatus =
                    status === "all" ||
                    statusClassFor(
                        poc.status
                    ) === statusClassFor(
                        status
                    );


                return (
                    matchesSearch &&
                    matchesAgency &&
                    matchesTechnology &&
                    matchesStatus
                );

            }
        );


    renderPoCs(
        filteredPoCs
    );

}


/* =========================================================
   FILTER EVENTS
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterPoCs
    );

}


if (agencyFilter) {

    agencyFilter.addEventListener(
        "change",
        filterPoCs
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterPoCs
    );

}


/* =========================================================
   REFRESH / RESET FILTERS
========================================================= */

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        () => {

            /*
                Clear search.
            */

            if (searchInput) {

                searchInput.value = "";

            }


            /*
                Reset agency.
            */

            if (agencyFilter) {

                agencyFilter.value =
                    "all";

            }


            /*
                Reset technologies.
            */

            selectedTechnologies = [];


            if (technologyMenu) {

                const checkboxes =
                    technologyMenu.querySelectorAll(
                        'input[type="checkbox"]'
                    );


                checkboxes.forEach(
                    checkbox => {

                        checkbox.checked =
                            false;

                    }
                );

            }


            if (
                technologySelectedText
            ) {

                technologySelectedText.textContent =
                    "All Technologies";

            }


            /*
                Reset status.
            */

            if (statusFilter) {

                statusFilter.value =
                    "all";

            }


            /*
                Re-render all PoCs.

                PoC ID 7 will STILL use its
                fixed 2-person team.

                Other PoCs without a fixed/API
                team may receive new random teams.
            */

            renderPoCs(
                pocData
            );

        }
    );

}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

async function initializeApp() {

    try {

        await loadPoCData();

        populateFilters();

        renderPoCs(
            pocData
        );


        /*
            Support old shared URLs:

            index.html?poc=123
        */

        openSharedPoC();


    } catch (error) {

        console.error(
            "Failed to initialize application:",
            error
        );

        renderPoCs([]);

    }

}


/* =========================================================
   START APPLICATION
========================================================= */

initializeApp();