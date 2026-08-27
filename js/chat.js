// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = "http://127.0.0.1:8000";


// ========================================
// DOM ELEMENTS
// ========================================

const pocInfo = document.getElementById(
    "poc-info"
);

const chatTitle = document.getElementById(
    "chat-title"
);

const chatMessages = document.getElementById(
    "chat-messages"
);

const chatForm = document.getElementById(
    "chat-form"
);

const chatInput = document.getElementById(
    "chat-input"
);

const sendButton = document.getElementById(
    "send-button"
);

const sessionStatus = document.getElementById(
    "session-status"
);


// ========================================
// STATE
// ========================================

let currentPoC = null;
let sessionId = null;
let isSending = false;


// ========================================
// HELPERS
// ========================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


function getPoCId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id = params.get("poc");

    return id || null;

}


function generateSessionId() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }

    return (
        "session-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


// ========================================
// LOAD CURRENT POC
// ========================================

async function loadPoCData() {

    const pocId = getPoCId();

    if (!pocId) {

        throw new Error(
            "No PoC specified."
        );

    }


    const response = await fetch(
        `${API_BASE_URL}/api/deliverables/${encodeURIComponent(pocId)}`,
        {
            cache: "no-cache"
        }
    );


    if (!response.ok) {

        if (response.status === 404) {

            throw new Error(
                "The requested PoC could not be found."
            );

        }

        throw new Error(
            `Failed to load PoC: ${response.status}`
        );

    }


    currentPoC =
        await response.json();


    if (!currentPoC) {

        throw new Error(
            "Invalid PoC data."
        );

    }

}


// ========================================
// RENDER POC SIDEBAR
// ========================================

function renderPoCInfo() {

    const poc = currentPoC;

    chatTitle.textContent =
        poc.title || "PoC";


    const technologies =
        Array.isArray(
            poc.technologies
        )
            ? poc.technologies
            : [];


    const benefits =
        Array.isArray(
            poc.benefits
        )
            ? poc.benefits
            : [];


    const status =
        displayDeliverableStatus(
            poc.deliverableStatus
        );


    pocInfo.innerHTML = `

        <div class="poc-info-header">

            <span class="poc-info-label">
                PROOF OF CONCEPT
            </span>

            <h2>
                ${escapeHTML(poc.title || "")}
            </h2>

            <span class="poc-agency">
                ${escapeHTML(
                    poc.agency || "Digital Lab"
                )}
            </span>

        </div>


        <div class="poc-info-section">

            <h3>
                Status
            </h3>

            <span class="poc-status">
                ${escapeHTML(status)}
            </span>

        </div>


        <div class="poc-info-section">

            <h3>
                Description
            </h3>

            <p>
                ${escapeHTML(
                    poc.fullDescription ||
                    poc.description ||
                    ""
                )}
            </p>

        </div>


        ${
            technologies.length > 0
                ? `

                    <div class="poc-info-section">

                        <h3>
                            Technologies
                        </h3>

                        <div class="poc-tech-list">

                            ${
                                technologies
                                    .map(
                                        technology => `

                                            <span>
                                                ${escapeHTML(
                                                    technology
                                                )}
                                            </span>

                                        `
                                    )
                                    .join("")
                            }

                        </div>

                    </div>

                `
                : ""
        }


        ${
            benefits.length > 0
                ? `

                    <div class="poc-info-section">

                        <h3>
                            Benefits
                        </h3>

                        <ul>

                            ${
                                benefits
                                    .map(
                                        benefit => `

                                            <li>
                                                ${escapeHTML(
                                                    benefit
                                                )}
                                            </li>

                                        `
                                    )
                                    .join("")
                            }

                        </ul>

                    </div>

                `
                : ""
        }

    `;

}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(
    role,
    content
) {

    const message =
        document.createElement(
            "div"
        );

    message.className =
        `chat-message ${role}`;


    const label =
        role === "user"
            ? "You"
            : "AI Assistant";


    message.innerHTML = `

        <div class="message-label">
            ${label}
        </div>

        <div class="message-content">
            ${escapeHTML(content)}
        </div>

    `;


    chatMessages.appendChild(
        message
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ========================================
// TYPING INDICATOR
// ========================================

function showTypingIndicator() {

    const typing =
        document.createElement(
            "div"
        );

    typing.id =
        "typing-indicator";

    typing.className =
        "chat-message assistant";


    typing.innerHTML = `

        <div class="message-label">
            AI Assistant
        </div>

        <div class="message-content typing">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    chatMessages.appendChild(
        typing
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


function removeTypingIndicator() {

    const typing =
        document.getElementById(
            "typing-indicator"
        );


    if (typing) {

        typing.remove();

    }

}


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage(
    message
) {

    if (
        !message ||
        isSending
    ) {

        return;

    }


    isSending = true;

    sendButton.disabled =
        true;

    chatInput.disabled =
        true;


    addMessage(
        "user",
        message
    );


    showTypingIndicator();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/ai/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        session_id:
                            sessionId,

                        poc_id:
                            Number(
                                currentPoC.id
                            ),

                        message:
                            message

                    })
                }
            );


        if (!response.ok) {

            const error =
                await response
                    .json()
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


        removeTypingIndicator();


        addMessage(
            "assistant",
            data.message
        );


        sessionId =
            data.session_id;


    }

    catch (error) {

        console.error(
            "Chat error:",
            error
        );


        removeTypingIndicator();


        addMessage(
            "assistant",
            "Sorry, I couldn't connect to the AI service. Please make sure the backend and Ollama are running."
        );


        sessionStatus.textContent =
            "Connection error";


        sessionStatus.classList.add(
            "error"
        );

    }

    finally {

        isSending =
            false;

        sendButton.disabled =
            false;

        chatInput.disabled =
            false;

        chatInput.focus();

    }

}


// ========================================
// FORM SUBMISSION
// ========================================

chatForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const message =
            chatInput.value
                .trim();


        if (!message) {

            return;

        }


        chatInput.value = "";


        await sendMessage(
            message
        );

    }
);


// ========================================
// ENTER TO SEND
// ========================================

chatInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            chatForm.requestSubmit();

        }

    }
);


// ========================================
// STATUS
// ========================================

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


// ========================================
// INITIALIZE
// ========================================

async function initializeChat() {

    try {

        sessionStatus.textContent =
            "Connecting...";


        // Fetch the PoC directly from FastAPI
        await loadPoCData();


        // Render the fetched PoC
        renderPoCInfo();


        // Create a new chat session
        sessionId =
            generateSessionId();


        sessionStatus.textContent =
            "Ready";


        sessionStatus.classList.remove(
            "error"
        );


    }

    catch (error) {

        console.error(
            "Failed to initialize chat:",
            error
        );


        pocInfo.innerHTML = `

            <div class="poc-error">

                <h2>
                    Unable to load PoC
                </h2>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <a href="index.html">
                    Return to PoC Gallery
                </a>

            </div>

        `;


        sessionStatus.textContent =
            "Unavailable";


        sessionStatus.classList.add(
            "error"
        );

    }

}


initializeChat();