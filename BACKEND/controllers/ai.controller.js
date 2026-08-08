const OpenAI = require("openai");
require("dotenv").config();

const {
    findDoctors,
    findHospitals, 
    findBloodDonors,
} = require("../services/aiDatabase.service");


// ============================================================
// OPENAI-COMPATIBLE CLIENT
// ============================================================

const client = new OpenAI({   
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "openai/gpt-oss-20b";


// ============================================================
// CONSTANTS
// ============================================================

const ALLOWED_URGENCY = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];

const ALLOWED_DATABASE_ACTIONS = [
    "FIND_DOCTORS",
    "FIND_HOSPITALS",
    "FIND_BLOOD",
    "NONE",
];

const ALLOWED_LANGUAGES = [
    "English",
    "Nepali",
    "Hindi",
    "Other",
];

const ALLOWED_SCRIPTS = [
    "Latin",
    "Romanized",
    "Devanagari",
];


// ============================================================
// ROUTER PROMPT
// ============================================================

const routerPrompt = `
You are the Sahara AI request router.

Your ONLY job is to analyze the user's CURRENT message.

You MUST NOT answer the healthcare question.

You must determine:

1. The user's language.
2. The user's writing script.
3. Whether Sahara's database is required.
4. If required, which database should be searched.
5. The normalized filters required for that database search.

===========================================================
LANGUAGE DETECTION
===========================================================

Supported languages:

- English
- Nepali
- Hindi
- Other

Supported scripts:

- Latin
- Romanized
- Devanagari

If the user writes Nepali using English/Roman letters:

Example:
"mero pet dukhyo"

Return:

"language": "Nepali"
"script": "Romanized"

If the user writes Nepali using Devanagari:

Example:
"मेरो पेट दुख्यो"

Return:

"language": "Nepali"
"script": "Devanagari"

If the user writes Hindi using English/Roman letters:

Example:
"mere pet mein dard hai"

Return:

"language": "Hindi"
"script": "Romanized"

If the user writes Hindi using Devanagari:

Example:
"मेरे पेट में दर्द है"

Return:

"language": "Hindi"
"script": "Devanagari"

If English is used:

"language": "English"
"script": "Latin"

===========================================================
DATABASE ACTIONS
===========================================================

The possible database actions are:

FIND_DOCTORS
FIND_HOSPITALS
FIND_BLOOD
NONE

===========================================================
WHEN TO USE FIND_DOCTORS
===========================================================

Use FIND_DOCTORS when the user asks for:

- a doctor
- specialist
- cardiologist
- neurologist
- dermatologist
- surgeon
- psychiatrist
- nearby doctor
- doctor recommendation
- doctor consultation
- doctors for a particular medical problem

Normalize common specialties into English.

Examples:

"heart doctor"
→ Cardiology

"muto ko doctor"
→ Cardiology

"मुटुको डाक्टर"
→ Cardiology

"brain doctor"
→ Neurology

"skin doctor"
→ Dermatology

===========================================================
WHEN TO USE FIND_HOSPITALS
===========================================================

Use FIND_HOSPITALS when the user asks for:

- hospitals
- nearby hospital
- emergency hospital
- hospitals in a city
- hospitals for a particular service

Examples:

"Find hospitals near Dharan"

→
{
  "city": "Dharan",
  "emergencyOnly": false
}

"mero najik emergency hospital khojdinu"

→
{
  "emergencyOnly": true
}

===========================================================
WHEN TO USE FIND_BLOOD
===========================================================

Use FIND_BLOOD when the user requests blood donors or blood.

Recognize blood groups:

A+
A-
B+
B-
AB+
AB-
O+
O-

Examples:

"I need O+ blood"

→
{
  "bloodGroup": "O+"
}

"malai O positive blood chahiyo"

→
{
  "bloodGroup": "O+"
}

"मलाई O+ रगत चाहियो"

→
{
  "bloodGroup": "O+"
}

===========================================================
WHEN TO USE NONE
===========================================================

Use NONE when the question can be answered without
Sahara database information.

Examples:

"mero pet dukhyo"

"what should I do for a mild headache?"

"what is dehydration?"

"how can I reduce fever?"

===========================================================
IMPORTANT
===========================================================

Do NOT diagnose.

Do NOT answer the user's medical question.

Do NOT invent database filters.

Only extract filters that are actually present or clearly
understandable from the user's message.

Return JSON ONLY.

Required format:

{
    "needsDatabase": false,
    "databaseAction": "NONE",
    "filters": {},
    "language": "English",
    "script": "Latin"
}
`;


// ============================================================
// FINAL AI PROMPT
// ============================================================

const createFinalPrompt = ({
    prompt,
    routing,
    databaseResults,
}) => {

    return `
You are Sahara AI, an emergency healthcare assistant.

===========================================================
YOUR ROLE
===========================================================

You are an AI emergency healthcare assistant.

You are NOT a doctor.

Never diagnose diseases.

Never say:

"You have [disease]."

Instead use safe language such as:

"These symptoms may require medical attention."

"One possible concern is..."

"Because this symptom can sometimes be serious..."

Do not present uncertain information as fact.

Always prioritize safety.

If there is uncertainty about urgency, choose the safer
urgency level.

===========================================================
URGENCY CLASSIFICATION
===========================================================

You MUST classify the user's current situation into exactly
ONE of:

LOW
MEDIUM
HIGH
CRITICAL

LOW:

- Minor symptoms
- Can generally wait
- Basic self-care may be reasonable

MEDIUM:

- Medical attention should be considered today
- Doctor or clinic consultation is appropriate

HIGH:

- Needs medical attention as soon as possible
- Hospital evaluation may be appropriate
- Do not unnecessarily delay

CRITICAL:

- Potentially life-threatening situation
- Immediate emergency services are required
- User should not wait for an AI response

===========================================================
EMERGENCY SAFETY
===========================================================

If the user describes symptoms suggesting a possible
life-threatening emergency, prioritize immediate emergency
care.

Examples include:

- severe difficulty breathing
- severe chest pain
- loss of consciousness
- severe uncontrolled bleeding
- sudden severe weakness
- signs of stroke
- severe allergic reaction
- serious trauma
- seizure with ongoing danger

Do not claim the user has a specific disease.

Say that the symptoms may represent an emergency and
recommend immediate professional help.

===========================================================
LANGUAGE
===========================================================

The router detected:

Language:
${routing.language}

Script:
${routing.script}

Respond to the user in the SAME language.

Also match the user's writing style/script.

Examples:

Nepali + Devanagari
→ Respond in Nepali Devanagari.

Nepali + Romanized
→ Respond in Romanized Nepali.

Hindi + Devanagari
→ Respond in Hindi Devanagari.

Hindi + Romanized
→ Respond in Romanized Hindi.

English
→ Respond in English.

IMPORTANT:

The JSON property names MUST remain in English.

These keys must remain exactly:

urgency
reason
response
recommendedActions
results
buttons
followUpQuestion

The button action values MUST remain exactly:

SOS
HOSPITAL
BLOOD
DOCTOR

Human-readable text such as button titles may be translated.

===========================================================
CURRENT USER MESSAGE
===========================================================

${prompt}

===========================================================
DATABASE RESULTS
===========================================================

${JSON.stringify(databaseResults || [], null, 2)}

===========================================================
DATABASE SAFETY RULES
===========================================================

If database results are available:

1. ONLY recommend doctors/hospitals/donors that actually
   exist in the supplied database results.

2. NEVER invent:
   - doctor names
   - hospital names
   - phone numbers
   - locations
   - consultation fees
   - availability
   - blood donor information

3. Do not modify database facts.

4. Do not claim something is available if the database does
   not explicitly indicate availability.

5. If no suitable database result exists, clearly say that
   Sahara could not find a matching result.

6. Do NOT fabricate a result to satisfy the user.

===========================================================
DATABASE RESULT FORMAT
===========================================================

The "results" field must contain the actual database
entities returned by the backend.

Do not create fake objects.

If there are no results:

"results": []

===========================================================
RESPONSE STYLE
===========================================================

Be concise and useful.

Do not overwhelm the user with unnecessary medical
information.

If the request is simply asking for a doctor/hospital/blood,
focus on the requested results.

If the request is an emergency, put the emergency action
first.

===========================================================
OUTPUT
===========================================================

Return VALID JSON ONLY.

Do NOT use markdown.

Do NOT use:

\`\`\`json

Do NOT include text before or after the JSON.

Required structure:

{
    "urgency": "LOW",
    "reason": "Short explanation",
    "response": "Natural language response",
    "recommendedActions": [
        "Action 1",
        "Action 2",
        "Action 3"
    ],
    "results": [],
    "buttons": [
        {
            "title": "Emergency SOS",
            "action": "SOS"
        },
        {
            "title": "Find Hospital",
            "action": "HOSPITAL"
        },
        {
            "title": "Find Blood",
            "action": "BLOOD"
        },
        {
            "title": "Doctor Consultation",
            "action": "DOCTOR"
        }
    ],
    "followUpQuestion": ""
}

Return JSON ONLY.
`;
};


// ============================================================
// SAFE JSON PARSER
// ============================================================

const parseAIJson = (text) => {

    if (!text || typeof text !== "string") {
        throw new Error("AI returned an empty response.");
    }

    let cleaned = text.trim();

    // Remove markdown code fences if model adds them
    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {

        console.error("Invalid AI JSON:");
        console.error(cleaned);

        throw new Error("AI returned invalid JSON.");
    }
};


// ============================================================
// VALIDATE ROUTING RESPONSE
// ============================================================

const validateRouting = (routing) => {

    if (!routing || typeof routing !== "object") {
        throw new Error("Invalid routing response.");
    }

    if (typeof routing.needsDatabase !== "boolean") {
        throw new Error("Invalid needsDatabase value.");
    }

    if (!ALLOWED_DATABASE_ACTIONS.includes(
        routing.databaseAction
    )) {
        throw new Error("Invalid database action.");
    }

    if (!ALLOWED_LANGUAGES.includes(routing.language)) {
        routing.language = "Other";
    }

    if (!ALLOWED_SCRIPTS.includes(routing.script)) {
        routing.script = "Latin";
    }

    if (
        !routing.filters ||
        typeof routing.filters !== "object"
    ) {
        routing.filters = {};
    }

    return routing;
};


// ============================================================
// VALIDATE FINAL RESPONSE
// ============================================================

const validateFinalResponse = (result) => {

    if (!result || typeof result !== "object") {
        throw new Error("Invalid final AI response.");
    }

    if (!ALLOWED_URGENCY.includes(result.urgency)) {
        result.urgency = "MEDIUM";
    }

    if (typeof result.reason !== "string") {
        result.reason = "";
    }

    if (typeof result.response !== "string") {
        result.response = "";
    }

    if (!Array.isArray(result.recommendedActions)) {
        result.recommendedActions = [];
    }

    if (!Array.isArray(result.results)) {
        result.results = [];
    }

    if (!Array.isArray(result.buttons)) {
        result.buttons = [];
    }

    if (typeof result.followUpQuestion !== "string") {
        result.followUpQuestion = "";
    }

    return result;
};


// ============================================================
// AI CONTROLLER
// ============================================================

const aiController = async (req, res) => {

    try {

        // IMPORTANT:
        // We intentionally only use the CURRENT prompt.
        //
        // No old conversation history is sent to the model.

        const { prompt } = req.body;


        // ====================================================
        // BASIC VALIDATION
        // ====================================================

        if (
            typeof prompt !== "string" ||
            !prompt.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Prompt is required.",
            });
        }


        const userPrompt = prompt.trim();


        // ====================================================
        // STEP 1
        // ROUTE REQUEST
        // ====================================================

        const routerResponse = await client.responses.create({

            model: MODEL,

            input: [
                {
                    role: "system",
                    content: routerPrompt,
                },

                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });


        const routing = validateRouting(
            parseAIJson(routerResponse.output_text)
        );


        // ====================================================
        // STEP 2
        // DATABASE SEARCH
        // ====================================================

        let databaseResults = null;


        if (routing.needsDatabase === true) {

            switch (routing.databaseAction) {

                // ==========================================
                // DOCTORS
                // ==========================================

                case "FIND_DOCTORS":

                    databaseResults =
                        await findDoctors(
                            routing.filters
                        );

                    break;


                // ==========================================
                // HOSPITALS
                // ==========================================

                case "FIND_HOSPITALS":

                    databaseResults =
                        await findHospitals(
                            routing.filters
                        );

                    break;


                // ==========================================
                // BLOOD
                // ==========================================

                case "FIND_BLOOD":

                    databaseResults =
                        await findBloodDonors(
                            routing.filters
                        );

                    break;


                // ==========================================
                // NONE
                // ==========================================

                case "NONE":

                    databaseResults = null;

                    break;


                default:

                    databaseResults = null;
            }
        }


        // ====================================================
        // STEP 3
        // FINAL AI RESPONSE
        // ====================================================

        const finalPrompt = createFinalPrompt({
            prompt: userPrompt,
            routing,
            databaseResults,
        });


        const finalResponse = await client.responses.create({

            model: MODEL,

            input: [
                {
                    role: "system",
                    content: finalPrompt,
                },

                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });


        // ====================================================
        // STEP 4
        // PARSE FINAL RESPONSE
        // ====================================================

        const result = validateFinalResponse(
            parseAIJson(finalResponse.output_text)
        );


        // ====================================================
        // STEP 5
        // RETURN RESPONSE
        // ====================================================

        return res.status(200).json({

            success: true,

            response: result,

            databaseUsed: routing.needsDatabase,

            databaseAction: routing.databaseAction,

            language: routing.language,

            script: routing.script,

        });


    } catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "Sahara AI Error:"
        );

        console.error(error);

        console.error(
            "===================================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Sahara AI is temporarily unavailable.",

        });
    }
};


module.exports = aiController;