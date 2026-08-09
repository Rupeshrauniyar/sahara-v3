import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Droplets,
  HeartPulse,
  Home,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserRound,
  WandSparkles,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const AI_API_URL =
  `${API_BASE_URL}/ai/chat`;

/* =========================================================
   INITIAL MESSAGE
========================================================= */

const createInitialMessage = () => ({
  id: Date.now(),
  role: "assistant",

  content: {
    urgency: "LOW",

    reason:
      "No symptoms or healthcare concern has been provided yet.",

    response:
      "Namaste. I’m डाक्टर साहेब, SAHARA’s AI healthcare navigator. Tell me what is happening and I’ll help you understand the urgency and guide you toward the right next step.",

    recommendedActions: [
      "Describe your main symptom or concern",
      "Tell me when it started",
      "Mention if symptoms are getting worse",
    ],

    results: [],

    buttons: [
      {
        title: "Emergency SOS",
        action: "SOS",
      },
      {
        title: "Find Doctor",
        action: "DOCTOR",
      },
      {
        title: "Blood Support",
        action: "BLOOD",
      },
    ],

    followUpQuestion:
      "What would you like help with today?",
  },

  time: new Date(),
});

/* =========================================================
   QUICK PROMPTS
========================================================= */

const QUICK_PROMPTS = [
  {
    icon: HeartPulse,
    title: "Check symptoms",
    subtitle:
      "Understand urgency",
    prompt:
      "I want to describe some symptoms I am experiencing.",
  },

  {
    icon: Stethoscope,
    title: "Find specialist",
    subtitle:
      "Choose the right doctor",
    prompt:
      "Help me understand what type of doctor I should see.",
  },

  {
    icon: Droplets,
    title: "Blood support",
    subtitle:
      "Request urgent blood",
    prompt:
      "I need help with an urgent blood requirement.",
  },

  {
    icon: ShieldAlert,
    title: "Urgent situation",
    subtitle:
      "What should I do now?",
    prompt:
      "I have an urgent medical situation and need guidance.",
  },
];

/* =========================================================
   PAGE
========================================================= */

