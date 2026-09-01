/* =========================================================
   POC DATA
========================================================= */

let pocData = [];

let selectedAgencies = [];
let selectedTechnologies = [];
let selectedStatuses = [];


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

    const shuffled = [...temporaryTeamMembers];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];

    }

    const count =
        Math.floor(
            Math.random() * 4
        ) + 1;

    return shuffled.slice(
        0,
        count
    );

}


/* =========================================================
   GET TEAM FOR POC
========================================================= */

function getTeamForPoC(poc) {

    const pocId =
        Number(
            poc?.id
        );


    /* -----------------------------------------------------
       1. POC-SPECIFIC TEAM
    ----------------------------------------------------- */

    const specificTeam =
        pocSpecificTeams[pocId];

    if (
        Array.isArray(specificTeam) &&
        specificTeam.length > 0
    ) {

        return specificTeam;

    }


    /* -----------------------------------------------------
       2. API TEAM MEMBERS
    ----------------------------------------------------- */

    const team =
        poc?.team;

    if (
        Array.isArray(team) &&
        team.length > 0
    ) {

        const usableMembers =
            team.filter(
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

                    return (
                        hasName ||
                        hasPicture
                    );

                }
            );


        if (
            usableMembers.length > 0
        ) {

            return usableMembers;

        }

    }


    /* -----------------------------------------------------
       3. RANDOM TEMPORARY TEAM
    ----------------------------------------------------- */

    return getRandomDummyTeam();

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const pocGrid =
    document.getElementById(
        "poc-grid"
    );

const pocCount =
    document.getElementById(
        "poc-count"
    );

const emptyState =
    document.getElementById(
        "empty-state"
    );

const searchInput =
    document.getElementById(
        "search-input"
    );

const refreshButton =
    document.getElementById(
        "refresh-button"
    );


/* =========================================================
   FILTER CONFIGURATION
========================================================= */

const filterConfigs = {

    agency: {

        container:
            document.getElementById(
                "agency-multi-select"
            ),

        trigger:
            document.getElementById(
                "agency-trigger"
            ),

        menu:
            document.getElementById(
                "agency-menu"
            ),

        selectedText:
            document.getElementById(
                "agency-selected-text"
            ),

        allText:
            "All Agencies",

        selectedLabel:
            "Agencies"

    },


    technology: {

        container:
            document.getElementById(
                "technology-multi-select"
            ),

        trigger:
            document.getElementById(
                "technology-trigger"
            ),

        menu:
            document.getElementById(
                "technology-menu"
            ),

        selectedText:
            document.getElementById(
                "technology-selected-text"
            ),

        allText:
            "All Technologies",

        selectedLabel:
            "Technologies"

    },


    status: {

        container:
            document.getElementById(
                "status-multi-select"
            ),

        trigger:
            document.getElementById(
                "status-trigger"
            ),

        menu:
            document.getElementById(
                "status-menu"
            ),

        selectedText:
            document.getElementById(
                "status-selected-text"
            ),

        allText:
            "All Statuses",

        selectedLabel:
            "Statuses"

    }

};


/* =========================================================
   BASIC DOM VALIDATION
========================================================= */

if (!pocGrid) {

    console.error(
        "Missing #poc-grid element."
    );

}


/* =========================================================
   SETUP MULTI-SELECT DROPDOWNS
========================================================= */

function setupMultiSelect(
    config
) {

    if (
        !config ||
        !config.container ||
        !config.trigger ||
        !config.menu
    ) {

        return;

    }


    config.trigger.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const isOpen =
                !config.menu.hidden;


            /*
                Close every other dropdown.
            */

            Object.values(
                filterConfigs
            ).forEach(
                otherConfig => {

                    if (
                        otherConfig !== config &&
                        otherConfig.menu &&
                        otherConfig.container
                    ) {

                        otherConfig.menu.hidden =
                            true;

                        otherConfig.container.classList.remove(
                            "open"
                        );

                    }

                }
            );


            /*
                Toggle current dropdown.
            */

            config.menu.hidden =
                isOpen;

            config.container.classList.toggle(
                "open",
                !isOpen
            );

        }
    );

}


/* =========================================================
   INITIALIZE ALL MULTI-SELECTS
========================================================= */

