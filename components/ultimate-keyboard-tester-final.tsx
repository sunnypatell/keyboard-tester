"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Sparkles, Keyboard, Activity, Clock, RotateCcw, Zap, Award, Download, AlertTriangle, Github, Linkedin, Globe } from "lucide-react"
import confetti from 'canvas-confetti'

// Correct type declaration for canvas-confetti
declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: Shape[]; // Use the Shape type from @types/canvas-confetti
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: Options): Promise<null>;
  namespace confetti {
    function create(canvas: HTMLCanvasElement, options?: Options): (options?: Options) => Promise<null>;
  }
}


const LAYOUTS: { [key: string]: number } = {
  "100%": 101,
  "TKL": 87,
  "75%": 84,
  "65%": 68,
  "60%": 61,
}

interface KeyboardKeyProps {
  keyName: string;
  isPressed: boolean;
  isHeld: boolean;
  isDoublePressed: boolean;
  isSimultaneous: boolean;
  size?: "normal" | "wide" | "extra-wide" | "tall" | "huge";
  onKeyPress: (key: string) => void;
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({ keyName, isPressed, isHeld, isDoublePressed, isSimultaneous, size = "normal", onKeyPress }) => {
  const sizeClasses: { [key: string]: string } = {
    normal: "w-12 h-12",
    wide: "w-20 h-12",
    "extra-wide": "w-24 h-12",
    tall: "w-12 h-24",
    huge: "w-48 h-12",
  }

  const getKeyColor = () => {
    if (isSimultaneous) return "bg-purple-600 text-white"
    if (isDoublePressed) return "bg-yellow-600 text-white"
    if (isHeld) return "bg-blue-600 text-white"
    if (isPressed) return "bg-green-600 text-white"
    return "bg-gray-700 text-gray-200"
  }

  return (
    <motion.div
      className={`rounded-lg ${sizeClasses[size]} flex items-center justify-center text-sm font-medium border border-gray-600 cursor-pointer
      ${getKeyColor()} transition-all duration-150 ease-in-out shadow-md`}
      whileHover={{ scale: 1.05, boxShadow: "0px 5px 10px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onKeyPress(keyName.toLowerCase())}
    >
      {keyName}
    </motion.div>
  )
}

interface StatBadgeProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
}

const StatBadge: React.FC<StatBadgeProps> = ({ icon: Icon, title, value }) => (
  <div className="flex items-center bg-gray-800 rounded-lg p-3 shadow-md">
    <Icon className="w-6 h-6 mr-2 text-blue-400" />
    <div>
      <p className="text-xs font-medium text-gray-400">{title}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  </div>
)

export default function UltimateKeyboardTester() {
  const [layout, setLayout] = useState<string>("100%")
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set())
  const [doublePressedKeys, setDoublePressedKeys] = useState<Set<string>>(new Set())
  const [simultaneousKeys, setSimultaneousKeys] = useState<Set<string>>(new Set())
  const [lastPressedKey, setLastPressedKey] = useState<string>("")
  const [keyPressCount, setKeyPressCount] = useState<number>(0)
  const [showEasterEgg, setShowEasterEgg] = useState<boolean>(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [wpm, setWpm] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(100)
  const [activeTab, setActiveTab] = useState<string>("visual")
  const [typedText, setTypedText] = useState<string>("")
  const [errors, setErrors] = useState<number>(0)
  const [keyPressTimestamps, setKeyPressTimestamps] = useState<{ [key: string]: number }>({})
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyPress = useCallback((key: string) => {
    if (!startTime) {
      setStartTime(Date.now())
    }
    setPressedKeys((prev) => {
      const newSet = new Set(prev)
      newSet.add(key)
      return newSet
    })
    setHeldKeys((prev) => {
      const newSet = new Set(prev)
      newSet.add(key)
      return newSet
    })
    setLastPressedKey(key)
    setKeyPressCount((prev) => prev + 1)

    // Check for double press
    const now = Date.now()
    setKeyPressTimestamps((prev) => {
      const lastPress = prev[key] || 0
      if (now - lastPress < 200) { // 200ms threshold for double press
        setDoublePressedKeys((dpk) => {
          const newSet = new Set(dpk)
          newSet.add(key)
          return newSet
        })
      }
      return { ...prev, [key]: now }
    })

    // Check for simultaneous press
    if (heldKeys.size > 0) {
      setSimultaneousKeys((prev) => {
        const newSet = new Set(prev)
        heldKeys.forEach((heldKey) => {
          newSet.add(`${heldKey}+${key}`)
        })
        return newSet
      })
    }
  }, [startTime, heldKeys])

  const handleKeyRelease = useCallback((key: string) => {
    setHeldKeys((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      handleKeyPress(e.key.toLowerCase())
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      handleKeyRelease(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyPress, handleKeyRelease])

  useEffect(() => {
    if (pressedKeys.size === LAYOUTS[layout]) {
      setShowEasterEgg(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [pressedKeys, layout])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (startTime) {
      interval = setInterval(() => {
        const currentTime = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(currentTime)
        if (activeTab === "text") {
          const words = typedText.trim().split(/\s+/).length
          const minutes = currentTime / 60
          setWpm(Math.round(words / minutes))
          setAccuracy(Math.max(0, Math.round(100 - (errors / typedText.length * 100))))
        }
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [startTime, activeTab, typedText, errors])

  const resetTester = () => {
    setPressedKeys(new Set())
    setHeldKeys(new Set())
    setDoublePressedKeys(new Set())
    setSimultaneousKeys(new Set())
    setLastPressedKey("")
    setKeyPressCount(0)
    setShowEasterEgg(false)
    setStartTime(null)
    setElapsedTime(0)
    setWpm(0)
    setAccuracy(100)
    setTypedText("")
    setErrors(0)
    setKeyPressTimestamps({})
    if (textInputRef.current) {
      textInputRef.current.value = ""
    }
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setTypedText(newText)
    setErrors(newText.split('').filter((char, index) => char !== typedText[index]).length)
    newText.split('').forEach(handleKeyPress)
  }

  const exportStats = () => {
    const stats = {
      layout,
      keysPressedCount: keyPressCount,
      uniqueKeysPressedCount: pressedKeys.size,
      doublePressedKeysCount: doublePressedKeys.size,
      simultaneousKeysCount: simultaneousKeys.size,
      elapsedTime,
      wpm,
      accuracy,
    }
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "keyboard-test-stats.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const keyboardLayouts: { [key: string]: string[][] } = {
    "100%": [
      ["esc", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12", "prtsc", "scrlk", "pause"],
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace"],
      ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
      ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
      ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
      ["ctrl", "win", "alt", "space", "alt", "fn", "menu", "ctrl"],
      ["", "", "", "ins", "home", "pgup"],
      ["", "", "", "del", "end", "pgdn"],
      ["", "", "", "←", "↑", "→"],
      ["", "", "", "", "↓", ""],
    ],
    "TKL": [
      ["esc", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12", "prtsc", "scrlk", "pause"],
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace"],
      ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
      ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
      ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
      ["ctrl", "win", "alt", "space", "alt", "fn", "menu", "ctrl"],
      ["", "", "", "ins", "home", "pgup"],
      ["", "", "", "del", "end", "pgdn"],
      ["", "", "", "←", "↑", "→"],
      ["", "", "", "", "↓", ""],
    ],
    "75%": [
      ["esc", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12", "del"],
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace"],
      ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
      ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
      ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
      ["ctrl", "win", "alt", "space", "alt", "fn", "ctrl"],
      ["", "", "", "←", "↑", "→"],
      ["", "", "", "", "↓", ""],
    ],
    "65%": [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace", "del"],
      ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\", "pgup"],
      ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter", "pgdn"],
      ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift", "↑"],
      ["ctrl", "win", "alt", "space", "alt", "fn", "ctrl", "←", "↓", "→"],
    ],
    "60%": [
      ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace"],
      ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
      ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
      ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
      ["ctrl", "win", "alt", "space", "alt", "fn", "ctrl"],
    ],
  }

  const keySizes: { [key: string]: "normal" | "wide" | "extra-wide" | "tall" | "huge" } = {
    backspace: "wide",
    tab: "wide",
    "\\": "wide",
    caps: "wide",
    enter: "wide",
    shift: "extra-wide",
    ctrl: "wide",
    alt: "wide",
    space: "huge",
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <motion.h1
        className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-green-400 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Ultimate Keyboard Tester
      </motion.h1>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-start mb-4 gap-4">
          <StatBadge icon={Activity} title="Keys Pressed" value={keyPressCount} />
          <StatBadge icon={Keyboard} title="Unique Keys" value={pressedKeys.size} />
          <StatBadge icon={AlertTriangle} title="Double Pressed" value={doublePressedKeys.size} />
          <StatBadge icon={Zap} title="Simultaneous" value={simultaneousKeys.size} />
          {activeTab === "text" && (
            <>
              <StatBadge icon={Clock} title="Time" value={`${elapsedTime}s`} />
              <StatBadge icon={Zap} title="WPM" value={wpm} />
              <StatBadge icon={Award} title="Accuracy" value={`${accuracy}%`} />
            </>
          )}
          <div className="flex-grow"></div>
          <Select
            value={layout}
            onValueChange={(value) => {
              setLayout(value)
              resetTester()
            }}
          >
            <SelectTrigger className="w-[180px] bg-gray-800 text-white border-gray-700">
              <SelectValue placeholder="Select a layout" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              {Object.keys(LAYOUTS).map((l) => (
                <SelectItem key={l} value={l} className="hover:bg-gray-700">
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={resetTester}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={exportStats}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Stats
          </Button>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-400 mb-1">Last Pressed</p>
          <Badge variant="secondary" className="text-lg bg-gray-700 text-white">
            {lastPressedKey || "None"}
          </Badge>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Progress</p>
          <Progress
            value={(pressedKeys.size / LAYOUTS[layout]) * 100}
            className="h-2 bg-gray-700"
          />
          <p className="text-sm text-gray-400 mt-1 text-center">
            {pressedKeys.size} / {LAYOUTS[layout]} keys pressed
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 rounded-t-lg">
            <TabsTrigger value="visual" className="text-white data-[state=active]:bg-gray-700">Visual Keyboard</TabsTrigger>
            <TabsTrigger value="text" className="text-white data-[state=active]:bg-gray-700">Text Input</TabsTrigger>
          </TabsList>
          <TabsContent value="visual" className="bg-gray-800 rounded-b-lg p-4">
            <div className="grid gap-2">
              {keyboardLayouts[layout].map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap justify-center gap-1">
                  {row.map((key, keyIndex) => (
                    key ? (
                      <KeyboardKey
                        key={`${key}-${keyIndex}`}
                        keyName={key}
                        isPressed={pressedKeys.has(key.toLowerCase())}
                        isHeld={heldKeys.has(key.toLowerCase())}
                        isDoublePressed={doublePressedKeys.has(key.toLowerCase())}
                        isSimultaneous={Array.from(simultaneousKeys).some(sk => typeof sk === 'string' && sk.includes(key.toLowerCase()))}
                        size={keySizes[key.toLowerCase()] || "normal"}
                        onKeyPress={handleKeyPress}
                      />
                    ) : (
                      <div key={`empty-${rowIndex}-${keyIndex}`} className="w-12 h-12" />
                    )
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="text" className="bg-gray-800 rounded-b-lg p-4">
            <textarea
              ref={textInputRef}
              className="w-full h-40 p-2 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Start typing here to test your keyboard..."
              onChange={handleTextInput}
              value={typedText}
            ></textarea>
            <div className="text-sm text-gray-400">
              <p>Characters typed: {typedText.length}</p>
              <p>Errors: {errors}</p>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about">
              <AccordionTrigger className="text-white hover:text-blue-400">
                What is this website? 🤔
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                This Ultimate Keyboard Tester is a fun and interactive tool to test your keyboard&apos;s functionality! 🎹✨ It helps you check for stuck keys, double presses, and even simultaneous key presses. Perfect for gamers, programmers, and anyone who loves their keyboard! 🖥️💻
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tech-stack">
              <AccordionTrigger className="text-white hover:text-blue-400">
                Tech Stack 🛠️
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                <ul className="list-disc list-inside">
                  <li>React ⚛️</li>
                  <li>Next.js 13 🚀</li>
                  <li>TypeScript 📘</li>
                  <li>Tailwind CSS 🎨</li>
                  <li>Framer Motion 🎭</li>
                  <li>Lucide Icons 🖼️</li>
                  <li>Shadcn UI 🎛️</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <footer className="mt-12 text-center text-gray-400">
        <p>© 2024 - Sunny Jayendra Patel</p>
        <div className="flex justify-center mt-4 space-x-4">
          <a href="https://github.com/sunnypatell" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <Github className="w-6 h-6" />
          </a>
          <a href="https://www.linkedin.com/in/sunny-patel-30b460204/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <Linkedin className="w-6 h-6" />
          </a>
          <a href="https://www.sunnypatel.net" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <Globe className="w-6 h-6" />
          </a>
        </div>
      </footer>
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-4 text-center text-white">Congratulations! 🎉</h2>
              <p className="text-xl mb-6 text-center text-gray-300">
                You&apos;ve pressed all the keys on the {layout} keyboard! You&apos;re a true keyboard master! 🏆
              </p>
              <div className="flex justify-center items-center mb-6">
                <Award className="w-8 h-8 mr-2 text-green-500" />
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-gray-700 text-white">
                  Keyboard Virtuoso 🎹
                </Badge>
              </div>
              <Button className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowEasterEgg(false)}>
                Continue Testing 🚀
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}