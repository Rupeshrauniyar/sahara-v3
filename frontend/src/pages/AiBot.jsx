import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Droplets,
  HeartPulse,
  Hospital,
  Info,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

const AI_API_URL =
  "http://localhost:3000/api/ai/chat";

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
      "Hello! I'm SAHARA AI. Tell me what is happening and I’ll help you understand the urgency and guide you toward an appropriate healthcare service.",

    recommendedActions: [
      "Describe the main symptom or healthcare concern",
      "Tell me when it started",
      "Mention anything that makes it better or worse",
    ],

    results: [],

    buttons: [
      {
        title: "Emergency Help",
        action: "SOS",
      },

      {
        title: "Find Hospital",
        action: "HOSPITAL",
      },

      {
        title: "Blood Support",
        action: "BLOOD",
      },

      {
        title: "Find Doctor",
        action: "DOCTOR",
      },
    ],

    followUpQuestion:
      "What healthcare concern can I help you with?",
  },

  time: new Date(),
});

/* =========================================================
   QUICK PROMPTS
========================================================= */

const quickPrompts = [
  {
    icon: HeartPulse,

    title: "Check symptoms",

    description:
      "Tell SAHARA what you are experiencing.",

    prompt:
      "I want to tell you about some symptoms I'm experiencing.",

    style:
      "bg-[#EAF4FF] text-[#1769E0]",
  },

  {
    icon: Stethoscope,

    title: "Find a doctor",

    description:
      "Get guidance toward the right specialist.",

    prompt:
      "Recommend doctors based on my health concern.",

    style:
      "bg-[#EAF9FC] text-[#0C9BB7]",
  },

  {
    icon: Hospital,

    title: "Find a hospital",

    description:
      "Get help choosing an appropriate facility.",

    prompt:
      "Help me find a hospital for my healthcare concern.",

    style:
      "bg-[#F1EEFF] text-[#7057D8]",
  },

  {
    icon: Droplets,

    title: "Blood support",

    description:
      "Get help with an urgent blood requirement.",

    prompt:
      "I need help finding blood.",

    style:
      "bg-[#FFF0F2] text-[#E43C4F]",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AiBot = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    createInitialMessage(),
  ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =====================================================
     TEXTAREA
  ===================================================== */

  const handleInputChange = (e) => {
    setInput(e.target.value);

    const textarea =
      textareaRef.current;

    if (textarea) {
      textarea.style.height =
        "auto";

      textarea.style.height =
        `${Math.min(
          textarea.scrollHeight,
          140,
        )}px`;
    }
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const sendMessage = async () => {
    const message =
      input.trim();

    if (
      !message ||
      loading
    ) {
      return;
    }

    const userMessage = {
      id: Date.now(),

      role: "user",

      content: message,

      time: new Date(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

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

      const currentConversation =
        [
          ...messages,
          userMessage,
        ].map((msg) => ({
          role:
            msg.role ===
            "assistant"
              ? "assistant"
              : "user",

          content:
            typeof msg.content ===
            "string"
              ? msg.content
              : msg.content
                  ?.response ||
                "",
        }));

      const response =
        await fetch(
          AI_API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },

            body: JSON.stringify(
              {
                prompt:
                  message,

                conversation:
                  currentConversation.slice(
                    -10,
                  ),
              },
            ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
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

      const aiMessage = {
        id:
          Date.now() + 1,

        role: "assistant",

        content:
          data.response,

        databaseUsed:
          data.databaseUsed ||
          false,

        databaseAction:
          data.databaseAction ||
          "NONE",

        time: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "SAHARA AI Error:",
        error,
      );

      setMessages((prev) => [
        ...prev,

        {
          id:
            Date.now() + 2,

          role: "error",

          content:
            error.message ||
            "Something went wrong. Please try again.",

          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     KEYBOARD
  ===================================================== */

  const handleKeyDown = (
    e,
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      sendMessage();
    }
  };

  /* =====================================================
     QUICK PROMPTS
  ===================================================== */

  const handleQuickPrompt = (
    prompt,
  ) => {
    setInput(prompt);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  /* =====================================================
     CLEAR CHAT
  ===================================================== */

  const clearChat = () => {
    setMessages([
      createInitialMessage(),
    ]);

    setInput("");
  };

  /* =====================================================
     ACTIONS
  ===================================================== */

  const handleAction = (
    action,
  ) => {
    switch (action) {
      case "SOS":
        setInput(
          "This may be an emergency. Help me understand what immediate action I should take.",
        );

        setTimeout(() => {
          textareaRef.current?.focus();
        }, 50);

        break;

      case "HOSPITAL":
        /*
         * Hospital Finder does not yet have its
         * own route in your current AppRoutes.
         * For now we continue through AI rather
         * than navigating to a broken URL.
         */
        setInput(
          "Help me find an appropriate hospital.",
        );

        setTimeout(() => {
          textareaRef.current?.focus();
        }, 50);

        break;

      case "BLOOD":
        navigate(
          "/bloodRequest",
        );

        break;

      case "DOCTOR":
        navigate("/doctor");

        break;

      case "APPOINTMENT":
        navigate(
          "/appointment",
        );

        break;

      default:
        console.log(
          "Unknown AI action:",
          action,
        );
    }
  };

  /* =====================================================
     TIME
  ===================================================== */

  const formatTime = (
    date,
  ) => {
    if (!date) return "";

    return new Intl.DateTimeFormat(
      "en-US",
      {
        hour: "numeric",

        minute: "2-digit",
      },
    ).format(date);
  };

  const conversationStarted =
    messages.length > 1;

  return (
    <div className="h-screen overflow-hidden bg-[#F5F9FD] text-[#11233E]">

      <div className="flex h-full">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#DFE9F3] bg-[#0B2446] text-white lg:flex">

          {/* Logo */}

          <div className="border-b border-white/10 p-5">

            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-[#2C89F5] to-[#1769E0] shadow-lg shadow-blue-900/30">
                <HeartPulse
                  size={22}
                />
              </div>

              <div>
                <p className="font-[Manrope] text-[15px] font-extrabold tracking-[0.05em]">
                  SAHARA
                </p>

                <p className="mt-0.5 text-[9px] text-blue-200/60">
                  AI Health Navigator
                </p>
              </div>
            </Link>
          </div>

          {/* New Chat */}

          <div className="p-4">

            <button
              type="button"
              onClick={clearChat}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[13px] bg-white text-[12px] font-bold text-[#0B3D7A] transition hover:bg-blue-50"
            >
              <Plus size={17} />

              New conversation
            </button>
          </div>

          {/* Navigation */}

          <div className="px-4">

            <p className="px-2 text-[9px] font-bold uppercase tracking-[0.15em] text-blue-200/40">
              Healthcare
            </p>

            <div className="mt-3 space-y-1">

              <SidebarLink
                icon={
                  Stethoscope
                }
                label="Find Doctors"
                onClick={() =>
                  navigate(
                    "/doctor",
                  )
                }
              />

              <SidebarLink
                icon={
                  CalendarDays
                }
                label="Appointments"
                onClick={() =>
                  navigate(
                    "/appointment",
                  )
                }
              />

              <SidebarLink
                icon={Droplets}
                label="Blood Request"
                onClick={() =>
                  navigate(
                    "/bloodRequest",
                  )
                }
              />

              <SidebarLink
                icon={UserRound}
                label="Dashboard"
                onClick={() =>
                  navigate(
                    "/dashboard",
                  )
                }
              />
            </div>
          </div>

          {/* AI Safety */}

          <div className="mt-auto p-4">

            <div className="rounded-[17px] border border-white/10 bg-white/[0.06] p-4">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={17}
                  className="text-cyan-300"
                />

                <p className="text-[11px] font-bold">
                  Responsible AI
                </p>
              </div>

              <p className="mt-2 text-[9.5px] leading-5 text-blue-100/55">
                SAHARA AI helps
                navigate healthcare.
                It does not replace a
                licensed medical
                professional.
              </p>
            </div>

            <Link
              to="/"
              className="mt-3 flex items-center gap-2 px-2 py-2 text-[10px] font-semibold text-blue-100/50 transition hover:text-white"
            >
              <ArrowLeft
                size={14}
              />

              Return home
            </Link>
          </div>
        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="flex min-h-[72px] shrink-0 items-center justify-between gap-4 border-b border-[#DFE9F3] bg-white/95 px-4 backdrop-blur-xl sm:px-6">

            <div className="flex items-center gap-3">

              <Link
                to="/"
                className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#DCE7F1] bg-white text-[#66798D] transition hover:text-[#1769E0] lg:hidden"
                aria-label="Back home"
              >
                <ArrowLeft
                  size={19}
                />
              </Link>

              {/* AI avatar */}

              <div className="relative">

                <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-[#1769E0] to-[#7458DB] text-white shadow-[0_8px_22px_rgba(67,87,206,0.25)]">
                  <BrainCircuit
                    size={21}
                  />
                </div>

                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#16A36A]" />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h1 className="font-[Manrope] text-[15px] font-extrabold text-[#142B47]">
                    SAHARA AI
                  </h1>

                  <span className="hidden rounded-full bg-[#F0EDFF] px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-[#6C54D5] sm:inline">
                    Navigator
                  </span>
                </div>

                <div className="mt-0.5 flex items-center gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />

                  <p className="text-[9.5px] text-[#8998A8]">
                    Healthcare assistance online
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">

              <div className="hidden items-center gap-2 rounded-full bg-[#EAF8F1] px-3 py-2 text-[9px] font-bold text-[#15875A] sm:flex">
                <ShieldCheck
                  size={13}
                />

                Safety-first guidance
              </div>

              <button
                type="button"
                onClick={clearChat}
                className="grid h-10 w-10 place-items-center rounded-[11px] border border-[#DCE7F1] bg-white text-[#708399] transition hover:border-[#B7CDE4] hover:bg-[#F6FAFE] hover:text-[#1769E0] lg:hidden"
                aria-label="New chat"
              >
                <RefreshCcw
                  size={16}
                />
              </button>
            </div>
          </header>

          {/* =================================================
              CHAT AREA
          ================================================= */}

          <main className="flex-1 overflow-y-auto">

            <div className="mx-auto w-full max-w-[940px] px-4 py-6 sm:px-6 sm:py-8">

              {/* =============================================
                  INTRO
              ============================================= */}

              {!conversationStarted &&
                !loading && (
                  <motion.section
                    initial={{
                      opacity: 0,
                      y: 18,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mb-8"
                  >
                    <div className="overflow-hidden rounded-[24px] border border-[#DCE8F3] bg-[radial-gradient(circle_at_90%_20%,rgba(115,87,218,0.10),transparent_28%),linear-gradient(135deg,#FFFFFF,#F5FAFF)] p-5 sm:p-7">

                      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

                        <div className="max-w-[590px]">

                          <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF5FF] px-3 py-1.5">

                            <Sparkles
                              size={13}
                              className="text-[#1769E0]"
                            />

                            <span className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#1769E0]">
                              AI Health Navigator
                            </span>
                          </div>

                          <h2 className="mt-4 font-[Manrope] text-[25px] font-extrabold leading-tight tracking-[-0.04em] text-[#0F2745] sm:text-[31px]">
                            Tell me what is happening.
                          </h2>

                          <p className="mt-3 max-w-[580px] text-[12.5px] leading-6 text-[#718296]">
                            Describe symptoms,
                            ask which healthcare
                            service may be
                            appropriate, find
                            doctors or get help
                            navigating blood
                            support.
                          </p>
                        </div>

                        <div className="relative grid h-[90px] w-[90px] shrink-0 place-items-center self-center rounded-[25px] bg-gradient-to-br from-[#EAF4FF] to-[#F0ECFF] text-[#1769E0]">

                          <motion.div
                            animate={{
                              scale: [
                                1,
                                1.16,
                                1,
                              ],
                            }}
                            transition={{
                              duration:
                                3,
                              repeat:
                                Infinity,
                            }}
                            className="absolute inset-0 rounded-[25px] border border-[#1769E0]/10"
                          />

                          <BrainCircuit
                            size={40}
                            strokeWidth={
                              1.6
                            }
                            className="relative"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}

              {/* =============================================
                  MESSAGES
              ============================================= */}

              <div className="space-y-7">

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

              {/* =============================================
                  QUICK PROMPTS
              ============================================= */}

              {!conversationStarted &&
                !loading && (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.15,
                    }}
                    className="mt-8"
                  >
                    <div className="mb-3 flex items-center justify-between">

                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#8A9AAB]">
                        Quick actions
                      </p>

                      <span className="text-[9px] text-[#A2AFBC]">
                        Choose a starting point
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">

                      {quickPrompts.map(
                        (
                          item,
                          index,
                        ) => {
                          const Icon =
                            item.icon;

                          return (
                            <motion.button
                              key={
                                item.title
                              }
                              type="button"
                              onClick={() =>
                                handleQuickPrompt(
                                  item.prompt,
                                )
                              }
                              initial={{
                                opacity:
                                  0,
                                y: 10,
                              }}
                              animate={{
                                opacity:
                                  1,
                                y: 0,
                              }}
                              transition={{
                                delay:
                                  0.18 +
                                  index *
                                    0.05,
                              }}
                              whileHover={{
                                y: -3,
                              }}
                              className="group flex items-center gap-4 rounded-[18px] border border-[#DEE8F2] bg-white p-4 text-left shadow-[0_8px_25px_rgba(18,52,87,0.035)] transition hover:border-[#BED6ED] hover:shadow-[0_14px_35px_rgba(18,52,87,0.08)]"
                            >
                              <div
                                className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${item.style}`}
                              >
                                <Icon
                                  size={
                                    20
                                  }
                                />
                              </div>

                              <div className="min-w-0 flex-1">

                                <p className="text-[12px] font-bold text-[#2A425C] transition group-hover:text-[#1769E0]">
                                  {
                                    item.title
                                  }
                                </p>

                                <p className="mt-1 text-[9.5px] leading-4 text-[#8B99A8]">
                                  {
                                    item.description
                                  }
                                </p>
                              </div>

                              <ChevronRight
                                size={
                                  16
                                }
                                className="text-[#B0BDC9] transition group-hover:translate-x-1 group-hover:text-[#1769E0]"
                              />
                            </motion.button>
                          );
                        },
                      )}
                    </div>
                  </motion.div>
                )}

              {/* =============================================
                  THINKING
              ============================================= */}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="mt-7 flex gap-3"
                  >
                    <AIAvatar />

                    <div className="rounded-[18px] rounded-tl-[6px] border border-[#DCE7F1] bg-white px-5 py-4 shadow-sm">

                      <div className="flex items-center gap-3">

                        <div className="flex gap-1">

                          {[0, 1, 2].map(
                            (
                              item,
                            ) => (
                              <motion.span
                                key={
                                  item
                                }
                                animate={{
                                  y: [
                                    0,
                                    -4,
                                    0,
                                  ],
                                }}
                                transition={{
                                  duration:
                                    0.8,

                                  repeat:
                                    Infinity,

                                  delay:
                                    item *
                                    0.13,
                                }}
                                className="h-2 w-2 rounded-full bg-[#1769E0]"
                              />
                            ),
                          )}
                        </div>

                        <span className="text-[10px] font-medium text-[#8695A5]">
                          SAHARA AI is
                          reviewing your
                          message...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>
          </main>

          {/* =================================================
              INPUT
          ================================================= */}

          <footer className="shrink-0 border-t border-[#DFE9F3] bg-white px-4 py-3 sm:px-6 sm:py-4">

            <div className="mx-auto max-w-[940px]">

              {/* safety */}

              <div className="mb-2.5 flex items-start gap-2">

                <Info
                  size={13}
                  className="mt-0.5 shrink-0 text-[#D79A18]"
                />

                <p className="text-[9px] leading-4 text-[#8E9BA9]">
                  SAHARA AI provides
                  healthcare navigation and
                  general guidance. It does
                  not provide a medical
                  diagnosis or replace a
                  healthcare professional.
                </p>
              </div>

              {/* composer */}

              <div className="flex items-end gap-2 rounded-[17px] border border-[#D8E5F0] bg-[#F8FBFE] p-2 transition-all focus-within:border-[#82B4E7] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">

                <textarea
                  ref={
                    textareaRef
                  }
                  value={input}
                  onChange={
                    handleInputChange
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={
                    loading
                  }
                  rows="1"
                  placeholder="Describe symptoms or ask SAHARA AI..."
                  className="max-h-[140px] min-h-[44px] flex-1 resize-none border-none bg-transparent px-3 py-3 text-[13px] leading-5 text-[#203952] outline-none placeholder:text-[#9AA8B7] disabled:opacity-50"
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
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br from-[#1977EA] to-[#0D5FC7] text-white shadow-[0_8px_20px_rgba(23,105,224,0.20)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#DFE6ED] disabled:text-[#A5B0BB] disabled:shadow-none disabled:hover:translate-y-0"
                  aria-label="Send message"
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Send
                      size={
                        17
                      }
                    />
                  )}
                </button>
              </div>

              <p className="mt-2 text-center text-[8.5px] text-[#A0ACB8]">
                Enter to send • Shift +
                Enter for a new line
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SIDEBAR LINK
========================================================= */

const SidebarLink = ({
  icon: Icon,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-left text-[11px] font-semibold text-blue-100/60 transition hover:bg-white/[0.07] hover:text-white"
  >
    <Icon size={17} />

    {label}
  </button>
);

/* =========================================================
   AI AVATAR
========================================================= */

const AIAvatar = () => (
  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-[#1769E0] to-[#7257D8] text-white shadow-sm">
    <BrainCircuit size={17} />
  </div>
);

/* =========================================================
   CHAT MESSAGE
========================================================= */

const ChatMessage = ({
  message,
  onAction,
  formatTime,
}) => {
  /* =====================================================
     USER
  ===================================================== */

  if (
    message.role === "user"
  ) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex justify-end"
      >
        <div className="max-w-[88%] sm:max-w-[72%]">

          <div className="rounded-[18px] rounded-br-[6px] bg-gradient-to-br from-[#1977EA] to-[#0B5FC7] px-5 py-3.5 text-white shadow-[0_10px_25px_rgba(23,105,224,0.16)]">

            <p className="whitespace-pre-wrap text-[12.5px] leading-6">
              {message.content}
            </p>
          </div>

          <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[8.5px] text-[#9BA8B5]">

            <UserRound
              size={10}
            />

            You •{" "}
            {formatTime(
              message.time,
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (
    message.role === "error"
  ) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex gap-3"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-red-100 text-red-600">
          <CircleAlert
            size={17}
          />
        </div>

        <div className="max-w-[85%]">

          <div className="rounded-[18px] rounded-tl-[6px] border border-red-200 bg-red-50 px-5 py-4">

            <p className="text-[12px] leading-6 text-red-700">
              {
                message.content
              }
            </p>
          </div>

          <p className="mt-1.5 text-[8.5px] text-[#9CA9B6]">
            SAHARA AI
          </p>
        </div>
      </motion.div>
    );
  }

  /* =====================================================
     AI RESPONSE
  ===================================================== */

  const ai =
    message.content || {};

  const urgency =
    getUrgencyConfig(
      ai.urgency,
    );

  const UrgencyIcon =
    urgency.icon;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex gap-3"
    >

      <AIAvatar />

      <div className="w-full max-w-[90%] sm:max-w-[84%]">

        <div className="overflow-hidden rounded-[20px] rounded-tl-[7px] border border-[#DCE7F1] bg-white shadow-[0_8px_28px_rgba(18,51,86,0.045)]">

          {/* ===============================================
              URGENCY HEADER
          =============================================== */}

          <div
            className={`border-b px-5 py-3.5 ${urgency.background} ${urgency.border}`}
          >
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div
                  className={`grid h-9 w-9 place-items-center rounded-[11px] ${urgency.iconBackground}`}
                >
                  <UrgencyIcon
                    size={17}
                  />
                </div>

                <div>

                  <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#8997A6]">
                    SAHARA AI assessment
                  </p>

                  <h3
                    className={`mt-0.5 text-[11px] font-extrabold ${urgency.text}`}
                  >
                    {
                      urgency.label
                    }
                  </h3>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wider ${urgency.badge}`}
              >
                {ai.urgency ||
                  "LOW"}
              </span>
            </div>
          </div>

          {/* ===============================================
              BODY
          =============================================== */}

          <div className="p-5">

            {/* Response */}

            {ai.response && (
              <p className="whitespace-pre-wrap text-[12.5px] leading-7 text-[#52677D]">
                {ai.response}
              </p>
            )}

            {/* Reason */}

            {ai.reason && (
              <div className="mt-5 rounded-[15px] border border-[#E4EBF2] bg-[#F8FBFD] p-4">

                <div className="flex gap-3">

                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#EAF4FF] text-[#1769E0]">

                    <Info
                      size={15}
                    />
                  </div>

                  <div>

                    <p className="text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-[#8696A7]">
                      Why this assessment?
                    </p>

                    <p className="mt-1.5 text-[11px] leading-5 text-[#677B90]">
                      {ai.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended actions */}

            {Array.isArray(
              ai.recommendedActions,
            ) &&
              ai
                .recommendedActions
                .length > 0 && (
                <div className="mt-5">

                  <div className="mb-3 flex items-center gap-2">

                    <Activity
                      size={14}
                      className="text-[#1769E0]"
                    />

                    <h4 className="text-[8.5px] font-extrabold uppercase tracking-[0.13em] text-[#788A9D]">
                      Recommended actions
                    </h4>
                  </div>

                  <div className="space-y-2">

                    {ai.recommendedActions.map(
                      (
                        action,
                        index,
                      ) => (
                        <div
                          key={`${action}-${index}`}
                          className="flex items-start gap-3 rounded-[11px] bg-[#F9FBFD] px-3 py-2.5"
                        >
                          <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#EAF8F1] text-[#15945F]">

                            <Check
                              size={11}
                              strokeWidth={
                                3
                              }
                            />
                          </div>

                          <p className="text-[10.5px] leading-5 text-[#657A90]">
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

            {/* ===============================================
                RESULTS
            =============================================== */}

            {Array.isArray(
              ai.results,
            ) &&
              ai.results.length >
                0 && (
                <div className="mt-6">

                  <div className="mb-3 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Sparkles
                        size={14}
                        className="text-[#7257D8]"
                      />

                      <h4 className="text-[8.5px] font-extrabold uppercase tracking-[0.13em] text-[#788A9D]">
                        SAHARA recommendations
                      </h4>
                    </div>

                    <span className="rounded-full bg-[#EEF4FA] px-2 py-1 text-[8px] font-bold text-[#657A90]">
                      {
                        ai
                          .results
                          .length
                      }{" "}
                      found
                    </span>
                  </div>

                  <div className="space-y-3">

                    {ai.results.map(
                      (
                        result,
                        index,
                      ) => (
                        <DatabaseResult
                          key={
                            result.id ||
                            result._id ||
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

            {/* Follow-up */}

            {ai.followUpQuestion && (
              <div className="mt-6 border-t border-[#EDF2F6] pt-5">

                <div className="flex items-start gap-3">

                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#F0EDFF] text-[#7257D8]">

                    <MessageCircle
                      size={15}
                    />
                  </div>

                  <div>

                    <p className="text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-[#8696A7]">
                      SAHARA AI asks
                    </p>

                    <p className="mt-1.5 text-[11.5px] font-semibold leading-5 text-[#4D6278]">
                      {
                        ai.followUpQuestion
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===============================================
              ACTION BUTTONS
          =============================================== */}

          {Array.isArray(
            ai.buttons,
          ) &&
            ai.buttons.length >
              0 && (
              <div className="border-t border-[#EDF2F6] bg-[#FBFDFF] px-5 py-4">

                <div className="flex flex-wrap gap-2">

                  {ai.buttons.map(
                    (
                      button,
                      index,
                    ) => (
                      <ActionButton
                        key={`${button.action}-${index}`}
                        action={
                          button.action
                        }
                        title={
                          button.title
                        }
                        onClick={() =>
                          onAction(
                            button.action,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              </div>
            )}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-[8.5px] text-[#9CA9B6]">

          <BrainCircuit
            size={10}
          />

          SAHARA AI •{" "}
          {formatTime(
            message.time,
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   DATABASE RESULT
========================================================= */

const DatabaseResult = ({
  result,
  onAction,
}) => {
  const type =
    result.type ||
    result.category ||
    "doctor";

  /* =====================================================
     DOCTOR
  ===================================================== */

  if (
    type.toLowerCase() ===
      "doctor" ||
    result.specialization
  ) {
    return (
      <div className="rounded-[15px] border border-[#DFE8F1] bg-white p-4 transition hover:border-[#BFD6EB] hover:shadow-sm">

        <div className="flex items-start gap-3">

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EAF4FF] text-[#1769E0]">
            <Stethoscope
              size={20}
            />
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <h5 className="truncate text-[12px] font-extrabold text-[#263E59]">
                  {result.name ||
                    result.fullName ||
                    "Doctor"}
                </h5>

                <p className="mt-1 text-[9.5px] font-bold text-[#1769E0]">
                  {result.specialization ||
                    "Healthcare Specialist"}
                </p>
              </div>

              {result.experience !==
                undefined && (
                <span className="shrink-0 rounded-[8px] bg-[#F2F5F8] px-2 py-1 text-[8px] font-bold text-[#75879A]">
                  {
                    result.experience
                  }{" "}
                  yrs
                </span>
              )}
            </div>

            <div className="mt-3 space-y-1.5">

              {result.qualification && (
                <ResultLine
                  icon={
                    ShieldCheck
                  }
                >
                  {
                    result.qualification
                  }
                </ResultLine>
              )}

              {result.hospital && (
                <ResultLine
                  icon={Hospital}
                >
                  {typeof result.hospital ===
                  "string"
                    ? result.hospital
                    : result
                        .hospital
                        .name}
                </ResultLine>
              )}

              {result.consultationFee !==
                undefined && (
                <ResultLine
                  icon={Clock3}
                >
                  Consultation: NPR{" "}
                  {
                    result.consultationFee
                  }
                </ResultLine>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  onAction(
                    "DOCTOR",
                  )
                }
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#1769E0] px-3 py-2 text-[9px] font-bold text-white transition hover:bg-[#0E59C2]"
              >
                View Doctor

                <ArrowRight
                  size={12}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  onAction(
                    "APPOINTMENT",
                  )
                }
                className="inline-flex items-center gap-2 rounded-[10px] border border-[#DCE6EF] bg-white px-3 py-2 text-[9px] font-bold text-[#66798D] transition hover:bg-[#F6FAFD]"
              >
                <CalendarDays
                  size={12}
                />

                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     HOSPITAL
  ===================================================== */

  if (
    type.toLowerCase() ===
      "hospital" ||
    result.beds ||
    result.emergencyAvailable !==
      undefined
  ) {
    return (
      <div className="rounded-[15px] border border-[#DFE8F1] bg-white p-4 transition hover:border-[#BFD6EB] hover:shadow-sm">

        <div className="flex items-start gap-3">

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#E9F9FC] text-[#0B9EB9]">
            <Hospital
              size={20}
            />
          </div>

          <div className="min-w-0 flex-1">

            <h5 className="text-[12px] font-extrabold text-[#263E59]">
              {result.name ||
                "Hospital"}
            </h5>

            {(result.city ||
              result.address) && (
              <div className="mt-1 flex items-start gap-1.5 text-[9px] leading-4 text-[#8796A6]">

                <MapPin
                  size={11}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {result.city ||
                    ""}

                  {result.address
                    ? `${
                        result.city
                          ? " • "
                          : ""
                      }${result.address}`
                    : ""}
                </span>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">

              {result.emergencyAvailable && (
                <ResultBadge
                  className="bg-red-50 text-red-600"
                  icon={
                    AlertTriangle
                  }
                >
                  Emergency
                </ResultBadge>
              )}

              {result.ambulanceAvailable && (
                <ResultBadge
                  className="bg-blue-50 text-blue-600"
                  icon={Activity}
                >
                  Ambulance
                </ResultBadge>
              )}

              {result.isOpen && (
                <ResultBadge
                  className="bg-emerald-50 text-emerald-600"
                  icon={
                    Check
                  }
                >
                  Open
                </ResultBadge>
              )}
            </div>

            {result.beds && (
              <div className="mt-4 grid grid-cols-3 gap-2">

                <MiniStat
                  label="Beds"
                  value={
                    result.beds
                      .total ?? 0
                  }
                />

                <MiniStat
                  label="Available"
                  value={
                    result.beds
                      .available ??
                    0
                  }
                />

                <MiniStat
                  label="ICU"
                  value={
                    result.beds
                      .icu ?? 0
                  }
                />
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                onAction(
                  "HOSPITAL",
                )
              }
              className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#1769E0] px-3 py-2 text-[9px] font-bold text-white"
            >
              Hospital help

              <ArrowRight
                size={12}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     GENERIC RESULT
  ===================================================== */

  return (
    <div className="rounded-[14px] border border-[#DFE8F1] bg-[#F8FBFD] p-4">

      <pre className="overflow-auto whitespace-pre-wrap break-words text-[9px] leading-5 text-[#65798E]">
        {JSON.stringify(
          result,
          null,
          2,
        )}
      </pre>
    </div>
  );
};

/* =========================================================
   RESULT LINE
========================================================= */

const ResultLine = ({
  icon: Icon,
  children,
}) => (
  <p className="flex items-start gap-2 text-[9px] leading-4 text-[#7D8D9D]">
    <Icon
      size={11}
      className="mt-0.5 shrink-0"
    />

    {children}
  </p>
);

/* =========================================================
   BADGE
========================================================= */

const ResultBadge = ({
  className,
  icon: Icon,
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[8px] font-bold ${className}`}
  >
    <Icon size={10} />

    {children}
  </span>
);

/* =========================================================
   MINI STAT
========================================================= */

const MiniStat = ({
  label,
  value,
}) => (
  <div className="rounded-[10px] bg-[#F4F8FB] p-2 text-center">

    <p className="text-[12px] font-extrabold text-[#334B65]">
      {value}
    </p>

    <p className="mt-0.5 text-[7px] font-bold uppercase tracking-wide text-[#9AA7B4]">
      {label}
    </p>
  </div>
);

/* =========================================================
   ACTION BUTTON
========================================================= */

const ActionButton = ({
  action,
  title,
  onClick,
}) => {
  const config =
    getActionConfig(
      action,
    );

  const Icon =
    config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[9px] font-bold transition hover:-translate-y-0.5 ${config.className}`}
    >
      <Icon size={13} />

      {title}

      <ChevronRight
        size={12}
      />
    </button>
  );
};

/* =========================================================
   ACTION CONFIG
========================================================= */

const getActionConfig = (
  action,
) => {
  switch (action) {
    case "SOS":
      return {
        icon: AlertTriangle,

        className:
          "bg-[#E43C4F] text-white shadow-sm hover:bg-[#CF3143]",
      };

    case "HOSPITAL":
      return {
        icon: Hospital,

        className:
          "bg-[#1769E0] text-white shadow-sm hover:bg-[#105DC7]",
      };

    case "BLOOD":
      return {
        icon: Droplets,

        className:
          "bg-[#FFF0F2] text-[#D93649] hover:bg-[#FFE7EA]",
      };

    case "DOCTOR":
      return {
        icon: Stethoscope,

        className:
          "bg-[#EAF4FF] text-[#1769E0] hover:bg-[#DAECFF]",
      };

    case "APPOINTMENT":
      return {
        icon: CalendarDays,

        className:
          "bg-[#EFF8F5] text-[#16895B] hover:bg-[#E3F5EE]",
      };

    default:
      return {
        icon: ArrowRight,

        className:
          "bg-[#EFF3F7] text-[#61758A]",
      };
  }
};

/* =========================================================
   URGENCY
========================================================= */

const getUrgencyConfig = (
  urgency,
) => {
  switch (
    String(
      urgency || "LOW",
    ).toUpperCase()
  ) {
    case "CRITICAL":
      return {
        label:
          "Immediate emergency attention",

        icon: AlertTriangle,

        text:
          "text-red-700",

        border:
          "border-red-200",

        background:
          "bg-red-50",

        iconBackground:
          "bg-red-100 text-red-600",

        badge:
          "bg-red-100 text-red-700",
      };

    case "HIGH":
      return {
        label:
          "High urgency",

        icon: CircleAlert,

        text:
          "text-orange-700",

        border:
          "border-orange-200",

        background:
          "bg-orange-50",

        iconBackground:
          "bg-orange-100 text-orange-600",

        badge:
          "bg-orange-100 text-orange-700",
      };

    case "MEDIUM":
      return {
        label:
          "Medical attention recommended",

        icon: Activity,

        text:
          "text-amber-700",

        border:
          "border-amber-200",

        background:
          "bg-amber-50",

        iconBackground:
          "bg-amber-100 text-amber-600",

        badge:
          "bg-amber-100 text-amber-700",
      };

    case "LOW":

    default:
      return {
        label:
          "Low urgency",

        icon: ShieldCheck,

        text:
          "text-[#1769E0]",

        border:
          "border-[#D6E6F6]",

        background:
          "bg-[#F2F8FF]",

        iconBackground:
          "bg-[#E4F1FF] text-[#1769E0]",

        badge:
          "bg-[#E4F1FF] text-[#1769E0]",
      };
  }
};

export default AiBot;