const AiBot = () => {
  const navigate =
    useNavigate();

  const [
    messages,
    setMessages,
  ] = useState([
    createInitialMessage(),
  ]);

  const [
    input,
    setInput,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  const hasConversation =
    messages.length > 1;

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages,
    loading,
  ]);

  /* =====================================================
     INPUT
  ===================================================== */

  const handleInputChange =
    (event) => {
      setInput(
        event.target.value,
      );

      const textarea =
        textareaRef.current;

      if (!textarea) {
        return;
      }

      textarea.style.height =
        "auto";

      textarea.style.height =
        `${Math.min(
          textarea.scrollHeight,
          150,
        )}px`;
    };

  /* =====================================================
     QUICK PROMPT
  ===================================================== */

  const handleQuickPrompt =
    (prompt) => {
      setInput(prompt);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    };

  /* =====================================================
     NEW CHAT
  ===================================================== */

  const clearChat = () => {
    setMessages([
      createInitialMessage(),
    ]);

    setInput("");

    if (
      textareaRef.current
    ) {
      textareaRef.current.style.height =
        "auto";
    }
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const sendMessage =
    async () => {
      const message =
        input.trim();

      if (
        !message ||
        loading
      ) {
        return;
      }

      const userMessage = {
        id:
          Date.now(),

        role:
          "user",

        content:
          message,

        time:
          new Date(),
      };

      setMessages(
        (previous) => [
          ...previous,
          userMessage,
        ],
      );

      setInput("");

      if (
        textareaRef.current
      ) {
        textareaRef.current.style.height =
          "auto";
      }

      setLoading(true);

      try {
        const token =
          localStorage.getItem(
            "token",
          ) ||
          sessionStorage.getItem(
            "token",
          );

        const response =
          await fetch(
            AI_API_URL,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token && {
                  Authorization:
                    `Bearer ${token}`,
                }),
              },

              body:
                JSON.stringify({
                  prompt:
                    message,
                }),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Unable to get a response from SAHARA AI.",
          );
        }

        if (
          !data.response ||
          typeof data.response !==
            "object"
        ) {
          throw new Error(
            "SAHARA AI returned an invalid response.",
          );
        }

        setMessages(
          (previous) => [
            ...previous,

            {
              id:
                Date.now() +
                1,

              role:
                "assistant",

              content:
                data.response,

              databaseUsed:
                data.databaseUsed ||
                false,

              databaseAction:
                data.databaseAction ||
                "NONE",

              time:
                new Date(),
            },
          ],
        );
      } catch (error) {
        setMessages(
          (previous) => [
            ...previous,

            {
              id:
                Date.now() +
                2,

              role:
                "error",

              content:
                error.message ||
                "Something went wrong. Please try again.",

              time:
                new Date(),
            },
          ],
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     ENTER TO SEND
  ===================================================== */

  const handleKeyDown =
    (event) => {
      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }
    };

  /* =====================================================
     ACTION ROUTING
  ===================================================== */

  const handleAction =
    (action) => {
      switch (
        action
      ) {
        case "SOS":
          navigate(
            "/emergency-sos",
          );
          break;

        case "BLOOD":
          navigate(
            "/bloodRequest",
          );
          break;

        case "DOCTOR":
          navigate(
            "/doctor",
          );
          break;

        case "APPOINTMENT":
          navigate(
            "/appointment",
          );
          break;

        case "HOSPITAL":
          setInput(
            "Help me understand where I should seek medical care.",
          );

          setTimeout(() => {
            textareaRef.current?.focus();
          }, 50);

          break;

        default:
          break;
      }
    };

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime =
    (date) => {
      if (!date) {
        return "";
      }

      return new Intl.DateTimeFormat(
        "en-US",
        {
          hour:
            "numeric",

          minute:
            "2-digit",
        },
      ).format(
        new Date(
          date,
        ),
      );
    };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="w-full">

      {/* =================================================
          PREMIUM HERO
      ================================================= */}

      <section className="relative overflow-hidden rounded-[28px] border border-[#DCE3FF] bg-[linear-gradient(135deg,#1010C9_0%,#1717E8_42%,#4C5BFF_100%)] shadow-[0_24px_60px_rgba(23,23,232,0.18)]">

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute bottom-[-90px] left-[20%] h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-7">

          <div className="flex items-center gap-4">

            <div className="relative">

              <div className="grid h-[62px] w-[62px] place-items-center rounded-[19px] border border-white/15 bg-white/10 text-white shadow-[0_16px_32px_rgba(0,0,0,0.12)] backdrop-blur">

                <WandSparkles
                  size={27}
                />
              </div>

              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-[3px] border-[#1717E8] bg-emerald-400">

                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="font-[Manrope] text-[24px] font-extrabold tracking-[-0.04em] !text-white sm:text-[28px]">
                  डाक्टर साहेब
                </h1>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[8px] font-extrabold uppercase tracking-[0.14em] !text-white backdrop-blur">
                  SAHARA AI
                </span>
              </div>

              <p className="mt-2 max-w-[520px] text-[9px] leading-5 !text-indigo-100 sm:text-[10px]">
                Intelligent healthcare navigation designed to understand urgency and connect you to the right SAHARA service.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="inline-flex min-h-[43px] items-center gap-2 rounded-[12px] border border-white/15 bg-white/10 px-4 text-[9px] font-extrabold !text-white backdrop-blur transition hover:bg-white/15"
            >
              <Home
                size={14}
              />

              <span className="!text-white">
                Home
              </span>
            </button>

            <button
              type="button"
              onClick={
                clearChat
              }
              className="inline-flex min-h-[43px] items-center gap-2 rounded-[12px] bg-white px-4 text-[9px] font-extrabold !text-[#1717E8] shadow-sm transition hover:-translate-y-0.5"
            >
              <RefreshCw
                size={14}
              />

              New Chat
            </button>
          </div>
        </div>
      </section>

      {/* =================================================
          STATUS STRIP
      ================================================= */}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">

        <StatusCard
          icon={Sparkles}
          title="AI Online"
          text="Ready to assist"
          green
        />

        <StatusCard
          icon={ShieldAlert}
          title="Urgency Aware"
          text="Low to critical"
        />

        <StatusCard
          icon={MessageCircle}
          title="Bilingual"
          text="English + नेपाली"
        />
      </div>

      {/* =================================================
          WORKSPACE
      ================================================= */}

      <div className="mt-5 grid min-h-[720px] gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="self-start rounded-[24px] border border-[#DEE5F0] bg-white p-4 shadow-[0_14px_40px_rgba(32,53,84,0.06)] xl:sticky xl:top-[95px]">

          {/* ASSISTANT CARD */}

          <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,#132F53,#174C81)] p-5">

            <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-white/[0.06] blur-2xl" />

            <div className="relative">

              <div className="flex items-center gap-3">

                <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-white/10 !text-white">

                  <Bot
                    size={21}
                  />
                </div>

                <div>

                  <p className="text-[10px] font-extrabold !text-white">
                    AI Health Navigator
                  </p>

                  <p className="mt-0.5 text-[8px] !text-blue-100">
                    Personal guidance assistant
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[14px] border border-white/10 bg-white/[0.06] p-3">

                <p className="text-[8.5px] leading-5 !text-blue-100">
                  Ask about symptoms, urgency, doctor selection, blood support or appointments.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-[7.5px] font-extrabold uppercase tracking-[0.12em] !text-white">
                  System Online
                </span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div className="mt-5">

            <p className="px-1 text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#97A6B6]">
              Quick Access
            </p>

            <div className="mt-3 space-y-2">

              <SidebarAction
                icon={ShieldAlert}
                label="Emergency SOS"
                description="Immediate actions"
                danger
                onClick={() =>
                  navigate(
                    "/emergency-sos",
                  )
                }
              />

              <SidebarAction
                icon={Stethoscope}
                label="Find Doctor"
                description="Search specialists"
                onClick={() =>
                  navigate(
                    "/doctor",
                  )
                }
              />

              <SidebarAction
                icon={CalendarDays}
                label="Appointments"
                description="Book consultation"
                onClick={() =>
                  navigate(
                    "/appointment",
                  )
                }
              />

              <SidebarAction
                icon={Droplets}
                label="Blood Support"
                description="Request blood"
                danger
                onClick={() =>
                  navigate(
                    "/bloodRequest",
                  )
                }
              />
            </div>
          </div>

          {/* TIP */}

          <div className="mt-5 rounded-[16px] border border-[#DDE4FF] bg-[#F5F7FF] p-4">

            <div className="flex items-start gap-2.5">

              <Lightbulb
                size={15}
                className="mt-0.5 shrink-0 text-[#1717E8]"
              />

              <div>

                <p className="text-[8px] font-extrabold uppercase tracking-[0.11em] text-[#1717E8]">
                  Better answers
                </p>

                <p className="mt-1.5 text-[7.8px] leading-4 text-[#738499]">
                  Mention age, main symptoms, duration and whether the condition is worsening.
                </p>
              </div>
            </div>
          </div>

          {/* DISCLAIMER */}

          <div className="mt-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4">

            <div className="flex items-start gap-2.5">

              <CircleAlert
                size={14}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <p className="text-[7.8px] leading-4 text-amber-800">
                AI guidance does not replace diagnosis or treatment from a licensed medical professional.
              </p>
            </div>
          </div>
        </aside>

        {/* =================================================
            CHAT CARD
        ================================================= */}

        <section className="flex min-w-0 flex-col overflow-hidden rounded-[25px] border border-[#DEE5EF] bg-white shadow-[0_18px_50px_rgba(32,51,80,0.08)]">

          {/* CHAT TOPBAR */}

          <div className="flex flex-col gap-4 border-b border-[#E9EDF4] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[linear-gradient(145deg,#EEF1FF,#E3E7FF)] text-[#1717E8]">

                <Sparkles
                  size={18}
                />
              </div>

              <div>

                <p className="text-[10px] font-extrabold text-[#29425C]">
                  Conversation
                </p>

                <p className="mt-0.5 text-[8px] text-[#8998A8]">
                  डाक्टर साहेब is ready to assist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[7.5px] font-extrabold text-emerald-700">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                ONLINE
              </span>

              <span className="rounded-full bg-[#F0F2FF] px-3 py-1.5 text-[7.5px] font-extrabold text-[#1717E8]">
                AI NAVIGATOR
              </span>
            </div>
          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="min-h-[490px] flex-1 overflow-y-auto bg-[radial-gradient(circle_at_85%_10%,rgba(23,23,232,0.04),transparent_30%),linear-gradient(180deg,#FAFBFF_0%,#F5F7FB_100%)]">

            <div className="mx-auto w-full max-w-[940px] px-4 py-7 sm:px-6">

              {!hasConversation && (
                <div className="mb-7 rounded-[22px] border border-[#E0E5FF] bg-[linear-gradient(135deg,#F6F7FF,#FFFFFF)] p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <Sparkles
                          size={15}
                          className="text-[#1717E8]"
                        />

                        <p className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                          Ask anything healthcare-related
                        </p>
                      </div>

                      <h2 className="mt-2 font-[Manrope] text-[20px] font-extrabold tracking-[-0.03em] text-[#243D58]">
                        How can I help you today?
                      </h2>
                    </div>

                    <div className="hidden h-12 w-12 place-items-center rounded-[15px] bg-[#1717E8] text-white sm:grid">

                      <Activity
                        size={21}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    {QUICK_PROMPTS.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        return (
                          <button
                            key={
                              item.title
                            }
                            type="button"
                            onClick={() =>
                              handleQuickPrompt(
                                item.prompt,
                              )
                            }
                            className="group flex items-center gap-3 rounded-[15px] border border-[#E1E7EF] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#C5CDFF] hover:shadow-[0_10px_24px_rgba(23,23,232,0.07)]"
                          >
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#EEF1FF] text-[#1717E8] transition group-hover:bg-[#1717E8] group-hover:text-white">

                              <Icon
                                size={17}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="text-[9px] font-extrabold text-[#304960]">
                                {
                                  item.title
                                }
                              </p>

                              <p className="mt-0.5 text-[7.5px] text-[#8A99A8]">
                                {
                                  item.subtitle
                                }
                              </p>
                            </div>

                            <ChevronRight
                              size={14}
                              className="ml-auto shrink-0 text-[#A5B0BC]"
                            />
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-6">

                {messages.map(
                  (message) => (
                    <ChatMessage
                      key={
                        message.id
                      }
                      message={
                        message
                      }
                      onAction={
                        handleAction
                      }
                      formatTime={
                        formatTime
                      }
                    />
                  ),
                )}
              </div>

              {loading && (
                <div className="mt-6 flex items-start gap-3">

                  <AIAvatar />

                  <div className="rounded-[18px] rounded-tl-[6px] border border-[#DFE6EF] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(34,54,82,0.05)]">

                    <div className="flex items-center gap-3">

                      <div className="flex gap-1">

                        {[0, 1, 2].map(
                          (index) => (
                            <span
                              key={
                                index
                              }
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1717E8]"
                              style={{
                                animationDelay:
                                  `${index * 130}ms`,
                              }}
                            />
                          ),
                        )}
                      </div>

                      <span className="text-[8.5px] font-semibold text-[#8291A1]">
                        डाक्टर साहेब is analyzing...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>
          </div>

          {/* =================================================
              PREMIUM COMPOSER
          ================================================= */}

          <div className="border-t border-[#E5EAF1] bg-white p-4 sm:p-5">

            <div className="mx-auto max-w-[940px]">

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                <div className="flex items-center gap-2">

                  <ShieldAlert
                    size={12}
                    className="text-amber-500"
                  />

                  <span className="text-[7.3px] text-[#8D99A7]">
                    For life-threatening emergencies, use Emergency SOS.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/emergency-sos",
                    )
                  }
                  className="text-[7.5px] font-extrabold text-red-600 hover:underline"
                >
                  Open SOS
                </button>
              </div>

              <div className="rounded-[22px] border border-[#D7DEEA] bg-[#F8F9FD] p-2 shadow-[0_12px_30px_rgba(36,55,82,0.08)] transition focus-within:border-[#BFC8FF] focus-within:bg-white focus-within:shadow-[0_16px_40px_rgba(23,23,232,0.11)]">

                <div className="flex items-end gap-2">

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[linear-gradient(145deg,#1717E8,#4D5BFF)] text-white shadow-[0_8px_18px_rgba(23,23,232,0.2)]">

                    <Sparkles
                      size={17}
                    />
                  </div>

                  <textarea
                    ref={
                      textareaRef
                    }
                    value={
                      input
                    }
                    onChange={
                      handleInputChange
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    disabled={
                      loading
                    }
                    rows={1}
                    placeholder="Describe your symptoms or ask डाक्टर साहेब..."
                    className="max-h-[150px] min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-[10px] leading-5 text-[#253D57] outline-none placeholder:text-[#A1ADBA] focus:ring-0 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={
                      sendMessage
                    }
                    disabled={
                      !input.trim() ||
                      loading
                    }
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#1717E8] !text-white shadow-[0_10px_22px_rgba(23,23,232,0.22)] transition hover:-translate-y-0.5 hover:bg-[#1010C9] disabled:translate-y-0 disabled:bg-[#DDE2EC] disabled:text-[#9AA7B4] disabled:shadow-none"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <Send
                        size={16}
                      />
                    )}
                  </button>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2 px-2 pb-1">

                  <p className="text-[7px] text-[#A1ACB7]">
                    Enter to send · Shift + Enter for new line
                  </p>

                  <div className="flex items-center gap-2">

                    <span className="rounded-full bg-[#EEF1FF] px-2 py-1 text-[6.8px] font-extrabold text-[#1717E8]">
                      EN
                    </span>

                    <span className="rounded-full bg-[#EEF1FF] px-2 py-1 text-[6.8px] font-extrabold text-[#1717E8]">
                      नेपाली
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/* =========================================================
   STATUS CARD
========================================================= */

const StatusCard = ({
  icon: Icon,
  title,
  text,
  green = false,
}) => (
  <div className="flex items-center gap-3 rounded-[17px] border border-[#E1E7EF] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(34,54,80,0.04)]">

    <div
      className={`grid h-9 w-9 place-items-center rounded-[10px] ${
        green
          ? "bg-emerald-50 text-emerald-600"
          : "bg-[#EEF1FF] text-[#1717E8]"
      }`}
    >
      <Icon
        size={16}
      />
    </div>

    <div>

      <p className="text-[8.5px] font-extrabold text-[#304960]">
        {title}
      </p>

      <p className="mt-0.5 text-[7px] text-[#91A0AF]">
        {text}
      </p>
    </div>
  </div>
);

/* =========================================================
   SIDEBAR ACTION
========================================================= */

const SidebarAction = ({
  icon: Icon,
  label,
  description,
  onClick,
  danger = false,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={`group flex w-full items-center gap-3 rounded-[14px] border p-3.5 text-left transition hover:-translate-y-0.5 ${
      danger
        ? "border-red-100 bg-red-50/60 hover:border-red-200 hover:bg-red-50"
        : "border-[#E2E8F0] bg-[#FAFBFD] hover:border-[#C9D1FF] hover:bg-[#F7F8FF]"
    }`}
  >
    <div
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-[11px] transition ${
        danger
          ? "bg-red-100 text-red-600"
          : "bg-[#EEF1FF] text-[#1717E8] group-hover:bg-[#1717E8] group-hover:text-white"
      }`}
    >
      <Icon
        size={17}
      />
    </div>

    <div className="min-w-0 flex-1">

      <p className="text-[9px] font-extrabold text-[#314A63]">
        {label}
      </p>

      <p className="mt-0.5 text-[7.5px] text-[#8B99A8]">
        {description}
      </p>
    </div>

    <ChevronRight
      size={14}
      className="shrink-0 text-[#A5B0BB]"
    />
  </button>
);

/* =========================================================
   CHAT MESSAGE
========================================================= */

const ChatMessage = ({
  message,
  onAction,
  formatTime,
}) => {
  /* USER */

  if (
    message.role ===
    "user"
  ) {
    return (
      <div className="flex justify-end">

        <div className="max-w-[90%] sm:max-w-[76%]">

          <div className="rounded-[20px] rounded-br-[6px] bg-[linear-gradient(145deg,#1717E8,#3C49F7)] px-4 py-3.5 shadow-[0_10px_26px_rgba(23,23,232,0.18)]">

            <p className="whitespace-pre-wrap text-[10px] leading-6 !text-white">
              {
                message.content
              }
            </p>
          </div>

          <div className="mt-1.5 flex items-center justify-end gap-1.5">

            <span className="text-[7px] font-semibold text-[#99A6B4]">
              You
            </span>

            <span className="h-1 w-1 rounded-full bg-[#CDD3DA]" />

            <span className="text-[7px] text-[#99A6B4]">
              {formatTime(
                message.time,
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ERROR */

  if (
    message.role ===
    "error"
  ) {
    return (
      <div className="flex items-start gap-3">

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-red-100 text-red-600">

          <AlertTriangle
            size={16}
          />
        </div>

        <div className="max-w-[88%] rounded-[18px] rounded-tl-[6px] border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-[9px] leading-5 text-red-700">
            {
              message.content
            }
          </p>
        </div>
      </div>
    );
  }

  /* AI */

  const ai =
    message.content ||
    {};

  const urgency =
    getUrgencyConfig(
      ai.urgency,
    );

  const buttons =
    Array.isArray(
      ai.buttons,
    )
      ? ai.buttons.filter(
          (button) =>
            button.action !==
            "HOSPITAL",
        )
      : [];

  return (
    <div className="flex items-start gap-3">

      <AIAvatar />

      <div className="min-w-0 w-full max-w-[94%] sm:max-w-[86%]">

        <div className="overflow-hidden rounded-[21px] rounded-tl-[6px] border border-[#DFE5EE] bg-white shadow-[0_10px_30px_rgba(35,55,84,0.055)]">

          {/* AI HEADER */}

          <div className="flex items-center justify-between gap-3 border-b border-[#EEF1F5] bg-[linear-gradient(90deg,#FBFCFF,#F7F8FF)] px-5 py-3.5">

            <div className="flex items-center gap-2">

              <p className="text-[9px] font-extrabold text-[#263F59]">
                SAHARA AI
              </p>

              <span className="rounded-full bg-[#E9ECFF] px-2 py-1 text-[6.8px] font-extrabold text-[#1717E8]">
                डाक्टर साहेब
              </span>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[7px] font-extrabold ${urgency.badge}`}
            >
              {String(
                ai.urgency ||
                  "LOW",
              ).toUpperCase()}
            </span>
          </div>

          {/* BODY */}

          <div className="p-5">

            {ai.response && (
              <p className="whitespace-pre-wrap text-[10px] leading-6 text-[#38536E]">
                {
                  ai.response
                }
              </p>
            )}

            {/* URGENCY */}

            {ai.reason && (
              <div
                className={`mt-4 rounded-[16px] border p-4 ${urgency.background} ${urgency.border}`}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${urgency.iconBackground} ${urgency.text}`}
                  >
                    <urgency.Icon
                      size={15}
                    />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <p
                        className={`text-[7.8px] font-extrabold uppercase tracking-[0.12em] ${urgency.text}`}
                      >
                        Urgency Assessment
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[6.8px] font-extrabold ${urgency.badge}`}
                      >
                        {ai.urgency ||
                          "LOW"}
                      </span>
                    </div>

                    <p className="mt-2 text-[8.5px] leading-5 text-[#536B82]">
                      {
                        ai.reason
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONS */}

            {Array.isArray(
              ai.recommendedActions,
            ) &&
              ai
                .recommendedActions
                .length >
                0 && (
                <div className="mt-5">

                  <p className="text-[7.8px] font-extrabold uppercase tracking-[0.12em] text-[#8B99A8]">
                    Recommended Actions
                  </p>

                  <div className="mt-3 grid gap-2">

                    {ai.recommendedActions.map(
                      (
                        action,
                        index,
                      ) => (
                        <div
                          key={`${action}-${index}`}
                          className="flex items-start gap-3 rounded-[12px] bg-[#F8FAFD] p-3"
                        >

                          <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">

                            <Check
                              size={11}
                            />
                          </div>

                          <p className="text-[8.3px] leading-5 text-[#60768B]">
                            {
                              action
                            }
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* RESULTS */}

            {Array.isArray(
              ai.results,
            ) &&
              ai.results.length >
                0 && (
                <div className="mt-5">

                  <p className="mb-3 text-[7.8px] font-extrabold uppercase tracking-[0.12em] text-[#8B99A8]">
                    SAHARA Results
                  </p>

                  <div className="space-y-3">

                    {ai.results.map(
                      (
                        result,
                        index,
                      ) => (
                        <DatabaseResult
                          key={
                            result._id ||
                            result.id ||
                            index
                          }
                          result={
                            result
                          }
                          onAction={
                            onAction
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* FOLLOWUP */}

            {ai.followUpQuestion && (
              <div className="mt-5 rounded-[15px] border border-[#DFE4FF] bg-[linear-gradient(135deg,#F7F8FF,#FCFCFF)] p-4">

                <div className="flex items-center gap-2">

                  <Sparkles
                    size={12}
                    className="text-[#1717E8]"
                  />

                  <p className="text-[7.4px] font-extrabold uppercase tracking-[0.12em] text-[#1717E8]">
                    डाक्टर साहेब asks
                  </p>
                </div>

                <p className="mt-2 text-[9px] leading-5 text-[#455E77]">
                  {
                    ai.followUpQuestion
                  }
                </p>
              </div>
            )}

            {/* BUTTONS */}

            {buttons.length >
              0 && (
              <div className="mt-5 flex flex-wrap gap-2">

                {buttons.map(
                  (
                    button,
                    index,
                  ) => (
                    <button
                      key={`${button.action}-${index}`}
                      type="button"
                      onClick={() =>
                        onAction(
                          button.action,
                        )
                      }
                      className={
                        getButtonClass(
                          button.action,
                        )
                      }
                    >
                      {getActionIcon(
                        button.action,
                      )}

                      <span
                        className={
                          button.action ===
                            "SOS" ||
                          button.action ===
                            "DOCTOR" ||
                          button.action ===
                            "APPOINTMENT"
                            ? "!text-white"
                            : ""
                        }
                      >
                        {
                          button.title
                        }
                      </span>

                      <ArrowRight
                        size={12}
                      />
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-1.5 text-[7px] text-[#9AA7B4]">
          SAHARA AI ·{" "}
          {formatTime(
            message.time,
          )}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   AI AVATAR
========================================================= */

const AIAvatar = () => (
  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[linear-gradient(145deg,#1717E8,#4D5BFF)] text-white shadow-[0_10px_22px_rgba(23,23,232,0.2)]">

    <Sparkles
      size={17}
    />
  </div>
);

/* =========================================================
   DATABASE RESULT
========================================================= */

const DatabaseResult = ({
  result,
  onAction,
}) => {
  if (
    result.specialization ||
    String(
      result.type ||
        "",
    ).toLowerCase() ===
      "doctor"
  ) {
    const name =
      result.user?.fullName ||
      result.fullName ||
      result.name ||
      "Doctor";

    return (
      <div className="rounded-[16px] border border-[#E0E7EF] bg-[#FAFCFE] p-4">

        <div className="flex items-start gap-3">

          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#EEF1FF] text-[#1717E8]">

            <UserRound
              size={17}
            />
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[9.5px] font-extrabold text-[#2F485F]">
              {name}
            </p>

            {result.specialization && (
              <p className="mt-1 text-[8px] font-bold text-[#1717E8]">
                {
                  result.specialization
                }
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">

              {result.experience !==
                undefined && (
                <span className="rounded-lg bg-white px-2 py-1 text-[7.5px] text-[#718398]">
                  {
                    result.experience
                  }{" "}
                  yrs experience
                </span>
              )}

              {result.consultationFee !==
                undefined && (
                <span className="rounded-lg bg-white px-2 py-1 text-[7.5px] text-[#718398]">
                  NPR{" "}
                  {
                    result.consultationFee
                  }
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  onAction(
                    "DOCTOR",
                  )
                }
                className="rounded-[9px] bg-[#1717E8] px-3 py-2 text-[7.5px] font-extrabold !text-white"
              >
                <span className="!text-white">
                  View Doctors
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAction(
                    "APPOINTMENT",
                  )
                }
                className="rounded-[9px] border border-[#DCE3EB] bg-white px-3 py-2 text-[7.5px] font-extrabold text-[#536C84]"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    result.beds ||
    result.emergencyAvailable !==
      undefined ||
    String(
      result.type ||
        "",
    ).toLowerCase() ===
      "hospital"
  ) {
    return (
      <div className="rounded-[16px] border border-[#E0E7EF] bg-[#FAFCFE] p-4">

        <div className="flex items-start gap-3">

          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#EEF1FF] text-[#1717E8]">

            <HeartPulse
              size={17}
            />
          </div>

          <div>

            <p className="text-[9.5px] font-extrabold text-[#304960]">
              {result.name ||
                "Healthcare Facility"}
            </p>

            {(result.city ||
              result.address) && (
              <p className="mt-1 text-[8px] text-[#8393A3]">
                {result.city}
                {result.city &&
                result.address
                  ? " · "
                  : ""}
                {
                  result.address
                }
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">

              {result.emergencyAvailable && (
                <span className="rounded-lg bg-red-50 px-2 py-1 text-[7.5px] font-bold text-red-600">
                  Emergency
                </span>
              )}

              {result.ambulanceAvailable && (
                <span className="rounded-lg bg-[#EEF1FF] px-2 py-1 text-[7.5px] font-bold text-[#1717E8]">
                  Ambulance
                </span>
              )}

              {result.isOpen && (
                <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[7.5px] font-bold text-emerald-700">
                  Open
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[#E0E7EF] bg-[#FAFCFE] p-4">

      <p className="text-[8px] leading-5 text-[#65798F]">
        {result.name ||
          result.fullName ||
          result.title ||
          "SAHARA healthcare result"}
      </p>
    </div>
  );
};

/* =========================================================
   URGENCY
========================================================= */

const getUrgencyConfig =
  (urgency) => {
    switch (
      String(
        urgency ||
          "LOW",
      ).toUpperCase()
    ) {
      case "CRITICAL":
        return {
          Icon:
            ShieldAlert,

          text:
            "text-red-700",

          border:
            "border-red-200",

          background:
            "bg-red-50",

          iconBackground:
            "bg-red-100",

          badge:
            "bg-red-100 text-red-700",
        };

      case "HIGH":
        return {
          Icon:
            AlertTriangle,

          text:
            "text-orange-700",

          border:
            "border-orange-200",

          background:
            "bg-orange-50",

          iconBackground:
            "bg-orange-100",

          badge:
            "bg-orange-100 text-orange-700",
        };

      case "MEDIUM":
        return {
          Icon:
            CircleAlert,

          text:
            "text-amber-700",

          border:
            "border-amber-200",

          background:
            "bg-amber-50",

          iconBackground:
            "bg-amber-100",

          badge:
            "bg-amber-100 text-amber-700",
        };

      case "LOW":
      default:
        return {
          Icon:
            Check,

          text:
            "text-emerald-700",

          border:
            "border-emerald-200",

          background:
            "bg-emerald-50",

          iconBackground:
            "bg-emerald-100",

          badge:
            "bg-emerald-100 text-emerald-700",
        };
    }
  };

/* =========================================================
   ACTION ICON
========================================================= */

const getActionIcon =
  (action) => {
    switch (
      action
    ) {
      case "SOS":
        return (
          <ShieldAlert
            size={13}
          />
        );

      case "BLOOD":
        return (
          <Droplets
            size={13}
          />
        );

      case "DOCTOR":
        return (
          <Stethoscope
            size={13}
          />
        );

      case "APPOINTMENT":
        return (
          <CalendarDays
            size={13}
          />
        );

      default:
        return (
          <Sparkles
            size={13}
          />
        );
    }
  };

/* =========================================================
   BUTTON STYLE
========================================================= */

const getButtonClass =
  (action) => {
    if (
      action ===
      "SOS"
    ) {
      return "inline-flex items-center gap-2 rounded-[10px] bg-red-600 px-3.5 py-2.5 text-[8px] font-extrabold !text-white shadow-sm transition hover:bg-red-700";
    }

    if (
      action ===
        "DOCTOR" ||
      action ===
        "APPOINTMENT"
    ) {
      return "inline-flex items-center gap-2 rounded-[10px] bg-[#1717E8] px-3.5 py-2.5 text-[8px] font-extrabold !text-white shadow-sm transition hover:bg-[#1010C9]";
    }

    return "inline-flex items-center gap-2 rounded-[10px] border border-[#DDE4EC] bg-[#F7F9FC] px-3.5 py-2.5 text-[8px] font-extrabold text-[#536C84] transition hover:bg-white";
  };

export default AiBot;