Object.values(
    filterConfigs
).forEach(
    config => {

        setupMultiSelect(
            config
        );

    }
);


/* =========================================================
   CLOSE FILTER DROPDOWNS
========================================================= */

document.addEventListener(
    "click",
    event => {

        Object.values(
            filterConfigs
        ).forEach(
            config => {

                if (
                    !config.container ||
                    !config.menu
                ) {

                    return;

                }


                if (
                    !config.container.contains(
                        event.target
                    )
                ) {

                    config.menu.hidden =
                        true;

                    config.container.classList.remove(
                        "open"
                    );

                }

            }
        );

    }
);


/* =========================================================
   DELIVERABLE STATUS MAPPING
========================================================= */

function displayDeliverableStatus(
    status
) {

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


/* =========================================================
   LOAD POC DATA
========================================================= */

async function loadPoCData() {

    try {

        const response =
            await fetch(
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
            !Array.isArray(
                data.items
            )
        ) {

            throw new Error(
                "Invalid deliverables API response. Expected an items array."
            );

        }


        /*
            Convert LabPortal API data
            into the UI format.
        */

        pocData =
            data.items.map(
                deliverable => ({

                    id:
                        deliverable.id,

                    code:
                        deliverable.code ||
                        "",

                    title:
                        deliverable.title ||
                        "",

                    description:
                        deliverable.description ||
                        "",

                    status:
                        displayDeliverableStatus(
                            deliverable.deliverableStatus
                        ),

                    agency:
                        deliverable.department ||
                        "Digital Lab",

                    technologies:
                        deliverable.technology
                            ? [
                                deliverable.technology
                            ]
                            : [],

                    team:
                        Array.isArray(
                            deliverable.teamMembers
                        )
                            ? deliverable.teamMembers
                            : [],

                    imageUrl:
                        deliverable.imageUrl ||
                        "",

                    demoVideoUrl:
                        deliverable.demoVideoUrl ||
                        "",

                    pocUrl:
                        deliverable.pocUrl ||
                        "",

                    benefits:
                        deliverable.benefits ||
                        "",

                    stages:
                        deliverable.stages ||
                        [],

                    isMilestone:
                        deliverable.isMilestone ||
                        false,

                    startDateTime:
                        deliverable.startDateTime,

                    endDateTime:
                        deliverable.endDateTime,

                    expectedDate:
                        deliverable.expectedDate,

                    ownerName:
                        deliverable.ownerName ||
                        "",

                    ownerEmail:
                        deliverable.ownerEmail ||
                        "",

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
   STATUS CLASS
========================================================= */

function statusClassFor(
    status
) {

    const normalized =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    switch (
        normalized
    ) {

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


/* =========================================================
   DISPLAY STATUS
========================================================= */

function displayStatus(
    status
) {

    if (!status) {

        return "Planning";

    }


    return String(
        status
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================================
   ESCAPE ATTRIBUTES
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   SHARED POC URL
========================================================= */

function openSharedPoC() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const pocId =
        params.get(
            "poc"
        );


    if (!pocId) {

        return;

    }


    window.location.href =
        `poc.html?id=${encodeURIComponent(pocId)}`;

}


/* =========================================================
   RENDER POC CARDS
========================================================= */

function renderPoCs(
    data
) {

    if (!pocGrid) {

        return;

    }


    /*
        Clear existing cards.
    */

    pocGrid.innerHTML =
        "";


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

    if (
        data.length === 0
    ) {

        if (emptyState) {

            emptyState.hidden =
                false;

        }

        return;

    }


    if (emptyState) {

        emptyState.hidden =
            true;

    }


    /*
        Create cards.
    */

    data.forEach(
        poc => {

            const card =
                document.createElement(
                    "article"
                );


            const status =
                displayStatus(
                    poc.status
                );


            const statusClass =
                statusClassFor(
                    status
                );


            card.className =
                `poc-card status-${statusClass}`;


            /*
                Entire card clickable.
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
                Array.isArray(
                    poc.technologies
                )
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

            const team =
                getTeamForPoC(
                    poc
                );


            const maxVisibleMembers =
                4;


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
                Additional team member indicator.
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
                        ${escapeHTML(
                            poc.title
                        )}
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
                        View Details
                    </span>

                </div>

            `;


            pocGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   POPULATE FILTERS
========================================================= */

function populateFilters() {

    const agencies =
        new Set();

    const technologies =
        new Set();

    const statuses =
        new Set();


    pocData.forEach(
        poc => {

            /* -------------------------------------------------
               AGENCY
            ------------------------------------------------- */

            if (poc.agency) {

                agencies.add(
                    poc.agency
                );

            }


            /* -------------------------------------------------
               TECHNOLOGIES
            ------------------------------------------------- */

            if (
                Array.isArray(
                    poc.technologies
                )
            ) {

                poc.technologies.forEach(
                    technology => {

                        if (technology) {

                            technologies.add(
                                technology
                            );

                        }

                    }
                );

            }


            /* -------------------------------------------------
               STATUS
            ------------------------------------------------- */

            if (poc.status) {

                statuses.add(
                    displayStatus(
                        poc.status
                    )
                );

            }

        }
    );


    /*
        Render Agency options.
    */

    renderFilterOptions(
        filterConfigs.agency,
        [...agencies].sort(),
        "agency"
    );


    /*
        Render Technology options.
    */

    renderFilterOptions(
        filterConfigs.technology,
        [...technologies].sort(),
        "technology"
    );


    /*
        Render Status options.
    */

    renderFilterOptions(
        filterConfigs.status,
        [...statuses].sort(),
        "status"
    );

}


/* =========================================================
   RENDER FILTER OPTIONS
========================================================= */

function renderFilterOptions(
    config,
    options,
    type
) {

    if (
        !config ||
        !config.menu
    ) {

        return;

    }


    /*
        Clear existing options.
    */

    config.menu.innerHTML =
        "";


    /* =====================================================
       SELECT ALL / CLEAR ALL
    ===================================================== */

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "filter-menu-actions";


    const toggleAllButton =
        document.createElement(
            "button"
        );


    toggleAllButton.type =
        "button";


    toggleAllButton.className =
        "toggle-all-button";


    toggleAllButton.textContent =
        "Select All";


    actions.appendChild(
        toggleAllButton
    );


    config.menu.appendChild(
        actions
    );


    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    options.forEach(
        option => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "multi-select-option";


            label.innerHTML = `

                <input
                    type="checkbox"
                    value="${escapeAttribute(option)}"
                >

                <span>
                    ${escapeHTML(option)}
                </span>

            `;


            const checkbox =
                label.querySelector(
                    "input"
                );


            checkbox.addEventListener(
                "change",
                () => {

                    updateFilterSelection(
                        type
                    );


                    updateToggleAllButton(
                        config
                    );


                    filterPoCs();

                }
            );


            config.menu.appendChild(
                label
            );

        }
    );


    /* =====================================================
       SELECT ALL / CLEAR ALL EVENT
    ===================================================== */

    toggleAllButton.addEventListener(
        "click",
        event => {

            /*
                Prevent dropdown from closing.
            */

            event.stopPropagation();


            const checkboxes =
                config.menu.querySelectorAll(
                    '.multi-select-option input[type="checkbox"]'
                );


            if (
                checkboxes.length === 0
            ) {

                return;

            }


            const allSelected =
                [...checkboxes].every(
                    checkbox =>
                        checkbox.checked
                );


            checkboxes.forEach(
                checkbox => {

                    checkbox.checked =
                        !allSelected;

                }
            );


            updateFilterSelection(
                type
            );


            updateToggleAllButton(
                config
            );


            filterPoCs();

        }
    );


    /*
        Make sure initial button state
        is correct.
    */

    updateToggleAllButton(
        config
    );

}


/* =========================================================
   UPDATE FILTER SELECTION
========================================================= */

function updateFilterSelection(
    type
) {

    const config =
        filterConfigs[type];


    if (
        !config ||
        !config.menu
    ) {

        return;

    }


    const selected =
        Array.from(
            config.menu.querySelectorAll(
                '.multi-select-option input[type="checkbox"]:checked'
            )
        )
        .map(
            checkbox =>
                checkbox.value
        );


    /* -----------------------------------------------------
       SAVE SELECTION
    ----------------------------------------------------- */

    if (
        type === "agency"
    ) {

        selectedAgencies =
            selected;

    }


    if (
        type === "technology"
    ) {

        selectedTechnologies =
            selected;

    }


    if (
        type === "status"
    ) {

        selectedStatuses =
            selected;

    }


    /* -----------------------------------------------------
       UPDATE TRIGGER TEXT
    ----------------------------------------------------- */

    if (
        !config.selectedText
    ) {

        return;

    }


    if (
        selected.length === 0
    ) {

        config.selectedText.textContent =
            config.allText;

        return;

    }


    if (
        selected.length === 1
    ) {

        config.selectedText.textContent =
            selected[0];

        return;

    }


    config.selectedText.textContent =
        `${selected.length} ${config.selectedLabel} selected`;

}


/* =========================================================
   UPDATE SELECT ALL BUTTON
========================================================= */

function updateToggleAllButton(
    config
) {

    if (
        !config ||
        !config.menu
    ) {

        return;

    }


    const checkboxes =
        config.menu.querySelectorAll(
            '.multi-select-option input[type="checkbox"]'
        );


    const button =
        config.menu.querySelector(
            ".toggle-all-button"
        );


    if (
        !button
    ) {

        return;

    }


    if (
        checkboxes.length === 0
    ) {

        button.textContent =
            "Select All";

        return;

    }


    const allSelected =
        [...checkboxes].every(
            checkbox =>
                checkbox.checked
        );


    button.textContent =
        allSelected
            ? "Clear All"
            : "Select All";

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


    const filteredPoCs =
        pocData.filter(
            poc => {

                /* -------------------------------------------------
                   BASIC DATA
                ------------------------------------------------- */

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
                    );


                const pocStatus =
                    displayStatus(
                        poc.status
                    );


                /* -------------------------------------------------
                   SEARCH
                ------------------------------------------------- */

                const matchesSearch =
                    !search ||

                    title.includes(
                        search
                    ) ||

                    description.includes(
                        search
                    ) ||

                    pocAgency
                        .toLowerCase()
                        .includes(
                            search
                        );


                /* -------------------------------------------------
                   AGENCY
                   ANY selected agency.
                ------------------------------------------------- */

                const matchesAgency =
                    selectedAgencies.length === 0 ||

                    selectedAgencies.includes(
                        pocAgency
                    );


                /* -------------------------------------------------
                   TECHNOLOGY
                   ANY selected technology.
                ------------------------------------------------- */

                const matchesTechnology =
                    selectedTechnologies.length === 0 ||

                    (
                        Array.isArray(
                            poc.technologies
                        ) &&

                        selectedTechnologies.some(
                            technology =>
                                poc.technologies.includes(
                                    technology
                                )
                        )
                    );


                /* -------------------------------------------------
                   STATUS
                   ANY selected status.
                ------------------------------------------------- */

                const matchesStatus =
                    selectedStatuses.length === 0 ||

                    selectedStatuses.some(
                        selectedStatus =>

                            statusClassFor(
                                selectedStatus
                            ) ===

                            statusClassFor(
                                pocStatus
                            )
                    );


                return (

                    matchesSearch &&

                    matchesAgency &&

                    matchesTechnology &&

                    matchesStatus

                );

            }
        );


    updateKPIStats(filteredPoCs);

    updateActiveFilterChips();

    renderPoCs(
        filteredPoCs
    );

}


/* =========================================================
   SEARCH EVENT
========================================================= */

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        filterPoCs
    );

}


/* =========================================================
   REFRESH / RESET FILTERS
========================================================= */

if (
    refreshButton
) {

    refreshButton.addEventListener(
        "click",
        () => {

            /* -------------------------------------------------
               CLEAR SEARCH
            ------------------------------------------------- */

            if (
                searchInput
            ) {

                searchInput.value =
                    "";

            }


            /* -------------------------------------------------
               RESET ALL SELECTION ARRAYS
            ------------------------------------------------- */

            selectedAgencies = [];

            selectedTechnologies = [];

            selectedStatuses = [];


            /* -------------------------------------------------
               RESET ALL CHECKBOXES
            ------------------------------------------------- */

            Object.values(
                filterConfigs
            ).forEach(
                config => {

                    if (
                        !config.menu
                    ) {

                        return;

                    }


                    const checkboxes =
                        config.menu.querySelectorAll(
                            '.multi-select-option input[type="checkbox"]'
                        );


                    checkboxes.forEach(
                        checkbox => {

                            checkbox.checked =
                                false;

                        }
                    );


                    /*
                        Reset trigger text.
                    */

                    if (
                        config.selectedText
                    ) {

                        config.selectedText.textContent =
                            config.allText;

                    }


                    /*
                        Reset Select All button.
                    */

                    updateToggleAllButton(
                        config
                    );


                    /*
                        Close dropdown.
                    */

                    config.menu.hidden =
                        true;


                    if (
                        config.container
                    ) {

                        config.container.classList.remove(
                            "open"
                        );

                    }

                }
            );


            /*
                Render all PoCs.
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

/* =========================================================
   KPI STAT BAND
========================================================= */

function updateKPIStats(data) {

    const totalPoCs = document.getElementById("kpi-total-pocs");
    const totalAgencies = document.getElementById("kpi-total-agencies");
    const totalTech = document.getElementById("kpi-total-tech");
    const completedPoCs = document.getElementById("kpi-completed-pocs");

    if (!data || data.length === 0) {
        if (totalPoCs)    totalPoCs.textContent    = "0";
        if (totalAgencies) totalAgencies.textContent = "0";
        if (totalTech)    totalTech.textContent    = "0";
        if (completedPoCs) completedPoCs.textContent = "0";
        return;
    }

    const agencies = new Set();
    const techs    = new Set();
    let   completed = 0;

    data.forEach(poc => {

        if (poc.agency) agencies.add(poc.agency);

        if (Array.isArray(poc.technologies)) {
            poc.technologies.forEach(t => techs.add(t));
        }

        const cls = statusClassFor(displayStatus(poc.status));
        if (cls === "complete") completed++;
    });

    if (totalPoCs)     totalPoCs.textContent     = data.length;
    if (totalAgencies) totalAgencies.textContent  = agencies.size;
    if (totalTech)     totalTech.textContent      = techs.size;
    if (completedPoCs) completedPoCs.textContent  = completed;
}


/* =========================================================
   ACTIVE FILTER CHIPS
========================================================= */

function updateActiveFilterChips() {

    const row      = document.getElementById("active-filters-row");
    const container = document.getElementById("active-chips-container");

    if (!row || !container) return;

    container.innerHTML = "";

    const allSelected = [
        ...selectedAgencies.map(v => ({ type: "agency",     label: v })),
        ...selectedTechnologies.map(v => ({ type: "technology", label: v })),
        ...selectedStatuses.map(v => ({ type: "status",    label: v }))
    ];

    if (allSelected.length === 0) {
        row.hidden = true;
        return;
    }

    row.hidden = false;

    allSelected.forEach(({ type, label }) => {

        const chip = document.createElement("span");
        chip.className = "active-chip";
        chip.innerHTML = `
            <span>${escapeHTML(label)}</span>
            <button
                type="button"
                class="chip-remove"
                aria-label="Remove ${escapeAttribute(label)} filter"
            >&times;</button>
        `;

        chip.querySelector(".chip-remove").addEventListener("click", () => {

            const config = filterConfigs[type];
            if (!config || !config.menu) return;

            const checkbox = [...config.menu.querySelectorAll("input[type=checkbox]")]
                .find(cb => cb.value === label);

            if (checkbox) {
                checkbox.checked = false;
            }

            updateFilterSelection(type);
            updateToggleAllButton(config);
            filterPoCs();
        });

        container.appendChild(chip);
    });
}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

async function initializeApp() {

    try {

        await loadPoCData();


        /*
            Build all filter options
            from API data.
        */

        populateFilters();


        /*
            Populate KPI stat band.
        */

        updateKPIStats(pocData);


        /*
            Display all PoCs.
        */

        renderPoCs(
            pocData
        );


        /*
            Support old shared URLs:

            index.html?poc=123
        */

        openSharedPoC();


    } catch (
        error
    ) {

        console.error(
            "Failed to initialize application:",
            error
        );


        updateKPIStats([]);
        renderPoCs([]);

    }

}

/* =========================================================
   AI CHATBOT
========================================================= */

const chatbot =
    document.getElementById("chatbot");

const chatbotToggle =
    document.getElementById("chatbot-toggle");

const chatbotClose =
    document.getElementById("chatbot-close");

const chatbotMessages =
    document.getElementById("chatbot-messages");

const chatbotForm =
    document.getElementById("chatbot-form");

const chatbotInput =
    document.getElementById("chatbot-input");

const chatbotSend =
    document.getElementById("chatbot-send");

const chatSuggestions =
    document.querySelectorAll(
        ".chat-suggestion"
    );


let chatbotHistory = [];


/* =========================================================
   OPEN CHATBOT
========================================================= */

function openChatbot() {

    if (!chatbot) {
        return;
    }

    chatbot.hidden = false;

    requestAnimationFrame(() => {

        chatbot.classList.add("visible");

    });

    if (chatbotInput) {

        setTimeout(() => {

            chatbotInput.focus();

        }, 100);

    }

}


/* =========================================================
   CLOSE CHATBOT
========================================================= */

function closeChatbot() {

    if (!chatbot) {
        return;
    }

    chatbot.classList.remove("visible");

    setTimeout(() => {

        chatbot.hidden = true;

    }, 200);

}


/* =========================================================
   TOGGLE
========================================================= */

if (chatbotToggle) {

    chatbotToggle.addEventListener(
        "click",
        () => {

            if (chatbot.hidden) {

                openChatbot();

            } else {

                closeChatbot();

            }

        }
    );

}


if (chatbotClose) {

    chatbotClose.addEventListener(
        "click",
        closeChatbot
    );

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addChatMessage(
    content,
    role
) {

    if (!chatbotMessages) {
        return;
    }


    const message =
        document.createElement("div");

    message.className =
        `chatbot-message ${role}`;


    const avatar =
        document.createElement("div");

    avatar.className =
        role === "assistant"
            ? "message-avatar"
            : "message-avatar user";


    avatar.textContent =
        role === "assistant"
            ? "✦"
            : "You";


    const messageContent =
        document.createElement("div");

    messageContent.className =
        "message-content";


    const paragraph =
        document.createElement("p");


    /*
        Basic formatting.

        Convert newlines to <br>.
    */

    paragraph.innerHTML =
        escapeHTML(content)
            .replace(
                /\n/g,
                "<br>"
            );


    messageContent.appendChild(
        paragraph
    );


    message.appendChild(
        avatar
    );

    message.appendChild(
        messageContent
    );


    chatbotMessages.appendChild(
        message
    );


    scrollChatToBottom();

}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTypingIndicator() {

    if (!chatbotMessages) {
        return;
    }


    const typing =
        document.createElement("div");

    typing.id =
        "chatbot-typing";

    typing.className =
        "chatbot-message assistant";


    typing.innerHTML = `

        <div class="message-avatar">
            ✦
        </div>

        <div class="message-content typing-content">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    chatbotMessages.appendChild(
        typing
    );


    scrollChatToBottom();

}


function removeTypingIndicator() {

    const typing =
        document.getElementById(
            "chatbot-typing"
        );

    if (typing) {

        typing.remove();

    }

}


/* =========================================================
   SCROLL
========================================================= */

function scrollChatToBottom() {

    if (!chatbotMessages) {
        return;
    }

    chatbotMessages.scrollTop =
        chatbotMessages.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendChatMessage(
    message
) {

    message =
        message.trim();


    if (!message) {
        return;
    }


    /*
        Show user message.
    */

    addChatMessage(
        message,
        "user"
    );


    /*
        Disable input while waiting.
    */

    if (chatbotInput) {

        chatbotInput.disabled =
            true;

    }


    if (chatbotSend) {

        chatbotSend.disabled =
            true;

    }


    /*
        Typing indicator.
    */

    showTypingIndicator();


    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        history:
                            chatbotHistory

                    })

                }
            );


        if (!response.ok) {

            const error =
                await response.json()
                    .catch(
                        () => null
                    );

            throw new Error(
                error?.detail ||
                `Request failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        const answer =
            data.response ||
            "I couldn't find an answer.";


        /*
            Remove typing.
        */

        removeTypingIndicator();


        /*
            Add assistant response.
        */

        addChatMessage(
            answer,
            "assistant"
        );


        /*
            Save history.

            IMPORTANT:
            Only save the actual conversation,
            not the internal PoC context.
        */

        chatbotHistory.push(
            {
                role: "user",
                content: message
            }
        );


        chatbotHistory.push(
            {
                role: "assistant",
                content: answer
            }
        );


        /*
            Keep history manageable.
        */

        if (
            chatbotHistory.length > 12
        ) {

            chatbotHistory =
                chatbotHistory.slice(-12);

        }


    } catch (error) {

        console.error(
            "Chatbot error:",
            error
        );


        removeTypingIndicator();


        addChatMessage(
            "Sorry, I couldn't connect to the PoC Assistant right now.",
            "assistant"
        );

    }


    /*
        Re-enable input.
    */

    if (chatbotInput) {

        chatbotInput.disabled =
            false;

        chatbotInput.focus();

    }


    if (chatbotSend) {

        chatbotSend.disabled =
            false;

    }

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

if (chatbotForm) {

    chatbotForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!chatbotInput) {
                return;
            }


            const message =
                chatbotInput.value.trim();


            if (!message) {
                return;
            }


            chatbotInput.value = "";


            sendChatMessage(
                message
            );

        }
    );

}


/* =========================================================
   SUGGESTED QUESTIONS
========================================================= */

chatSuggestions.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.textContent.trim();


                if (chatbotInput) {

                    chatbotInput.value =
                        question;

                }


                sendChatMessage(
                    question
                );

            }
        );

    }
);

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

/* =========================================================
   SEARCH KEYBOARD SHORTCUT  (⌘K / Ctrl+K / /)
========================================================= */

document.addEventListener("keydown", event => {

    const tag = (event.target.tagName || "").toUpperCase();
    const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        event.target.isContentEditable;

    const isShortcut =
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !isEditable);

    if (!isShortcut) return;

    event.preventDefault();

    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }

});


/* =========================================================
   SEARCH CLEAR BUTTON
========================================================= */

const searchClearBtn = document.getElementById("search-clear-btn");

if (searchInput && searchClearBtn) {

    searchInput.addEventListener("input", () => {
        searchClearBtn.hidden = searchInput.value.trim() === "";
    });

    searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchClearBtn.hidden = true;
        searchInput.focus();
        filterPoCs();
    });

}


/* =========================================================
   CLEAR ALL FILTERS BUTTON  (in active chips row)
========================================================= */

const clearAllFiltersBtn = document.getElementById("clear-all-filters-btn");

if (clearAllFiltersBtn) {

    clearAllFiltersBtn.addEventListener("click", () => {

        /* Uncheck every checkbox in every filter menu */
        Object.values(filterConfigs).forEach(config => {

            if (!config.menu) return;

            config.menu
                .querySelectorAll("input[type=checkbox]")
                .forEach(cb => { cb.checked = false; });

            updateFilterSelection(
                Object.keys(filterConfigs)
                    .find(k => filterConfigs[k] === config)
            );

            updateToggleAllButton(config);

        });

        filterPoCs();

    });

}


/* =========================================================
   EMPTY STATE CLEAR-FILTERS BUTTON
========================================================= */

const emptyClearBtn = document.getElementById("empty-clear-btn");

if (emptyClearBtn) {

    emptyClearBtn.addEventListener("click", () => {

        /* Reset search */
        if (searchInput) {
            searchInput.value = "";
            if (searchClearBtn) searchClearBtn.hidden = true;
        }

        /* Uncheck every checkbox */
        Object.values(filterConfigs).forEach(config => {

            if (!config.menu) return;

            config.menu
                .querySelectorAll("input[type=checkbox]")
                .forEach(cb => { cb.checked = false; });

            updateFilterSelection(
                Object.keys(filterConfigs)
                    .find(k => filterConfigs[k] === config)
            );

            updateToggleAllButton(config);

        });

        filterPoCs();

    });

}


/* =========================================================
   START APPLICATION
========================================================= */

initializeApp();
